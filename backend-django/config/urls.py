from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.classrooms import urls as classrooms
from apps.learning import urls as learning

admin.site.site_header = 'VibeSkool admin'
admin.site.site_title = 'VibeSkool admin'
admin.site.index_title = 'Content and classes'


def health(request):
    return JsonResponse({'status': 'ok', 'server': 'django'})


# The React app calls list endpoints without a trailing slash (/api/paths),
# so each list route is also mounted at the bare prefix.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/paths/', include(learning.paths_urls)),
    path('api/paths', include(learning.paths_urls[:1])),
    path('api/lessons/', include(learning.lessons_urls)),
    path('api/lessons', include(learning.lessons_urls[:1])),
    path('api/progress/', include(learning.progress_urls)),
    path('api/progress', include(learning.progress_urls[:1])),
    path('api/skill-checks/', include(learning.skill_check_urls)),
    path('api/classrooms/', include(classrooms.urlpatterns)),
    path('api/classrooms', include(classrooms.urlpatterns[:1])),
    path('api/schema', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]
