import random

from django.conf import settings
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTutor

from . import access, services
from .models import Lesson, LessonCompletion, PassedModule, SkillCheck, SkillPath, Streak
from .serializers import (
    LessonListSerializer, LessonSerializer, PathSerializer, QuestionPublicSerializer, SkillCheckSerializer,
)


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


class PassModuleView(APIView):
    def post(self, request):
        module_id = request.data.get('moduleId')
        try:
            score = int(request.data.get('score'))
        except (TypeError, ValueError):
            score = -1
        if not module_id or not 0 <= score <= 100:
            return Response({'error': 'moduleId and a score from 0 to 100 are required'}, status=status.HTTP_400_BAD_REQUEST)
        if score < SkillCheck.PASS_MARK:
            return Response({'error': f'A pass needs {SkillCheck.PASS_MARK}% or more'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(services.pass_module(request.user, str(module_id), score))


# ── Skill checks ──────────────────────────────────────────────────────
class SkillCheckView(APIView):
    """GET a fresh attempt: a random set of questions, options shuffled, no answers."""

    def get(self, request, module_id):
        check = get_object_or_404(SkillCheck, pk=module_id)
        questions = list(check.questions.prefetch_related('options'))
        random.shuffle(questions)
        picked = questions[:check.questions_per_attempt]
        data = QuestionPublicSerializer(picked, many=True).data
        for q in data:
            random.shuffle(q['options'])
        return Response({'skillCheck': SkillCheckSerializer(check).data, 'questions': data})


class GradeSkillCheckView(APIView):
    """POST {answers: {questionId: optionId}} → score, per-question results; records a pass."""

    def post(self, request, module_id):
        check = get_object_or_404(SkillCheck, pk=module_id)
        answers = request.data.get('answers')
        if not isinstance(answers, dict) or not answers:
            return Response({'error': 'answers is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = services.grade_skill_check(check, answers)
        if result['passed']:
            result['progress'] = services.pass_module(request.user, check.module_id, result['score'])
        return Response(result)
