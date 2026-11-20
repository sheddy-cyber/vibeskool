"""Live updates for a class over WebSockets (Django Channels).

The browser opens /ws/classrooms/<id>/ and sends {"type": "auth", "token": ...}
as its first message (a token in the URL would end up in server logs).
Once the user is checked as the class's tutor or a member, the socket joins
the class's group and receives small events such as

    {"type": "event", "topic": "stream", "action": "post.created", "data": {"id": 12}}

Events carry ids, never content. The page refetches what changed through
the normal API, so private posts and other people's work stay protected by
the same permission checks as everything else.
"""
import asyncio
import logging

import jwt
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Classroom

log = logging.getLogger(__name__)
AUTH_TIMEOUT = 10  # seconds to send the auth message before we hang up

# Close codes the client understands
UNAUTHORIZED, FORBIDDEN = 4001, 4003


def group_name(classroom_id):
    return f'classroom_{classroom_id}'


def broadcast(classroom_id, topic, action, **data):
    """Tell everyone in the class that something changed, once the change is saved."""
    layer = get_channel_layer()
    if layer is None:
        return

    def send():
        try:
            async_to_sync(layer.group_send)(group_name(classroom_id), {
                'type': 'classroom.event', 'topic': topic, 'action': action, 'data': data,
            })
        except Exception:  # live updates are a nicety; never fail the request over them
            log.exception('Could not send live update')

    transaction.on_commit(send)


@database_sync_to_async
def user_for_token(token):
    try:
        payload = jwt.decode(token or '', settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    return get_user_model().objects.filter(pk=payload.get('id'), is_active=True).first()


@database_sync_to_async
def can_join(user, classroom_id):
    room = Classroom.objects.filter(pk=classroom_id).first()
    return bool(room and (room.is_tutor(user) or room.is_member(user)))


class ClassroomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.classroom_id = str(self.scope['url_route']['kwargs']['pk'])
        self.group = None
        await self.accept()
        self.timeout = asyncio.ensure_future(self._close_if_silent())

    async def _close_if_silent(self):
        await asyncio.sleep(AUTH_TIMEOUT)
        if not self.group:
            await self.close(code=UNAUTHORIZED)

    async def receive_json(self, content, **kwargs):
        kind = content.get('type')
        if kind == 'ping':
            await self.send_json({'type': 'pong'})
            return
        if kind != 'auth' or self.group:
            return
        user = await user_for_token(content.get('token'))
        if not user:
            await self.close(code=UNAUTHORIZED)
            return
        if not await can_join(user, self.classroom_id):
            await self.close(code=FORBIDDEN)
            return
        self.group = group_name(self.classroom_id)
        await self.channel_layer.group_add(self.group, self.channel_name)
        self.timeout.cancel()
        await self.send_json({'type': 'ready'})

    async def disconnect(self, code):
        if getattr(self, 'timeout', None):
            self.timeout.cancel()
        if self.group:
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def classroom_event(self, event):
        await self.send_json({'type': 'event', 'topic': event['topic'], 'action': event['action'], 'data': event['data']})
