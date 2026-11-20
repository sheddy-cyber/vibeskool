"""ASGI entry point: normal HTTP through Django, WebSockets through Channels.

Run in production with:  daphne -b 0.0.0.0 -p $PORT config.asgi:application
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi = get_asgi_application()  # set up Django before importing anything that uses models

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import OriginValidator  # noqa: E402
from django.conf import settings  # noqa: E402
from django.urls import path  # noqa: E402

from apps.classrooms.live import ClassroomConsumer  # noqa: E402

websocket_urls = [
    path('ws/classrooms/<uuid:pk>/', ClassroomConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'http': django_asgi,
    # Only pages served from our own frontend may open a socket
    'websocket': OriginValidator(URLRouter(websocket_urls), settings.WEBSOCKET_ALLOWED_ORIGINS),
})
