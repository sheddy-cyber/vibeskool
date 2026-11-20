"""Demo projects for the showcase (development only). Run seed_demo first.

Draws simple "screenshots" with Pillow so some cards have preview images
and others show the generated cover, the way real uploads will mix.
"""
import io
from datetime import timedelta

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from PIL import Image, ImageDraw

from apps.accounts.models import User
from apps.classrooms.models import Classroom
from apps.showcase.models import Appreciation, Project, ProjectComment, ProjectMember

DOMAIN = 'demo.vibeskool.test'


def screenshot(bg, accent, ink, layout):
    """A 1600×1000 browser-window mock in the given colours."""
    W, H = 1600, 1000
    img = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 56], fill=tuple(max(0, c - 18) for c in bg))
    for i, col in enumerate([(237, 106, 94), (245, 191, 79), (98, 197, 84)]):
        d.ellipse([24 + i * 26, 20, 40 + i * 26, 36], fill=col)
    d.rounded_rectangle([140, 14, 900, 42], radius=14, fill=tuple(min(255, c + 14) for c in bg))
    if layout == 'hero':
        d.rounded_rectangle([120, 170, 980, 230], radius=10, fill=ink)
        d.rounded_rectangle([120, 260, 820, 290], radius=8, fill=tuple((a + b) // 2 for a, b in zip(ink, bg)))
        d.rounded_rectangle([120, 305, 760, 335], radius=8, fill=tuple((a + b) // 2 for a, b in zip(ink, bg)))
        d.rounded_rectangle([120, 390, 380, 456], radius=33, fill=accent)
        d.ellipse([1060, 170, 1440, 550], fill=accent)
        d.ellipse([1150, 260, 1350, 460], fill=bg)
        for i in range(3):
            x = 120 + i * 470
            d.rounded_rectangle([x, 640, x + 430, 900], radius=18, outline=tuple((a + b) // 2 for a, b in zip(ink, bg)), width=3)
            d.rounded_rectangle([x + 30, 680, x + 250, 708], radius=6, fill=ink)
    elif layout == 'weather':
        d.rounded_rectangle([400, 170, 1200, 860], radius=36, fill=tuple(min(255, c + 22) for c in bg))
        d.ellipse([660, 230, 940, 510], fill=accent)
        d.rounded_rectangle([560, 560, 1040, 640], radius=12, fill=ink)
        d.rounded_rectangle([620, 670, 980, 700], radius=8, fill=tuple((a + b) // 2 for a, b in zip(ink, bg)))
        for i in range(4):
            x = 470 + i * 170
            d.rounded_rectangle([x, 740, x + 140, 820], radius=14, fill=tuple(max(0, c - 10) for c in bg))
    else:  # list
        d.rounded_rectangle([120, 140, 520, 190], radius=8, fill=ink)
        for i in range(5):
            y = 250 + i * 130
            d.rounded_rectangle([120, y, 1480, y + 100], radius=16, fill=tuple(min(255, c + 16) for c in bg))
            d.rounded_rectangle([150, y + 25, 200, y + 75], radius=10, fill=accent)
            d.rounded_rectangle([230, y + 30, 760, y + 52], radius=6, fill=ink)
            d.rounded_rectangle([230, y + 62, 600, y + 76], radius=5, fill=tuple((a + b) // 2 for a, b in zip(ink, bg)))
    out = io.BytesIO()
    img.save(out, format='WEBP', quality=84)
    return ContentFile(out.getvalue(), name='demo.webp'), (W, H)


PROJECTS = [
    {
        'owner': 'ada', 'with': [], 'title': "Ada's first page",
        'tagline': 'A one-page site about me, my first thing on the internet.',
        'description': "I built this in week two. It started as one heading and a paragraph, then I learned to link a stylesheet and it finally looked like mine.\n\nWhat I learned: file names are case-sensitive once your site is online, and alt text matters.",
        'live': 'https://ada-okafor.netlify.app', 'repo': 'https://github.com/ada-okafor/first-page',
        'tags': ['html', 'css'], 'shot': ((250, 246, 240), (233, 112, 75), (40, 36, 34), 'hero'), 'days': 9, 'class': True,
    },
    {
        'owner': 'tunde', 'with': ['ada'], 'title': 'Weather in a sentence',
        'tagline': 'Type a city, get the weather as one friendly sentence.',
        'description': "Tunde wired up the weather API; Ada did the layout and the loading states. We used AI to explain the JSON the API sends back, then wrote the code that turns it into a sentence ourselves.",
        'live': 'https://weather-sentence.vercel.app', 'repo': 'https://github.com/tunde-bello/weather-sentence',
        'tags': ['javascript', 'api', 'fetch'], 'shot': ((22, 34, 58), (255, 196, 61), (232, 238, 247), 'weather'), 'days': 4,
        'class': True, 'featured': True,
    },
    {
        'owner': 'mira', 'with': [], 'title': 'Recipe box',
        'tagline': 'Save recipes in your browser and filter them by what is in your fridge.',
        'description': 'Everything is stored with localStorage, so it works without an account. The filter was the hard part.',
        'live': 'https://mira-recipes.netlify.app', 'repo': '',
        'tags': ['javascript', 'localstorage', 'css'], 'shot': None, 'days': 6,
    },
    {
        'owner': 'tutor', 'with': [], 'title': 'Class starter kit',
        'tagline': 'The folder structure and starter files we use in class.',
        'description': 'Fork it to start any assignment: an index.html, a stylesheet that is already linked, and a README that explains each file.',
        'live': '', 'repo': 'https://github.com/grace-nwosu/vibeskool-starter',
        'tags': ['html', 'template'], 'shot': None, 'days': 14, 'class': True,
    },
    {
        'owner': 'mira', 'with': ['tunde'], 'title': 'Habit tracker',
        'tagline': 'Tick off a habit each day and watch your streak grow.',
        'description': 'Built together over a weekend. Tunde did the streak maths, Mira did the design.',
        'live': 'https://habits-mt.netlify.app', 'repo': 'https://github.com/mira-shah/habits',
        'tags': ['react', 'css'], 'shot': ((243, 246, 250), (34, 160, 107), (28, 35, 45), 'list'), 'days': 2, 'class': True,
    },
    {
        'owner': 'leo', 'with': [], 'title': 'DNS explained with cats',
        'tagline': 'Still working on it.', 'description': '', 'live': '', 'repo': '',
        'tags': ['html'], 'shot': None, 'days': 0, 'draft': True,
    },
]

COMMENTS = [
    ('Weather in a sentence', 'mira', 'The loading message is such a nice touch.'),
    ('Weather in a sentence', 'tutor', 'Great teamwork, and the error message when a city is not found is really clear.'),
    ("Ada's first page", 'tunde', 'Love the colours!'),
]


class Command(BaseCommand):
    help = 'Create demo showcase projects (development only).'

    @transaction.atomic
    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError('seed_showcase only runs with DJANGO_DEBUG=1.')
        users = {u.email.split('@')[0]: u for u in User.objects.filter(email__endswith='@' + DOMAIN)}
        if 'tutor' not in users:
            raise CommandError('Run "python manage.py seed_demo" first.')
        room = Classroom.objects.filter(teacher=users['tutor']).first()
        Project.objects.filter(members__user__in=users.values()).distinct().delete()
        now = timezone.now()
        by_title = {}
        for spec in PROJECTS:
            p = Project(
                title=spec['title'], tagline=spec['tagline'], description=spec['description'],
                live_url=spec['live'], repo_url=spec['repo'], tags=spec['tags'],
                classroom=room if spec.get('class') else None, created_by=users[spec['owner']],
                status=Project.Status.DRAFT if spec.get('draft') else Project.Status.PUBLISHED,
                published_at=None if spec.get('draft') else now - timedelta(days=spec['days'], hours=3),
                featured_at=now if spec.get('featured') else None, xp_awarded=not spec.get('draft'),
            )
            if spec['shot']:
                content, (w, h) = screenshot(*spec['shot'])
                p.image.save(content.name, content, save=False)
                p.image_width, p.image_height = w, h
                p.image_alt = f'Screenshot of {spec["title"]}'
            p.save()
            ProjectMember.objects.create(project=p, user=users[spec['owner']], role='owner')
            for name in spec['with']:
                ProjectMember.objects.create(project=p, user=users[name], role='collaborator')
            by_title[p.title] = p

        likes = {'Weather in a sentence': ['mira', 'leo', 'ife', 'tutor'], "Ada's first page": ['tunde', 'mira'],
                 'Habit tracker': ['ada', 'leo', 'tutor'], 'Recipe box': ['ada']}
        for title, names in likes.items():
            for n in names:
                Appreciation.objects.create(project=by_title[title], user=users[n])
        for title, who, body in COMMENTS:
            ProjectComment.objects.create(project=by_title[title], author=users[who], body=body)
        self.stdout.write(self.style.SUCCESS(f'{len(PROJECTS)} demo projects ready.'))
