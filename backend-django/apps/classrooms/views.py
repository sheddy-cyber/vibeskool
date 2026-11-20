from django.db import IntegrityError, transaction
from django.db.models import Avg, Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTutor
from apps.accounts.serializers import PublicUserSerializer
from apps.learning.models import LessonCompletion

from . import services
from .live import broadcast
from .models import Assignment, Classroom, FeedbackComment, Membership, Nudge, Post, Reply, Submission
from .serializers import (
    AssignmentSerializer, ClassroomSerializer, FeedbackCommentSerializer, MemberSerializer, NudgeSerializer,
    PostSerializer, ReplySerializer, ReviewSerializer, SubmissionSerializer,
)


def with_counts(qs):
    return qs.select_related('teacher').annotate(member_count=Count('memberships', distinct=True))


class ClassroomScoped(APIView):
    """Base for everything under /api/classrooms/<id>/.

    Sets self.classroom and self.tutor (the class's tutor or an admin).
    Anyone who isn't the tutor or a member gets 403.
    """
    tutor_only = False

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        try:
            self.classroom = with_counts(Classroom.objects).get(pk=kwargs['pk'])
        except Classroom.DoesNotExist:
            raise NotFound('Classroom not found')
        self.tutor = self.classroom.is_tutor(request.user)
        if not self.tutor and (self.tutor_only or not self.classroom.is_member(request.user)):
            raise PermissionDenied('Access denied')

    def ctx(self):
        return {'request': self.request, 'tutor': self.tutor}

    def require_tutor(self):
        if not self.tutor:
            raise PermissionDenied('Only the tutor can do that.')

    def members(self):
        return list(self.classroom.memberships.select_related('student'))


# ── Classes ───────────────────────────────────────────────────────────
class ClassroomListView(APIView):
    def get(self, request):
        user = request.user
        if user.is_admin:
            qs = Classroom.objects.all()
        elif user.is_tutor:
            qs = Classroom.objects.filter(teacher=user)
        else:
            # Filter with a subquery so the member count isn't narrowed to this student's row
            qs = Classroom.objects.filter(pk__in=Membership.objects.filter(student=user).values('classroom'))
        qs = with_counts(qs)
        return Response({'classrooms': ClassroomSerializer(qs, many=True, context={'request': request}).data})

    def post(self, request):
        if not request.user.is_tutor:
            raise PermissionDenied('Only tutors can create a class.')
        s = ClassroomSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        room = s.save(teacher=request.user)
        room.member_count = 0
        return Response({'classroom': ClassroomSerializer(room, context={'request': request}).data},
                        status=status.HTTP_201_CREATED)


class JoinView(APIView):
    def post(self, request):
        code = (request.data.get('inviteCode') or '').strip().upper()
        if not code:
            return Response({'error': 'Invite code is required'}, status=status.HTTP_400_BAD_REQUEST)
        room = Classroom.objects.filter(invite_code__iexact=code, archived=False).first()
        if not room or not room.joining_open:
            return Response({'error': 'Classroom not found'}, status=status.HTTP_404_NOT_FOUND)
        if room.teacher_id == request.user.id:
            return Response({'error': "You're the tutor of this class"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                Membership.objects.create(classroom=room, student=request.user)
        except IntegrityError:
            return Response({'error': 'Already a member of this classroom'}, status=status.HTTP_400_BAD_REQUEST)
        broadcast(room.id, 'people', 'member.joined', studentId=str(request.user.id))
        room = with_counts(Classroom.objects).get(pk=room.pk)
        return Response({'classroom': ClassroomSerializer(room, context={'request': request}).data})


class ClassroomDetailView(ClassroomScoped):
    def get(self, request, pk):
        room = self.classroom
        data = ClassroomSerializer(room, context=self.ctx()).data
        data['path_count'] = room.paths.count()
        data['members'] = MemberSerializer(self.members(), many=True, context=self.ctx()).data
        if not self.tutor:
            Membership.objects.filter(classroom=room, student=request.user).update(last_seen_at=timezone.now())
            data['unread_nudges'] = room.nudges.filter(student=request.user, read_at__isnull=True).count()
        return Response(data)

    def put(self, request, pk):
        self.require_tutor()
        s = ClassroomSerializer(self.classroom, data=request.data, partial=True, context=self.ctx())
        s.is_valid(raise_exception=True)
        room = s.save()
        broadcast(room.id, 'class', 'class.updated')
        return Response(ClassroomSerializer(room, context=self.ctx()).data)

    patch = put

    def delete(self, request, pk):
        self.require_tutor()
        room_id = self.classroom.id
        self.classroom.delete()
        broadcast(room_id, 'class', 'class.deleted')
        return Response({'success': True})


class LeaveView(ClassroomScoped):
    def post(self, request, pk):
        if self.tutor:
            return Response({'error': "Tutors can't leave their own class"}, status=status.HTTP_400_BAD_REQUEST)
        Membership.objects.filter(classroom=self.classroom, student=request.user).delete()
        broadcast(self.classroom.id, 'people', 'member.left', studentId=str(request.user.id))
        return Response({'success': True})


class InviteCodeView(ClassroomScoped):
    """POST: make a new invite code (the old one stops working)."""
    tutor_only = True

    def post(self, request, pk):
        self.classroom.reset_invite_code()
        broadcast(self.classroom.id, 'class', 'class.updated')
        return Response({'invite_code': self.classroom.invite_code})


class MembersView(ClassroomScoped):
    tutor_only = True

    def get(self, request, pk):
        return Response({'members': MemberSerializer(self.members(), many=True, context=self.ctx()).data})


class MemberDetailView(ClassroomScoped):
    tutor_only = True

    def delete(self, request, pk, student_id):
        Membership.objects.filter(classroom=self.classroom, student_id=student_id).delete()
        broadcast(self.classroom.id, 'people', 'member.removed', studentId=str(student_id))
        return Response({'success': True})


class LeaderboardView(ClassroomScoped):
    def get(self, request, pk):
        users = [m.student for m in self.members()]
        users.sort(key=lambda u: (-u.xp, u.created_at))
        board = [{**PublicUserSerializer(u).data, 'xp': u.xp, 'badges': u.badges} for u in users[:50]]
        return Response({'leaderboard': board})


class StatsView(ClassroomScoped):
    """Headline numbers for the class page."""

    def get(self, request, pk):
        room = self.classroom
        ids = room.memberships.values('student_id')
        week_ago = timezone.now() - timezone.timedelta(days=7)
        return Response({
            'members': room.member_count,
            'activeThisWeek': LessonCompletion.objects.filter(student_id__in=ids, completed_at__gte=week_ago)
            .values('student_id').distinct().count(),
            'lessonsThisWeek': LessonCompletion.objects.filter(student_id__in=ids, completed_at__gte=week_ago).count(),
            'openQuestions': room.posts.filter(kind=Post.Kind.QUESTION, resolved_at__isnull=True).count(),
            'assignments': room.assignments.filter(published=True).count(),
            'toReview': Submission.objects.filter(assignment__classroom=room, status=Submission.Status.SUBMITTED).count()
            if self.tutor else None,
        })


class AnalyticsView(ClassroomScoped):
    """Kept for the current tutor page (same shape as the Express route)."""
    tutor_only = True

    def get(self, request, pk):
        members = self.classroom.memberships
        avg = members.aggregate(v=Avg('student__xp'))['v'] or 0
        return Response({
            'totalStudents': members.count(),
            'avgXp': round(avg),
            # Exercises move over from the Express server in a later step
            'difficultExercises': [],
        })


class InsightsView(ClassroomScoped):
    """Who needs help: per-student signals, most urgent first, plus questions waiting on the tutor."""
    tutor_only = True

    def get(self, request, pk):
        rows, waiting = services.class_insights(self.classroom)
        for r in rows:
            r['student'] = PublicUserSerializer(r['student']).data
        return Response({
            'students': rows,
            'needsHelp': sum(1 for r in rows if r['flags']),
            'waitingQuestions': PostSerializer(waiting, many=True, context=self.ctx()).data,
        })


# ── Stream ────────────────────────────────────────────────────────────
class PostListView(ClassroomScoped):
    """GET ?kind=question&open=1&lesson=<id>&before=<post id>  ·  POST a new post."""
    PAGE = 30

    def visible(self):
        qs = self.classroom.posts.select_related('author', 'lesson').prefetch_related(
            Prefetch('replies', queryset=Reply.objects.select_related('author')))
        if not self.tutor:
            qs = qs.filter(Q(is_private=False) | Q(author=self.request.user))
        return qs

    def get(self, request, pk):
        qs = self.visible()
        p = request.query_params
        if p.get('kind') in Post.Kind.values:
            qs = qs.filter(kind=p['kind'])
        if p.get('open') in ('1', 'true'):
            qs = qs.filter(kind=Post.Kind.QUESTION, resolved_at__isnull=True)
        if p.get('lesson'):
            qs = qs.filter(lesson_id=p['lesson'])
        if p.get('before', '').isdigit():
            qs = qs.filter(pk__lt=int(p['before']), pinned=False)
        posts = list(qs[:self.PAGE + 1])
        return Response({
            'posts': PostSerializer(posts[:self.PAGE], many=True, context=self.ctx()).data,
            'hasMore': len(posts) > self.PAGE,
        })

    def post(self, request, pk):
        s = PostSerializer(data=request.data, context=self.ctx())
        s.is_valid(raise_exception=True)
        kind = s.validated_data.get('kind', Post.Kind.POST)
        if kind == Post.Kind.ANNOUNCEMENT and not self.tutor:
            raise PermissionDenied('Only the tutor can post announcements.')
        extra = {}
        if not self.tutor:
            extra['pinned'] = False
        if kind != Post.Kind.QUESTION:
            extra['is_private'] = False  # only questions can be private
        s.validated_data.pop('resolved', None)
        post = s.save(classroom=self.classroom, author=request.user, **extra)
        broadcast(self.classroom.id, 'stream', 'post.created', id=post.id)
        return Response({'post': PostSerializer(post, context=self.ctx()).data}, status=status.HTTP_201_CREATED)


class PostDetailView(ClassroomScoped):
    def get_post(self, post_id):
        post = get_object_or_404(Post.objects.select_related('author', 'lesson'), pk=post_id, classroom=self.classroom)
        if not post.visible_to(self.request.user, self.tutor):
            raise NotFound('Post not found')
        return post

    def get(self, request, pk, post_id):
        return Response({'post': PostSerializer(self.get_post(post_id), context=self.ctx()).data})

    def put(self, request, pk, post_id):
        post = self.get_post(post_id)
        mine = post.author_id == request.user.id
        if not (mine or self.tutor):
            raise PermissionDenied("You can't change this post.")
        s = PostSerializer(post, data=request.data, partial=True, context=self.ctx())
        s.is_valid(raise_exception=True)
        d = s.validated_data
        d.pop('kind', None)  # a post keeps its kind
        if not self.tutor:
            d.pop('pinned', None)
        if not mine:
            # The tutor may pin or resolve someone else's post, not rewrite it
            for key in ('title', 'body', 'code', 'code_language', 'lesson', 'is_private'):
                d.pop(key, None)
        if 'resolved' in d:
            resolved = d.pop('resolved')
            post.resolved_at = (post.resolved_at or timezone.now()) if resolved else None
        if any(k in d for k in ('title', 'body', 'code')):
            post.edited_at = timezone.now()
        for key, value in d.items():
            setattr(post, key, value)
        post.save()
        broadcast(self.classroom.id, 'stream', 'post.updated', id=post.id)
        return Response({'post': PostSerializer(post, context=self.ctx()).data})

    patch = put

    def delete(self, request, pk, post_id):
        post = self.get_post(post_id)
        if not (post.author_id == request.user.id or self.tutor):
            raise PermissionDenied("You can't delete this post.")
        broadcast(self.classroom.id, 'stream', 'post.deleted', id=post.id)
        post.delete()
        return Response({'success': True})


class ReplyListView(ClassroomScoped):
    def post(self, request, pk, post_id):
        post = get_object_or_404(Post, pk=post_id, classroom=self.classroom)
        if not post.visible_to(request.user, self.tutor):
            raise NotFound('Post not found')
        s = ReplySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        reply = s.save(post=post, author=request.user)
        broadcast(self.classroom.id, 'stream', 'reply.created', id=reply.id, postId=post.id)
        return Response({'reply': ReplySerializer(reply).data}, status=status.HTTP_201_CREATED)


class ReplyDetailView(ClassroomScoped):
    def get_reply(self, reply_id):
        reply = get_object_or_404(Reply.objects.select_related('post', 'author'), pk=reply_id, post__classroom=self.classroom)
        if not reply.post.visible_to(self.request.user, self.tutor):
            raise NotFound('Reply not found')
        return reply

    def delete(self, request, pk, reply_id):
        reply = self.get_reply(reply_id)
        if not (reply.author_id == request.user.id or self.tutor):
            raise PermissionDenied("You can't delete this reply.")
        broadcast(self.classroom.id, 'stream', 'reply.deleted', id=reply.id, postId=reply.post_id)
        reply.delete()
        return Response({'success': True})


class AcceptReplyView(ReplyDetailView):
    """POST: mark a reply as the answer (the asker or the tutor). Resolves the question."""

    def post(self, request, pk, reply_id):
        reply = self.get_reply(reply_id)
        post = reply.post
        if not (post.author_id == request.user.id or self.tutor):
            raise PermissionDenied('Only the person who asked, or the tutor, can pick the answer.')
        with transaction.atomic():
            post.replies.update(accepted=False)
            reply.accepted = True
            reply.save(update_fields=['accepted'])
            if post.kind == Post.Kind.QUESTION and not post.resolved_at:
                post.resolved_at = timezone.now()
                post.save(update_fields=['resolved_at'])
        broadcast(self.classroom.id, 'stream', 'reply.accepted', id=reply.id, postId=post.id)
        return Response({'reply': ReplySerializer(reply).data, 'resolved': post.resolved})


# ── Assignments ───────────────────────────────────────────────────────
class AssignmentListView(ClassroomScoped):
    def get(self, request, pk):
        qs = self.classroom.assignments.select_related('lesson').prefetch_related('submissions')
        if not self.tutor:
            qs = qs.filter(published=True)
        assignments = list(qs)
        data = AssignmentSerializer(assignments, many=True).data
        if self.tutor:
            members = self.members()
            for item, a in zip(data, assignments):
                item['counts'] = services.status_counts(a, members)
        else:
            finished = set(LessonCompletion.objects.filter(student=request.user).values_list('lesson_id', flat=True))
            for item, a in zip(data, assignments):
                sub = next((s for s in a.submissions.all() if s.student_id == request.user.id), None)
                item['status'] = services.assignment_status(a, sub, finished)
                item['submissionId'] = sub.id if sub else None
        return Response({'assignments': data})

    def post(self, request, pk):
        self.require_tutor()
        s = AssignmentSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        a = s.save(classroom=self.classroom, created_by=request.user)
        broadcast(self.classroom.id, 'work', 'assignment.created', assignmentId=a.id)
        return Response({'assignment': AssignmentSerializer(a).data}, status=status.HTTP_201_CREATED)


class AssignmentDetailView(ClassroomScoped):
    def get_assignment(self, aid):
        qs = self.classroom.assignments.select_related('lesson')
        if not self.tutor:
            qs = qs.filter(published=True)
        return get_object_or_404(qs, pk=aid)

    def get(self, request, pk, aid):
        a = self.get_assignment(aid)
        data = AssignmentSerializer(a).data
        if self.tutor:
            rows = services.roster_for_assignment(a, self.members())
            data['roster'] = [{
                'student': PublicUserSerializer(r['student']).data,
                'status': r['status'],
                'submissionId': r['submission'].id if r['submission'] else None,
                'submitted_at': r['submission'].submitted_at if r['submission'] else None,
                'late': r['submission'].late if r['submission'] else False,
            } for r in rows]
        else:
            sub = a.submissions.filter(student=request.user).prefetch_related('comments__author').first()
            finished = set(LessonCompletion.objects.filter(student=request.user, lesson_id=a.lesson_id).values_list('lesson_id', flat=True))
            data['status'] = services.assignment_status(a, sub, finished)
            data['submission'] = SubmissionSerializer(sub).data if sub else None
        return Response({'assignment': data})

    def put(self, request, pk, aid):
        self.require_tutor()
        s = AssignmentSerializer(self.get_assignment(aid), data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        a = s.save()
        broadcast(self.classroom.id, 'work', 'assignment.updated', assignmentId=a.id)
        return Response({'assignment': AssignmentSerializer(a).data})

    patch = put

    def delete(self, request, pk, aid):
        self.require_tutor()
        self.get_assignment(aid).delete()
        broadcast(self.classroom.id, 'work', 'assignment.deleted', assignmentId=int(aid))
        return Response({'success': True})


class MySubmissionView(AssignmentDetailView):
    """PUT: a student hands in (or hands in again) their work for an assignment."""

    def put(self, request, pk, aid):
        if self.tutor:
            return Response({'error': 'Tutors review work; students hand it in'}, status=status.HTTP_400_BAD_REQUEST)
        a = self.get_assignment(aid)
        if a.kind == Assignment.Kind.LESSON:
            return Response({'error': 'This one is done by finishing the lesson'}, status=status.HTTP_400_BAD_REQUEST)
        s = SubmissionSerializer(data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        if a.kind == Assignment.Kind.CODE and not (d.get('code') or '').strip():
            return Response({'error': 'Paste your code first'}, status=status.HTTP_400_BAD_REQUEST)
        if a.kind == Assignment.Kind.LINK and not d.get('link'):
            return Response({'error': 'Add the link first'}, status=status.HTTP_400_BAD_REQUEST)
        sub, created = Submission.objects.get_or_create(assignment=a, student=request.user)
        if not created and sub.status == Submission.Status.APPROVED:
            return Response({'error': 'This work is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        old_code = sub.code
        with transaction.atomic():
            for key in ('code', 'link', 'note'):
                if key in d:
                    setattr(sub, key, d[key])
            if not created and (sub.code != old_code or 'link' in d):
                sub.revision += 1
            sub.status = Submission.Status.SUBMITTED
            sub.submitted_at = timezone.now()
            sub.save()
            if not created:
                services.reanchor_comments(sub, old_code, sub.code)
        broadcast(self.classroom.id, 'work', 'submission.handed_in',
                  assignmentId=a.id, submissionId=sub.id, studentId=str(request.user.id))
        sub = Submission.objects.prefetch_related('comments__author').get(pk=sub.pk)
        return Response({'submission': SubmissionSerializer(sub).data},
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class SubmissionView(ClassroomScoped):
    def get_submission(self, sid):
        sub = get_object_or_404(
            Submission.objects.select_related('assignment', 'student').prefetch_related('comments__author'),
            pk=sid, assignment__classroom=self.classroom,
        )
        if not (self.tutor or sub.student_id == self.request.user.id):
            raise NotFound('Submission not found')
        return sub

    def get(self, request, pk, sid):
        sub = self.get_submission(sid)
        data = SubmissionSerializer(sub).data
        data['assignment'] = AssignmentSerializer(sub.assignment).data
        return Response({'submission': data})


class ReviewView(SubmissionView):
    """POST {status: approved|changes_requested, score?, comment?} — the tutor's verdict."""
    tutor_only = True

    def post(self, request, pk, sid):
        sub = self.get_submission(sid)
        s = ReviewSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        with transaction.atomic():
            sub.status = d['status']
            if 'score' in d:
                sub.score = d['score']
            sub.reviewed_at = timezone.now()
            sub.save()
            if d.get('comment', '').strip():
                FeedbackComment.objects.create(submission=sub, author=request.user, body=d['comment'].strip())
        broadcast(self.classroom.id, 'work', 'submission.reviewed',
                  assignmentId=sub.assignment_id, submissionId=sub.id, studentId=str(sub.student_id))
        sub = self.get_submission(sid)
        return Response({'submission': SubmissionSerializer(sub).data})


class CommentListView(SubmissionView):
    """POST {body, line?} — feedback on a submission, optionally on one line of code."""

    def post(self, request, pk, sid):
        sub = self.get_submission(sid)
        s = FeedbackCommentSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        line = s.validated_data.get('line')
        if line and line > max(1, len(sub.code.splitlines())):
            return Response({'error': 'That line is not in the code'}, status=status.HTTP_400_BAD_REQUEST)
        c = s.save(submission=sub, author=request.user)
        broadcast(self.classroom.id, 'work', 'submission.commented',
                  assignmentId=sub.assignment_id, submissionId=sub.id, studentId=str(sub.student_id))
        return Response({'comment': FeedbackCommentSerializer(c).data}, status=status.HTTP_201_CREATED)


# ── Nudges ────────────────────────────────────────────────────────────
class NudgeListView(ClassroomScoped):
    def get(self, request, pk):
        qs = self.classroom.nudges.select_related('sender', 'student')
        if not self.tutor:
            qs = qs.filter(student=request.user)
        return Response({'nudges': NudgeSerializer(qs[:50], many=True).data})

    def post(self, request, pk):
        self.require_tutor()
        s = NudgeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        student_id = s.validated_data.pop('studentId')
        if not self.classroom.memberships.filter(student_id=student_id).exists():
            return Response({'error': "That student isn't in this class"}, status=status.HTTP_400_BAD_REQUEST)
        n = s.save(classroom=self.classroom, sender=request.user, student_id=student_id)
        broadcast(self.classroom.id, 'nudges', 'nudge.created', studentId=str(student_id))
        return Response({'nudge': NudgeSerializer(n).data}, status=status.HTTP_201_CREATED)


class NudgeReadView(ClassroomScoped):
    def post(self, request, pk, nid):
        n = get_object_or_404(Nudge, pk=nid, classroom=self.classroom, student=request.user)
        if not n.read_at:
            n.read_at = timezone.now()
            n.save(update_fields=['read_at'])
        return Response({'nudge': NudgeSerializer(n).data})
