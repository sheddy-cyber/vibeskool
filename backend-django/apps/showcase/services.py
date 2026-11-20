from collections import Counter

from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef, Q

from apps.classrooms.models import Classroom, Membership

from .models import Appreciation, Project, ProjectMember

User = get_user_model()
PUBLISH_XP = 30


def my_class_ids(user):
    """Classes the user teaches or belongs to."""
    return set(
        Classroom.objects.filter(Q(teacher=user) | Q(memberships__student=user)).values_list('id', flat=True)
    )


def people_i_can_add(user, class_ids=None):
    """Collaborators come from people you share a class with: classmates and tutors."""
    class_ids = my_class_ids(user) if class_ids is None else class_ids
    students = Membership.objects.filter(classroom_id__in=class_ids).values('student_id')
    tutors = Classroom.objects.filter(id__in=class_ids).values('teacher_id')
    return User.objects.filter(Q(id__in=students) | Q(id__in=tutors), is_active=True).exclude(id=user.id)


def annotated(qs, user):
    return (qs.select_related('classroom')
            .prefetch_related('members__user')
            .annotate(
                n_appreciations=Count('appreciations', distinct=True),
                n_comments=Count('comments', distinct=True),
                i_appreciated=Exists(Appreciation.objects.filter(project=OuterRef('pk'), user=user)),
            ))


def projects_of(users_or_user):
    """Subquery: ids of projects someone (or anyone in a queryset) worked on."""
    if isinstance(users_or_user, User):
        return ProjectMember.objects.filter(user=users_or_user).values('project')
    return ProjectMember.objects.filter(user__in=users_or_user).values('project')


def visible_projects(user):
    """Published work, plus your own drafts. (Subqueries, not joins, so counts stay right.)"""
    return Project.objects.filter(Q(status=Project.Status.PUBLISHED) | Q(pk__in=projects_of(user)))


def top_tags(limit=14):
    counts = Counter()
    for tags in Project.objects.filter(status=Project.Status.PUBLISHED).values_list('tags', flat=True):
        counts.update(tags or [])
    return [{'name': t, 'count': n} for t, n in counts.most_common(limit)]
