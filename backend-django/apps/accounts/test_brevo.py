from unittest import mock

from django.core.mail import EmailMultiAlternatives, get_connection
from django.test import SimpleTestCase, override_settings

from . import emails
from .models import User


@override_settings(BREVO_API_KEY='xkeysib-test', DEFAULT_FROM_EMAIL='VibeSkool <vibeskool.app@gmail.com>', EMAIL_TIMEOUT=15)
class BrevoBackendTests(SimpleTestCase):
    def connection(self):
        return get_connection('apps.accounts.brevo.BrevoEmailBackend')

    def test_sends_text_and_html_over_https(self):
        msg = EmailMultiAlternatives('Hello', 'Plain body', None, ['Ada Obi <ada@example.com>'], connection=self.connection())
        msg.attach_alternative('<p>HTML body</p>', 'text/html')
        with mock.patch('apps.accounts.brevo.requests.post', return_value=mock.Mock(status_code=201)) as post:
            self.assertEqual(msg.send(), 1)
        url, kwargs = post.call_args[0][0], post.call_args[1]
        self.assertEqual(url, 'https://api.brevo.com/v3/smtp/email')
        self.assertEqual(kwargs['headers']['api-key'], 'xkeysib-test')
        body = kwargs['json']
        self.assertEqual(body['sender'], {'email': 'vibeskool.app@gmail.com', 'name': 'VibeSkool'})
        self.assertEqual(body['to'], [{'email': 'ada@example.com', 'name': 'Ada Obi'}])
        self.assertEqual((body['subject'], body['textContent'], body['htmlContent']), ('Hello', 'Plain body', '<p>HTML body</p>'))

    def test_a_refusal_is_an_error(self):
        msg = EmailMultiAlternatives('Hi', 'x', None, ['a@example.com'], connection=self.connection())
        refused = mock.Mock(status_code=401, text='unrecognised IP address')
        with mock.patch('apps.accounts.brevo.requests.post', return_value=refused):
            with self.assertRaises(RuntimeError):
                msg.send()

    @override_settings(EMAIL_BACKEND='apps.accounts.brevo.BrevoEmailBackend')
    def test_site_emails_report_failure_without_crashing(self):
        user = User(email='ada@example.com', display_name='Ada')
        with mock.patch('apps.accounts.brevo.requests.post', return_value=mock.Mock(status_code=500, text='down')):
            self.assertFalse(emails.password_reset(user, 'https://x.test/reset'))
