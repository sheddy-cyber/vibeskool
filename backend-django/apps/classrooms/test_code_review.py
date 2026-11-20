from .models import Post
from .tests import ClassroomTestCase

STUDENT_CODE = 'function add(a, b) {\n  return a - b\n}\n'
TUTOR_CODE = 'function add(a, b) {\n  return a + b\n}\n\nconsole.log(add(2, 3))\n'


class CodeReviewTests(ClassroomTestCase):
    def setUp(self):
        super().setUp()
        self.post = Post.objects.create(classroom=self.room, author=self.ada, kind=Post.Kind.QUESTION,
                                        body='Why is add(2, 3) giving me -1?', code=STUDENT_CODE)

    def review_url(self, post=None):
        return self.url(f'/posts/{(post or self.post).id}/code-review')

    def save_review(self, user=None, **data):
        body = {'code': TUTOR_CODE, 'notes': [{'line': 2, 'body': 'Plus, not minus.'}], **data}
        return self.as_(user or self.tutor).put(self.review_url(), body, format='json')

    def test_tutor_edits_the_code_and_the_original_is_kept(self):
        res = self.save_review()
        self.assertEqual(res.status_code, 200)
        review = res.data['post']['code_review']
        self.assertEqual(review['code'], TUTOR_CODE)
        self.assertEqual(review['base'], STUDENT_CODE)
        self.assertEqual(review['notes'], [{'line': 2, 'body': 'Plus, not minus.'}])
        self.assertEqual(review['by']['display_name'], 'Tutor')
        self.assertFalse(review['outdated'])
        self.assertEqual(res.data['post']['code'], STUDENT_CODE, "the student's code isn't overwritten")

    def test_the_asker_and_classmates_see_it_but_cannot_change_it(self):
        self.save_review()
        for student in (self.ada, self.ben):
            posts = self.as_(student).get(self.url('/posts')).data['posts']
            self.assertEqual(posts[0]['code_review']['code'], TUTOR_CODE)
            self.assertEqual(self.save_review(student, code='hacked').status_code, 403)
            self.assertEqual(self.as_(student).patch(self.review_url(), {'code': 'x'}, format='json').status_code, 403)
            self.assertEqual(self.as_(student).delete(self.review_url()).status_code, 403)
        self.post.refresh_from_db()
        self.assertEqual(self.post.review_code, TUTOR_CODE)

    def test_classmates_can_still_reply(self):
        self.save_review()
        res = self.as_(self.ben).post(self.url(f'/posts/{self.post.id}/replies'), {'body': 'That fixed mine too'}, format='json')
        self.assertEqual(res.status_code, 201)

    def test_private_questions_stay_private(self):
        self.post.is_private = True
        self.post.save()
        self.save_review()
        self.assertEqual(self.as_(self.ben).get(self.url('/posts')).data['posts'], [])
        self.assertEqual(self.as_(self.ben).get(self.url(f'/posts/{self.post.id}')).status_code, 404)
        self.assertIsNotNone(self.as_(self.ada).get(self.url('/posts')).data['posts'][0]['code_review'])

    def test_outsiders_are_kept_out(self):
        self.assertEqual(self.save_review(self.outsider).status_code, 403)

    def test_notes_must_point_at_real_lines(self):
        self.assertEqual(self.save_review(notes=[{'line': 99, 'body': 'Nope'}]).status_code, 400)
        self.assertEqual(self.save_review(notes=[{'line': 'two', 'body': 'Nope'}]).status_code, 400)
        self.assertEqual(self.save_review(notes=[{'line': 2, 'body': 'a'}, {'line': 2, 'body': 'b'}]).status_code, 400)
        self.assertEqual(self.save_review(code='   ').status_code, 400)
        # Empty notes are dropped, the rest come back in line order
        res = self.save_review(notes=[{'line': 5, 'body': 'Try it'}, {'line': 1, 'body': '  '}, {'line': 2, 'body': 'Plus'}])
        self.assertEqual([n['line'] for n in res.data['post']['code_review']['notes']], [2, 5])

    def test_notes_alone_are_fine(self):
        res = self.save_review(code=STUDENT_CODE, notes=[{'line': 2, 'body': 'Look at the operator'}])
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['post']['code_review']['code'], STUDENT_CODE)

    def test_posts_without_code_or_by_the_tutor_cannot_be_reviewed(self):
        no_code = Post.objects.create(classroom=self.room, author=self.ada, kind=Post.Kind.QUESTION, body='Help')
        self.assertEqual(self.as_(self.tutor).put(self.review_url(no_code), {'code': 'x'}, format='json').status_code, 403)
        own = Post.objects.create(classroom=self.room, author=self.tutor, body='Example', code='let a = 1')
        self.assertEqual(self.as_(self.tutor).put(self.review_url(own), {'code': 'x'}, format='json').status_code, 403)

    def test_student_changing_their_code_marks_the_review_outdated(self):
        self.save_review()
        self.as_(self.ada).patch(self.url(f'/posts/{self.post.id}'), {'code': 'function add(a, b) { return a + b }'}, format='json')
        review = self.as_(self.ben).get(self.url(f'/posts/{self.post.id}')).data['post']['code_review']
        self.assertTrue(review['outdated'])
        self.assertEqual(review['base'], STUDENT_CODE, 'the changes still show against what the tutor saw')

    def test_tutor_removes_their_version(self):
        self.save_review()
        res = self.as_(self.tutor).delete(self.review_url())
        self.assertIsNone(res.data['post']['code_review'])

    def test_a_reviewed_question_no_longer_waits_on_the_tutor(self):
        waiting = lambda: self.as_(self.tutor).get(self.url('/insights')).data['waitingQuestions']
        self.assertEqual(len(waiting()), 1)
        self.save_review()
        self.assertEqual(len(waiting()), 0)
