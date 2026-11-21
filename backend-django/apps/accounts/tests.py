from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings
from rest_framework.test import APITestCase

from .models import User


class AuthTests(APITestCase):
    def signup(self, **kw):
        data = {'email': 'Sam@Example.com', 'password': 'tidal-orbit-maple-42', 'displayName': 'Sam Lee', 'role': 'student', **kw}
        return self.client.post('/api/auth/signup', data, format='json')

    def test_signup_returns_user_and_token(self):
        res = self.signup()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['user']['email'], 'sam@example.com')
        self.assertEqual(res.data['user']['display_name'], 'Sam Lee')
        self.assertEqual(res.data['user']['avatar_url'], 'SL')
        self.assertNotIn('password', res.data['user'])
        self.assertTrue(res.data['token'])

    def test_signup_errors_use_the_error_shape(self):
        self.signup()
        res = self.signup()
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.data, {'error': 'Email already exists'})
        res = self.signup(email='new@example.com', password='123')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.data['error'], 'Password must be at least 8 characters')
        res = self.signup(email='other@example.com', role='admin')
        self.assertEqual(res.data['error'], 'Role must be student or teacher')

    def test_login(self):
        self.signup()
        ok = self.client.post('/api/auth/login', {'email': 'SAM@example.com', 'password': 'tidal-orbit-maple-42'}, format='json')
        self.assertEqual(ok.status_code, 200)
        bad = self.client.post('/api/auth/login', {'email': 'sam@example.com', 'password': 'nope'}, format='json')
        self.assertEqual(bad.status_code, 401)
        self.assertEqual(bad.data, {'error': 'Invalid email or password'})

    def test_me_needs_a_token(self):
        res = self.client.get('/api/auth/me')
        self.assertEqual(res.status_code, 401)
        self.assertIn('error', res.data)

    def test_me_for_a_student_includes_learning_totals(self):
        token = self.signup().data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/auth/me')
        self.assertEqual(res.status_code, 200)
        for key in ('lessonsCompleted', 'passedModules', 'mekScore', 'currentStreak', 'longestStreak'):
            self.assertIn(key, res.data)

    def test_tokens_from_the_old_server_still_work(self):
        user = User.objects.create_user('old@example.com', 'tidal-orbit-maple-42', display_name='Old Timer')
        token = jwt.encode(
            {'id': str(user.id), 'email': user.email, 'role': 'student',
             'exp': datetime.now(timezone.utc) + timedelta(days=1)},
            settings.JWT_SECRET, algorithm='HS256',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(self.client.get('/api/auth/me').status_code, 200)

    def test_imported_bcrypt_passwords_still_work(self):
        import bcrypt
        user = User.objects.create_user('legacy@example.com', display_name='Legacy')
        legacy_hash = bcrypt.hashpw(b'oldpass1', bcrypt.gensalt(rounds=4)).decode()
        User.objects.filter(pk=user.pk).update(password='bcrypt$' + legacy_hash)
        res = self.client.post('/api/auth/login', {'email': 'legacy@example.com', 'password': 'oldpass1'}, format='json')
        self.assertEqual(res.status_code, 200)
        user.refresh_from_db()
        self.assertFalse(user.password.startswith('bcrypt'), 'hash is upgraded on sign-in')

    def test_expired_token(self):
        user = User.objects.create_user('x@example.com', 'tidal-orbit-maple-42', display_name='X')
        token = jwt.encode({'id': str(user.id), 'exp': datetime.now(timezone.utc) - timedelta(minutes=1)},
                           settings.JWT_SECRET, algorithm='HS256')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/auth/me')
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.data['error'], 'Your session has expired. Sign in again.')

    def test_profile_update(self):
        token = self.signup().data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.put('/api/auth/profile', {'displayName': 'Samuel', 'settings': {'theme': 'dark'}}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['user']['display_name'], 'Samuel')
        self.assertEqual(res.data['user']['settings'], {'theme': 'dark'})
        self.assertEqual(self.client.put('/api/auth/profile', {}, format='json').status_code, 400)
