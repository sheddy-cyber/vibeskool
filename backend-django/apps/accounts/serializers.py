import json
import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """The user as the frontend sees it."""

    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'avatar_url', 'role', 'settings', 'xp', 'badges',
                  'headline', 'bio', 'github_username', 'website_url', 'auth_provider', 'created_at',
                  'tutor_status', 'tutor_requested_at']
        read_only_fields = fields


class PublicUserSerializer(serializers.ModelSerializer):
    """What classmates may see of each other."""

    class Meta:
        model = User
        fields = ['id', 'display_name', 'avatar_url', 'role']
        read_only_fields = fields


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField(error_messages={'invalid': 'Valid email is required', 'required': 'Valid email is required'})
    password = serializers.CharField(min_length=8, max_length=128, write_only=True, trim_whitespace=False, error_messages={
        'min_length': 'Password must be at least 8 characters',
        'required': 'Password must be at least 8 characters',
    })
    displayName = serializers.CharField(max_length=120, error_messages={
        'required': 'Display name is required', 'blank': 'Display name is required',
    })
    role = serializers.ChoiceField(choices=['student', 'teacher'], default='student', error_messages={
        'invalid_choice': 'Role must be student or teacher',
    })
    # Someone asking to teach can say what; an admin reads it before approving
    teachingNote = serializers.CharField(max_length=1000, required=False, allow_blank=True)

    def validate(self, data):
        check_password(data['password'], email=data.get('email', ''), name=data.get('displayName', ''))
        return data

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            # Surfaced as 409 by the view
            raise serializers.ValidationError('Email already exists', code='exists')
        return value


def check_password(password, user=None, email='', name=''):
    """Django's password rules (length, too common, too like the name or email)."""
    probe = user or User(email=email, display_name=name)
    try:
        validate_password(password, probe)
    except DjangoValidationError as exc:
        raise serializers.ValidationError({'password': [_friendly(m) for m in exc.messages]})


def _friendly(message):
    if 'too common' in message:
        return 'That password is too common. Pick one that is harder to guess.'
    if 'too similar' in message:
        return 'That password is too close to your name or email.'
    if 'at least' in message:
        return 'Password must be at least 8 characters'
    return message


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(error_messages={'invalid': 'Enter your email address', 'required': 'Enter your email address'})


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, max_length=128, trim_whitespace=False, error_messages={
        'min_length': 'Password must be at least 8 characters',
        'required': 'Password must be at least 8 characters',
    })


class TutorRequestSerializer(serializers.Serializer):
    note = serializers.CharField(max_length=1000, required=False, allow_blank=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(error_messages={'required': 'Email and password are required', 'blank': 'Email and password are required'})
    password = serializers.CharField(trim_whitespace=False, error_messages={'required': 'Email and password are required', 'blank': 'Email and password are required'})


class ProfileSerializer(serializers.Serializer):
    displayName = serializers.CharField(max_length=120, required=False)
    avatarUrl = serializers.CharField(required=False, allow_blank=True)
    settings = serializers.JSONField(required=False)
    headline = serializers.CharField(max_length=80, required=False, allow_blank=True)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    github = serializers.CharField(max_length=60, required=False, allow_blank=True)
    website = serializers.CharField(max_length=300, required=False, allow_blank=True)

    def validate_displayName(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Your name needs at least 2 characters')
        return value

    def validate_github(self, value):
        # Accept "ada", "@ada" or a full profile link
        value = value.strip().removeprefix('@')
        value = re.sub(r'^(https?://)?(www\.)?github\.com/', '', value).strip('/')
        if value and not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}', value):
            raise serializers.ValidationError("That isn't a GitHub username")
        return value

    def validate_website(self, value):
        value = value.strip()
        if not value:
            return ''
        if not re.match(r'^https?://', value):
            value = 'https://' + value
        try:
            URLValidator(schemes=['http', 'https'])(value)
        except DjangoValidationError:
            raise serializers.ValidationError("That doesn't look like a web address")
        return value

    def validate_settings(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('Settings must be an object.')
        # Preferences only; keys and secrets don't belong here
        value = {k: v for k, v in value.items() if 'key' not in k.lower() and 'token' not in k.lower()}
        if len(json.dumps(value)) > 4000:
            raise serializers.ValidationError('Too many settings.')
        return value
