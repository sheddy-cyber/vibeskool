from django.urls import path

from . import views

urlpatterns = [
    path('signup', views.SignupView.as_view(), name='auth-signup'),
    path('login', views.LoginView.as_view(), name='auth-login'),
    path('google', views.GoogleView.as_view(), name='auth-google'),
    path('me', views.MeView.as_view(), name='auth-me'),
    path('profile', views.ProfileView.as_view(), name='auth-profile'),
]
