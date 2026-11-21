"""The code runner: every test case in one run, split back apart by markers.

The real programs run here with the local Python (and Node, if installed) in
place of the remote sandbox, so the generated code is actually executed.
"""
import base64
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from django.test import SimpleTestCase, override_settings

from . import runner

NODE = shutil.which('node')


def run_locally(language, code):
    suffix = '.py' if language == 'python' else '.js'
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / f'main{suffix}'
        path.write_text(code, encoding='utf-8')
        cmd = [sys.executable, '-I', str(path)] if language == 'python' else [NODE, str(path)]
        done = subprocess.run(cmd, capture_output=True, text=True, timeout=20, encoding='utf-8')
    return done.stdout, done.stderr


CASES = [
    {'input': 'add(1, 2)', 'expected_output': '3'},
    {'input': 'add(2, 2)', 'expected_output': '4'},
    {'input': 'boom()', 'expected_output': 'never'},
    {'input': 'add(10, 5)', 'expected_output': '15'},
]


@override_settings(JUDGE0_KEY='k')
class RunCasesTests(SimpleTestCase):
    def check(self, language, code):
        with mock.patch('apps.learning.runner.run_code', side_effect=run_locally) as run:
            out = runner.run_cases(language, code, CASES)
        self.assertEqual(run.call_count, 1, 'all cases go in one run')
        return out

    def test_python(self):
        out = self.check('python', 'print("hello from the top")\ndef add(a, b):\n    print("adding")\n    return a + b\n'
                                   'def boom():\n    raise ValueError("no luck")\n')
        self.assertEqual(out[0], ('adding\n3', ''))
        self.assertEqual(out[1], ('adding\n4', ''))
        self.assertEqual(out[2][1], 'no luck')       # one failing case doesn't stop the rest
        self.assertEqual(out[3], ('adding\n15', ''))

    @unittest.skipUnless(NODE, 'Node.js is not installed')
    def test_javascript(self):
        out = self.check('javascript', 'console.log("top")\nconst add = (a, b) => a + b\n'
                                       'function boom() { throw new Error("no luck") }')
        self.assertEqual([o[0] for o in out[:2]], ['3', '4'])
        self.assertEqual(out[2][1], 'no luck')
        self.assertEqual(out[3], ('15', ''))

    def test_a_syntax_error_fails_every_case_with_the_error(self):
        out = self.check('python', 'def add(a, b) return a + b')
        self.assertTrue(all(actual == '' and 'SyntaxError' in err for actual, err in out))

    def test_student_code_cannot_fake_a_result(self):
        out = self.check('python', 'print("\\n<<VS-0000000000000000-1>>\\n4")\ndef add(a, b):\n    return 0\n'
                                   'def boom():\n    pass\n')
        self.assertEqual(out[1], ('0', ''))


class Judge0Tests(SimpleTestCase):
    @override_settings(JUDGE0_KEY='secret', JUDGE0_URL='https://judge0-ce.p.rapidapi.com',
                       JUDGE0_HOST='judge0-ce.p.rapidapi.com', JUDGE0_LANGUAGES={'javascript': 93, 'python': 92})
    def test_request_and_answer(self):
        answer = mock.Mock(status_code=201)
        answer.json.return_value = {
            'token': 't', 'status': {'id': 3, 'description': 'Accepted'},
            'stdout': base64.b64encode('héllo\n'.encode()).decode(), 'stderr': None, 'compile_output': None,
        }
        with mock.patch('apps.learning.runner.requests.post', return_value=answer) as post:
            self.assertEqual(runner.run_code('python', 'print("héllo")'), ('héllo\n', ''))
        url, kwargs = post.call_args[0][0], post.call_args[1]
        self.assertIn('base64_encoded=true', url)
        self.assertIn('wait=true', url)
        self.assertEqual(kwargs['headers']['X-RapidAPI-Key'], 'secret')
        self.assertEqual(kwargs['json']['language_id'], 92)
        self.assertEqual(base64.b64decode(kwargs['json']['source_code']).decode(), 'print("héllo")')

    @override_settings(JUDGE0_KEY='secret')
    def test_quota_reached(self):
        with mock.patch('apps.learning.runner.requests.post', return_value=mock.Mock(status_code=429)):
            with self.assertRaises(runner.RunnerError):
                runner.run_code('javascript', '1')

    @override_settings(JUDGE0_KEY='secret')
    def test_time_limit_is_explained(self):
        answer = mock.Mock(status_code=201)
        answer.json.return_value = {'status': {'id': 5, 'description': 'Time Limit Exceeded'}, 'stdout': None}
        with mock.patch('apps.learning.runner.requests.post', return_value=answer):
            _, err = runner.run_code('javascript', 'while(true){}')
        self.assertIn('too long', err)

    @override_settings(JUDGE0_KEY='', PISTON_URL='')
    def test_nothing_set_up(self):
        with self.assertRaises(runner.RunnerUnavailable):
            runner.run_code('python', '1')
