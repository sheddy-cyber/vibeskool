from datetime import date, timedelta

from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Lesson, Option, Question, SkillCheck, SkillPath, Streak
from .services import touch_streak


def make_content():
    path = SkillPath.objects.create(id='web', title='Web', order=0, is_default=True, modules=[{'id': 'm0'}])
    Lesson.objects.create(id='l1', path=path, title='One', order=0, sections=[{'type': 'text'}], terminal_mission='ls')
    Lesson.objects.create(id='l2', path=path, title='Two', order=1)
    Lesson.objects.create(id='draft', path=path, title='Draft', order=2, published=False)
    check = SkillCheck.objects.create(module_id='m0', path=path, questions_per_attempt=2)
    for i in range(2):
        q = Question.objects.create(skill_check=check, key=f'm0-q{i}', prompt=f'Q{i}?', explanation='Because.')
        Option.objects.create(question=q, text='Right', correct=True)
        Option.objects.create(question=q, text='Wrong', correct=False)
    return path


class ContentTests(APITestCase):
    def setUp(self):
        make_content()

    def test_paths_are_public_and_shaped_for_the_app(self):
        res = self.client.get('/api/paths')
        self.assertEqual(res.status_code, 200)
        p = res.data['paths'][0]
        self.assertEqual(p['name'], 'Web')
        self.assertEqual([l['id'] for l in p['lessons_data']], ['l1', 'l2'], 'drafts are hidden')
        self.assertEqual(p['lessons_data'][0]['path_id'], 'web')

    def test_lesson_detail(self):
        res = self.client.get('/api/lessons/l1')
        self.assertEqual(res.data['lesson']['pathId'], 'web')
        self.assertEqual(res.data['lesson']['terminalMission'], 'ls')
        self.assertEqual(self.client.get('/api/lessons/draft').status_code, 404)
        self.assertEqual(self.client.get('/api/lessons/nope').data, {'error': 'Lesson not found'})

    def test_only_tutors_write_lessons(self):
        student = User.objects.create_user('s@x.com', 'secret123', display_name='S')
        self.client.force_authenticate(student)
        self.assertEqual(self.client.post('/api/lessons', {'id': 'l9', 'pathId': 'web', 'title': 'x'}, format='json').status_code, 403)
        tutor = User.objects.create_user('t@x.com', 'secret123', display_name='T', role='teacher')
        self.client.force_authenticate(tutor)
        res = self.client.post('/api/lessons', {'id': 'l9', 'pathId': 'web', 'title': 'New', 'sections': []}, format='json')
        self.assertEqual(res.status_code, 201)
        res = self.client.put('/api/lessons/l9', {'title': 'Renamed'}, format='json')
        self.assertEqual(res.data['lesson']['title'], 'Renamed')


class ProgressTests(APITestCase):
    def setUp(self):
        make_content()
        self.user = User.objects.create_user('s@x.com', 'secret123', display_name='S')
        self.client.force_authenticate(self.user)

    def test_completing_a_lesson_gives_xp_once(self):
        res = self.client.post('/api/progress/complete', {'lessonId': 'l1', 'pathId': 'web'}, format='json')
        self.assertEqual(res.data, {'success': True, 'lessonsComplete': 1, 'xpAwarded': 10})
        res = self.client.post('/api/progress/complete', {'lessonId': 'l1', 'pathId': 'web'}, format='json')
        self.assertEqual(res.data['xpAwarded'], 0)
        self.user.refresh_from_db()
        self.assertEqual(self.user.xp, 10)
        prog = self.client.get('/api/progress').data
        self.assertEqual(prog['progress'], {'web': ['l1']})
        self.assertEqual(prog['currentStreak'], 1)

    def test_unknown_lesson(self):
        res = self.client.post('/api/progress/complete', {'lessonId': 'ghost'}, format='json')
        self.assertEqual(res.status_code, 404)

    def test_streak_rules(self):
        d = date(2026, 3, 1)
        touch_streak(self.user, d)
        touch_streak(self.user, d)
        touch_streak(self.user, d + timedelta(days=1))
        s = Streak.objects.get(student=self.user)
        self.assertEqual((s.current, s.longest), (2, 2))
        touch_streak(self.user, d + timedelta(days=5))
        s.refresh_from_db()
        self.assertEqual((s.current, s.longest), (1, 2))

    def test_pass_module_needs_the_pass_mark(self):
        self.assertEqual(self.client.post('/api/progress/pass-module', {'moduleId': 'm0', 'score': 50}, format='json').status_code, 400)
        res = self.client.post('/api/progress/pass-module', {'moduleId': 'm0', 'score': 80}, format='json')
        self.assertEqual(res.data['passedModules'], ['m0'])
        self.assertEqual(res.data['xpAwarded'], 50)

    def test_skill_check_hides_answers_and_grades_on_the_server(self):
        res = self.client.get('/api/skill-checks/m0')
        self.assertEqual(len(res.data['questions']), 2)
        for q in res.data['questions']:
            for o in q['options']:
                self.assertNotIn('correct', o)
        right = {q.key: q.options.get(correct=True).id for q in Question.objects.all()}
        res = self.client.post('/api/skill-checks/m0/grade', {'answers': right}, format='json')
        self.assertEqual(res.data['score'], 100)
        self.assertTrue(res.data['passed'])
        self.assertEqual(res.data['progress']['passedModules'], ['m0'])
