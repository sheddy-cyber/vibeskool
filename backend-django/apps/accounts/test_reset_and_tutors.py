import re
from datetime import datetime, timedelta, timezone
from unittest import mock

from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase

from .authentication import issue_token
from .models import User

GOOD = 'tidal-orbit-maple-42'


class PasswordRuleTests(APITestCase):
    def signup(self, password, **kw):
        data = {'email': 'sam@example.com', 'password': password, 'displayName': 'Sam Lee', **kw}
        return self.client.post('/api/auth/signup', data, format='json')

    def test_short_common_and_name_like_passwords_are_refused(self):
        self.assertEqual(self.signup('short1').data['error'], 'Password must be at least 8 characters')
        self.assertIn('too common', self.signup('password123').data['error'])
        self.assertIn('too close', self.signup('samexample').data['error'])
        self.assertEqual(self.signup(GOOD).status_code, 201)


@override_settings(FRONTEND_URL='https://vibeskool.test', EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('ada@example.com', GOOD, display_name='Ada Obi')

    def ask(self, email='ada@example.com'):
        return self.client.post('/api/auth/password-reset', {'email': email}, format='json')

    def link(self):
        m = re.search(r'https://vibeskool\.test/reset-password\?uid=([^&\s]+)&token=([^\s"<]+)', mail.outbox[-1].body)
        return m.group(1), m.group(2)

    def test_same_answer_whether_or_not_the_account_exists(self):
        self.assertEqual(self.ask().data, {'ok': True})
        self.assertEqual(self.ask('nobody@example.com').data, {'ok': True})
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['ada@example.com'])
        self.assertTrue(mail.outbox[0].alternatives, 'has an HTML version')

    def test_reset_sets_the_password_signs_in_and_signs_out_other_devices(self):
        # A session from a minute ago, on another device
        with mock.patch('apps.accounts.authentication.datetime') as clock:
            clock.now.return_value = datetime.now(timezone.utc) - timedelta(minutes=1)
            old_token = issue_token(self.user)
        self.ask()
        uid, token = self.link()
        res = self.client.post('/api/auth/password-reset/confirm',
                               {'uid': uid, 'token': token, 'password': 'new-river-stone-77'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['token'])
        ok = self.client.post('/api/auth/login', {'email': 'ada@example.com', 'password': 'new-river-stone-77'}, format='json')
        self.assertEqual(ok.status_code, 200)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_token}')
        self.assertEqual(self.client.get('/api/auth/me').status_code, 401, 'old sessions end')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['token']}")
        self.assertEqual(self.client.get('/api/auth/me').status_code, 200, 'this device stays signed in')

    def test_link_works_once(self):
        self.ask()
        uid, token = self.link()
        url = '/api/auth/password-reset/confirm'
        self.assertEqual(self.client.post(url, {'uid': uid, 'token': token, 'password': 'new-river-stone-77'}, format='json').status_code, 200)
        again = self.client.post(url, {'uid': uid, 'token': token, 'password': 'other-river-stone-88'}, format='json')
        self.assertEqual(again.status_code, 400)
        self.assertIn('expired', again.data['error'])

    def test_bad_links_and_weak_passwords(self):
        url = '/api/auth/password-reset/confirm'
        self.assertEqual(self.client.post(url, {'uid': 'xx', 'token': 'yy', 'password': GOOD}, format='json').status_code, 400)
        self.ask()
        uid, token = self.link()
        weak = self.client.post(url, {'uid': uid, 'token': token, 'password': 'password123'}, format='json')
        self.assertEqual(weak.status_code, 400)
        self.assertTrue(User.objects.get(pk=self.user.pk).check_password(GOOD))


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', TUTOR_REQUEST_EMAILS=['admin@example.com'])
class TutorRequestTests(APITestCase):
    def test_signing_up_to_teach_waits_for_approval(self):
        with self.captureOnCommitCallbacks(execute=True):
            res = self.client.post('/api/auth/signup', {
                'email': 'tutor@example.com', 'password': GOOD, 'displayName': 'Grace N', 'role': 'teacher',
                'teachingNote': 'Python for beginners',
            }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['user']['role'], 'student')
        self.assertEqual(res.data['user']['tutor_status'], 'pending')
        self.assertEqual(mail.outbox[0].to, ['admin@example.com'])
        self.assertIn('Python for beginners', mail.outbox[0].body)
        # Still can't do tutor things
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['token']}")
        self.assertEqual(self.client.post('/api/classrooms', {'name': 'X'}, format='json').status_code, 403)

    def test_a_student_can_ask_later_and_take_it_back(self):
        user = User.objects.create_user('s@example.com', GOOD, display_name='S')
        self.client.force_authenticate(user)
        res = self.client.post('/api/auth/tutor-request', {'note': 'JS'}, format='json')
        self.assertEqual(res.data['user']['tutor_status'], 'pending')
        self.assertEqual(self.client.post('/api/auth/tutor-request', {}, format='json').status_code, 409)
        self.assertEqual(self.client.delete('/api/auth/tutor-request').data['user']['tutor_status'], '')

    def test_admin_approval_makes_a_tutor_and_emails_them(self):
        from django.contrib.admin.sites import site
        from django.test import RequestFactory
        from .admin import UserAdmin

        user = User.objects.create_user('s@example.com', GOOD, display_name='Sam', tutor_status='pending')
        other = User.objects.create_user('o@example.com', GOOD, display_name='Olu', tutor_status='pending')
        admin = UserAdmin(User, site)
        request = RequestFactory().post('/')
        with mock.patch.object(admin, 'message_user'):
            admin.approve_tutors(request, User.objects.filter(pk=user.pk))
            admin.decline_tutors(request, User.objects.filter(pk=other.pk))
        user.refresh_from_db(); other.refresh_from_db()
        self.assertEqual((user.role, user.tutor_status), ('teacher', 'approved'))
        self.assertEqual((other.role, other.tutor_status), ('student', 'declined'))
        self.assertEqual({m.to[0] for m in mail.outbox}, {'s@example.com', 'o@example.com'})
