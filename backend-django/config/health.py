"""Answers /api/health before anything else looks at the request.

The host's health checker calls over plain HTTP, sometimes with an internal
host name, so the HTTPS redirect and the allowed-hosts check would turn it
away. This replies first: 200 if the database answers, 503 if not.
"""
from django.db import connection
from django.http import JsonResponse

PATH = '/api/health'


def database_ok():
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return True
    except Exception:
        return False


class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == PATH and request.method in ('GET', 'HEAD'):
            if database_ok():
                return JsonResponse({'status': 'ok'})
            return JsonResponse({'status': 'error', 'database': 'unreachable'}, status=503)
        return self.get_response(request)
