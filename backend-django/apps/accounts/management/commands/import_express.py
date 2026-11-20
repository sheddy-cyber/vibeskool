"""One-time import: copy data from the old Express server's tables into Django's,
in the same database. (The Express server itself has been removed.)

Reads: users, skill_paths, lessons, lesson_progress, student_streaks,
passed_modules, classrooms, classroom_members, exercises, exercise_submissions.
Never writes to them.

IDs are kept, so sign-in tokens issued before the move stay valid, and bcrypt
password hashes are reused as-is (upgraded on each person's next sign-in).
Safe to run again: anything already copied is skipped.
"""
import json

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from apps.accounts.models import User, initials
from apps.classrooms.models import Classroom, Membership
from apps.learning.models import (
    Exercise, ExerciseSubmission, Lesson, LessonCompletion, PassedModule, SkillPath, Streak,
)

EXPRESS_TABLES = ['users', 'skill_paths', 'lessons', 'lesson_progress', 'student_streaks', 'passed_modules',
                  'classrooms', 'classroom_members', 'exercises', 'exercise_submissions']


def rows(sql, params=()):
    with connection.cursor() as cur:
        cur.execute(sql, params)
        cols = [c.name for c in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]


def as_json(value, default):
    if value is None:
        return default
    if isinstance(value, str):
        try:
            return json.loads(value)
        except ValueError:
            return default
    return value


class Command(BaseCommand):
    help = 'Copy users, content, progress, classes and exercises from the Express tables.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be copied, then roll back.')

    def handle(self, *args, dry_run=False, **opts):
        if connection.vendor != 'postgresql':
            raise CommandError('Point DATABASE_URL at the Postgres database the Express server uses.')
        existing = set(connection.introspection.table_names())
        missing = [t for t in EXPRESS_TABLES if t not in existing]
        if missing:
            raise CommandError(f'Express tables not found: {", ".join(missing)}')

        counts = {}
        with transaction.atomic():
            counts['users'] = self.users()
            counts['paths'], counts['lessons'] = self.content()
            counts['completions'], counts['streaks'], counts['passed modules'] = self.progress()
            counts['classes'], counts['memberships'] = self.classes()
            counts['exercises'], counts['submissions'] = self.exercises()
            summary = ', '.join(f'{v} {k}' for k, v in counts.items())
            if dry_run:
                transaction.set_rollback(True)
                self.stdout.write(f'Dry run (nothing saved). Would copy: {summary}.')
                return
        self.stdout.write(self.style.SUCCESS(f'Copied {summary}.'))
        call_command('seed_content', skill_checks_only=True, stdout=self.stdout)

    # ── Users ────────────────────────────────────────────────────────────
    def users(self):
        n = 0
        for r in rows('SELECT * FROM users'):
            if User.objects.filter(pk=r['id']).exists() or User.objects.filter(email__iexact=r['email']).exists():
                continue
            settings = {k: v for k, v in (as_json(r.get('settings'), {}) or {}).items()
                        if 'key' not in k.lower() and 'token' not in k.lower()}
            u = User(
                id=r['id'], email=r['email'].lower(), display_name=r['display_name'] or r['email'].split('@')[0],
                avatar_url=r.get('avatar_url') or initials(r['display_name']), role=r['role'] or 'student',
                google_id=r.get('google_id') or None, auth_provider=r.get('auth_provider') or 'local',
                settings=settings, xp=r.get('xp') or 0, badges=as_json(r.get('badges'), []) or [],
            )
            ph = r.get('password_hash') or ''
            # Express used bcrypt; Django reads the same hash behind a "bcrypt$" prefix
            u.password = f'bcrypt${ph}' if ph.startswith('$2') else '!'
            if r.get('role') == 'admin':
                u.is_staff = u.is_superuser = True
            u.save()
            User.objects.filter(pk=u.pk).update(created_at=r['created_at'])
            n += 1
        return n

    # ── Paths and lessons (as edited in the old CMS) ────────────────────
    def content(self):
        paths = lessons = 0
        for r in rows('SELECT * FROM skill_paths ORDER BY order_index'):
            if SkillPath.objects.filter(pk=r['id']).exists():
                continue
            SkillPath.objects.create(
                id=r['id'], title=r['title'], description=r.get('description') or '', icon=r.get('icon') or '',
                color=r.get('color') or '', tag=r.get('tag') or '', modules=as_json(r.get('modules_json'), []),
                is_official=True, status='published',
                order=r.get('order_index') or 0, is_default=bool(r.get('is_default')),
            )
            paths += 1
        for r in rows('SELECT * FROM lessons ORDER BY path_id, order_index'):
            if Lesson.objects.filter(pk=r['id']).exists() or not SkillPath.objects.filter(pk=r['path_id']).exists():
                continue
            Lesson.objects.create(
                id=r['id'], path_id=r['path_id'], title=r['title'], duration=r.get('duration') or '',
                part=r.get('part_name') or '', mek_label=r.get('mek_label') or '',
                sections=as_json(r.get('content_json'), []), ai_prompt=r.get('ai_prompt') or '',
                terminal_mission=str(r.get('terminal_mission') or ''), order=r.get('order_index') or 0,
                published=r.get('published', True) is not False,
            )
            lessons += 1
        return paths, lessons

    # ── Progress ─────────────────────────────────────────────────────────
    def progress(self):
        users = set(User.objects.values_list('id', flat=True))
        lessons = set(Lesson.objects.values_list('id', flat=True))
        done = 0
        for r in rows('SELECT * FROM lesson_progress WHERE completed = true'):
            if r['student_id'] in users and r['lesson_id'] in lessons:
                _, created = LessonCompletion.objects.get_or_create(
                    student_id=r['student_id'], lesson_id=r['lesson_id'],
                    defaults={'completed_at': r.get('completed_at') or r.get('created_at')},
                )
                done += created
        streaks = 0
        for r in rows('SELECT * FROM student_streaks'):
            if r['student_id'] in users:
                _, created = Streak.objects.get_or_create(student_id=r['student_id'], defaults={
                    'current': r.get('current_streak') or 0, 'longest': r.get('longest_streak') or 0,
                    'last_active': r.get('last_active'),
                })
                streaks += created
        passed = 0
        for r in rows('SELECT * FROM passed_modules'):
            if r['student_id'] in users:
                _, created = PassedModule.objects.get_or_create(
                    student_id=r['student_id'], module_id=r['module_id'],
                    defaults={'score': r.get('score') or 0, 'passed_at': r['passed_at']},
                )
                passed += created
        return done, streaks, passed

    # ── Classes ──────────────────────────────────────────────────────────
    def classes(self):
        users = set(User.objects.values_list('id', flat=True))
        rooms = 0
        for r in rows('SELECT * FROM classrooms'):
            if Classroom.objects.filter(pk=r['id']).exists() or r['teacher_id'] not in users:
                continue
            Classroom.objects.create(
                id=r['id'], teacher_id=r['teacher_id'], name=r['name'], description=r.get('description') or '',
                invite_code=r['invite_code'], ai_provider=r.get('ai_provider') or 'gemini',
                ai_api_key=r.get('ai_api_key') or '',
            )
            Classroom.objects.filter(pk=r['id']).update(created_at=r['created_at'])
            rooms += 1
        members = 0
        for r in rows('SELECT * FROM classroom_members'):
            if r['student_id'] in users and Classroom.objects.filter(pk=r['classroom_id']).exists():
                _, created = Membership.objects.get_or_create(classroom_id=r['classroom_id'], student_id=r['student_id'])
                members += created
        return rooms, members

    # ── Exercises ────────────────────────────────────────────────────────
    def exercises(self):
        lessons = set(Lesson.objects.values_list('id', flat=True))
        users = set(User.objects.values_list('id', flat=True))
        ex = 0
        for r in rows('SELECT * FROM exercises'):
            if Exercise.objects.filter(pk=r['id']).exists():
                continue
            Exercise.objects.create(
                id=r['id'], lesson_id=r['lesson_id'] if r.get('lesson_id') in lessons else None,
                teacher_id=r['teacher_id'] if r.get('teacher_id') in users else None, type=r.get('type') or 'coding',
                language=r.get('language') or 'javascript', title=r['title'], instructions=r.get('instructions') or '',
                starter_code=r.get('starter_code') or '', solution_code=r.get('solution_code') or '',
                test_cases=as_json(r.get('test_cases'), []) or [], options=as_json(r.get('options'), []) or [],
                points=r.get('points') or 10, order=r.get('order_index') or 0, created_at=r['created_at'],
            )
            ex += 1
        subs = 0
        for r in rows('SELECT * FROM exercise_submissions'):
            if ExerciseSubmission.objects.filter(pk=r['id']).exists() or r['student_id'] not in users:
                continue
            if not Exercise.objects.filter(pk=r['exercise_id']).exists():
                continue
            ExerciseSubmission.objects.create(
                id=r['id'], exercise_id=r['exercise_id'], student_id=r['student_id'], code=r.get('code') or '',
                answer_text=r.get('answer_text') or '', output=r.get('output') or '', passed=bool(r.get('passed')),
                score=r.get('score') or 0, feedback=r.get('feedback') or '', submitted_at=r['submitted_at'],
            )
            subs += 1
        return ex, subs
