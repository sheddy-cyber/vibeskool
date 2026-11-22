from unittest import mock

from django.contrib import messages
from django.contrib.admin.sites import site
from django.core import mail
from django.test import RequestFactory, TestCase, override_settings

from .admin import UserAdmin
from .models import User


class TestEmailActionTests(TestCase):
    def run_action(self):
        admin_user = User.objects.create_superuser('boss@example.com', 'tidal-orbit-maple-42', display_name='Boss')
        request = RequestFactory().post('/')
        request.user = admin_user
        admin = UserAdmin(User, site)
        with mock.patch.object(admin, 'message_user') as said:
            admin.send_test_email(request, User.objects.none())
        return said.call_args[0][1], said.call_args[0][2]

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend')
    def test_says_when_email_is_not_set_up(self):
        text, level = self.run_action()
        self.assertEqual(level, messages.ERROR)
        self.assertIn('BREVO_API_KEY', text)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_sends_to_the_signed_in_admin(self):
        text, level = self.run_action()
        self.assertEqual(level, messages.SUCCESS)
        self.assertEqual(mail.outbox[0].to, ['boss@example.com'])

    @override_settings(EMAIL_BACKEND='apps.accounts.brevo.BrevoEmailBackend', BREVO_API_KEY='x', EMAIL_TIMEOUT=5)
    def test_explains_a_blocked_address(self):
        refused = mock.Mock(status_code=401, text='{"message":"unrecognised IP address 1.2.3.4"}')
        with mock.patch('apps.accounts.brevo.requests.post', return_value=refused):
            text, level = self.run_action()
        self.assertEqual(level, messages.ERROR)
        self.assertIn('Authorised IPs', text)


class SenderTests(TestCase):
    def test_sender_check(self):
        from .apps import sender_ok
        self.assertTrue(sender_ok('VibeSkool <vibeskool.app@gmail.com>'))
        self.assertFalse(sender_ok('VibeSkool <no-reply@localhost>'))
        self.assertFalse(sender_ok(''))

    @override_settings(EMAIL_BACKEND='apps.accounts.brevo.BrevoEmailBackend', BREVO_API_KEY='x',
                       DEFAULT_FROM_EMAIL='VibeSkool <no-reply@localhost>')
    def test_test_action_explains_a_missing_sender(self):
        text, level = TestEmailActionTests.run_action(self)
        self.assertEqual(level, messages.ERROR)
        self.assertIn('DEFAULT_FROM_EMAIL', text)

    def test_quotes_around_the_value_are_ignored(self):
        import os
        import subprocess
        import sys
        env = {**os.environ, 'DEFAULT_FROM_EMAIL': '"VibeSkool <vibeskool.app@gmail.com>"',
               'DJANGO_SETTINGS_MODULE': 'config.settings', 'DJANGO_DEBUG': '1'}
        out = subprocess.run([sys.executable, '-c', 'import django; django.setup(); from django.conf import settings; print(settings.DEFAULT_FROM_EMAIL)'],
                             env=env, capture_output=True, text=True, timeout=60)
        self.assertEqual(out.stdout.strip().splitlines()[-1], 'VibeSkool <vibeskool.app@gmail.com>')
