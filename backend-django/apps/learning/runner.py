"""Runs students' code in a sandbox somewhere else. Never on this server.

Judge0 (through RapidAPI by default) when JUDGE0_KEY is set, or a
self-hosted Piston when PISTON_URL is set.

Every test case of an exercise runs in one program, so checking an answer
costs one run, not one per test (Judge0's free plan counts runs). Each case
prints a marker with a random nonce before its result, and the output is split
on those markers; student code can't fake them because it can't know the nonce.
"""
import base64
import re
import secrets
import time

import requests
from django.conf import settings

PISTON_RUNTIMES = {'javascript': '18.15.0', 'python': '3.10.0'}
LANGUAGES = ('javascript', 'python')


class RunnerUnavailable(Exception):
    """No sandbox is set up on this server."""


class RunnerError(Exception):
    """The sandbox didn't answer properly (down, busy, out of quota)."""


def configured():
    return bool(settings.JUDGE0_KEY or settings.PISTON_URL)


# ── One run ───────────────────────────────────────────────────────────
def _b64(text):
    return base64.b64encode(text.encode('utf-8')).decode('ascii')


def _unb64(text):
    return base64.b64decode(text).decode('utf-8', errors='replace') if text else ''


def _judge0(language, code):
    headers = {'Content-Type': 'application/json'}
    if settings.JUDGE0_KEY:
        headers.update({'X-RapidAPI-Key': settings.JUDGE0_KEY, 'X-RapidAPI-Host': settings.JUDGE0_HOST})
    body = {
        'language_id': settings.JUDGE0_LANGUAGES[language],
        'source_code': _b64(code),
        'cpu_time_limit': 5,
        'wall_time_limit': 10,
    }
    url = f'{settings.JUDGE0_URL}/submissions'
    res = requests.post(f'{url}?base64_encoded=true&wait=true', json=body, headers=headers, timeout=30)
    if res.status_code == 429:
        raise RunnerError('The code checker is busy (rate limit or daily quota reached).')
    if res.status_code >= 400:
        raise RunnerError(f'Judge0 answered {res.status_code}')
    data = res.json()

    # wait=true can still hand back just a token when the queue is long
    tries = 0
    while data.get('token') and not (data.get('status') or {}).get('id', 0) > 2:
        if tries >= 10:
            raise RunnerError('Judge0 took too long to run the code.')
        time.sleep(1)
        tries += 1
        poll = requests.get(f"{url}/{data['token']}?base64_encoded=true", headers=headers, timeout=15)
        if poll.status_code >= 400:
            raise RunnerError(f'Judge0 answered {poll.status_code}')
        data = poll.json()

    status = (data.get('status') or {}).get('id')
    stdout = _unb64(data.get('stdout'))
    stderr = _unb64(data.get('stderr')) or _unb64(data.get('compile_output'))
    if status == 5:
        stderr = (stderr + '\n' if stderr else '') + 'Your code took too long to finish (over 5 seconds).'
    elif status in (13, 14):  # Judge0's own internal error / exec format error
        raise RunnerError(f"Judge0 couldn't run the code: {(data.get('status') or {}).get('description')}")
    elif status and status >= 7 and not stderr:
        stderr = _unb64(data.get('message')) or (data.get('status') or {}).get('description', '')
    return stdout, stderr


def _piston(language, code):
    res = requests.post(
        f'{settings.PISTON_URL}/execute',
        json={'language': language, 'version': PISTON_RUNTIMES.get(language, '*'),
              'files': [{'content': code}], 'compile_timeout': 10000, 'run_timeout': 3000},
        timeout=20,
    )
    if res.status_code >= 400:
        raise RunnerError(f'Piston answered {res.status_code}')
    run = res.json().get('run', {})
    return run.get('stdout') or '', run.get('stderr') or ''


def run_code(language, code):
    """Run a program and return (stdout, stderr)."""
    if language not in LANGUAGES:
        raise ValueError(f'Unsupported language: {language}')
    try:
        if settings.JUDGE0_KEY:
            return _judge0(language, code)
        if settings.PISTON_URL:
            return _piston(language, code)
    except requests.RequestException as exc:
        raise RunnerError(str(exc)) from exc
    raise RunnerUnavailable()


# ── All test cases in one run ─────────────────────────────────────────
def build_program(language, code, expressions):
    """The student's code, then each expression printed after its own marker."""
    nonce = secrets.token_hex(8)
    calls = []
    if language == 'javascript':
        calls.append(
            f';{{\nconst __vs = (i, f) => {{ console.log("\\n<<VS-{nonce}-" + i + ">>"); '
            f'try {{ console.log(f()) }} catch (e) {{ console.log("<<VS-{nonce}-ERR>>" + ((e && e.message) || e)) }} }};'
        )
        for i, expr in enumerate(expressions):
            calls.append(f'__vs({i}, () => (\n{expr}\n));')
        calls.append('}')
    else:
        calls.append(
            f'\n\ndef __vs(i, f):\n'
            f'    print("\\n<<VS-{nonce}-%d>>" % i, flush=True)\n'
            f'    try:\n        print(f(), flush=True)\n'
            f'    except Exception as e:\n        print("<<VS-{nonce}-ERR>>" + str(e), flush=True)\n'
        )
        for i, expr in enumerate(expressions):
            calls.append(f'__vs({i}, lambda: (\n{expr}\n))')
    return f'{code}\n' + '\n'.join(calls) + '\n', nonce


def split_output(stdout, nonce, count):
    """[(output before any marker)], then (output, error) for each expression."""
    parts = re.split(rf'\n?<<VS-{nonce}-(\d+)>>\n?', stdout)
    preamble = parts[0]
    found = {int(parts[i]): parts[i + 1] for i in range(1, len(parts) - 1, 2)}
    results = []
    for i in range(count):
        if i not in found:
            results.append((None, None))  # the program stopped before this case ran
            continue
        text = found[i]
        error = None
        marker = f'<<VS-{nonce}-ERR>>'
        if marker in text:
            text, error = text.split(marker, 1)
        results.append((text.strip(), error.strip() if error is not None else None))
    return preamble.strip(), results


def run_cases(language, code, cases):
    """Run every case at once. Returns [(actual_output, error_text)] in order."""
    expressions = [str(tc.get('input') or '').strip() for tc in cases]
    program, nonce = build_program(language, code, [e for e in expressions if e])
    stdout, stderr = run_code(language, program)
    preamble, results = split_output(stdout, nonce, sum(1 for e in expressions if e))
    out, it = [], iter(results)
    for expr in expressions:
        if not expr:
            # No expression: the case compares what the code itself prints
            out.append((preamble, stderr.strip()))
            continue
        actual, error = next(it)
        if actual is None:
            out.append(('', stderr.strip() or 'Your code stopped before this test ran.'))
        else:
            out.append((actual, error or ''))
    return out
