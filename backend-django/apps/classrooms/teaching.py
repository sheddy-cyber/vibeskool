"""The tutor's overview: everything that needs you, across all your classes."""
from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTutor
from apps.learning import access
from apps.learning.models import CourseInvite, LessonCompletion
from apps.learning.studio import course_summary

from . import services
from .models import Classroom, Membership, Submission


def person(u):
    return {'id': str(u.id), 'display_name': u.display_name, 'avatar_url': u.avatar_url, 'role': u.role}


class OverviewView(APIView):
    permission_classes = [IsAuthenticated, IsTutor]
    ATTENTION_LIMIT = 12

    def get(self, request):
        user = request.user
        rooms = list(Classroom.objects.filter(teacher=user, archived=False).order_by('-created_at'))
        week_ago = timezone.now() - timedelta(days=7)

        attention, classes, students = [], [], set()
        for room in rooms:
            rows, waiting = services.class_insights(room)
            ids = [r['student'].id for r in rows]
            students.update(ids)
            to_review = list(Submission.objects.filter(assignment__classroom=room, status=Submission.Status.SUBMITTED)
                             .select_related('student', 'assignment').order_by('submitted_at'))
            active = (LessonCompletion.objects.filter(student_id__in=ids, completed_at__gte=week_ago)
                      .values('student_id').distinct().count())
            ref = {'id': str(room.id), 'name': room.name}
            classes.append({
                **ref, 'students': len(rows), 'activeThisWeek': active, 'toReview': len(to_review),
                'waiting': len(waiting), 'needsHelp': sum(1 for r in rows if r['flags']),
            })
            for q in waiting:
                attention.append({'kind': 'question', 'id': q.id, 'title': q.title or q.body[:120], 'person': person(q.author),
                                  'classroom': ref, 'at': q.created_at, 'private': q.is_private})
            for sub in to_review:
                attention.append({'kind': 'review', 'id': sub.id, 'assignmentId': sub.assignment_id,
                                  'title': sub.assignment.title, 'person': person(sub.student), 'classroom': ref,
                                  'at': sub.submitted_at, 'late': sub.late})
            for r in rows:
                if 'overdue' in r['flags'] or 'inactive' in r['flags']:
                    attention.append({'kind': 'student', 'id': str(r['student'].id), 'person': person(r['student']),
                                      'classroom': ref, 'flags': r['flags'], 'at': r['last_active'],
                                      'overdue': [o['title'] for o in r['overdue']]})

        # Oldest first: the longer something has waited, the more it needs you
        rank = {'question': 0, 'review': 1, 'student': 2}
        far_past = timezone.now() - timedelta(days=3650)
        attention.sort(key=lambda a: (rank[a['kind']], a['at'] or far_past))

        courses = access.editable_courses(user).filter(is_official=False).prefetch_related('team__user', 'lessons')
        return Response({
            'totals': {
                'classes': len(rooms), 'students': len(students),
                'toReview': sum(c['toReview'] for c in classes), 'waiting': sum(c['waiting'] for c in classes),
                'needsHelp': sum(c['needsHelp'] for c in classes),
            },
            'attention': attention[:self.ATTENTION_LIMIT],
            'attentionTotal': len(attention),
            'classes': classes,
            'courses': [course_summary(c, user) for c in sorted(courses, key=lambda c: c.updated_at, reverse=True)[:6]],
            'invites': CourseInvite.objects.filter(email__iexact=user.email).count(),
        })
