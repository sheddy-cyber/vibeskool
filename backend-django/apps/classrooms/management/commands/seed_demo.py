"""A demo class to click around in during development.

Creates an admin, one tutor, five students and a class with a lived-in stream,
assignments in every state, line feedback and a nudge. Run seed_content
first. Refuses to run with DEBUG off.

All demo accounts share the password in DEMO_PASSWORD (default below).
"""
import os
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.classrooms.models import Assignment, Classroom, FeedbackComment, Membership, Nudge, Post, Reply, Submission
from apps.learning.models import Lesson, LessonCompletion
from apps.learning.services import touch_streak

DEFAULT_PASSWORD = 'vibeskool-demo'
DOMAIN = 'demo.vibeskool.test'

STUDENTS = [
    ('Ada Okafor', 9, 0),       # name, lessons done, days since last active
    ('Tunde Bello', 6, 1),
    ('Mira Shah', 4, 3),
    ('Leo Martins', 2, 12),
    ('Ife Adeyemi', 0, None),
]

SITE_CODE = """<!doctype html>
<html>
<head>
  <title>My first page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, I'm Ada</h1>
  <p>I'm learning to build with AI.
  <img src="me.png">
</body>
</html>"""


class Command(BaseCommand):
    help = 'Create a demo tutor, students and a class with activity (development only).'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Delete the demo accounts first.')

    @transaction.atomic
    def handle(self, *args, reset=False, **opts):
        if not settings.DEBUG:
            raise CommandError('seed_demo only runs with DJANGO_DEBUG=1.')
        lessons = list(Lesson.objects.filter(path__is_default=True).order_by('order')[:12])
        if len(lessons) < 10:
            raise CommandError('Run "python manage.py seed_content" first.')
        if reset:
            User.objects.filter(email__endswith='@' + DOMAIN).delete()
        if User.objects.filter(email=f'tutor@{DOMAIN}').exists():
            self.stdout.write('Demo data already exists. Use --reset to start again.')
            return

        password = os.environ.get('DEMO_PASSWORD', DEFAULT_PASSWORD)
        now = timezone.now()
        User.objects.create_superuser(f'admin@{DOMAIN}', password, display_name='Demo Admin')
        tutor = User.objects.create_user(f'tutor@{DOMAIN}', password, display_name='Grace Nwosu', role='teacher')
        # A second tutor, to try building a course together
        User.objects.create_user(f'kofi@{DOMAIN}', password, display_name='Kofi Mensah', role='teacher')
        room = Classroom.objects.create(
            teacher=tutor, name='Web Foundations · Evening cohort',
            description='Tuesdays and Thursdays, 6–8pm. From "what is a server" to your first deployed site.',
        )

        students = []
        for name, done, idle in STUDENTS:
            first = name.split()[0].lower()
            s = User.objects.create_user(f'{first}@{DOMAIN}', password, display_name=name, role='student')
            m = Membership.objects.create(classroom=room, student=s)
            Membership.objects.filter(pk=m.pk).update(joined_at=now - timedelta(days=21))
            for i, lesson in enumerate(lessons[:done]):
                when = now - timedelta(days=(idle or 0) + (done - i - 1))
                LessonCompletion.objects.create(student=s, lesson=lesson, completed_at=when)
                touch_streak(s, today=when.date())
            if done:
                User.objects.filter(pk=s.pk).update(xp=done * 10)
            if idle is not None:
                Membership.objects.filter(pk=m.pk).update(last_seen_at=now - timedelta(days=idle))
            students.append(s)
        ada, tunde, mira, leo, ife = students

        def post(author, kind, body, ago, **kw):
            p = Post.objects.create(classroom=room, author=author, kind=kind, body=body, **kw)
            Post.objects.filter(pk=p.pk).update(created_at=now - ago)
            return p

        post(tutor, 'announcement', 'Welcome, everyone. This week is all about how the web works: read the first three '
             'lessons before Thursday and bring one question. No question is too small.', timedelta(days=6), pinned=True,
             title='Week 1: start here')
        q1 = post(tunde, 'question', "When I run curl -I on example.com I get 200, but on my own page I get 404. "
                  "Is my server broken?", timedelta(days=2), lesson=lessons[2], title='curl gives me a 404')
        r = Reply.objects.create(post=q1, author=tutor, body="Your server is fine. 404 means it answered, but there's "
                                 "nothing at that path. Check the file name: index.html, not Index.html.")
        Reply.objects.filter(pk=r.pk).update(accepted=True)
        Post.objects.filter(pk=q1.pk).update(resolved_at=now - timedelta(days=1))
        post(mira, 'question', "Why does my CSS not load? The page shows but it's plain.", timedelta(hours=30),
             lesson=lessons[8], title='Stylesheet not loading',
             code='<link rel="stylesheet" href="styles.css">', code_language='html')
        post(leo, 'question', "I'm a bit lost on DNS. Is it OK if I message you privately?", timedelta(days=9), is_private=True)
        post(ada, 'post', 'Sharing the diagram I made of a request going from my browser to the server and back. '
             'Took me three tries.', timedelta(hours=5))

        Assignment.objects.create(
            classroom=room, created_by=tutor, kind='lesson', lesson=lessons[0],
            title='Read: what happens when you type a URL', due_at=now - timedelta(days=3),
        )
        a2 = Assignment.objects.create(
            classroom=room, created_by=tutor, kind='code', title='Build your first page',
            instructions='Make an index.html with a heading, a paragraph about you and one image. '
                         'Link a stylesheet, even if it is empty.',
            starter_code='<!doctype html>\n<html>\n  <body>\n\n  </body>\n</html>', due_at=now + timedelta(days=2),
        )
        Assignment.objects.create(
            classroom=room, created_by=tutor, kind='link', title='Share your deployed site',
            instructions='Deploy your page and hand in the link.', due_at=now + timedelta(days=9),
        )

        sub = Submission.objects.create(assignment=a2, student=ada, code=SITE_CODE, note='Not sure about the image.',
                                        status='changes_requested', reviewed_at=now - timedelta(hours=20))
        FeedbackComment.objects.create(submission=sub, author=tutor, line=9,
                                       body='This <p> is never closed. Add </p> at the end of the line.')
        FeedbackComment.objects.create(submission=sub, author=tutor, line=10,
                                       body='Add alt text so screen readers can describe the photo: alt="Ada smiling".')
        FeedbackComment.objects.create(submission=sub, author=tutor, body='Great start. Two small fixes and this is done.')
        Submission.objects.create(assignment=a2, student=tunde, code=SITE_CODE.replace('Ada', 'Tunde'), status='submitted')
        Submission.objects.create(assignment=a2, student=mira, code=SITE_CODE.replace('Ada', 'Mira'), status='approved',
                                  score=92, reviewed_at=now - timedelta(days=1))

        Nudge.objects.create(classroom=room, sender=tutor, student=leo,
                             message="Haven't seen you in a while. Want to go through DNS together on Thursday?")

        self.stdout.write(self.style.SUCCESS(
            f'Demo class "{room.name}" ready (invite code {room.invite_code}).\n'
            f'Admin site: admin@{DOMAIN}. Tutors: tutor@{DOMAIN}, kofi@{DOMAIN}. Students: {", ".join(s.email for s in students)}.\n'
            f'Password: the DEMO_PASSWORD env var, or the default in this command.'
        ))
