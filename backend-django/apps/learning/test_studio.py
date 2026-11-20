"""Course studio: who sees what, who edits what, and working as a team."""
from datetime import timedelta

from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.classrooms.models import Classroom, Membership

from .models import CourseInvite, Exercise, Lesson, SkillPath


class StudioTestCase(APITestCase):
    def setUp(self):
        self.ana = User.objects.create_user('ana@x.com', 'secret123', display_name='Ana Tutor', role='teacher')
        self.ben = User.objects.create_user('ben@x.com', 'secret123', display_name='Ben Tutor', role='teacher')
        self.cal = User.objects.create_user('cal@x.com', 'secret123', display_name='Cal Tutor', role='teacher')
        self.sam = User.objects.create_user('sam@x.com', 'secret123', display_name='Sam Student')
        self.zoe = User.objects.create_user('zoe@x.com', 'secret123', display_name='Zoe Student')
        self.official = SkillPath.objects.create(id='web', title='Web', is_official=True, status='published')
        Lesson.objects.create(id='web-1', path=self.official, title='Official lesson', part='M0: Intro')
        self.room = Classroom.objects.create(teacher=self.ana, name="Ana's class")
        Membership.objects.create(classroom=self.room, student=self.sam)

    def as_(self, user):
        self.client.force_authenticate(user)
        return self.client

    def new_course(self, user=None, title='Intro to APIs'):
        res = self.as_(user or self.ana).post('/api/studio/courses', {'title': title}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        return res.data['course']

    def add_lesson(self, course, user=None, title='What is an API?'):
        res = self.as_(user or self.ana).post(f"/api/studio/courses/{course['id']}/lessons",
                                              {'title': title, 'moduleId': course['modules'][0]['id']}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        return res.data['lesson']


class OwnershipTests(StudioTestCase):
    def test_a_new_course_is_a_private_draft_owned_by_you(self):
        c = self.new_course()
        self.assertEqual((c['status'], c['role'], c['official']), ('draft', 'owner', False))
        self.assertEqual([m['display_name'] for m in c['team']], ['Ana Tutor'])

    def test_other_tutors_cannot_see_or_touch_your_course(self):
        c = self.new_course()
        lesson = self.add_lesson(c)
        ben = self.as_(self.ben)
        self.assertEqual(ben.get('/api/studio/courses').data['courses'], [])
        self.assertEqual(ben.get(f"/api/studio/courses/{c['id']}").status_code, 404)
        self.assertEqual(ben.patch(f"/api/studio/courses/{c['id']}", {'title': 'Mine now'}, format='json').status_code, 404)
        self.assertEqual(ben.patch(f"/api/studio/lessons/{lesson['id']}", {'title': 'x'}, format='json').status_code, 404)
        self.assertEqual(ben.put(f"/api/lessons/{lesson['id']}", {'title': 'x'}, format='json').status_code, 404)
        self.assertEqual(ben.delete(f"/api/paths/{c['id']}").status_code, 403)
        self.assertNotIn(c['id'], [p['id'] for p in ben.get('/api/paths').data['paths']])
        self.assertNotIn(lesson['id'], [l['id'] for l in ben.get('/api/lessons').data['lessons']])

    def test_official_courses_are_read_only_for_tutors(self):
        ana = self.as_(self.ana)
        self.assertEqual(ana.get('/api/studio/courses/web').status_code, 404)
        self.assertEqual(ana.patch('/api/studio/lessons/web-1', {'title': 'x'}, format='json').status_code, 404)
        self.assertIn('web', [p['id'] for p in ana.get('/api/paths').data['paths']])

    def test_students_cannot_use_the_studio(self):
        self.assertEqual(self.as_(self.sam).get('/api/studio/courses').status_code, 403)
        self.assertEqual(self.as_(self.sam).post('/api/studio/courses', {'title': 'Hack'}, format='json').status_code, 403)


class VisibilityTests(StudioTestCase):
    def test_students_see_a_course_only_when_published_and_shared_with_their_class(self):
        c = self.new_course()
        lesson = self.add_lesson(c)
        cid = c['id']
        ana = self.as_(self.ana)
        # Can't publish an empty course
        self.assertEqual(ana.patch(f'/api/studio/courses/{cid}', {'status': 'published'}, format='json').status_code, 400)
        ana.patch(f"/api/studio/lessons/{lesson['id']}", {'published': True}, format='json')
        ana.patch(f'/api/studio/courses/{cid}', {'status': 'published'}, format='json')
        self.assertNotIn(cid, [p['id'] for p in self.as_(self.sam).get('/api/paths').data['paths']], 'not shared yet')
        res = self.as_(self.ana).put(f'/api/studio/courses/{cid}/classes', {'classIds': [str(self.room.id)]}, format='json')
        self.assertEqual(res.data['course']['students'], 1)
        self.assertIn(cid, [p['id'] for p in self.as_(self.sam).get('/api/paths').data['paths']])
        self.assertEqual(self.as_(self.sam).get(f"/api/lessons/{lesson['id']}").status_code, 200)
        self.assertNotIn(cid, [p['id'] for p in self.as_(self.zoe).get('/api/paths').data['paths']], 'not in the class')

    def test_unpublished_lessons_stay_hidden_from_students(self):
        c = self.new_course()
        draft = self.add_lesson(c, title='Draft lesson')
        live = self.add_lesson(c, title='Live lesson')
        ana = self.as_(self.ana)
        ana.patch(f"/api/studio/lessons/{live['id']}", {'published': True}, format='json')
        ana.patch(f"/api/studio/courses/{c['id']}", {'status': 'published'}, format='json')
        ana.put(f"/api/studio/courses/{c['id']}/classes", {'classIds': [str(self.room.id)]}, format='json')
        path = next(p for p in self.as_(self.sam).get('/api/paths').data['paths'] if p['id'] == c['id'])
        self.assertEqual([l['title'] for l in path['lessons_data']], ['Live lesson'])
        self.assertEqual(self.client.get(f"/api/lessons/{draft['id']}").status_code, 404)

    def test_you_can_only_share_with_your_own_classes(self):
        c = self.new_course()
        bens = Classroom.objects.create(teacher=self.ben, name="Ben's class")
        res = self.as_(self.ana).put(f"/api/studio/courses/{c['id']}/classes", {'classIds': [str(bens.id)]}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_modules_say_whether_they_have_a_skill_check(self):
        from .models import SkillCheck
        SkillCheck.objects.create(module_id='m0')
        self.official.modules = [{'id': 'm0', 'title': 'Intro'}, {'id': 'm1', 'title': 'Next'}]
        self.official.save()
        path = self.as_(self.sam).get('/api/paths/web').data['path']
        self.assertEqual([m['has_check'] for m in path['modules']], [True, False])


class TeamTests(StudioTestCase):
    def invite(self, course, email, by=None):
        return self.as_(by or self.ana).post(f"/api/studio/courses/{course['id']}/invites", {'email': email}, format='json')

    def test_invite_accept_and_collaborate(self):
        c = self.new_course()
        res = self.invite(c, 'BEN@x.com')
        self.assertEqual(res.status_code, 201)
        invites = self.as_(self.ben).get('/api/studio/courses').data['invites']
        self.assertEqual([i['course']['title'] for i in invites], ['Intro to APIs'])
        self.assertEqual(self.as_(self.cal).get('/api/studio/courses').data['invites'], [], 'only the invited person sees it')
        self.assertEqual(self.as_(self.cal).post(f"/api/studio/invites/{invites[0]['id']}/accept").status_code, 404)
        joined = self.as_(self.ben).post(f"/api/studio/invites/{invites[0]['id']}/accept").data['course']
        self.assertEqual(joined['role'], 'editor')
        lesson = self.add_lesson(c, user=self.ben, title="Ben's lesson")
        self.assertEqual(lesson['title'], "Ben's lesson")
        # Editors can't manage the team or delete the course
        self.assertEqual(self.invite(c, 'cal@x.com', by=self.ben).status_code, 403)
        self.assertEqual(self.as_(self.ben).delete(f"/api/studio/courses/{c['id']}").status_code, 403)

    def test_inviting_never_reveals_whether_an_account_exists(self):
        c = self.new_course()
        a = self.invite(c, 'nobody@x.com')
        b = self.invite(c, 'cal@x.com')
        self.assertEqual(a.status_code, b.status_code)
        self.assertEqual(set(a.data['invite']), set(b.data['invite']))
        self.assertEqual(self.invite(c, 'cal@x.com').status_code, 400, 'already invited')
        self.assertEqual(self.invite(c, 'ana@x.com').status_code, 400, 'already on the team')

    def test_students_cannot_join_a_team(self):
        c = self.new_course()
        self.invite(c, 'sam@x.com')
        inv = CourseInvite.objects.get(email='sam@x.com')
        self.assertEqual(self.as_(self.sam).post(f'/api/studio/invites/{inv.id}/accept').status_code, 403)

    def test_leave_remove_and_hand_over(self):
        c = self.new_course()
        self.invite(c, 'ben@x.com')
        inv = CourseInvite.objects.get(email='ben@x.com')
        self.as_(self.ben).post(f'/api/studio/invites/{inv.id}/accept')
        cid = c['id']
        # The owner can't leave without handing over
        self.assertEqual(self.as_(self.ana).delete(f'/api/studio/courses/{cid}/team/{self.ana.id}').status_code, 400)
        res = self.as_(self.ana).post(f'/api/studio/courses/{cid}/team/{self.ben.id}/owner')
        roles = {m['display_name']: m['course_role'] for m in res.data['course']['team']}
        self.assertEqual(roles, {'Ana Tutor': 'editor', 'Ben Tutor': 'owner'})
        self.assertEqual(self.as_(self.ana).delete(f'/api/studio/courses/{cid}/team/{self.ana.id}').status_code, 200, 'Ana leaves')
        self.assertEqual(self.as_(self.ana).get(f'/api/studio/courses/{cid}').status_code, 404)

    def test_saving_over_a_collaborators_changes_is_refused(self):
        c = self.new_course()
        self.invite(c, 'ben@x.com')
        self.as_(self.ben).post(f"/api/studio/invites/{CourseInvite.objects.get().id}/accept")
        lesson = self.add_lesson(c)
        base = lesson['updated_at']
        # Ben saves first
        self.as_(self.ben).patch(f"/api/studio/lessons/{lesson['id']}", {'title': "Ben's version"}, format='json')
        Lesson.objects.filter(pk=lesson['id']).update(updated_at=Lesson.objects.get(pk=lesson['id']).updated_at + timedelta(seconds=5))
        # Ana saves on top of the version she opened
        res = self.as_(self.ana).patch(f"/api/studio/lessons/{lesson['id']}", {'title': "Ana's version", 'baseUpdatedAt': base}, format='json')
        self.assertEqual(res.status_code, 409)
        self.assertIn('Ben Tutor', res.data['error'])
        self.assertEqual(res.data['lesson']['title'], "Ben's version")


class OutlineAndLessonTests(StudioTestCase):
    def test_outline_moves_lessons_between_modules(self):
        c = self.new_course()
        a = self.add_lesson(c, title='Alpha')
        b = self.add_lesson(c, title='Beta')
        mid = c['modules'][0]['id']
        res = self.as_(self.ana).put(f"/api/studio/courses/{c['id']}/outline", {'modules': [
            {'id': mid, 'title': 'Basics', 'lessons': [b['id']]},
            {'title': 'Going further', 'lessons': [a['id']]},
        ]}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        mods = res.data['course']['modules']
        self.assertEqual([(m['title'], [l['title'] for l in m['lessons']]) for m in mods],
                         [('Basics', ['Beta']), ('Going further', ['Alpha'])])
        self.assertEqual(Lesson.objects.get(pk=a['id']).part, 'M1: Going further')

    def test_outline_must_place_every_lesson(self):
        c = self.new_course()
        self.add_lesson(c)
        res = self.as_(self.ana).put(f"/api/studio/courses/{c['id']}/outline",
                                     {'modules': [{'id': 'x', 'title': 'Only', 'lessons': []}]}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_lesson_fields_are_checked_and_tidied(self):
        c = self.new_course()
        lesson = self.add_lesson(c)
        res = self.as_(self.ana).patch(f"/api/studio/lessons/{lesson['id']}", {
            'duration': '12', 'goal': 'call an API',
            'sections': [{'heading': 'Intro', 'body': 'Hello', 'code': '', 'callout': ''}],
        }, format='json')
        self.assertEqual(res.data['lesson']['duration'], '12 min')
        self.assertEqual(res.data['lesson']['sections'], [{'heading': 'Intro', 'body': 'Hello'}])
        self.assertEqual(self.client.patch(f"/api/studio/lessons/{lesson['id']}", {'duration': 'soon'}, format='json').status_code, 400)


class ExerciseAccessTests(StudioTestCase):
    def test_exercises_follow_the_course_team(self):
        c = self.new_course()
        lesson = self.add_lesson(c)
        ana = self.as_(self.ana)
        res = ana.post('/api/exercises', {'title': 'Fetch a joke', 'lesson_id': lesson['id'], 'solution_code': 'secret'}, format='json')
        self.assertEqual(res.status_code, 201)
        ex = res.data['exercise']['id']
        self.assertEqual(ana.post('/api/exercises', {'title': 'x', 'lesson_id': 'web-1'}, format='json').status_code, 403,
                         'not on official lessons')
        ben = self.as_(self.ben)
        self.assertEqual(ben.get(f'/api/exercises/{ex}').status_code, 404, 'draft lesson: invisible to others')
        self.assertEqual(ben.delete(f'/api/exercises/{ex}').status_code, 404)
        self.assertEqual(ben.get('/api/studio/exercises').data['exercises'], [])
        self.assertEqual(len(self.as_(self.ana).get('/api/studio/exercises').data['exercises']), 1)

    def test_students_never_get_solutions(self):
        c = self.new_course()
        lesson = self.add_lesson(c)
        Exercise.objects.create(lesson_id=lesson['id'], title='E', solution_code='secret')
        ana = self.as_(self.ana)
        ana.patch(f"/api/studio/lessons/{lesson['id']}", {'published': True}, format='json')
        ana.patch(f"/api/studio/courses/{c['id']}", {'status': 'published'}, format='json')
        ana.put(f"/api/studio/courses/{c['id']}/classes", {'classIds': [str(self.room.id)]}, format='json')
        ex = self.as_(self.sam).get(f"/api/exercises?lessonId={lesson['id']}").data['exercises'][0]
        self.assertNotIn('solution_code', ex)


class AssignmentLessonTests(StudioTestCase):
    def test_assigning_a_draft_is_refused_and_a_published_course_gets_shared(self):
        c = self.new_course()
        lesson = self.add_lesson(c)
        url = f'/api/classrooms/{self.room.id}/assignments'
        body = {'kind': 'lesson', 'title': 'Read it', 'lessonId': lesson['id']}
        self.assertEqual(self.as_(self.ana).post(url, body, format='json').status_code, 400)
        self.client.patch(f"/api/studio/lessons/{lesson['id']}", {'published': True}, format='json')
        self.client.patch(f"/api/studio/courses/{c['id']}", {'status': 'published'}, format='json')
        self.assertEqual(self.client.post(url, body, format='json').status_code, 201)
        self.assertTrue(SkillPath.objects.get(pk=c['id']).classes.filter(pk=self.room.pk).exists(), 'shared automatically')

    def test_cannot_assign_another_tutors_lesson(self):
        c = self.new_course(user=self.ben)
        lesson = self.add_lesson(c, user=self.ben)
        res = self.as_(self.ana).post(f'/api/classrooms/{self.room.id}/assignments',
                                      {'kind': 'lesson', 'title': 'x', 'lessonId': lesson['id']}, format='json')
        self.assertEqual(res.status_code, 400)


class OverviewTests(StudioTestCase):
    def test_overview_collects_what_needs_you(self):
        from apps.classrooms.models import Assignment, Post, Submission
        a = Assignment.objects.create(classroom=self.room, kind='code', title='Build a page')
        Submission.objects.create(assignment=a, student=self.sam, code='<h1>Hi</h1>')
        Post.objects.create(classroom=self.room, author=self.sam, kind='question', body='Help?')
        self.new_course()
        res = self.as_(self.ana).get('/api/teaching/overview')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['totals']['toReview'], 1)
        self.assertEqual(res.data['totals']['waiting'], 1)
        self.assertEqual([x['kind'] for x in res.data['attention']][:2], ['question', 'review'])
        self.assertEqual(len(res.data['courses']), 1)
        self.assertEqual(self.as_(self.ben).get('/api/teaching/overview').data['totals']['toReview'], 0)
        self.assertEqual(self.as_(self.sam).get('/api/teaching/overview').status_code, 403)
