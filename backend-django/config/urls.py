from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.classrooms import urls as classrooms
from apps.learning import urls as learning

admin.site.site_header = 'VibeSkool admin'
admin.site.site_title = 'VibeSkool admin'
admin.site.index_title = 'Content and classes'


# The React app calls list endpoints without a trailing slash (/api/paths),
# so each list route is also mounted at the bare prefix.
urlpatterns = [
    # This is an API; someone opening its bare address is sent to the website
    path('', lambda request: redirect(settings.FRONTEND_URL)),
    # The admin also answers without its trailing slash (/adminkris)
    path(settings.ADMIN_PATH.rstrip('/'), RedirectView.as_view(url='/' + settings.ADMIN_PATH, permanent=False)),
    path(settings.ADMIN_PATH, admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/paths/', include(learning.paths_urls)),
    path('api/paths', include(learning.paths_urls[:1])),
    path('api/lessons/', include(learning.lessons_urls)),
    path('api/lessons', include(learning.lessons_urls[:1])),
    path('api/progress/', include(learning.progress_urls)),
    path('api/progress', include(learning.progress_urls[:1])),
    path('api/skill-checks/', include(learning.skill_check_urls)),
    path('api/ai/', include(learning.ai_urls)),
    path('api/studio/', include(learning.studio_urls)),
    path('api/teaching/', include('apps.classrooms.teaching_urls')),
    path('api/exercises/', include(learning.exercise_urls)),
    path('api/exercises', include(learning.exercise_urls[:1])),
    path('api/classrooms/', include(classrooms.urlpatterns)),
    path('api/classrooms', include(classrooms.urlpatterns[:1])),
    path('api/showcase/', include('apps.showcase.urls')),
    path('api/people/', include('apps.accounts.people_urls')),
]

if settings.DEBUG:
    # API docs and uploaded files are served here only in development
    urlpatterns += [
        path('api/schema', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
