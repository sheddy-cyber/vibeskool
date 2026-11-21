from django.urls import path

from . import ai, exercises, studio, views

paths_urls = [
    path('', views.PathListView.as_view(), name='path-list'),
    path('<slug:pk>', views.PathDetailView.as_view(), name='path-detail'),
]

lessons_urls = [
    path('', views.LessonListView.as_view(), name='lesson-list'),
    path('<slug:pk>', views.LessonDetailView.as_view(), name='lesson-detail'),
]

progress_urls = [
    path('', views.ProgressView.as_view(), name='progress'),
    path('complete', views.CompleteLessonView.as_view(), name='progress-complete'),
]

skill_check_urls = [
    path('attempts/<uuid:pk>/answer', views.AnswerView.as_view(), name='skill-check-answer'),
    path('attempts/<uuid:pk>/finish', views.FinishAttemptView.as_view(), name='skill-check-finish'),
    path('<str:module_id>/attempts', views.StartAttemptView.as_view(), name='skill-check-start'),
    path('<str:module_id>', views.SkillCheckInfoView.as_view(), name='skill-check'),
]

ai_urls = [
    path('chat', ai.ChatView.as_view(), name='ai-chat'),
    path('hint', ai.HintView.as_view(), name='ai-hint'),
]

exercise_urls = [
    path('', exercises.ExerciseListView.as_view(), name='exercise-list'),
    path('check', exercises.CheckView.as_view(), name='exercise-check'),
    path('<uuid:pk>', exercises.ExerciseDetailView.as_view(), name='exercise-detail'),
    path('<uuid:pk>/submit', exercises.SubmitView.as_view(), name='exercise-submit'),
    path('<uuid:pk>/solutions', exercises.SolutionsView.as_view(), name='exercise-solutions'),
]

studio_urls = [
    path('courses', studio.CourseListView.as_view(), name='studio-courses'),
    path('courses/<slug:pk>', studio.CourseDetailView.as_view(), name='studio-course'),
    path('courses/<slug:pk>/outline', studio.OutlineView.as_view(), name='studio-outline'),
    path('courses/<slug:pk>/lessons', studio.LessonCreateView.as_view(), name='studio-lesson-create'),
    path('courses/<slug:pk>/invites', studio.InviteView.as_view(), name='studio-invite'),
    path('courses/<slug:pk>/team/<uuid:user_id>', studio.TeamMemberView.as_view(), name='studio-team-member'),
    path('courses/<slug:pk>/team/<uuid:user_id>/owner', studio.TransferOwnerView.as_view(), name='studio-transfer'),
    path('courses/<slug:pk>/classes', studio.ClassesView.as_view(), name='studio-classes'),
    path('lessons/<slug:pk>', studio.LessonView.as_view(), name='studio-lesson'),
    path('invites/<int:pk>', studio.InviteDetailView.as_view(), name='studio-invite-detail'),
    path('invites/<int:pk>/accept', studio.AcceptInviteView.as_view(), name='studio-invite-accept'),
    path('exercises', studio.ExerciseListView.as_view(), name='studio-exercises'),
]
