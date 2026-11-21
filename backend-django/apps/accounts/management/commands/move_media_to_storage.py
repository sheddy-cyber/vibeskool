"""Copy uploads saved on this computer's disk into the storage bucket.

Run once after setting the STORAGE_* variables, from the machine that has the
files (backend-django/media). Avatars and project images keep their names, and
avatar links are rewritten to point at the bucket. Safe to run again: files
already in the bucket are skipped.
"""
from django.conf import settings
from django.core.files import File
from django.core.files.storage import FileSystemStorage, default_storage
from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import User
from apps.media_urls import media_url
from apps.showcase.models import Project


class Command(BaseCommand):
    help = 'Upload files from backend-django/media to the storage bucket and fix avatar links.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='List what would be copied without copying.')

    def handle(self, *args, dry_run=False, **opts):
        if not settings.STORAGE_BUCKET:
            raise CommandError('Set STORAGE_BUCKET and the other STORAGE_* variables first.')
        local = FileSystemStorage(location=settings.MEDIA_ROOT)
        copied = skipped = missing = 0

        def copy(name):
            nonlocal copied, skipped, missing
            if not name:
                return
            if not local.exists(name):
                missing += 1
                self.stdout.write(self.style.WARNING(f'  not on this disk: {name}'))
                return
            if default_storage.exists(name):
                skipped += 1
                return
            self.stdout.write(f'  {name}')
            if not dry_run:
                with local.open(name, 'rb') as fh:
                    saved = default_storage.save(name, File(fh, name=name))
                if saved != name:
                    raise CommandError(f'The bucket renamed {name} to {saved}; stopping so links stay right.')
            copied += 1

        for user in User.objects.exclude(avatar_file=''):
            copy(user.avatar_file.name)
            url = media_url(user.avatar_file)
            if not dry_run and user.avatar_url != url:
                User.objects.filter(pk=user.pk).update(avatar_url=url)
        for project in Project.objects.exclude(image=''):
            copy(project.image.name)

        verb = 'Would copy' if dry_run else 'Copied'
        self.stdout.write(self.style.SUCCESS(
            f'{verb} {copied} file(s); {skipped} already in the bucket; {missing} missing from this disk.'))
