import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


def initials(name):
    words = (name or 'User').strip().split()
    return ''.join(w[0] for w in words[:2]).upper() or 'U'


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('An email address is required.')
        email = self.normalize_email(email).lower()
        extra.setdefault('display_name', email.split('@')[0])
        extra.setdefault('avatar_url', initials(extra['display_name']))
        user = self.model(email=email, **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.update(role=User.Role.ADMIN, is_staff=True, is_superuser=True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    """A student, tutor or admin. Signs in with email and password, or Google."""

    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        TEACHER = 'teacher', 'Tutor'
        ADMIN = 'admin', 'Admin'

    class Provider(models.TextChoices):
        LOCAL = 'local', 'Email and password'
        GOOGLE = 'google', 'Google'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=120)
    avatar_url = models.TextField(blank=True, help_text='An image URL, or initials shown in a circle.')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT, db_index=True)
    google_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    auth_provider = models.CharField(max_length=10, choices=Provider.choices, default=Provider.LOCAL)
    settings = models.JSONField(default=dict, blank=True)
    # Profile
    headline = models.CharField(max_length=80, blank=True, help_text='e.g. Learning full-stack, one build at a time')
    bio = models.TextField(max_length=500, blank=True)
    github_username = models.CharField(max_length=39, blank=True)
    website_url = models.URLField(max_length=300, blank=True)
    avatar_file = models.ImageField(upload_to='avatars/', blank=True, help_text='Uploaded photo; avatar_url points at it.')
    xp = models.PositiveIntegerField(default=0)
    badges = models.JSONField(default=list, blank=True)

    # Tutors are approved by an admin. Until then the account is a student's.
    class TutorStatus(models.TextChoices):
        NONE = '', 'Not requested'
        PENDING = 'pending', 'Waiting for approval'
        APPROVED = 'approved', 'Approved'
        DECLINED = 'declined', 'Declined'

    tutor_status = models.CharField(max_length=10, choices=TutorStatus.choices, default='', blank=True, db_index=True)
    tutor_request_note = models.TextField(max_length=1000, blank=True, help_text='What they told us they want to teach.')
    tutor_requested_at = models.DateTimeField(null=True, blank=True)

    # Sign-in tokens issued before this moment stop working (set when the
    # password changes, so a reset signs out every other device).
    tokens_valid_after = models.DateTimeField(null=True, blank=True, editable=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False, help_text='Can sign in to this admin site.')
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['display_name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.display_name} <{self.email}>'

    def revoke_tokens(self):
        """Sign out every device: tokens issued before now stop working.

        Whole seconds, because a token's issue time is in whole seconds and one
        issued straight afterwards (to keep this device signed in) must pass.
        """
        self.tokens_valid_after = timezone.now().replace(microsecond=0)

    @property
    def is_tutor(self):
        return self.role in (self.Role.TEACHER, self.Role.ADMIN)

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    def add_xp(self, amount):
        User.objects.filter(pk=self.pk).update(xp=models.F('xp') + amount)
        self.refresh_from_db(fields=['xp'])
