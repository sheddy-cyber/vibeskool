"""Who can see and who can edit which course. Every view goes through here.

  Official courses   everyone sees them once published; only admins edit.
  Tutor courses      the team (owner + editors) sees and edits them, drafts
                     included. Students see them once published, and only
                     if they're in a class the course is shared with.
  Lessons            follow their course; an unpublished lesson is seen
                     only by people who can edit the course.
"""
from django.db.models import Q

from .models import CourseMember, Lesson, SkillPath

PUBLISHED = SkillPath.Status.PUBLISHED


def _signed_in(user):
    return bool(user and user.is_authenticated)


def my_class_ids(user):
    from apps.classrooms.models import Classroom
    return Classroom.objects.filter(Q(teacher=user) | Q(memberships__student=user)).values('id')


def team_course_ids(user):
    """Courses the user is on the team of (owner or editor)."""
    return CourseMember.objects.filter(user=user).values('course')


def visible_courses(user):
    official = Q(is_official=True, status=PUBLISHED)
    if not _signed_in(user):
        return SkillPath.objects.filter(official)
    if user.is_admin:
        return SkillPath.objects.all()
    shared = SkillPath.classes.through.objects.filter(classroom_id__in=my_class_ids(user)).values('skillpath_id')
    return SkillPath.objects.filter(
        official
        | Q(pk__in=team_course_ids(user))
        | Q(is_official=False, status=PUBLISHED, pk__in=shared)
    )


def editable_courses(user):
    if not _signed_in(user):
        return SkillPath.objects.none()
    if user.is_admin:
        return SkillPath.objects.all()
    return SkillPath.objects.filter(is_official=False, pk__in=team_course_ids(user))


def visible_lessons(user):
    qs = Lesson.objects.filter(path__in=visible_courses(user))
    if _signed_in(user) and user.is_admin:
        return qs
    if _signed_in(user):
        return qs.filter(Q(published=True) | Q(path__in=editable_courses(user)))
    return qs.filter(published=True)


def can_edit_course(user, course):
    return editable_courses(user).filter(pk=course.pk).exists()


def lesson_visible_to_class(lesson, classroom):
    """Can every student in this class open the lesson?"""
    if not lesson.published or not lesson.path.is_published:
        return False
    if lesson.path.is_official:
        return True
    return lesson.path.classes.filter(pk=classroom.pk).exists()
