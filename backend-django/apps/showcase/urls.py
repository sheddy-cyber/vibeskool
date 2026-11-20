from django.urls import path

from . import views as v

urlpatterns = [
    path('projects', v.ProjectListView.as_view(), name='project-list'),
    path('projects/<uuid:pk>', v.ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<uuid:pk>/image', v.ProjectImageView.as_view(), name='project-image'),
    path('projects/<uuid:pk>/appreciate', v.AppreciateView.as_view(), name='project-appreciate'),
    path('projects/<uuid:pk>/feature', v.FeatureView.as_view(), name='project-feature'),
    path('projects/<uuid:pk>/leave', v.LeaveView.as_view(), name='project-leave'),
    path('projects/<uuid:pk>/comments', v.CommentListView.as_view(), name='project-comments'),
    path('projects/<uuid:pk>/comments/<int:comment_id>', v.CommentDetailView.as_view(), name='project-comment'),
    path('collaborators', v.CollaboratorSearchView.as_view(), name='collaborator-search'),
]
