from django.urls import path

from . import views as v

urlpatterns = [
    path('', v.ClassroomListView.as_view(), name='classroom-list'),
    path('join', v.JoinView.as_view(), name='classroom-join'),
    path('<uuid:pk>', v.ClassroomDetailView.as_view(), name='classroom-detail'),
    path('<uuid:pk>/leave', v.LeaveView.as_view(), name='classroom-leave'),
    path('<uuid:pk>/invite-code', v.InviteCodeView.as_view(), name='classroom-invite-code'),
    path('<uuid:pk>/members', v.MembersView.as_view(), name='classroom-members'),
    path('<uuid:pk>/members/<uuid:student_id>', v.MemberDetailView.as_view(), name='classroom-member'),
    path('<uuid:pk>/leaderboard', v.LeaderboardView.as_view(), name='classroom-leaderboard'),
    path('<uuid:pk>/stats', v.StatsView.as_view(), name='classroom-stats'),
    path('<uuid:pk>/insights', v.InsightsView.as_view(), name='classroom-insights'),
    # Stream
    path('<uuid:pk>/posts', v.PostListView.as_view(), name='classroom-posts'),
    path('<uuid:pk>/posts/<int:post_id>', v.PostDetailView.as_view(), name='classroom-post'),
    path('<uuid:pk>/posts/<int:post_id>/code-review', v.CodeReviewView.as_view(), name='classroom-post-code-review'),
    path('<uuid:pk>/posts/<int:post_id>/replies', v.ReplyListView.as_view(), name='classroom-replies'),
    path('<uuid:pk>/replies/<int:reply_id>', v.ReplyDetailView.as_view(), name='classroom-reply'),
    path('<uuid:pk>/replies/<int:reply_id>/accept', v.AcceptReplyView.as_view(), name='classroom-reply-accept'),
    # Assignments
    path('<uuid:pk>/assignments', v.AssignmentListView.as_view(), name='classroom-assignments'),
    path('<uuid:pk>/assignments/<int:aid>', v.AssignmentDetailView.as_view(), name='classroom-assignment'),
    path('<uuid:pk>/assignments/<int:aid>/submission', v.MySubmissionView.as_view(), name='classroom-my-submission'),
    path('<uuid:pk>/submissions/<int:sid>', v.SubmissionView.as_view(), name='classroom-submission'),
    path('<uuid:pk>/submissions/<int:sid>/review', v.ReviewView.as_view(), name='classroom-review'),
    path('<uuid:pk>/submissions/<int:sid>/comments', v.CommentListView.as_view(), name='classroom-comments'),
    # Nudges
    path('<uuid:pk>/nudges', v.NudgeListView.as_view(), name='classroom-nudges'),
    path('<uuid:pk>/nudges/<int:nid>/read', v.NudgeReadView.as_view(), name='classroom-nudge-read'),
]
