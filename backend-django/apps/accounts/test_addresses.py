from django.conf import settings
from django.test import TestCase, override_settings


@override_settings(FRONTEND_URL='https://vibeskool.vercel.app')
class AddressTests(TestCase):
    def test_health_answers_at_the_usual_addresses(self):
        for path in ('/api/health', '/api/health/', '/health', '/health/'):
            res = self.client.get(path)
            self.assertEqual(res.status_code, 200, path)
            self.assertEqual(res.json(), {'status': 'ok'})

    def test_the_bare_address_goes_to_the_website(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 302)
        self.assertEqual(res['Location'], 'https://vibeskool.vercel.app')

    def test_the_admin_works_without_its_trailing_slash(self):
        res = self.client.get('/' + settings.ADMIN_PATH.rstrip('/'))
        self.assertEqual(res.status_code, 302)
        self.assertEqual(res['Location'], '/' + settings.ADMIN_PATH)
