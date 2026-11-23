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

    @override_settings(GEMINI_API_KEY='test-key', GEMINI_MODEL='gemini-old', GEMINI_FALLBACK_MODEL='gemini-flash-lite-latest')
    def test_falls_back_when_the_model_is_retired_or_busy(self):
        gone = mock.Mock(status_code=404, ok=False, text='no longer available')
        good = mock.Mock(status_code=200, ok=True)
        good.json.return_value = {'candidates': [{'content': {'parts': [{'text': 'Hi!'}]}}]}
        with mock.patch('apps.learning.ai.requests.post', side_effect=[gone, good]) as post:
            res = self.client.post('/api/ai/chat', {'message': 'Hello'}, format='json')
        self.assertEqual(res.data, {'reply': 'Hi!'})
        self.assertIn('gemini-flash-lite-latest', post.call_args_list[1].args[0])

    @override_settings(GEMINI_API_KEY='bad', GEMINI_MODEL='gemini-flash-lite-latest', GEMINI_FALLBACK_MODEL='gemini-flash-lite-latest')
    def test_a_bad_key_is_reported(self):
        refused = mock.Mock(status_code=400, ok=False, text='API key not valid')
        with mock.patch('apps.learning.ai.requests.post', return_value=refused), self.assertLogs('apps.learning.ai', 'ERROR') as logs:
            res = self.client.post('/api/ai/chat', {'message': 'Hello'}, format='json')
        self.assertEqual(res.status_code, 502)
        self.assertIn('API key not valid', ' '.join(logs.output))

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

    @override_settings(JUDGE0_KEY='k')
    def test_submit_runs_tests_and_gives_xp_once(self):
        self.client.force_authenticate(self.student)
        with mock.patch('apps.learning.exercises.run_cases', return_value=[('3', '')]):
            first = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'const add=(a,b)=>a+b'}, format='json')
            again = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'const add=(a,b)=>a+b'}, format='json')
        self.assertEqual((first.data['passed'], first.data['xpAwarded']), (True, 20))
        self.assertEqual(again.data['xpAwarded'], 0)
        with mock.patch('apps.learning.exercises.run_cases', return_value=[('4', '')]):
            wrong = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'x'}, format='json')
        self.assertFalse(wrong.data['passed'])

    @override_settings(JUDGE0_KEY='k')
    def test_runner_down_is_a_clear_error(self):
        import requests
        self.client.force_authenticate(self.student)
        with mock.patch('apps.learning.runner.requests.post', side_effect=requests.ConnectionError()):
            res = self.client.post(f'/api/exercises/{self.ex.id}/submit', {'code': 'x'}, format='json')
        self.assertEqual(res.status_code, 502)
        self.assertFalse(self.ex.submissions.exists())

    @override_settings(JUDGE0_KEY='', PISTON_URL='')
    @override_settings(JUDGE0_KEY='', PISTON_URL='')
    def test_without_a_runner_the_browser_checks(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get('/api/exercises?lessonId=l1').data['checkedOn'], 'browser')
        url = f'/api/exercises/{self.ex.id}/submit'
        # Nothing run yet
        res = self.client.post(url, {'code': 'x'}, format='json')
        self.assertEqual(res.status_code, 400)
        # Right output: passes, XP once
        res = self.client.post(url, {'code': 'const add=(a,b)=>a+b', 'results': [{'actual': '3'}]}, format='json')
        self.assertEqual((res.data['passed'], res.data['xpAwarded']), (True, 20))

    @override_settings(JUDGE0_KEY='', PISTON_URL='')
    def test_the_server_decides_what_passed(self):
        self.client.force_authenticate(self.student)
        url = f'/api/exercises/{self.ex.id}/submit'
        wrong = self.client.post(url, {'code': 'x', 'results': [{'actual': '4', 'passed': True}]}, format='json')
        self.assertFalse(wrong.data['passed'], 'a claimed pass with the wrong output fails')
        errored = self.client.post(url, {'code': 'x', 'results': [{'actual': '3', 'stderr': 'TypeError: boom'}]}, format='json')
        self.assertFalse(errored.data['passed'])
        short = self.client.post(url, {'code': 'x', 'results': []}, format='json')
        self.assertEqual(short.status_code, 400)
        self.assertEqual(self.ex.submissions.filter(passed=True).count(), 0)

    @override_settings(JUDGE0_KEY='k')
    def test_with_a_runner_browser_results_are_ignored(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get('/api/exercises?lessonId=l1').data['checkedOn'], 'server')
        with mock.patch('apps.learning.exercises.run_cases', return_value=[('4', '')]):
            res = self.client.post(f'/api/exercises/{self.ex.id}/submit',
                                   {'code': 'x', 'results': [{'actual': '3'}]}, format='json')
        self.assertFalse(res.data['passed'])

    def test_solutions_after_passing(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(f'/api/exercises/{self.ex.id}/solutions').status_code, 403)
