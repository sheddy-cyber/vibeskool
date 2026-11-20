"""The class WebSocket: sign in with the first message, then receive events."""
from channels.layers import get_channel_layer
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase

from apps.accounts.authentication import issue_token
from apps.accounts.models import User
from config.asgi import application

from .live import FORBIDDEN, UNAUTHORIZED, group_name
from .models import Classroom, Membership

ORIGIN = [(b'origin', b'http://localhost:5173')]


class SocketTests(TransactionTestCase):
    def setUp(self):
        self.tutor = User.objects.create_user('t@x.com', 'secret123', display_name='T', role='teacher')
        self.ada = User.objects.create_user('a@x.com', 'secret123', display_name='Ada')
        self.out = User.objects.create_user('o@x.com', 'secret123', display_name='Out')
        self.room = Classroom.objects.create(teacher=self.tutor, name='C')
        Membership.objects.create(classroom=self.room, student=self.ada)

    def socket(self):
        return WebsocketCommunicator(application, f'/ws/classrooms/{self.room.id}/', headers=ORIGIN)

    async def test_member_gets_events(self):
        ws = self.socket()
        connected, _ = await ws.connect()
        self.assertTrue(connected)
        await ws.send_json_to({'type': 'auth', 'token': issue_token(self.ada)})
        self.assertEqual(await ws.receive_json_from(), {'type': 'ready'})
        await get_channel_layer().group_send(group_name(self.room.id), {
            'type': 'classroom.event', 'topic': 'stream', 'action': 'post.created', 'data': {'id': 1},
        })
        self.assertEqual(await ws.receive_json_from(), {'type': 'event', 'topic': 'stream', 'action': 'post.created', 'data': {'id': 1}})
        await ws.send_json_to({'type': 'ping'})
        self.assertEqual(await ws.receive_json_from(), {'type': 'pong'})
        await ws.disconnect()

    async def test_bad_token_is_refused(self):
        ws = self.socket()
        await ws.connect()
        await ws.send_json_to({'type': 'auth', 'token': 'nope'})
        out = await ws.receive_output()
        self.assertEqual((out['type'], out.get('code')), ('websocket.close', UNAUTHORIZED))

    async def test_outsider_is_refused(self):
        ws = self.socket()
        await ws.connect()
        await ws.send_json_to({'type': 'auth', 'token': issue_token(self.out)})
        out = await ws.receive_output()
        self.assertEqual((out['type'], out.get('code')), ('websocket.close', FORBIDDEN))
