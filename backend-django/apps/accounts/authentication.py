"""Bearer-token sign-in for the API.

Tokens are plain HS256 JWTs carrying {id, email, role}, the same format the
Express server issued, so a student who signed in before the move stays
signed in after it.
"""
from datetime import datetime, timezone

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions


def issue_token(user):
    now = datetime.now(timezone.utc)
    payload = {
        'id': str(user.id),
        'email': user.email,
        'role': user.role,
        'iat': now,
        'exp': now + settings.JWT_LIFETIME,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


class JWTAuthentication(authentication.BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode('latin-1')
        if not header:
            return None
        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None
        try:
            payload = jwt.decode(parts[1], settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Your session has expired. Sign in again.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        User = get_user_model()
        try:
            user = User.objects.get(pk=payload.get('id'), is_active=True)
        except (User.DoesNotExist, ValueError, TypeError):
            raise exceptions.AuthenticationFailed('User not found')
        return user, payload

    def authenticate_header(self, request):
        # Makes DRF answer 401 (not 403) when no token is sent
        return self.keyword
