"""Progress rules: completing lessons, streaks, XP and skill checks.

Kept out of the views so the classroom insights and the admin can reuse them.
"""
from datetime import timedelta

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import LessonCompletion, PassedModule, Streak

LESSON_XP = 10
MODULE_XP = 50


def mek_score(lessons_completed, modules_passed):
    """Readiness score: 3 points a lesson and 10 a passed module, out of 100."""
    return min(100, lessons_completed * 3 + modules_passed * 10)


def student_summary(user):
    lessons = LessonCompletion.objects.filter(student=user).count()
    passed = list(PassedModule.objects.filter(student=user).values_list('module_id', flat=True))
    streak = Streak.objects.filter(student=user).first()
    return {
        'lessonsCompleted': lessons,
        'passedModules': passed,
        'mekScore': mek_score(lessons, len(passed)),
        'currentStreak': current_streak(streak),
        'longestStreak': streak.longest if streak else 0,
    }


def current_streak(streak):
    """A streak only counts while it's alive: active today or yesterday."""
    if not streak or not streak.last_active:
        return 0
    if timezone.localdate() - streak.last_active > timedelta(days=1):
        return 0
    return streak.current


def touch_streak(user, today=None):
    today = today or timezone.localdate()
    streak, created = Streak.objects.select_for_update().get_or_create(
        student=user, defaults={'current': 1, 'longest': 1, 'last_active': today},
    )
    if created or streak.last_active == today:
        return streak
    if streak.last_active == today - timedelta(days=1):
        streak.current += 1
    else:
        streak.current = 1
    streak.longest = max(streak.longest, streak.current)
    streak.last_active = today
    streak.save()
    return streak


@transaction.atomic
def complete_lesson(user, lesson):
    """Mark a lesson done. XP is given once per lesson, not on every replay."""
    _, created = LessonCompletion.objects.get_or_create(student=user, lesson=lesson)
    touch_streak(user)
    xp = LESSON_XP if created else 0
    if xp:
        type(user).objects.filter(pk=user.pk).update(xp=F('xp') + xp)
    done_in_path = LessonCompletion.objects.filter(student=user, lesson__path_id=lesson.path_id).count()
    return {'success': True, 'lessonsComplete': done_in_path, 'xpAwarded': xp}


@transaction.atomic
def pass_module(user, module_id, score):
    """Record a passed skill check, keeping the best score."""
    record, created = PassedModule.objects.get_or_create(
        student=user, module_id=module_id, defaults={'score': score},
    )
    if not created and score > record.score:
        record.score = score
        record.save(update_fields=['score'])
    if created:
        type(user).objects.filter(pk=user.pk).update(xp=F('xp') + MODULE_XP)
    touch_streak(user)
    passed = list(PassedModule.objects.filter(student=user).values_list('module_id', flat=True))
    return {'success': True, 'passedModules': passed, 'xpAwarded': MODULE_XP if created else 0}
