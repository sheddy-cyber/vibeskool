"""Exercises: practice tasks on a lesson, checked against test cases.

Code runs in a sandbox elsewhere (Judge0 or Piston, see runner.py), never
on this one. Web (HTML) exercises are checked visually in the browser, so
they pass on submit.
"""
import json
import logging

from django.db.models import F
from rest_framework import serializers, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from . import access
from .models import Exercise, ExerciseSubmission, Lesson
from .runner import RunnerError, RunnerUnavailable, run_cases

log = logging.getLogger(__name__)
PASS_XP = 20
NOT_SET_UP = "Checking code isn't set up on this server yet. Ask your tutor."


class ExerciseSerializer(serializers.ModelSerializer):
    lesson_id = serializers.PrimaryKeyRelatedField(source='lesson', queryset=Lesson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Exercise
        fields = ['id', 'lesson_id', 'type', 'language', 'title', 'instructions', 'starter_code', 'solution_code',
                  'test_cases', 'options', 'points', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_test_cases(self, value):
        if not isinstance(value, list) or not all(isinstance(t, dict) for t in value):
            raise serializers.ValidationError('Test cases must be a list of {input, expected_output}')
        return value

    def validate_language(self, value):
        if value not in ('javascript', 'python', 'html'):
            raise serializers.ValidationError('Choose JavaScript, Python or HTML')
        return value

    def to_representation(self, obj):
        data = super().to_representation(obj)
        editable = self.context.get('editable_course_ids')
        if editable is None:
            editable = self.context['editable_course_ids'] = set(
                access.editable_courses(self.context['request'].user).values_list('id', flat=True))
        if not obj.lesson or obj.lesson.path_id not in editable:
            data.pop('solution_code', None)  # the answer stays with the course team
        return data


class RunThrottle(UserRateThrottle):
    scope = 'run'
    rate = '30/min'


def check(exercise, code):
    """Returns (passed, score, feedback_json)."""
    if exercise.language in ('html', 'web') or exercise.type != Exercise.Type.CODING:
        return True, 100, json.dumps([{'input': 'Visual', 'actual': 'OK', 'expected': 'OK', 'passed': True}])
    cases = [tc for tc in (exercise.test_cases or []) if isinstance(tc, dict)]
    if not cases:
        return True, 100, 'No test cases defined. Submission accepted.'
    outputs = run_cases(exercise.language, code, cases)
    results, passed = [], 0
    for tc, (actual, error) in zip(cases, outputs):
        ok = not error and actual == str(tc.get('expected_output', '')).strip()
        passed += ok
        results.append({'input': tc.get('input'), 'expected': tc.get('expected_output'), 'actual': actual,
                        'passed': ok, 'stderr': error})
    score = round(passed / len(cases) * 100)
    return score == 100, score, json.dumps(results)


class ExerciseListView(APIView):
    """GET ?lessonId=  ·  POST (tutors)"""

    def get(self, request):
        qs = Exercise.objects.filter(lesson__in=access.visible_lessons(request.user)).select_related('lesson')
        if request.query_params.get('lessonId'):
            qs = qs.filter(lesson_id=request.query_params['lessonId'])
        return Response({'exercises': ExerciseSerializer(qs, many=True, context={'request': request}).data})

    def post(self, request):
        s = ExerciseSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        lesson = s.validated_data.get('lesson')
        if not lesson:
            raise serializers.ValidationError({'lesson_id': 'Pick the lesson this exercise belongs to'})
        if not lesson.path.can_edit(request.user):
            raise PermissionDenied("You can only add exercises to courses you're on the team of.")
        ex = s.save(teacher=request.user)
        return Response({'exercise': ExerciseSerializer(ex, context={'request': request}).data}, status=status.HTTP_201_CREATED)


def visible_exercise(user, pk):
    ex = Exercise.objects.select_related('lesson', 'lesson__path').filter(
        pk=pk, lesson__in=access.visible_lessons(user)).first()
    if not ex:
        raise NotFound('Exercise not found')
    return ex


def editable_exercise(user, pk):
    ex = visible_exercise(user, pk)
    if not ex.lesson.path.can_edit(user):
        raise PermissionDenied("You can only change exercises in courses you're on the team of.")
    return ex


class ExerciseDetailView(APIView):
    def get(self, request, pk):
        ex = visible_exercise(request.user, pk)
        return Response({'exercise': ExerciseSerializer(ex, context={'request': request}).data})

    def put(self, request, pk):
        ex = editable_exercise(request.user, pk)
        s = ExerciseSerializer(ex, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        target = s.validated_data.get('lesson')
        if target and not target.path.can_edit(request.user):
            raise PermissionDenied("You can only move exercises into courses you're on the team of.")
        return Response({'exercise': ExerciseSerializer(s.save(), context={'request': request}).data})

    patch = put

    def delete(self, request, pk):
        editable_exercise(request.user, pk).delete()
        return Response({'success': True})


class SubmitView(APIView):
    """POST {code} → {passed, score, feedback, xpAwarded}. XP only the first time you pass."""
    throttle_classes = [RunThrottle]

    def post(self, request, pk):
        ex = visible_exercise(request.user, pk)
        code = str(request.data.get('code') or '')[:20000]
        try:
            passed, score, feedback = check(ex, code)
        except RunnerUnavailable:
            return Response({'error': NOT_SET_UP}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except (RunnerError, ValueError):
            log.exception('Code runner failed')
            return Response({'error': "Couldn't run your code right now. Try again in a moment."}, status=status.HTTP_502_BAD_GATEWAY)
        first_pass = passed and not ExerciseSubmission.objects.filter(exercise=ex, student=request.user, passed=True).exists()
        ExerciseSubmission.objects.create(exercise=ex, student=request.user, code=code, score=score, passed=passed, feedback=feedback)
        xp = PASS_XP if first_pass else 0
        if xp:
            type(request.user).objects.filter(pk=request.user.pk).update(xp=F('xp') + xp)
        return Response({'passed': passed, 'score': score, 'feedback': feedback, 'xpAwarded': xp})


class SolutionsView(APIView):
    """GET other people's passing solutions, once you've passed it yourself."""

    def get(self, request, pk):
        ex = visible_exercise(request.user, pk)
        if not ex.lesson.path.can_edit(request.user) and not ex.submissions.filter(student=request.user, passed=True).exists():
            raise PermissionDenied('You must pass the exercise before viewing community solutions.')
        subs = ex.submissions.filter(passed=True).exclude(student=request.user).select_related('student')[:20]
        return Response({'solutions': [
            {'id': str(s.id), 'code': s.code, 'created_at': s.submitted_at,
             'display_name': s.student.display_name, 'avatar_url': s.student.avatar_url}
            for s in subs
        ]})


class CheckView(APIView):
    """POST {language, code, test_cases}: tutors try an exercise's tests while writing it.

    Nothing is saved and no XP is given.
    """
    throttle_classes = [RunThrottle]

    def post(self, request):
        if not request.user.is_tutor:
            raise PermissionDenied('Only tutors can do that.')
        cases = request.data.get('test_cases') or []
        if not isinstance(cases, list):
            return Response({'error': 'Test cases must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        draft = Exercise(type=Exercise.Type.CODING, language=str(request.data.get('language') or 'javascript'), test_cases=cases)
        try:
            passed, score, feedback = check(draft, str(request.data.get('code') or '')[:20000])
        except RunnerUnavailable:
            return Response({'error': NOT_SET_UP}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except (RunnerError, ValueError):
            log.exception('Code runner failed')
            return Response({'error': "Couldn't run the code right now. Try again in a moment."},
                            status=status.HTTP_502_BAD_GATEWAY)
        try:
            results = json.loads(feedback)
        except ValueError:
            results = []
        return Response({'passed': passed, 'score': score, 'results': results if isinstance(results, list) else []})
