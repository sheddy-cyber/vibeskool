from django.urls import path

from . import views

urlpatterns = [
    path('signup', views.SignupView.as_view(), name='auth-signup'),
    path('login', views.LoginView.as_view(), name='auth-login'),
    path('google', views.GoogleView.as_view(), name='auth-google'),
    path('password-reset', views.PasswordResetView.as_view(), name='auth-password-reset'),
    path('password-reset/confirm', views.PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('tutor-request', views.TutorRequestView.as_view(), name='auth-tutor-request'),
    path('me', views.MeView.as_view(), name='auth-me'),
    path('profile', views.ProfileView.as_view(), name='auth-profile'),
    path('avatar', views.AvatarView.as_view(), name='auth-avatar'),
]
