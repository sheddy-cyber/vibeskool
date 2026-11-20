from django.urls import path

from . import views

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
    path('pass-module', views.PassModuleView.as_view(), name='progress-pass-module'),
]

skill_check_urls = [
    path('<str:module_id>', views.SkillCheckView.as_view(), name='skill-check'),
    path('<str:module_id>/grade', views.GradeSkillCheckView.as_view(), name='skill-check-grade'),
]
