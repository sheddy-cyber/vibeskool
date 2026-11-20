"""Classrooms: where a tutor and their students work together.

  Classroom ── Membership ── student
     │
     ├── Post (announcement · question · post) ── Reply
     ├── Assignment ── Submission ── FeedbackComment (optionally on a code line)
     └── Nudge (tutor → one student)
"""
import secrets
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # no 0/O or 1/I to misread


def new_invite_code():
    return 'VIBE-' + ''.join(secrets.choice(INVITE_ALPHABET) for _ in range(6))


class Classroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='taught_classrooms')
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    invite_code = models.CharField(max_length=20, unique=True, default=new_invite_code)
    joining_open = models.BooleanField(default=True, help_text='Turn off to stop new students joining with the code.')
    archived = models.BooleanField(default=False)
    ai_provider = models.CharField(max_length=20, default='gemini', blank=True)
    ai_api_key = models.CharField(max_length=200, blank=True, help_text='Optional key for this class. Never sent to students.')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def is_tutor(self, user):
        return bool(user and user.is_authenticated and (user.is_admin or self.teacher_id == user.id))

    def is_member(self, user):
        return self.memberships.filter(student=user).exists()

    def reset_invite_code(self):
        code = new_invite_code()
        while Classroom.objects.filter(invite_code=code).exists():
            code = new_invite_code()
        self.invite_code = code
        self.save(update_fields=['invite_code'])


class Membership(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(null=True, blank=True, help_text='Last time the student opened the class.')

    class Meta:
        constraints = [models.UniqueConstraint(fields=['classroom', 'student'], name='one_membership_per_class')]
        ordering = ['-joined_at']

    def __str__(self):
        return f'{self.student} in {self.classroom}'


class Post(models.Model):
    """Something said in the class stream."""

    class Kind(models.TextChoices):
        ANNOUNCEMENT = 'announcement', 'Announcement'  # tutors only
        QUESTION = 'question', 'Question'              # asks the tutor, can be resolved
        POST = 'post', 'Post'                          # general discussion

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_posts')
    kind = models.CharField(max_length=14, choices=Kind.choices, default=Kind.POST, db_index=True)
    title = models.CharField(max_length=160, blank=True)
    body = models.TextField()
    code = models.TextField(blank=True, help_text='Optional code the post is about.')
    code_language = models.CharField(max_length=20, blank=True)
    lesson = models.ForeignKey('learning.Lesson', null=True, blank=True, on_delete=models.SET_NULL, related_name='class_posts')
    is_private = models.BooleanField(default=False, help_text='Only the author and the tutor can see it.')
    pinned = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-pinned', '-created_at']

    def __str__(self):
        return self.title or self.body[:60]

    @property
    def resolved(self):
        return self.resolved_at is not None

    def visible_to(self, user, tutor):
        return tutor or not self.is_private or self.author_id == user.id


class Reply(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_replies')
    body = models.TextField()
    code = models.TextField(blank=True)
    accepted = models.BooleanField(default=False, help_text='Marked as the answer to a question.')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name_plural = 'replies'

    def __str__(self):
        return self.body[:60]


class Assignment(models.Model):
    class Kind(models.TextChoices):
        LESSON = 'lesson', 'Finish a lesson'   # done when the student completes the lesson
        CODE = 'code', 'Hand in code'
        LINK = 'link', 'Hand in a link'

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+')
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.CODE)
    title = models.CharField(max_length=160)
    instructions = models.TextField(blank=True)
    lesson = models.ForeignKey('learning.Lesson', null=True, blank=True, on_delete=models.SET_NULL, related_name='assignments')
    starter_code = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_at', '-created_at']

    def __str__(self):
        return self.title

    @property
    def is_past_due(self):
        return bool(self.due_at and self.due_at < timezone.now())


class Submission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Handed in'
        CHANGES = 'changes_requested', 'Changes requested'
        APPROVED = 'approved', 'Approved'

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField(blank=True)
    link = models.URLField(blank=True, max_length=500)
    note = models.TextField(blank=True, help_text="The student's note to the tutor.")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED, db_index=True)
    score = models.PositiveSmallIntegerField(null=True, blank=True)
    revision = models.PositiveIntegerField(default=1, help_text='Goes up each time changed code is handed in again.')
    submitted_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['assignment', 'student'], name='one_submission_per_student')]
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.student} · {self.assignment}'

    @property
    def late(self):
        due = self.assignment.due_at
        return bool(due and self.submitted_at > due)


class FeedbackComment(models.Model):
    """A comment on a submission, optionally pinned to one line of the code.

    When the student hands in changed code, a line comment follows its line
    if that line is still there (even if it moved). If the line itself changed,
    the comment is marked outdated and keeps the old line text for context.
    """

    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    line = models.PositiveIntegerField(null=True, blank=True, help_text='1-based line in the submitted code.')
    line_text = models.TextField(blank=True, help_text='The line as it was when the comment was written.')
    outdated = models.BooleanField(default=False, help_text='The line has changed since.')
    revision = models.PositiveIntegerField(default=1, help_text='Which hand-in the comment was written on.')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self._state.adding:
            self.revision = self.submission.revision
            if self.line and not self.line_text:
                lines = self.submission.code.splitlines()
                if 0 < self.line <= len(lines):
                    self.line_text = lines[self.line - 1]
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        where = f' (line {self.line})' if self.line else ''
        return f'{self.body[:50]}{where}'


class Nudge(models.Model):
    """A short, private message from the tutor to one student."""

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='nudges')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nudges')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'To {self.student}: {self.message[:50]}'
