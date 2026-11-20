"""Load the paths, lessons and skill-check questions from seed/*.json.

Safe to run again: records are matched by id and updated in place, so
student progress is kept. Lessons edited in the admin are overwritten
only with --overwrite.
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.learning.models import Lesson, Option, Question, SkillCheck, SkillPath

SEED_DIR = Path(settings.BASE_DIR) / 'seed'


class Command(BaseCommand):
    help = 'Load lesson content and skill checks from seed/content.json and seed/skill_checks.json.'

    def add_arguments(self, parser):
        parser.add_argument('--overwrite', action='store_true', help='Replace lessons and questions that already exist.')

    @transaction.atomic
    def handle(self, *args, overwrite=False, **opts):
        content = json.loads((SEED_DIR / 'content.json').read_text(encoding='utf-8'))
        new_paths = new_lessons = 0
        default_path = None
        for p in content['paths']:
            lessons = p.pop('lessons')
            path, created = SkillPath.objects.update_or_create(id=p['id'], defaults=p)
            new_paths += created
            if path.is_default:
                default_path = path
            for lesson in lessons:
                exists = Lesson.objects.filter(pk=lesson['id']).exists()
                if exists and not overwrite:
                    continue
                Lesson.objects.update_or_create(id=lesson['id'], defaults={**lesson, 'path': path, 'published': True})
                new_lessons += not exists

        checks = json.loads((SEED_DIR / 'skill_checks.json').read_text(encoding='utf-8'))
        modules = {m['id']: m.get('title', '') for m in (default_path.modules if default_path else [])}
        new_questions = 0
        for module_id, questions in checks.items():
            check, _ = SkillCheck.objects.update_or_create(
                module_id=module_id,
                defaults={'title': modules.get(module_id, ''), 'path': default_path},
            )
            for i, q in enumerate(questions):
                existing = Question.objects.filter(key=q['id']).first()
                if existing and not overwrite:
                    continue
                question, created = Question.objects.update_or_create(key=q['id'], defaults={
                    'skill_check': check, 'topic': q.get('topic', ''), 'prompt': q['question'],
                    'explanation': q.get('explanation', ''), 'order': i,
                })
                question.options.all().delete()
                Option.objects.bulk_create(
                    Option(question=question, text=o['text'], correct=bool(o.get('correct')), order=j)
                    for j, o in enumerate(q['options'])
                )
                new_questions += created

        self.stdout.write(self.style.SUCCESS(
            f'Content ready: {SkillPath.objects.count()} paths ({new_paths} new), '
            f'{Lesson.objects.count()} lessons ({new_lessons} new), '
            f'{SkillCheck.objects.count()} skill checks with {Question.objects.count()} questions ({new_questions} new).'
        ))
