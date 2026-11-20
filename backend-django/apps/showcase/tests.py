import io
import shutil
import tempfile

from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.classrooms.models import Classroom, Membership

from .models import Project

MEDIA = tempfile.mkdtemp()


def png(w=2400, h=1600, exif=False):
    buf = io.BytesIO()
    img = Image.new('RGB', (w, h), (30, 90, 200))
    kwargs = {}
    if exif:
        e = Image.Exif()
        e[0x010F] = 'PhoneMaker'  # camera make
        kwargs['exif'] = e.tobytes()
    img.save(buf, format='JPEG' if exif else 'PNG', **kwargs)
    buf.seek(0)
    buf.name = 'shot.jpg' if exif else 'shot.png'
    return buf


@override_settings(MEDIA_ROOT=MEDIA)
class ShowcaseTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA, ignore_errors=True)

    def setUp(self):
        self.tutor = User.objects.create_user('t@x.com', 'secret123', display_name='Grace Tutor', role='teacher')
        self.ada = User.objects.create_user('ada@x.com', 'secret123', display_name='Ada Okafor')
        self.ben = User.objects.create_user('ben@x.com', 'secret123', display_name='Ben Bello')
        self.stranger = User.objects.create_user('s@x.com', 'secret123', display_name='Sam Stranger')
        self.room = Classroom.objects.create(teacher=self.tutor, name='Evening')
        Membership.objects.create(classroom=self.room, student=self.ada)
        Membership.objects.create(classroom=self.room, student=self.ben)

    def as_(self, user):
        self.client.force_authenticate(user)
        return self.client

    def create(self, user=None, **data):
        body = {'title': 'My page', 'live_url': 'https://ada.netlify.app', **data}
        return self.as_(user or self.ada).post('/api/showcase/projects', body, format='json')

    def test_draft_then_publish_awards_xp_once(self):
        res = self.create()
        self.assertEqual(res.status_code, 201)
        pid = res.data['project']['id']
        self.assertEqual(res.data['project']['status'], 'draft')
        self.assertEqual(res.data['xpAwarded'], 0)
        self.assertEqual(self.as_(self.ben).get(f'/api/showcase/projects/{pid}').status_code, 404, 'drafts are private')
        res = self.as_(self.ada).patch(f'/api/showcase/projects/{pid}', {'status': 'published'}, format='json')
        self.assertEqual(res.data['xpAwarded'], 30)
        self.client.patch(f'/api/showcase/projects/{pid}', {'status': 'draft'}, format='json')
        res = self.client.patch(f'/api/showcase/projects/{pid}', {'status': 'published'}, format='json')
        self.assertEqual(res.data['xpAwarded'], 0)
        self.ada.refresh_from_db()
        self.assertEqual(self.ada.xp, 30)

    def test_links_are_checked(self):
        self.assertEqual(self.create(repo_url='https://gitlab.com/a/b').status_code, 400)
        res = self.create(live_url='http://localhost:5173')
        self.assertIn('own computer', res.data['error'])
        res = self.create(live_url='', repo_url='http://www.github.com/ada/site.git/')
        self.assertEqual(res.data['project']['repo_url'], 'https://github.com/ada/site')
        self.assertEqual(res.data['project']['repo_label'], 'ada/site')
        res = self.create(live_url='', status='published')
        self.assertEqual(res.status_code, 400, 'publishing needs a link')

    def test_tags_are_tidied(self):
        res = self.create(tags=['#React', ' CSS ', 'react'])
        self.assertEqual(res.data['project']['tags'], ['react', 'css'])
        self.assertEqual(self.create(tags=['<script>']).status_code, 400)

    def test_collaborators_come_from_your_classes(self):
        res = self.create(collaboratorIds=[str(self.ben.id), str(self.tutor.id)], status='published')
        names = [m['display_name'] for m in res.data['project']['members']]
        self.assertEqual(names[0], 'Ada Okafor', 'owner first')
        self.assertEqual(set(names), {'Ada Okafor', 'Ben Bello', 'Grace Tutor'})
        self.assertEqual(self.create(collaboratorIds=[str(self.stranger.id)]).status_code, 400)
        people = self.as_(self.ada).get('/api/showcase/collaborators?q=be').data['people']
        self.assertEqual([p['display_name'] for p in people], ['Ben Bello'])
        self.assertEqual(self.as_(self.stranger).get('/api/showcase/collaborators').data['people'], [])

    def test_collaborators_can_edit_only_owner_deletes(self):
        pid = self.create(collaboratorIds=[str(self.ben.id)]).data['project']['id']
        res = self.as_(self.ben).patch(f'/api/showcase/projects/{pid}', {'tagline': 'Now better'}, format='json')
        self.assertEqual(res.data['project']['tagline'], 'Now better')
        self.assertEqual(self.client.patch(f'/api/showcase/projects/{pid}', {'collaboratorIds': []}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/showcase/projects/{pid}').status_code, 403)
        self.assertEqual(self.client.post(f'/api/showcase/projects/{pid}/leave').status_code, 200)
        self.assertEqual(self.as_(self.ada).delete(f'/api/showcase/projects/{pid}').status_code, 200)

    def test_listing_scopes_search_and_tags(self):
        self.create(title='Weather now', tags=['react'], status='published')
        self.create(user=self.stranger, title='Elsewhere', tags=['css'], status='published')
        self.create(title='Secret draft')
        c = self.as_(self.ben)
        self.assertEqual({p['title'] for p in c.get('/api/showcase/projects').data['projects']}, {'Weather now', 'Elsewhere'})
        self.assertEqual([p['title'] for p in c.get('/api/showcase/projects?scope=classes').data['projects']], ['Weather now'])
        self.assertEqual([p['title'] for p in c.get('/api/showcase/projects?tag=css').data['projects']], ['Elsewhere'])
        self.assertEqual([p['title'] for p in c.get('/api/showcase/projects?q=okafor').data['projects']], ['Weather now'])
        mine = self.as_(self.ada).get('/api/showcase/projects?scope=mine').data['projects']
        self.assertEqual(mine[0]['title'], 'Secret draft', 'drafts first in your own list')
        self.assertIn({'name': 'react', 'count': 1}, c.get('/api/showcase/projects').data['tags'])

    def test_appreciations(self):
        pid = self.create(status='published').data['project']['id']
        self.assertEqual(self.as_(self.ada).post(f'/api/showcase/projects/{pid}/appreciate').status_code, 400)
        res = self.as_(self.ben).post(f'/api/showcase/projects/{pid}/appreciate')
        self.assertEqual(res.data, {'appreciated': True, 'appreciations': 1})
        res = self.client.post(f'/api/showcase/projects/{pid}/appreciate')
        self.assertEqual(res.data, {'appreciated': False, 'appreciations': 0})
        self.client.post(f'/api/showcase/projects/{pid}/appreciate')
        top = self.client.get('/api/showcase/projects?sort=popular').data['projects'][0]
        self.assertTrue(top['appreciated'])

    def test_comments(self):
        pid = self.create(status='published').data['project']['id']
        res = self.as_(self.stranger).post(f'/api/showcase/projects/{pid}/comments', {'body': 'Love the colours'}, format='json')
        self.assertEqual(res.status_code, 201)
        cid = res.data['comment']['id']
        self.assertEqual(self.as_(self.ben).delete(f'/api/showcase/projects/{pid}/comments/{cid}').status_code, 403)
        self.assertEqual(self.as_(self.ada).delete(f'/api/showcase/projects/{pid}/comments/{cid}').status_code, 200, 'owners can moderate')

    def test_only_the_class_tutor_features(self):
        pid = self.create(status='published', classroomId=str(self.room.id)).data['project']['id']
        self.assertEqual(self.as_(self.ben).post(f'/api/showcase/projects/{pid}/feature').status_code, 403)
        self.assertEqual(self.as_(self.tutor).post(f'/api/showcase/projects/{pid}/feature').data, {'featured': True})
        featured = self.as_(self.stranger).get('/api/showcase/projects').data['featured']
        self.assertEqual(len(featured), 1)
        self.assertIsNone(featured[0]['classroom'], 'class names stay inside the class')
        self.assertEqual(self.create(user=self.stranger, classroomId=str(self.room.id)).status_code, 400)

    def test_preview_image_is_resized_and_cleaned(self):
        pid = self.create().data['project']['id']
        res = self.as_(self.ada).post(f'/api/showcase/projects/{pid}/image', {'image': png(exif=True)}, format='multipart')
        self.assertEqual(res.status_code, 200)
        p = Project.objects.get(pk=pid)
        self.assertEqual((p.image_width, p.image_height), (1500, 1000))
        img = Image.open(p.image.path)
        self.assertEqual(img.format, 'WEBP')
        self.assertFalse(img.getexif(), 'location and camera data removed')
        self.assertTrue(res.data['project']['image_url'].endswith('.webp'))
        bad = io.BytesIO(b'not an image at all')
        bad.name = 'evil.png'
        self.assertEqual(self.client.post(f'/api/showcase/projects/{pid}/image', {'image': bad}, format='multipart').status_code, 400)
        self.assertEqual(self.as_(self.ben).post(f'/api/showcase/projects/{pid}/image', {'image': png()}, format='multipart').status_code, 404)


@override_settings(MEDIA_ROOT=MEDIA)
class ProfileTests(APITestCase):
    def setUp(self):
        self.ada = User.objects.create_user('ada@x.com', 'secret123', display_name='Ada Okafor')
        self.ben = User.objects.create_user('ben@x.com', 'secret123', display_name='Ben Bello')

    def test_profile_fields_are_checked(self):
        self.client.force_authenticate(self.ada)
        res = self.client.put('/api/auth/profile', {
            'headline': 'Learning to build', 'github': 'https://github.com/ada-o/', 'website': 'ada.dev',
        }, format='json')
        self.assertEqual(res.data['user']['github_username'], 'ada-o')
        self.assertEqual(res.data['user']['website_url'], 'https://ada.dev')
        self.assertEqual(self.client.put('/api/auth/profile', {'github': 'not a name!'}, format='json').status_code, 400)
        res = self.client.put('/api/auth/profile', {'settings': {'font': 'geist', 'anthropicKey': 'sk-x'}}, format='json')
        self.assertEqual(res.data['user']['settings'], {'font': 'geist'}, 'secrets are not stored in settings')

    def test_renaming_updates_initials(self):
        self.client.force_authenticate(self.ada)
        res = self.client.put('/api/auth/profile', {'displayName': 'Ada Lovelace'}, format='json')
        self.assertEqual(res.data['user']['avatar_url'], 'AL')

    def test_avatar_upload(self):
        self.client.force_authenticate(self.ada)
        res = self.client.post('/api/auth/avatar', {'avatar': png(900, 600)}, format='multipart')
        self.assertTrue(res.data['user']['avatar_url'].startswith('http'))
        self.ada.refresh_from_db()
        self.assertEqual(Image.open(self.ada.avatar_file.path).size, (256, 256))
        res = self.client.delete('/api/auth/avatar')
        self.assertEqual(res.data['user']['avatar_url'], 'AO')

    def test_public_profile_hides_email_and_can_hide_stats(self):
        self.client.force_authenticate(self.ben)
        res = self.client.get(f'/api/people/{self.ada.id}')
        self.assertNotIn('email', res.data['person'])
        self.assertIsNotNone(res.data['stats'])
        self.ada.settings = {'showStats': False}
        self.ada.save()
        self.assertIsNone(self.client.get(f'/api/people/{self.ada.id}').data['stats'])
        self.client.force_authenticate(self.ada)
        self.assertIsNotNone(self.client.get(f'/api/people/{self.ada.id}').data['stats'], 'you always see your own')
