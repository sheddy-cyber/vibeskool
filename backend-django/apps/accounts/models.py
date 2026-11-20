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
    xp = models.PositiveIntegerField(default=0)
    badges = models.JSONField(default=list, blank=True)

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

    @property
    def is_tutor(self):
        return self.role in (self.Role.TEACHER, self.Role.ADMIN)

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    def add_xp(self, amount):
        User.objects.filter(pk=self.pk).update(xp=models.F('xp') + amount)
        self.refresh_from_db(fields=['xp'])
