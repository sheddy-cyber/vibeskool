from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.learning.models import Lesson, SkillPath

from .models import Assignment, Classroom, Membership, Post


class ClassroomTestCase(APITestCase):
    def setUp(self):
        self.tutor = User.objects.create_user('t@x.com', 'secret123', display_name='Tutor', role='teacher')
        self.ada = User.objects.create_user('ada@x.com', 'secret123', display_name='Ada')
        self.ben = User.objects.create_user('ben@x.com', 'secret123', display_name='Ben')
        self.outsider = User.objects.create_user('out@x.com', 'secret123', display_name='Out')
        self.room = Classroom.objects.create(teacher=self.tutor, name='Evening cohort')
        Membership.objects.create(classroom=self.room, student=self.ada)
        Membership.objects.create(classroom=self.room, student=self.ben)
        path = SkillPath.objects.create(id='web', title='Web')
        self.lesson = Lesson.objects.create(id='l1', path=path, title='One')

    def as_(self, user):
        self.client.force_authenticate(user)
        return self.client

    def url(self, rest=''):
        return f'/api/classrooms/{self.room.id}{rest}'


class ClassTests(ClassroomTestCase):
    def test_tutor_creates_a_class_students_cannot(self):
        res = self.as_(self.tutor).post('/api/classrooms', {'name': 'Morning'}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data['classroom']['invite_code'].startswith('VIBE-'))
        self.assertEqual(self.as_(self.ada).post('/api/classrooms', {'name': 'Mine'}, format='json').status_code, 403)

    def test_join_by_code(self):
        code = self.room.invite_code.lower()
        res = self.as_(self.outsider).post('/api/classrooms/join', {'inviteCode': f'  {code} '}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['classroom']['member_count'], 3)
        self.assertNotIn('invite_code', res.data['classroom'], 'students do not see the code')
        again = self.client.post('/api/classrooms/join', {'inviteCode': code}, format='json')
        self.assertEqual(again.data, {'error': 'Already a member of this classroom'})
        self.assertEqual(self.client.post('/api/classrooms/join', {'inviteCode': 'VIBE-NOPE'}, format='json').status_code, 404)

    def test_closed_class_cannot_be_joined(self):
        self.room.joining_open = False
        self.room.save()
        res = self.as_(self.outsider).post('/api/classrooms/join', {'inviteCode': self.room.invite_code}, format='json')
        self.assertEqual(res.status_code, 404)

    def test_lists_per_role(self):
        self.assertEqual(len(self.as_(self.tutor).get('/api/classrooms').data['classrooms']), 1)
        self.assertEqual(len(self.as_(self.ada).get('/api/classrooms').data['classrooms']), 1)
        self.assertEqual(self.client.get('/api/classrooms').data['classrooms'][0]['member_count'], 2)
        self.assertEqual(len(self.as_(self.outsider).get('/api/classrooms').data['classrooms']), 0)

    def test_outsiders_are_kept_out(self):
        self.assertEqual(self.as_(self.outsider).get(self.url()).status_code, 403)
        self.assertEqual(self.as_(self.ada).get(self.url('/members')).status_code, 403)
        self.assertEqual(self.as_(self.ada).delete(self.url()).status_code, 403)

    def test_detail_hides_emails_from_students(self):
        data = self.as_(self.ada).get(self.url()).data
        self.assertEqual(len(data['members']), 2)
        self.assertNotIn('email', data['members'][0])
        self.assertIn('email', self.as_(self.tutor).get(self.url()).data['members'][0])

    def test_new_invite_code(self):
        old = self.room.invite_code
        res = self.as_(self.tutor).post(self.url('/invite-code'))
        self.assertNotEqual(res.data['invite_code'], old)

    def test_student_leaves(self):
        self.as_(self.ada).post(self.url('/leave'))
        self.assertFalse(self.room.is_member(self.ada))


class StreamTests(ClassroomTestCase):
    def test_only_tutors_announce(self):
        res = self.as_(self.ada).post(self.url('/posts'), {'kind': 'announcement', 'body': 'Hi'}, format='json')
        self.assertEqual(res.status_code, 403)
        res = self.as_(self.tutor).post(self.url('/posts'), {'kind': 'announcement', 'body': 'Hi', 'pinned': True}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data['post']['pinned'])

    def test_private_questions_stay_between_student_and_tutor(self):
        res = self.as_(self.ada).post(self.url('/posts'), {
            'kind': 'question', 'body': 'Can I ask privately?', 'is_private': True, 'lessonId': 'l1',
            'code': 'ls -la', 'pinned': True,
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertFalse(res.data['post']['pinned'], 'students cannot pin')
        self.assertEqual(res.data['post']['lesson']['id'], 'l1')
        pid = res.data['post']['id']
        self.assertEqual(len(self.as_(self.ben).get(self.url('/posts')).data['posts']), 0)
        self.assertEqual(self.client.get(self.url(f'/posts/{pid}')).status_code, 404)
        self.assertEqual(len(self.as_(self.tutor).get(self.url('/posts')).data['posts']), 1)

    def test_accepting_an_answer_resolves_the_question(self):
        pid = self.as_(self.ada).post(self.url('/posts'), {'kind': 'question', 'body': 'Why 404?'}, format='json').data['post']['id']
        rid = self.as_(self.tutor).post(self.url(f'/posts/{pid}/replies'), {'body': 'Check the path.'}, format='json').data['reply']['id']
        self.assertEqual(self.as_(self.ben).post(self.url(f'/replies/{rid}/accept')).status_code, 403)
        res = self.as_(self.ada).post(self.url(f'/replies/{rid}/accept'))
        self.assertTrue(res.data['resolved'])
        open_qs = self.client.get(self.url('/posts?open=1')).data['posts']
        self.assertEqual(open_qs, [])

    def test_tutor_can_pin_but_not_rewrite_a_student_post(self):
        pid = self.as_(self.ada).post(self.url('/posts'), {'body': 'My diagram'}, format='json').data['post']['id']
        res = self.as_(self.tutor).put(self.url(f'/posts/{pid}'), {'pinned': True, 'body': 'Changed'}, format='json')
        self.assertTrue(res.data['post']['pinned'])
        self.assertEqual(res.data['post']['body'], 'My diagram')
        self.assertEqual(self.as_(self.ben).delete(self.url(f'/posts/{pid}')).status_code, 403)


class AssignmentTests(ClassroomTestCase):
    def setUp(self):
        super().setUp()
        self.code_task = Assignment.objects.create(classroom=self.room, kind='code', title='First page',
                                                   due_at=timezone.now() + timedelta(days=2))

    def test_lesson_assignments_need_a_lesson(self):
        res = self.as_(self.tutor).post(self.url('/assignments'), {'kind': 'lesson', 'title': 'Read'}, format='json')
        self.assertEqual(res.status_code, 400)
        res = self.client.post(self.url('/assignments'), {'kind': 'lesson', 'title': 'Read', 'lessonId': 'l1'}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(self.as_(self.ada).post(self.url('/assignments'), {'title': 'x'}, format='json').status_code, 403)

    def test_hand_in_review_and_line_feedback(self):
        url = self.url(f'/assignments/{self.code_task.id}/submission')
        self.assertEqual(self.as_(self.ada).put(url, {'code': '  '}, format='json').status_code, 400)
        res = self.client.put(url, {'code': '<h1>Hi\n<p>Me', 'note': 'First try'}, format='json')
        self.assertEqual(res.status_code, 201)
        sid = res.data['submission']['id']
        self.assertEqual(self.as_(self.ben).get(self.url(f'/submissions/{sid}')).status_code, 404)

        tutor = self.as_(self.tutor)
        c = tutor.post(self.url(f'/submissions/{sid}/comments'), {'line': 2, 'body': 'Close the <p>'}, format='json')
        self.assertEqual(c.status_code, 201)
        bad = tutor.post(self.url(f'/submissions/{sid}/comments'), {'line': 40, 'body': 'x'}, format='json')
        self.assertEqual(bad.status_code, 400)
        r = tutor.post(self.url(f'/submissions/{sid}/review'), {'status': 'changes_requested', 'comment': 'Nearly'}, format='json')
        self.assertEqual(r.data['submission']['status'], 'changes_requested')
        self.assertEqual(len(r.data['submission']['comments']), 2)

        mine = self.as_(self.ada).get(self.url('/assignments')).data['assignments'][0]
        self.assertEqual(mine['status'], 'changes_requested')
        self.client.put(url, {'code': '<h1>Hi</h1>\n<p>Me</p>'}, format='json')
        roster = self.as_(self.tutor).get(self.url(f'/assignments/{self.code_task.id}')).data['assignment']['roster']
        statuses = {r['student']['display_name']: r['status'] for r in roster}
        self.assertEqual(statuses, {'Ada': 'submitted', 'Ben': 'not_started'})

    def test_lesson_assignment_is_done_by_finishing_the_lesson(self):
        a = Assignment.objects.create(classroom=self.room, kind='lesson', lesson=self.lesson, title='Read one')
        self.as_(self.ada).post('/api/progress/complete', {'lessonId': 'l1'}, format='json')
        res = self.client.get(self.url(f'/assignments/{a.id}'))
        self.assertEqual(res.data['assignment']['status'], 'done')
        counts = next(x for x in self.as_(self.tutor).get(self.url('/assignments')).data['assignments'] if x['id'] == a.id)['counts']
        self.assertEqual((counts['done'], counts['not_started']), (1, 1))


class InsightsTests(ClassroomTestCase):
    def test_flags_who_needs_help(self):
        Assignment.objects.create(classroom=self.room, kind='code', title='Late one', due_at=timezone.now() - timedelta(days=1))
        q = Post.objects.create(classroom=self.room, author=self.ben, kind='question', body='Stuck')
        Post.objects.filter(pk=q.pk).update(created_at=timezone.now() - timedelta(hours=30))
        self.as_(self.ada).put(self.url(f'/assignments/{Assignment.objects.get().id}/submission'), {'code': 'x'}, format='json')

        res = self.as_(self.tutor).get(self.url('/insights'))
        self.assertEqual(res.status_code, 200)
        first = res.data['students'][0]
        self.assertEqual(first['student']['display_name'], 'Ben', 'waiting on the tutor sorts first')
        # Ben's question 30 hours ago counts as activity, so he isn't inactive
        self.assertEqual(first['flags'], ['waiting_on_you', 'overdue'])
        ada = next(r for r in res.data['students'] if r['student']['display_name'] == 'Ada')
        self.assertEqual(ada['flags'], [], 'handed in, so nothing is overdue')
        self.assertEqual(len(res.data['waitingQuestions']), 1)
        self.assertEqual(self.as_(self.ada).get(self.url('/insights')).status_code, 403)

    def test_nudges(self):
        res = self.as_(self.tutor).post(self.url('/nudges'), {'studentId': str(self.outsider.id), 'message': 'Hi'}, format='json')
        self.assertEqual(res.status_code, 400)
        res = self.client.post(self.url('/nudges'), {'studentId': str(self.ben.id), 'message': 'Need a hand?'}, format='json')
        nid = res.data['nudge']['id']
        self.assertEqual(self.as_(self.ada).get(self.url('/nudges')).data['nudges'], [])
        self.assertEqual(self.as_(self.ben).get(self.url()).data['unread_nudges'], 1)
        self.client.post(self.url(f'/nudges/{nid}/read'))
        self.assertEqual(self.client.get(self.url()).data['unread_nudges'], 0)


class CommentAnchoringTests(ClassroomTestCase):
    CODE = '<h1>Hi</h1>\n<p>Me\n<img src="me.png">\n</body>'

    def setUp(self):
        super().setUp()
        self.task = Assignment.objects.create(classroom=self.room, kind='code', title='Page')
        self.url_in = self.url(f'/assignments/{self.task.id}/submission')
        self.sid = self.as_(self.ada).put(self.url_in, {'code': self.CODE}, format='json').data['submission']['id']
        tutor = self.as_(self.tutor)
        tutor.post(self.url(f'/submissions/{self.sid}/comments'), {'line': 2, 'body': 'Close the <p>'}, format='json')
        tutor.post(self.url(f'/submissions/{self.sid}/comments'), {'line': 3, 'body': 'Add alt text'}, format='json')
        tutor.post(self.url(f'/submissions/{self.sid}/comments'), {'line': 4, 'body': 'Where is <body>?'}, format='json')

    def comments(self):
        data = self.as_(self.tutor).get(self.url(f'/submissions/{self.sid}')).data['submission']
        return data, {c['body']: c for c in data['comments']}

    def test_comments_remember_their_line(self):
        _, c = self.comments()
        self.assertEqual(c['Close the <p>']['line_text'], '<p>Me')
        self.assertFalse(c['Close the <p>']['outdated'])

    def test_handing_in_changed_code_moves_or_outdates_comments(self):
        # Line 2 is fixed (changed), a line is added at the top, the img line is untouched
        new = '<!doctype html>\n<h1>Hi</h1>\n<p>Me</p>\n<img src="me.png">\n</body>'
        res = self.as_(self.ada).put(self.url_in, {'code': new}, format='json')
        self.assertEqual(res.data['submission']['revision'], 2)
        sub, c = self.comments()
        self.assertTrue(c['Close the <p>']['outdated'], 'the line it was about changed')
        self.assertEqual(c['Close the <p>']['line_text'], '<p>Me', 'keeps the old line for context')
        self.assertEqual((c['Add alt text']['line'], c['Add alt text']['outdated']), (4, False), 'followed its line')
        self.assertEqual(c['Where is <body>?']['line'], 5)
        self.assertEqual(c['Close the <p>']['revision'], 1)

    def test_same_code_keeps_revision(self):
        res = self.as_(self.ada).put(self.url_in, {'code': self.CODE, 'note': 'just a note'}, format='json')
        self.assertEqual(res.data['submission']['revision'], 1)


class LiveEventTests(ClassroomTestCase):
    def test_views_announce_changes(self):
        from unittest import mock
        with mock.patch('apps.classrooms.views.broadcast') as b:
            pid = self.as_(self.ada).post(self.url('/posts'), {'body': 'Hi'}, format='json').data['post']['id']
            b.assert_called_with(self.room.id, 'stream', 'post.created', id=pid)
            self.client.post(self.url(f'/posts/{pid}/replies'), {'body': 'Yo'}, format='json')
            self.assertEqual(b.call_args.args[1:3], ('stream', 'reply.created'))
            a = Assignment.objects.create(classroom=self.room, kind='code', title='Page')
            self.client.put(self.url(f'/assignments/{a.id}/submission'), {'code': 'x'}, format='json')
            self.assertEqual(b.call_args.args[1:3], ('work', 'submission.handed_in'))
