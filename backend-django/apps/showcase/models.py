"""The showcase: things students (and tutors) have built, shared with everyone.

  Project ── ProjectMember ── user (owner, collaborators)
     ├── Appreciation (one per person)
     └── ProjectComment
"""
import re
import uuid
from urllib.parse import urlparse

from django.conf import settings
from django.db import models
from django.utils import timezone

GITHUB_REPO = re.compile(r'^https://github\.com/([A-Za-z0-9-]{1,39})/([A-Za-z0-9._-]{1,100})/?$')


def repo_label(url):
    """'https://github.com/ada/my-site' → 'ada/my-site'."""
    m = GITHUB_REPO.match(url or '')
    return f'{m.group(1)}/{m.group(2).removesuffix(".git")}' if m else ''


def host_label(url):
    """'https://ada.netlify.app/about' → 'ada.netlify.app'."""
    host = urlparse(url or '').hostname or ''
    return host.removeprefix('www.')


class Project(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=80)
    tagline = models.CharField(max_length=140, blank=True, help_text='One line: what it is or does.')
    description = models.TextField(blank=True, help_text='The story: what you built, how, and what you learned.')
    live_url = models.URLField(blank=True, max_length=500)
    repo_url = models.URLField(blank=True, max_length=500, help_text='A public GitHub repository.')
    image = models.ImageField(upload_to='projects/%Y/%m/', blank=True)
    image_width = models.PositiveIntegerField(null=True, blank=True)
    image_height = models.PositiveIntegerField(null=True, blank=True)
    image_alt = models.CharField(max_length=200, blank=True)
    tags = models.JSONField(default=list, blank=True)
    # ",react,css," — lets every database filter by tag with a plain LIKE
    tag_index = models.CharField(max_length=400, blank=True, editable=False)
    classroom = models.ForeignKey(
        'classrooms.Classroom', null=True, blank=True, on_delete=models.SET_NULL, related_name='projects',
        help_text='The class it was built in, if any. Its tutor can feature it.',
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT, db_index=True)
    featured_at = models.DateTimeField(null=True, blank=True, db_index=True)
    xp_awarded = models.BooleanField(default=False, editable=False)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.tag_index = f",{','.join(self.tags)}," if self.tags else ''
        if kwargs.get('update_fields') is not None and 'tags' in kwargs['update_fields']:
            kwargs['update_fields'] = {*kwargs['update_fields'], 'tag_index'}
        super().save(*args, **kwargs)

    @property
    def is_published(self):
        return self.status == self.Status.PUBLISHED

    def member_ids(self):
        return {m.user_id for m in self.members.all()}

    def owner_id(self):
        return next((m.user_id for m in self.members.all() if m.role == ProjectMember.Role.OWNER), None)

    def can_edit(self, user):
        return user.is_admin or user.id in self.member_ids()

    def can_manage(self, user):
        """Delete the project and change who is on it."""
        return user.is_admin or user.id == self.owner_id()

    def can_feature(self, user):
        return user.is_admin or bool(self.classroom_id and self.classroom.teacher_id == user.id)

    def visible_to(self, user):
        return self.is_published or self.can_edit(user)

    def publish(self):
        if not self.published_at:
            self.published_at = timezone.now()
        self.status = self.Status.PUBLISHED


class ProjectMember(models.Model):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        COLLABORATOR = 'collaborator', 'Collaborator'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=12, choices=Role.choices, default=Role.COLLABORATOR)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['project', 'user'], name='one_membership_per_project')]
        ordering = ['-role', 'added_at']  # owner first

    def __str__(self):
        return f'{self.user} on {self.project}'


class Appreciation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='appreciations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['project', 'user'], name='one_appreciation_per_person')]


class ProjectComment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.body[:60]
