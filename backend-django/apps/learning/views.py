import random

from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from apps.accounts.permissions import IsTutor

from . import access, services
from .models import Lesson, LessonCompletion, PassedModule, Question, SkillCheck, SkillCheckAttempt, SkillPath, Streak
from .serializers import LessonListSerializer, LessonSerializer, PathSerializer, SkillCheckSerializer


def with_lessons(courses, user):
    lessons = access.visible_lessons(user).order_by('order')
    return courses.prefetch_related(Prefetch('lessons', queryset=lessons, to_attr='visible_lessons'))


class ReadOpenWriteTutor:
    """Anyone may read; writing needs a tutor, and then the per-course checks below."""

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAuthenticated(), IsTutor()]


def editable_course_or_403(user, pk):
    course = get_object_or_404(SkillPath, pk=pk)
    if not course.can_edit(user):
        raise PermissionDenied("You can only change courses you're on the team of.")
    return course


# ── Paths (courses) ───────────────────────────────────────────────────
class PathListView(ReadOpenWriteTutor, APIView):
    def get(self, request):
        courses = with_lessons(access.visible_courses(request.user), request.user)
        return Response({'paths': PathSerializer(courses, many=True, context={'request': request}).data})

    def post(self, request):
        """Create a tutor course with you as its owner (the studio uses /api/studio/courses)."""
        from .studio import create_course
        course = create_course(request.user, request.data)
        return Response({'path': PathSerializer(course, context={'request': request}).data}, status=status.HTTP_201_CREATED)


class PathDetailView(ReadOpenWriteTutor, APIView):
    def get(self, request, pk):
        course = with_lessons(access.visible_courses(request.user), request.user).filter(pk=pk).first()
        if not course:
            return Response({'error': 'Path not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'path': PathSerializer(course, context={'request': request}).data})

    def put(self, request, pk):
        course = editable_course_or_403(request.user, pk)
        s = PathSerializer(course, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.validated_data.pop('id', None)
        return Response({'path': PathSerializer(s.save(), context={'request': request}).data})

    def delete(self, request, pk):
        course = get_object_or_404(SkillPath, pk=pk)
        if not course.can_manage(request.user):
            raise PermissionDenied('Only the course owner can delete it.')
        course.delete()
        return Response({'success': True})


# ── Lessons ───────────────────────────────────────────────────────────
class LessonListView(ReadOpenWriteTutor, APIView):
    def get(self, request):
        lessons = access.visible_lessons(request.user).select_related('path').order_by('path__order', 'path__title', 'order')
        return Response({'lessons': LessonListSerializer(lessons, many=True).data})

    def post(self, request):
        s = LessonSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        course = s.validated_data['path']
        if not course.can_edit(request.user):
            raise PermissionDenied("You can only add lessons to courses you're on the team of.")
        if Lesson.objects.filter(pk=s.validated_data['id']).exists():
            return Response({'error': 'A lesson with that id already exists'}, status=status.HTTP_409_CONFLICT)
        lesson = s.save(created_by=request.user, updated_by=request.user)
        return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_201_CREATED)


class LessonDetailView(ReadOpenWriteTutor, APIView):
    def get(self, request, pk):
        lesson = access.visible_lessons(request.user).filter(pk=pk).select_related('path').first()
        if not lesson:
            return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'lesson': LessonSerializer(lesson).data})

    def editable(self, request, pk):
        lesson = get_object_or_404(Lesson.objects.select_related('path'), pk=pk)
        if not lesson.path.can_edit(request.user):
            # Don't reveal drafts that exist in other people's courses
            if not access.visible_lessons(request.user).filter(pk=pk).exists():
                raise NotFound('Lesson not found')
            raise PermissionDenied("You can only change lessons in courses you're on the team of.")
        return lesson

    def put(self, request, pk):
        lesson = self.editable(request, pk)
        s = LessonSerializer(lesson, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.validated_data.pop('id', None)
        target = s.validated_data.get('path')
        if target and target.pk != lesson.path_id and not target.can_edit(request.user):
            raise PermissionDenied("You can only move lessons into courses you're on the team of.")
        return Response({'lesson': LessonSerializer(s.save(updated_by=request.user)).data})

    def delete(self, request, pk):
        self.editable(request, pk).delete()
        return Response({'success': True})


# ── Progress ──────────────────────────────────────────────────────────
class ProgressView(APIView):
    def get(self, request):
        rows = (LessonCompletion.objects.filter(student=request.user)
                .select_related('lesson').order_by('completed_at'))
        progress, completions = {}, []
        for row in rows:
            path_id = row.lesson.path_id
            progress.setdefault(path_id, []).append(row.lesson_id)
            completions.append({'lessonId': row.lesson_id, 'pathId': path_id, 'completedAt': row.completed_at})
        summary = services.student_summary(request.user)
        return Response({
            'progress': progress,
            'completions': completions,
            'lessonsCompleted': summary['lessonsCompleted'],
            'passedModules': summary['passedModules'],
            'currentStreak': summary['currentStreak'],
            'longestStreak': summary['longestStreak'],
        })

    def delete(self, request):
        """Development only: wipe your own progress."""
        if not settings.DEBUG:
            return Response({'error': 'Not available'}, status=status.HTTP_404_NOT_FOUND)
        LessonCompletion.objects.filter(student=request.user).delete()
        PassedModule.objects.filter(student=request.user).delete()
        Streak.objects.filter(student=request.user).delete()
        return Response({'success': True})


class CompleteLessonView(APIView):
    def post(self, request):
        lesson_id = request.data.get('lessonId')
        if not lesson_id:
            return Response({'error': 'lessonId is required'}, status=status.HTTP_400_BAD_REQUEST)
        lesson = access.visible_lessons(request.user).filter(pk=lesson_id).first()
        if not lesson:
            return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)
        result = services.complete_lesson(request.user, lesson)
        # Lesson assignments and the tutor's "needs help" view depend on this
        from apps.classrooms.live import broadcast
        for room_id in request.user.memberships.values_list('classroom_id', flat=True):
            broadcast(room_id, 'work', 'lesson.completed', lessonId=lesson.id, studentId=str(request.user.id))
        return Response(result)


# ── Skill checks ──────────────────────────────────────────────────────
class SkillCheckThrottle(UserRateThrottle):
    scope = 'skill-check'
    rate = '40/hour'


def deal(questions):
    """Option order for each question, with the right answers spread evenly over A-D.

    Shuffling alone can put the answer on B three times running; dealing the
    positions (A, B, C, D, A, B, ...) and then shuffling which question gets
    which keeps position from ever being a clue.
    """
    rng = random.SystemRandom()
    options = [list(q.options.all()) for q in questions]
    fewest = min((len(o) for o in options), default=1) or 1
    slots = [i % fewest for i in range(len(questions))]
    rng.shuffle(slots)
    dealt = []
    for q, opts, slot in zip(questions, options, slots):
        right = [o for o in opts if o.correct][:1]
        wrong = [o for o in opts if not right or o.id != right[0].id]
        rng.shuffle(wrong)
        order = wrong[:]
        if right:
            order.insert(min(slot, len(order)), right[0])
        dealt.append({'key': q.key, 'options': [o.id for o in order]})
    return dealt


def own_attempt(user, pk):
    attempt = SkillCheckAttempt.objects.select_related('skill_check').filter(pk=pk, student=user).first()
    if not attempt:
        raise NotFound('That attempt was not found. Start the skill check again.')
    return attempt


def attempt_result(attempt):
    """Score the locked-in answers. Unanswered questions count as wrong."""
    keys = [q['key'] for q in attempt.questions]
    questions = {q.key: q for q in Question.objects.filter(key__in=keys).prefetch_related('options')}
    results, right = [], 0
    for key in keys:
        q = questions.get(key)
        correct = next((o.id for o in q.options.all() if o.correct), None) if q else None
        chosen = attempt.answers.get(key)
        ok = correct is not None and chosen == correct
        right += ok
        results.append({'question': key, 'chosen': chosen, 'correctOption': correct, 'correct': ok,
                        'explanation': q.explanation if q else ''})
    total = len(keys)
    score = round(right / total * 100) if total else 0
    return {'score': score, 'right': right, 'total': total, 'passed': total > 0 and score >= SkillCheck.PASS_MARK,
            'passMark': SkillCheck.PASS_MARK, 'results': results}


class SkillCheckInfoView(APIView):
    """GET: what the intro screen shows. No questions."""

    def get(self, request, module_id):
        check = SkillCheck.objects.filter(pk=module_id).first()
        count = check.questions.count() if check else 0
        return Response({
            'skillCheck': SkillCheckSerializer(check).data if check else None,
            'questionCount': min(count, check.questions_per_attempt) if check else 0,
            'passMark': SkillCheck.PASS_MARK,
        })


class StartAttemptView(APIView):
    """POST: start a skill check. A random set of questions, options in a dealt order, no answers."""
    throttle_classes = [SkillCheckThrottle]

    def post(self, request, module_id):
        check = SkillCheck.objects.filter(pk=module_id).first()
        if not check:
            raise NotFound("This skill check isn't ready yet.")
        pool = list(check.questions.prefetch_related('options'))
        picked = random.SystemRandom().sample(pool, min(check.questions_per_attempt, len(pool)))
        if not picked:
            raise NotFound("This skill check has no questions yet.")
        attempt = SkillCheckAttempt.objects.create(student=request.user, skill_check=check, questions=deal(picked))
        by_key = {q.key: q for q in picked}
        questions = []
        for item in attempt.questions:
            q = by_key[item['key']]
            text = {o.id: o.text for o in q.options.all()}
            questions.append({'id': q.key, 'topic': q.topic, 'question': q.prompt,
                              'options': [{'id': oid, 'text': text[oid]} for oid in item['options']]})
        return Response({'attempt': str(attempt.id), 'skillCheck': SkillCheckSerializer(check).data,
                         'questions': questions}, status=status.HTTP_201_CREATED)


class AnswerView(APIView):
    """POST {question, option}: lock in an answer and find out if it was right. One go per question."""

    def post(self, request, pk):
        own_attempt(request.user, pk)
        key = str(request.data.get('question') or '')
        try:
            option = int(request.data.get('option'))
        except (TypeError, ValueError):
            option = None
        # Row lock, so two quick clicks can't both count
        with transaction.atomic():
            attempt = SkillCheckAttempt.objects.select_for_update().get(pk=pk)
            if attempt.finished_at:
                return Response({'error': 'This attempt is finished. Start a new one.'}, status=status.HTTP_409_CONFLICT)
            item = next((q for q in attempt.questions if q['key'] == key), None)
            if not item:
                return Response({'error': "That question isn't part of this attempt."}, status=status.HTTP_400_BAD_REQUEST)
            if option not in item['options']:
                return Response({'error': 'Pick one of the options.'}, status=status.HTTP_400_BAD_REQUEST)
            if key in attempt.answers:
                return Response({'error': 'You already answered that one.'}, status=status.HTTP_409_CONFLICT)
            attempt.answers = {**attempt.answers, key: option}
            attempt.save(update_fields=['answers'])
        q = Question.objects.prefetch_related('options').get(key=key)
        correct = next((o.id for o in q.options.all() if o.correct), None)
        return Response({'correct': option == correct, 'correctOption': correct, 'explanation': q.explanation})


class FinishAttemptView(APIView):
    """POST: score the attempt here, from the answers given, and record a pass."""

    def post(self, request, pk):
        attempt = own_attempt(request.user, pk)
        result = attempt_result(attempt)
        if not attempt.finished_at:
            updated = SkillCheckAttempt.objects.filter(pk=attempt.pk, finished_at__isnull=True).update(
                finished_at=timezone.now(), score=result['score'], passed=result['passed'])
            if updated and result['passed']:
                result['progress'] = services.pass_module(request.user, attempt.skill_check.module_id, result['score'])
        if 'progress' not in result:
            result['progress'] = {'passedModules': list(
                PassedModule.objects.filter(student=request.user).values_list('module_id', flat=True)), 'xpAwarded': 0}
        return Response(result)
