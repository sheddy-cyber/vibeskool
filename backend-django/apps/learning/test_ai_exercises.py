from unittest import mock

from django.test import override_settings
from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Exercise, Lesson, SkillPath


class AiTests(APITestCase):
    def setUp(self):
        self.client.force_authenticate(User.objects.create_user('s@x.com', 'secret123', display_name='S'))

    @override_settings(GEMINI_API_KEY='')
    def test_without_a_key_the_tutor_is_offline(self):
        res = self.client.post('/api/ai/chat', {'message': 'What is DNS?'}, format='json')
        self.assertEqual(res.status_code, 503)

    @override_settings(GEMINI_API_KEY='test-key')
    def test_chat_sends_lesson_context_and_returns_reply(self):
        fake = mock.Mock()
        fake.json.return_value = {'candidates': [{'content': {'parts': [{'text': 'DNS is the phonebook.'}]}}]}
        with mock.patch('apps.learning.ai.requests.post', return_value=fake) as post:
            res = self.client.post('/api/ai/chat', {'message': 'What is DNS?', 'lessonContext': {'title': 'DNS basics'}}, format='json')
        self.assertEqual(res.data, {'reply': 'DNS is the phonebook.'})
        body = post.call_args.kwargs['data']
        self.assertIn('DNS basics', body)
        self.assertEqual(post.call_args.kwargs['headers']['x-goog-api-key'], 'test-key', 'key in a header, not the URL')

    def test_empty_message(self):
        self.assertEqual(self.client.post('/api/ai/chat', {'message': ' '}, format='json').status_code, 400)


class ExerciseTests(APITestCase):
    def setUp(self):
        path = SkillPath.objects.create(id='web', title='Web', is_official=True, status='published')
        self.lesson = Lesson.objects.create(id='l1', path=path, title='One')
        # Official lessons are authored by admins; tutors author their own courses (see test_studio)
        self.tutor = User.objects.create_superuser('t@x.com', 'secret123', display_name='T')
        self.student = User.objects.create_user('s@x.com', 'secret123', display_name='S')
        self.ex = Exercise.objects.create(
            lesson=self.lesson, title='Add', language='javascript', solution_code='const add=(a,b)=>a+b',
            test_cases=[{'input': 'add(1, 2)', 'expected_output': '3'}],
        )

    def test_students_never_see_the_solution(self):
        self.client.force_authenticate(self.student)
        ex = self.client.get('/api/exercises?lessonId=l1').data['exercises'][0]
        self.assertNotIn('solution_code', ex)
        self.client.force_authenticate(self.tutor)
        self.assertIn('solution_code', self.client.get(f'/api/exercises/{self.ex.id}').data['exercise'])

    def test_only_tutors_create(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.post('/api/exercises', {'title': 'x', 'lesson_id': 'l1'}, format='json').status_code, 403)
        self.client.force_authenticate(self.tutor)
        res = self.client.post('/api/exercises', {'title': 'Double', 'lesson_id': 'l1', 'test_cases': [{'input': 'd(2)', 'expected_output': '4'}]}, format='json')
        self.assertEqual(res.status_code, 201)

    def test_submit_runs_tests_and_gives_xp_once(self):
        self.client.force_authenticate(self.student)
        with mock.patch('apps.learning.exercises.run_code', return_value=('3', '')):
            first = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'const add=(a,b)=>a+b'}, format='json')
            again = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'const add=(a,b)=>a+b'}, format='json')
        self.assertEqual((first.data['passed'], first.data['xpAwarded']), (True, 20))
        self.assertEqual(again.data['xpAwarded'], 0)
        with mock.patch('apps.learning.exercises.run_code', return_value=('4', '')):
            wrong = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'x'}, format='json')
        self.assertFalse(wrong.data['passed'])

    def test_runner_down_is_a_clear_error(self):
        import requests
        self.client.force_authenticate(self.student)
        with mock.patch('apps.learning.exercises.run_code', side_effect=requests.ConnectionError()):
            res = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'x'}, format='json')
        self.assertEqual(res.status_code, 502)

    def test_solutions_after_passing(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(f'/api/exercises/{self.ex.id}/solutions').status_code, 403)
