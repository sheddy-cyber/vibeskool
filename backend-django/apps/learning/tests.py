from datetime import date, timedelta

from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Lesson, Option, PassedModule, Question, SkillCheck, SkillPath, Streak
from .services import touch_streak


def make_content():
    path = SkillPath.objects.create(id='web', title='Web', order=0, is_default=True, modules=[{'id': 'm0'}], is_official=True, status='published')
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

    def test_nobody_but_admins_edits_official_courses(self):
        student = User.objects.create_user('s@x.com', 'secret123', display_name='S')
        self.client.force_authenticate(student)
        self.assertEqual(self.client.post('/api/lessons', {'id': 'l9', 'pathId': 'web', 'title': 'x'}, format='json').status_code, 403)
        tutor = User.objects.create_user('t@x.com', 'secret123', display_name='T', role='teacher')
        self.client.force_authenticate(tutor)
        self.assertEqual(self.client.post('/api/lessons', {'id': 'l9', 'pathId': 'web', 'title': 'New'}, format='json').status_code, 403)
        self.assertEqual(self.client.put('/api/lessons/l1', {'title': 'Hijacked'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete('/api/paths/web').status_code, 403)
        admin = User.objects.create_superuser('a@x.com', 'secret123', display_name='A')
        self.client.force_authenticate(admin)
        res = self.client.put('/api/lessons/l1', {'title': 'Renamed'}, format='json')
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

    def test_a_score_cannot_be_posted_directly(self):
        res = self.client.post('/api/progress/pass-module', {'moduleId': 'm0', 'score': 100}, format='json')
        self.assertEqual(res.status_code, 404)
        self.assertFalse(PassedModule.objects.exists())

    def start(self):
        res = self.client.post('/api/skill-checks/m0/attempts')
        self.assertEqual(res.status_code, 201)
        return res.data

    def right_option(self, key):
        return Question.objects.get(key=key).options.get(correct=True).id

    def test_info_for_the_intro(self):
        res = self.client.get('/api/skill-checks/m0')
        self.assertEqual((res.data['questionCount'], res.data['passMark']), (2, 70))
        self.assertNotIn('questions', res.data)
        self.assertEqual(self.client.get('/api/skill-checks/m9').data['questionCount'], 0)

    def test_attempt_hides_answers_until_each_is_given(self):
        data = self.start()
        self.assertEqual(len(data['questions']), 2)
        for q in data['questions']:
            self.assertNotIn('explanation', q)
            for o in q['options']:
                self.assertEqual(set(o), {'id', 'text'})
        q = data['questions'][0]
        res = self.client.post(f"/api/skill-checks/attempts/{data['attempt']}/answer",
                               {'question': q['id'], 'option': self.right_option(q['id'])}, format='json')
        self.assertEqual(res.data, {'correct': True, 'correctOption': self.right_option(q['id']), 'explanation': 'Because.'})

    def test_score_comes_from_the_answers_given_and_records_a_pass(self):
        data = self.start()
        for q in data['questions']:
            self.client.post(f"/api/skill-checks/attempts/{data['attempt']}/answer",
                             {'question': q['id'], 'option': self.right_option(q['id'])}, format='json')
        res = self.client.post(f"/api/skill-checks/attempts/{data['attempt']}/finish")
        self.assertEqual((res.data['score'], res.data['passed']), (100, True))
        self.assertEqual(res.data['progress']['passedModules'], ['m0'])
        self.assertEqual(res.data['progress']['xpAwarded'], 50)
        # Finishing again changes nothing and gives no more XP
        again = self.client.post(f"/api/skill-checks/attempts/{data['attempt']}/finish")
        self.assertEqual(again.data['progress']['xpAwarded'], 0)
        self.assertEqual(User.objects.get(pk=self.user.pk).xp, 50)

    def test_an_answer_is_locked_in(self):
        data = self.start()
        q = data['questions'][0]
        wrong = Question.objects.get(key=q['id']).options.get(correct=False).id
        url = f"/api/skill-checks/attempts/{data['attempt']}/answer"
        self.assertFalse(self.client.post(url, {'question': q['id'], 'option': wrong}, format='json').data['correct'])
        retry = self.client.post(url, {'question': q['id'], 'option': self.right_option(q['id'])}, format='json')
        self.assertEqual(retry.status_code, 409)
        res = self.client.post(f"/api/skill-checks/attempts/{data['attempt']}/finish")
        self.assertEqual((res.data['score'], res.data['passed']), (0, False), 'unanswered counts as wrong')
        self.assertFalse(PassedModule.objects.exists())
        self.assertEqual(self.client.post(url, {'question': data['questions'][1]['id'], 'option': 1}, format='json').status_code, 409)

    def test_answers_must_belong_to_the_attempt(self):
        data = self.start()
        url = f"/api/skill-checks/attempts/{data['attempt']}/answer"
        q = data['questions'][0]
        other = Question.objects.exclude(key=q['id']).first().options.first().id
        self.assertEqual(self.client.post(url, {'question': q['id'], 'option': other}, format='json').status_code, 400)
        self.assertEqual(self.client.post(url, {'question': 'nope', 'option': 1}, format='json').status_code, 400)

    def test_someone_elses_attempt_is_not_found(self):
        data = self.start()
        self.client.force_authenticate(User.objects.create_user('b@x.com', 'secret123', display_name='B'))
        res = self.client.post(f"/api/skill-checks/attempts/{data['attempt']}/finish")
        self.assertEqual(res.status_code, 404)

    def test_right_answers_are_dealt_across_positions(self):
        from .views import deal
        check = SkillCheck.objects.get(pk='m0')
        for i in range(2, 8):
            q = Question.objects.create(skill_check=check, key=f'm0-x{i}', prompt='?')
            for j in range(4):
                Option.objects.create(question=q, text=str(j), correct=j == 0)
        qs = list(Question.objects.filter(key__startswith='m0-x').prefetch_related('options'))[:4]
        positions = []
        for item, q in zip(deal(qs), qs):
            right = q.options.get(correct=True).id
            positions.append(item['options'].index(right))
        self.assertEqual(sorted(positions), [0, 1, 2, 3])
