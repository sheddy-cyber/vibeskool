"""
VibeSkool API settings.

Everything that changes between machines comes from the environment
(or a local .env file). Local development uses SQLite; set DATABASE_URL
to point at Postgres in production.
"""
import os
import sys
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env_bool(name, default=False):
    return os.environ.get(name, str(int(default))).lower() in ('1', 'true', 'yes', 'on')


def env_list(name, default=''):
    return [v.strip() for v in os.environ.get(name, default).split(',') if v.strip()]


DEBUG = env_bool('DJANGO_DEBUG', False)
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or ('dev-only-insecure-key' if DEBUG else None)
if not SECRET_KEY:
    raise RuntimeError('DJANGO_SECRET_KEY must be set when DEBUG is off.')

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')

INSTALLED_APPS = [
    'daphne',  # makes runserver speak ASGI, so WebSockets work in development
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'channels',
    # VibeSkool
    'apps.accounts',
    'apps.learning',
    'apps.classrooms',
    'apps.showcase',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if not DEBUG:
    # Serves the admin's CSS and JS in production (run collectstatic first)
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

ROOT_URLCONF = 'config.urls'
APPEND_SLASH = False

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Live class updates. One process in development; Redis when there are several.
REDIS_URL = os.environ.get('REDIS_URL')
CHANNEL_LAYERS = {
    'default': (
        {'BACKEND': 'channels_redis.core.RedisChannelLayer', 'CONFIG': {'hosts': [REDIS_URL]}}
        if REDIS_URL else
        {'BACKEND': 'channels.layers.InMemoryChannelLayer'}
    )
}

# The app runs under ASGI (Daphne), where each request may get a new thread.
# Persistent per-thread connections (CONN_MAX_AGE > 0) would then pile up, one
# per request, until the database refuses more (Supabase's session pooler
# allows 15). So connections go back to a small shared pool after every
# request instead.
DATABASES = {
    'default': dj_database_url.config(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}", conn_max_age=0)
}
if DATABASES['default']['ENGINE'].endswith('postgresql'):
    options = DATABASES['default'].setdefault('OPTIONS', {})
    options.setdefault('sslmode', 'require')
    options['pool'] = {
        'min_size': 1,
        'max_size': int(os.environ.get('DB_POOL_SIZE', '5')),
        'timeout': 15,      # wait this long for a free connection before failing
        'max_idle': 120,    # hand idle connections back to the database
    }
    if str(DATABASES['default'].get('PORT')) == '6543':
        # Supabase's transaction pooler: no server-side cursors or prepared
        # statements. (Prefer the session pooler, :5432.)
        DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
        options['prepare_threshold'] = None

AUTH_USER_MODEL = 'accounts.User'

# Accounts imported from the old server were hashed with bcrypt; Django can
# verify those and upgrades them to its default hasher on the next sign-in.
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.BCryptPasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

TESTING = 'test' in sys.argv[1:2]
if TESTING:
    # Never create test databases on a real server (e.g. Supabase)
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
    # Hashing is deliberately slow; tests don't need that
    PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher', *PASSWORD_HASHERS[1:]]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 6}},
]

LANGUAGE_CODE = 'en-gb'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# Uploads (project previews, avatars). Local disk in development; in production
# point MEDIA_ORIGIN at wherever /media is served from, or swap the storage
# backend for object storage (S3, Supabase Storage) so files survive redeploys.
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_ORIGIN = os.environ.get('MEDIA_ORIGIN', 'http://localhost:8000' if DEBUG else '')
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── API ───────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['apps.accounts.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.accounts.exceptions.error_handler',
    'UNAUTHENTICATED_USER': None,
}
if DEBUG:
    REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'].append('rest_framework.renderers.BrowsableAPIRenderer')

SPECTACULAR_SETTINGS = {
    'TITLE': 'VibeSkool API',
    'DESCRIPTION': 'Accounts, learning paths, progress and classrooms for VibeSkool.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Same token format, secret and lifetime as the old server, so sign-ins from
# before the move to Django keep working.
JWT_SECRET = os.environ.get('JWT_SECRET') or SECRET_KEY
JWT_ALGORITHM = 'HS256'
JWT_LIFETIME = timedelta(days=7)

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')

# AI tutor (Gemini) and the sandbox that runs exercise code (Piston)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
PISTON_URL = os.environ.get('PISTON_URL', 'https://emkc.org/api/v2/piston')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', FRONTEND_URL)
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', FRONTEND_URL)
# Pages allowed to open a live-update socket. Any origin in development.
WEBSOCKET_ALLOWED_ORIGINS = ['*'] if DEBUG else CORS_ALLOWED_ORIGINS

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
    # 4xx answers are normal API traffic, not warnings
    'loggers': {'django.request': {'level': 'ERROR' if TESTING else 'WARNING'}},
}
