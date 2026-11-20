import random

from django.conf import settings
from django.db.models import Prefetch, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsTutor

from . import services
from .models import Lesson, LessonCompletion, PassedModule, SkillCheck, SkillPath, Streak
from .serializers import (
    LessonListSerializer, LessonSerializer, PathSerializer, QuestionPublicSerializer, SkillCheckSerializer,
)


def visible_paths(user):
    """Public paths, plus paths made for classes the user belongs to or teaches."""
    qs = SkillPath.objects.all()
    if not (user and user.is_authenticated):
        return qs.filter(classroom__isnull=True)
    if user.is_admin:
        return qs
    return qs.filter(
        Q(classroom__isnull=True) | Q(classroom__teacher=user) | Q(classroom__memberships__student=user)
    ).distinct()


def lessons_for(user):
    qs = Lesson.objects.select_related('path')
    if not (user and user.is_authenticated and user.is_tutor):
        qs = qs.filter(published=True)
    return qs


class TutorWritesMixin:
    """Anyone may read; tutors write; only admins delete paths."""

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAuthenticated(), IsTutor()]


# ── Paths ─────────────────────────────────────────────────────────────
class PathListView(TutorWritesMixin, APIView):
    def get(self, request):
        lessons = lessons_for(request.user).order_by('order')
        paths = visible_paths(request.user).prefetch_related(Prefetch('lessons', queryset=lessons, to_attr='visible_lessons'))
        return Response({'paths': PathSerializer(paths, many=True).data})

    def post(self, request):
        s = PathSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        if SkillPath.objects.filter(pk=s.validated_data['id']).exists():
            return Response({'error': 'A path with that id already exists'}, status=status.HTTP_409_CONFLICT)
        path = s.save(created_by=request.user)
        return Response({'path': PathSerializer(path).data}, status=status.HTTP_201_CREATED)


class PathDetailView(TutorWritesMixin, APIView):
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    def get(self, request, pk):
        lessons = lessons_for(request.user).order_by('order')
        qs = visible_paths(request.user).prefetch_related(Prefetch('lessons', queryset=lessons, to_attr='visible_lessons'))
        path = qs.filter(pk=pk).first()
        if not path:
            return Response({'error': 'Path not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'path': PathSerializer(path).data})

    def put(self, request, pk):
        path = get_object_or_404(SkillPath, pk=pk)
        s = PathSerializer(path, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.validated_data.pop('id', None)
        path = s.save()
        return Response({'path': PathSerializer(path).data})

    def delete(self, request, pk):
        get_object_or_404(SkillPath, pk=pk).delete()
        return Response({'success': True})


# ── Lessons ───────────────────────────────────────────────────────────
class LessonListView(TutorWritesMixin, APIView):
    def get(self, request):
        lessons = lessons_for(request.user).filter(path__in=visible_paths(request.user)).order_by('path__order', 'order')
        return Response({'lessons': LessonListSerializer(lessons, many=True).data})

    def post(self, request):
        s = LessonSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        if Lesson.objects.filter(pk=s.validated_data['id']).exists():
            return Response({'error': 'A lesson with that id already exists'}, status=status.HTTP_409_CONFLICT)
        lesson = s.save(created_by=request.user)
        return Response({'lesson': LessonSerializer(lesson).data}, status=status.HTTP_201_CREATED)


class LessonDetailView(TutorWritesMixin, APIView):
    def get(self, request, pk):
        lesson = lessons_for(request.user).filter(pk=pk, path__in=visible_paths(request.user)).first()
        if not lesson:
            return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'lesson': LessonSerializer(lesson).data})

    def put(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        s = LessonSerializer(lesson, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.validated_data.pop('id', None)
        lesson = s.save()
        return Response({'lesson': LessonSerializer(lesson).data})

    def delete(self, request, pk):
        get_object_or_404(Lesson, pk=pk).delete()
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
        lesson = lessons_for(request.user).filter(pk=lesson_id).first()
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
