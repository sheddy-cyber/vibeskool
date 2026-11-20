from django.urls import path

from .teaching import OverviewView

urlpatterns = [
    path('overview', OverviewView.as_view(), name='teaching-overview'),
]
