from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """The user as the frontend sees it (same fields the Express API sent)."""

    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'avatar_url', 'role', 'settings', 'xp', 'badges', 'created_at']
        read_only_fields = fields


class PublicUserSerializer(serializers.ModelSerializer):
    """What classmates may see of each other."""

    class Meta:
        model = User
        fields = ['id', 'display_name', 'avatar_url', 'role']
        read_only_fields = fields


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField(error_messages={'invalid': 'Valid email is required', 'required': 'Valid email is required'})
    password = serializers.CharField(min_length=6, write_only=True, trim_whitespace=False, error_messages={
        'min_length': 'Password must be at least 6 characters',
        'required': 'Password must be at least 6 characters',
    })
    displayName = serializers.CharField(max_length=120, error_messages={
        'required': 'Display name is required', 'blank': 'Display name is required',
    })
    role = serializers.ChoiceField(choices=['student', 'teacher'], default='student', error_messages={
        'invalid_choice': 'Role must be student or teacher',
    })

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            # Surfaced as 409 by the view
            raise serializers.ValidationError('Email already exists', code='exists')
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(error_messages={'required': 'Email and password are required', 'blank': 'Email and password are required'})
    password = serializers.CharField(trim_whitespace=False, error_messages={'required': 'Email and password are required', 'blank': 'Email and password are required'})


class ProfileSerializer(serializers.Serializer):
    displayName = serializers.CharField(max_length=120, required=False)
    avatarUrl = serializers.CharField(required=False, allow_blank=True)
    settings = serializers.JSONField(required=False)

    def validate_settings(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('Settings must be an object.')
        return value
