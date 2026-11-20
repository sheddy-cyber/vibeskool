import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.learning.services import student_summary

from .authentication import issue_token
from .models import initials
from .serializers import LoginSerializer, ProfileSerializer, SignupSerializer, UserSerializer

User = get_user_model()
log = logging.getLogger(__name__)


class AuthThrottle(AnonRateThrottle):
    rate = '30/min'


def signed_in(user, code=status.HTTP_200_OK):
    return Response({'user': UserSerializer(user).data, 'token': issue_token(user)}, status=code)


class SignupView(APIView):
    """POST /api/auth/signup — create an account with email and password."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AuthThrottle]

    def post(self, request):
        s = SignupSerializer(data=request.data)
        if not s.is_valid():
            if any(getattr(e, 'code', '') == 'exists' for e in s.errors.get('email', [])):
                return Response({'error': 'Email already exists'}, status=status.HTTP_409_CONFLICT)
            s.is_valid(raise_exception=True)
        d = s.validated_data
        user = User.objects.create_user(
            email=d['email'],
            password=d['password'],
            display_name=d['displayName'].strip(),
            role=d['role'],
        )
        return signed_in(user, status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login"""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AuthThrottle]

    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email = s.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user or not user.check_password(s.validated_data['password']):
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        return signed_in(user)


class GoogleView(APIView):
    """POST /api/auth/google {credential, role} — sign in or sign up with a Google ID token."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AuthThrottle]

    def post(self, request):
        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'Google credential is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not settings.GOOGLE_CLIENT_ID:
            return Response({'error': 'Google sign-in is not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token
        try:
            info = id_token.verify_oauth2_token(credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
        except ValueError as exc:
            return Response({'error': f'Failed to verify Google token: {exc}'}, status=status.HTTP_401_UNAUTHORIZED)

        email = (info.get('email') or '').lower()
        if not email or not info.get('email_verified', False):
            return Response({'error': 'Your Google account has no verified email'}, status=status.HTTP_401_UNAUTHORIZED)
        google_id = info['sub']
        name = info.get('name') or email.split('@')[0]
        picture = info.get('picture') or ''

        with transaction.atomic():
            user = User.objects.filter(google_id=google_id).first() or User.objects.filter(email__iexact=email).first()
            if user:
                changed = []
                if not user.google_id:
                    user.google_id = google_id
                    changed.append('google_id')
                # Replace an initials avatar with the Google photo
                if picture and (not user.avatar_url or len(user.avatar_url) <= 3):
                    user.avatar_url = picture
                    changed.append('avatar_url')
                if changed:
                    user.save(update_fields=changed)
            else:
                role = request.data.get('role')
                user = User.objects.create_user(
                    email=email,
                    display_name=name,
                    avatar_url=picture or initials(name),
                    role=role if role in ('student', 'teacher') else 'student',
                    google_id=google_id,
                    auth_provider=User.Provider.GOOGLE,
                )
        return signed_in(user)


class MeView(APIView):
    """GET /api/auth/me — the signed-in user, plus learning totals for students."""

    def get(self, request):
        data = {'user': UserSerializer(request.user).data}
        if request.user.role == User.Role.STUDENT:
            data.update(student_summary(request.user))
        return Response(data)


class ProfileView(APIView):
    """PUT /api/auth/profile {displayName, avatarUrl, settings}"""

    def put(self, request):
        s = ProfileSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        if not d:
            return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if 'displayName' in d:
            user.display_name = d['displayName'].strip() or user.display_name
        if 'avatarUrl' in d:
            user.avatar_url = d['avatarUrl']
        if 'settings' in d:
            user.settings = d['settings']
        user.save()
        return Response({'user': UserSerializer(user).data})
