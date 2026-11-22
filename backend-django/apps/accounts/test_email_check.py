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
