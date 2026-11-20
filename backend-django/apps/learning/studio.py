"""The course studio: where tutors build their own courses, alone or as a team.

  GET  POST           /api/studio/courses
  GET  PATCH  DELETE  /api/studio/courses/<id>
  PUT                 /api/studio/courses/<id>/outline     modules and lesson order
  POST                /api/studio/courses/<id>/lessons
  GET  PATCH  DELETE  /api/studio/lessons/<id>
  POST                /api/studio/courses/<id>/invites     owner invites a tutor by email
  POST                /api/studio/invites/<id>/accept|decline
  DELETE              /api/studio/invites/<id>             cancel
  DELETE              /api/studio/courses/<id>/team/<user> remove someone, or leave
  POST                /api/studio/courses/<id>/team/<user>/owner   hand over ownership
  PUT                 /api/studio/courses/<id>/classes     which of your classes can see it
  GET                 /api/studio/exercises

Every write checks the course team (see access.py). Official VibeSkool
courses are read-only here for everyone except admins.
"""
import re
import uuid
from datetime import datetime

from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTutor
from apps.classrooms.models import Classroom, Membership

from . import access
from .models import CourseInvite, CourseMember, Exercise, ExerciseSubmission, Lesson, SkillPath

MAX_MODULES = 40
MAX_SECTIONS = 60
MAX_TEAM = 12
MAX_PENDING_INVITES = 10
COLORS = ['violet', 'blue', 'green', 'amber', 'coral', 'teal', 'pink', 'slate']


def person(u):
    return {'id': str(u.id), 'display_name': u.display_name, 'avatar_url': u.avatar_url, 'role': u.role}


def new_id(text, size=4):
    base = slugify(text)[:56].strip('-') or 'course'
    return f'{base}-{uuid.uuid4().hex[:size]}'


def module_label(index, title):
    """The lesson's `part` string. The app groups lessons by the M<n> prefix."""
    return f'M{index}: {title.strip()[:60]}'


def module_index(part):
    m = re.match(r'^M(\d+)', part or '', re.I)
    return int(m.group(1)) if m else None


class StudioView(APIView):
    permission_classes = [IsAuthenticated, IsTutor]

    def course(self, pk, manage=False):
        course = SkillPath.objects.prefetch_related('team__user').filter(pk=pk).first()
        if not course or not course.can_edit(self.request.user):
            # Other tutors' courses don't exist as far as you're concerned
            raise NotFound('Course not found')
        if manage and not course.can_manage(self.request.user):
            raise PermissionDenied('Only the course owner can do that.')
        return course


# ── Shapes ───────────────────────────────────────────────────────────
def lesson_row(lesson):
    return {
        'id': lesson.id,
        'title': lesson.title,
        'duration': lesson.duration,
        'goal': lesson.mek_label,
        'published': lesson.published,
        'sections': len(lesson.sections or []),
        'exercises': getattr(lesson, 'n_exercises', None),
        'updated_at': lesson.updated_at,
        'updated_by': lesson.updated_by.display_name if lesson.updated_by else None,
    }


def students_reached(course):
    rooms = course.classes.values('id')
    return Membership.objects.filter(classroom_id__in=rooms).values('student').distinct().count()


def course_summary(course, user):
    lessons = list(course.lessons.all())
    return {
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'tag': course.tag,
        'color': course.color,
        'icon': course.icon,
        'status': course.status,
        'official': course.is_official,
        'role': course.role_of(user),
        'team': [{**person(m.user), 'course_role': m.role} for m in course.team.all()],
        'lessons': len(lessons),
        'published_lessons': sum(1 for l in lessons if l.published),
        'modules': len(course.modules or []),
        'classes': course.classes.count(),
        'students': students_reached(course),
        'updated_at': max([course.updated_at, *[l.updated_at for l in lessons]]),
    }


def course_detail(course, user):
    data = course_summary(course, user)
    lessons = list(course.lessons.select_related('updated_by').annotate(n_exercises=Count('exercises')).order_by('order'))
    modules = []
    for i, m in enumerate(course.modules or []):
        modules.append({
            'id': m.get('id') or f'm{i}', 'title': m.get('title') or f'Module {i + 1}',
            'goal': m.get('goal') or '', 'deliverables': m.get('deliverables') or '', 'lessons': [],
        })
    unsorted = []
    for lesson in lessons:
        idx = module_index(lesson.part)
        (modules[idx]['lessons'] if idx is not None and idx < len(modules) else unsorted).append(lesson_row(lesson))
    rooms = list(course.classes.select_related('teacher'))
    mine = list(Classroom.objects.filter(teacher=user, archived=False).annotate(n=Count('memberships')))
    linked = {r.id for r in rooms}
    data.update({
        'modules': modules,
        'unsorted': unsorted,
        'invites': [
            {'id': i.id, 'email': i.email, 'created_at': i.created_at,
             'invited_by': i.invited_by.display_name if i.invited_by else None}
            for i in course.invites.select_related('invited_by')
        ] if course.can_edit(user) else [],
        'linked_classes': [
            {'id': str(r.id), 'name': r.name, 'teacher_name': r.teacher.display_name, 'mine': r.teacher_id == user.id}
            for r in rooms
        ],
        'my_classes': [{'id': str(r.id), 'name': r.name, 'students': r.n, 'linked': r.id in linked} for r in mine],
        'permissions': {'edit': course.can_edit(user), 'manage': course.can_manage(user)},
    })
    return data


class SectionSerializer(serializers.Serializer):
    heading = serializers.CharField(max_length=200, allow_blank=True, required=False, default='')
    body = serializers.CharField(max_length=12000, allow_blank=True, required=False, default='')
    callout = serializers.CharField(max_length=2000, allow_blank=True, required=False, default='')
    code = serializers.CharField(max_length=12000, allow_blank=True, required=False, default='', trim_whitespace=False)


class LessonWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False)
    duration = serializers.CharField(max_length=20, required=False, allow_blank=True)
    goal = serializers.CharField(max_length=120, required=False, allow_blank=True)
    sections = SectionSerializer(many=True, required=False)
    ai_prompt = serializers.CharField(max_length=4000, required=False, allow_blank=True)
    terminal_mission = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    published = serializers.BooleanField(required=False)
    baseUpdatedAt = serializers.DateTimeField(required=False)

    def validate_title(self, v):
        v = v.strip()
        if len(v) < 2:
            raise serializers.ValidationError('Give the lesson a title')
        return v

    def validate_duration(self, v):
        v = v.strip()
        if v and not re.fullmatch(r'\d{1,3}( ?min)?', v):
            raise serializers.ValidationError('Write it in minutes, like "8 min"')
        return f'{int(re.match(r"\d+", v).group())} min' if v else ''

    def validate_sections(self, v):
        if len(v) > MAX_SECTIONS:
            raise serializers.ValidationError(f'Up to {MAX_SECTIONS} sections')
        # Drop the keys a section doesn't use, so stored lessons stay tidy
        return [{k: s[k] for k in ('heading', 'body', 'callout', 'code') if s.get(k)} for s in v]


class CourseWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=160, required=False)
    description = serializers.CharField(max_length=600, required=False, allow_blank=True)
    tag = serializers.CharField(max_length=40, required=False, allow_blank=True)
    color = serializers.ChoiceField(choices=COLORS, required=False)
    status = serializers.ChoiceField(choices=SkillPath.Status.choices, required=False)

    def validate_title(self, v):
        v = v.strip()
        if len(v) < 3:
            raise serializers.ValidationError('Give the course a name')
        return v


def create_course(user, data):
    if not user.is_tutor:
        raise PermissionDenied('Only tutors can create courses.')
    s = CourseWriteSerializer(data=data)
    s.is_valid(raise_exception=True)
    d = s.validated_data
    if not d.get('title'):
        raise serializers.ValidationError({'title': 'Give the course a name'})
    with transaction.atomic():
        course = SkillPath.objects.create(
            id=new_id(d['title']), title=d['title'], description=d.get('description', ''), tag=d.get('tag', '') or 'Course',
            color=d.get('color') or COLORS[hash(d['title']) % len(COLORS)], is_official=False,
            status=SkillPath.Status.DRAFT, order=1000, created_by=user,
            modules=[{'id': f'mod-{uuid.uuid4().hex[:8]}', 'title': 'Getting started', 'goal': '', 'deliverables': ''}],
        )
        CourseMember.objects.create(course=course, user=user, role=CourseMember.Role.OWNER)
    return course


def renumber(course):
    """Give lessons a continuous order: module by module, keeping order inside each."""
    lessons = sorted(course.lessons.all(), key=lambda l: (module_index(l.part) if module_index(l.part) is not None else 999, l.order))
    for i, l in enumerate(lessons):
        if l.order != i:
            Lesson.objects.filter(pk=l.pk).update(order=i)


# ── Courses ──────────────────────────────────────────────────────────
class CourseListView(StudioView):
    def get(self, request):
        user = request.user
        courses = access.editable_courses(user).prefetch_related('team__user', 'lessons').order_by('is_official', '-updated_at')
        invites = CourseInvite.objects.filter(email__iexact=user.email).select_related('course', 'invited_by')
        return Response({
            'courses': [course_summary(c, user) for c in courses],
            'invites': [{
                'id': i.id, 'course': {'id': i.course.id, 'title': i.course.title, 'description': i.course.description},
                'invited_by': person(i.invited_by) if i.invited_by else None, 'created_at': i.created_at,
            } for i in invites],
        })

    def post(self, request):
        course = create_course(request.user, request.data)
        return Response({'course': course_detail(course, request.user)}, status=status.HTTP_201_CREATED)


class CourseDetailView(StudioView):
    def get(self, request, pk):
        return Response({'course': course_detail(self.course(pk), request.user)})

    def patch(self, request, pk):
        course = self.course(pk)
        s = CourseWriteSerializer(data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        if d.get('status') == SkillPath.Status.PUBLISHED and not course.lessons.filter(published=True).exists():
            raise serializers.ValidationError({'status': 'Publish at least one lesson first'})
        for key in ('title', 'description', 'tag', 'color', 'status'):
            if key in d:
                setattr(course, key, d[key])
        course.save()
        return Response({'course': course_detail(course, request.user)})

    def delete(self, request, pk):
        course = self.course(pk, manage=True)
        if course.is_official and not request.user.is_admin:
            raise PermissionDenied("VibeSkool courses can't be deleted here.")
        course.delete()
        return Response({'success': True})


class OutlineView(StudioView):
    """PUT {modules: [{id, title, goal, deliverables, lessons: [lessonId, …]}]} — the whole outline at once."""

    def put(self, request, pk):
        course = self.course(pk)
        modules = request.data.get('modules')
        if not isinstance(modules, list) or not modules:
            raise serializers.ValidationError({'modules': 'A course needs at least one module'})
        if len(modules) > MAX_MODULES:
            raise serializers.ValidationError({'modules': f'Up to {MAX_MODULES} modules'})
        all_ids = set(course.lessons.values_list('id', flat=True))
        placed, clean = [], []
        for i, m in enumerate(modules):
            if not isinstance(m, dict):
                raise serializers.ValidationError({'modules': 'Each module needs a title and its lessons'})
            title = str(m.get('title') or '').strip()[:80]
            if not title:
                raise serializers.ValidationError({'modules': f'Module {i + 1} needs a title'})
            mid = str(m.get('id') or '')[:40] or f'mod-{uuid.uuid4().hex[:8]}'
            if not re.fullmatch(r'[A-Za-z0-9_-]+', mid):
                mid = f'mod-{uuid.uuid4().hex[:8]}'
            lesson_ids = [str(x) for x in (m.get('lessons') or [])]
            placed += lesson_ids
            clean.append(({'id': mid, 'title': title, 'goal': str(m.get('goal') or '')[:300],
                           'deliverables': str(m.get('deliverables') or '')[:300]}, lesson_ids))
        if sorted(placed) != sorted(all_ids):
            raise serializers.ValidationError({'modules': 'Every lesson must be in exactly one module. Reload and try again.'})
        if len({m['id'] for m, _ in clean}) != len(clean):
            raise serializers.ValidationError({'modules': 'Two modules share an id'})
        with transaction.atomic():
            course.modules = [m for m, _ in clean]
            course.save(update_fields=['modules', 'updated_at'])
            n = 0
            for i, (m, ids) in enumerate(clean):
                for lid in ids:
                    Lesson.objects.filter(pk=lid, path=course).update(part=module_label(i, m['title']), order=n)
                    n += 1
        return Response({'course': course_detail(course, request.user)})


# ── Lessons ──────────────────────────────────────────────────────────
def lesson_full(lesson):
    return {
        'id': lesson.id, 'courseId': lesson.path_id, 'title': lesson.title, 'duration': lesson.duration,
        'goal': lesson.mek_label, 'part': lesson.part, 'module': module_index(lesson.part),
        'sections': lesson.sections or [], 'ai_prompt': lesson.ai_prompt, 'terminal_mission': lesson.terminal_mission,
        'published': lesson.published, 'updated_at': lesson.updated_at,
        'updated_by': person(lesson.updated_by) if lesson.updated_by else None,
    }


class LessonCreateView(StudioView):
    """POST {title, moduleId} — a new, unpublished lesson at the end of the module."""

    def post(self, request, pk):
        course = self.course(pk)
        title = str(request.data.get('title') or '').strip()[:200]
        if len(title) < 2:
            raise serializers.ValidationError({'title': 'Give the lesson a title'})
        mods = course.modules or []
        idx = next((i for i, m in enumerate(mods) if m.get('id') == request.data.get('moduleId')), None)
        if idx is None:
            raise serializers.ValidationError({'moduleId': 'Pick a module'})
        last = course.lessons.order_by('-order').values_list('order', flat=True).first()
        lesson = Lesson.objects.create(
            id=new_id(title), path=course, title=title, part=module_label(idx, mods[idx]['title']),
            order=(last or 0) + 1, published=False, sections=[{'heading': '', 'body': ''}], duration='5 min',
            created_by=request.user, updated_by=request.user,
        )
        renumber(course)
        SkillPath.objects.filter(pk=course.pk).update(updated_at=timezone.now())
        lesson.refresh_from_db()
        return Response({'lesson': lesson_full(lesson)}, status=status.HTTP_201_CREATED)


class LessonView(StudioView):
    def lesson(self, pk):
        lesson = Lesson.objects.select_related('path', 'updated_by').filter(pk=pk).first()
        if not lesson or not lesson.path.can_edit(self.request.user):
            raise NotFound('Lesson not found')
        return lesson

    def get(self, request, pk):
        lesson = self.lesson(pk)
        return Response({'lesson': lesson_full(lesson), 'course': {'id': lesson.path_id, 'title': lesson.path.title,
                                                                   'modules': lesson.path.modules or []}})

    def patch(self, request, pk):
        lesson = self.lesson(pk)
        s = LessonWriteSerializer(data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        base = d.pop('baseUpdatedAt', None)
        # Two tutors on one lesson: don't let the second save silently wipe the first
        if base and lesson.updated_by_id and lesson.updated_by_id != request.user.id \
                and abs((lesson.updated_at - base).total_seconds()) > 1:
            return Response({
                'error': f'{lesson.updated_by.display_name} saved changes to this lesson while you were editing.',
                'lesson': lesson_full(lesson),
            }, status=status.HTTP_409_CONFLICT)
        mapping = {'goal': 'mek_label'}
        for key, value in d.items():
            setattr(lesson, mapping.get(key, key), value)
        lesson.updated_by = request.user
        lesson.save()
        SkillPath.objects.filter(pk=lesson.path_id).update(updated_at=timezone.now())
        lesson.refresh_from_db()
        return Response({'lesson': lesson_full(lesson)})

    def delete(self, request, pk):
        lesson = self.lesson(pk)
        course = lesson.path
        lesson.delete()
        renumber(course)
        if course.is_published and not course.lessons.filter(published=True).exists():
            course.status = SkillPath.Status.DRAFT  # nothing left for students to open
            course.save(update_fields=['status'])
        return Response({'success': True})


# ── Team ─────────────────────────────────────────────────────────────
class InviteView(StudioView):
    """POST {email} — the owner invites a tutor. The reply never says whether the email has an account."""

    def post(self, request, pk):
        course = self.course(pk, manage=True)
        email = str(request.data.get('email') or '').strip().lower()
        try:
            serializers.EmailField().run_validation(email)
        except serializers.ValidationError:
            raise serializers.ValidationError({'email': "That isn't an email address"})
        if course.team.filter(user__email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Already on the team'})
        if course.team.count() >= MAX_TEAM:
            raise serializers.ValidationError({'email': f'A team can have up to {MAX_TEAM} people'})
        if course.invites.count() >= MAX_PENDING_INVITES:
            raise serializers.ValidationError({'email': 'Too many invitations waiting. Cancel some first.'})
        if course.invites.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Already invited'})
        try:
            with transaction.atomic():
                invite = CourseInvite.objects.create(course=course, email=email, invited_by=request.user)
        except IntegrityError:
            raise serializers.ValidationError({'email': 'Already invited'})
        return Response({'invite': {'id': invite.id, 'email': invite.email, 'created_at': invite.created_at,
                                    'invited_by': request.user.display_name}}, status=status.HTTP_201_CREATED)


class InviteDetailView(StudioView):
    def invite(self, pk):
        return get_object_or_404(CourseInvite.objects.select_related('course'), pk=pk)

    def delete(self, request, pk):
        """Cancel (owner or whoever sent it) or decline (the person invited)."""
        inv = self.invite(pk)
        mine = inv.email.lower() == request.user.email.lower()
        if not (mine or inv.invited_by_id == request.user.id or inv.course.can_manage(request.user)):
            raise NotFound('Invitation not found')
        inv.delete()
        return Response({'success': True})


class AcceptInviteView(InviteDetailView):
    def post(self, request, pk):
        inv = self.invite(pk)
        if inv.email.lower() != request.user.email.lower():
            raise NotFound('Invitation not found')
        with transaction.atomic():
            CourseMember.objects.get_or_create(course=inv.course, user=request.user, defaults={'role': CourseMember.Role.EDITOR})
            inv.delete()
        return Response({'course': course_detail(self.course(inv.course_id), request.user)})


class TeamMemberView(StudioView):
    def delete(self, request, pk, user_id):
        """The owner removes someone, or an editor leaves."""
        course = self.course(pk)
        seat = course.team.filter(user_id=user_id).first()
        if not seat:
            raise NotFound('Not on this team')
        leaving = str(user_id) == str(request.user.id)
        if not leaving and not course.can_manage(request.user):
            raise PermissionDenied('Only the course owner can remove people.')
        if seat.role == CourseMember.Role.OWNER:
            raise serializers.ValidationError({'error': 'Hand ownership to someone else first.'})
        seat.delete()
        return Response({'success': True})


class TransferOwnerView(StudioView):
    def post(self, request, pk, user_id):
        course = self.course(pk, manage=True)
        seat = course.team.filter(user_id=user_id).first()
        if not seat or seat.role == CourseMember.Role.OWNER:
            raise serializers.ValidationError({'error': 'Pick an editor on this team'})
        with transaction.atomic():
            course.team.filter(role=CourseMember.Role.OWNER).update(role=CourseMember.Role.EDITOR)
            seat.role = CourseMember.Role.OWNER
            seat.save(update_fields=['role'])
        return Response({'course': course_detail(self.course(pk), request.user)})


# ── Who can see it ───────────────────────────────────────────────────
class ClassesView(StudioView):
    """PUT {classIds} — share the course with some of *your* classes (other tutors' links are left alone)."""

    def put(self, request, pk):
        course = self.course(pk)
        if course.is_official:
            raise serializers.ValidationError({'error': 'VibeSkool courses are open to everyone already.'})
        wanted = {str(x) for x in (request.data.get('classIds') or [])}
        mine = {str(i): i for i in Classroom.objects.filter(teacher=request.user).values_list('id', flat=True)}
        if wanted - set(mine):
            raise serializers.ValidationError({'classIds': 'You can only share with classes you teach'})
        with transaction.atomic():
            course.classes.remove(*[mine[k] for k in mine if k not in wanted])
            course.classes.add(*[mine[k] for k in wanted])
        return Response({'course': course_detail(self.course(pk), request.user)})


# ── Exercises across your courses ────────────────────────────────────
class ExerciseListView(StudioView):
    def get(self, request):
        courses = access.editable_courses(request.user)
        qs = (Exercise.objects.filter(lesson__path__in=courses).select_related('lesson', 'lesson__path')
              .annotate(attempts=Count('submissions'),
                        passed_students=Count('submissions__student', filter=Q(submissions__passed=True), distinct=True),
                        tried_students=Count('submissions__student', distinct=True))
              .order_by('lesson__path__title', 'lesson__order', 'order', 'created_at'))
        if request.query_params.get('courseId'):
            qs = qs.filter(lesson__path_id=request.query_params['courseId'])
        lessons = (Lesson.objects.filter(path__in=courses).select_related('path')
                   .order_by('path__is_official', 'path__title', 'order'))
        return Response({
            'exercises': [{
                'id': str(e.id), 'title': e.title, 'type': e.type, 'language': e.language, 'points': e.points,
                'tests': len(e.test_cases or []), 'lesson': {'id': e.lesson_id, 'title': e.lesson.title},
                'course': {'id': e.lesson.path_id, 'title': e.lesson.path.title},
                'attempts': e.attempts, 'students_tried': e.tried_students, 'students_passed': e.passed_students,
                'created_at': e.created_at,
            } for e in qs],
            'lessons': [{'id': l.id, 'title': l.title, 'courseId': l.path_id, 'courseTitle': l.path.title,
                         'official': l.path.is_official} for l in lessons],
        })
