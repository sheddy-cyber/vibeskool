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
TESTING = 'test' in sys.argv[1:2]
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or ('dev-only-insecure-key' if DEBUG or TESTING else None)

# Placeholders from .env.example. A live server refuses to start with them,
# because anyone who knows the secret can sign in as any user.
WEAK_SECRETS = {'change-me', 'change-me-to-at-least-32-random-characters', 'dev-only-insecure-key', 'secret'}


def require_secret(name, value):
    if DEBUG or TESTING:
        return
    if not value or value in WEAK_SECRETS or len(value.encode()) < 32:
        raise RuntimeError(
            f'{name} must be set to at least 32 random characters when DEBUG is off. '
            'Make one with: python -c "import secrets; print(secrets.token_urlsafe(48))"'
        )


require_secret('DJANGO_SECRET_KEY', SECRET_KEY)

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')
if os.environ.get('RENDER_EXTERNAL_HOSTNAME'):
    # Render tells the app its own address (e.g. vibeskool-api.onrender.com)
    ALLOWED_HOSTS.append(os.environ['RENDER_EXTERNAL_HOSTNAME'])

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
    'config.health.HealthCheckMiddleware',  # first, so health checks skip the host and HTTPS checks
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
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')

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

if TESTING:
    # Never create test databases on a real server (e.g. Supabase)
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
    # Hashing is deliberately slow; tests don't need that
    PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher', *PASSWORD_HASHERS[1:]]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
     'OPTIONS': {'user_attributes': ('email', 'display_name')}},
]

LANGUAGE_CODE = 'en-gb'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# Uploads (project previews, avatars). Local disk in development. On a live
# server the disk is wiped on every deploy, so set the STORAGE_* variables to
# keep uploads in a public Supabase Storage bucket (any S3-compatible store works).
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
STORAGE_BUCKET = os.environ.get('STORAGE_BUCKET', '')
if STORAGE_BUCKET and not TESTING:
    # Supabase: Project settings -> Storage -> S3 connection gives the endpoint,
    # region and access keys. STORAGE_PUBLIC_URL is the bucket's public address:
    # https://<project>.supabase.co/storage/v1/object/public/<bucket>
    _public = os.environ.get('STORAGE_PUBLIC_URL', '').rstrip('/')
    STORAGES['default'] = {
        'BACKEND': 'storages.backends.s3.S3Storage',
        'OPTIONS': {
            'bucket_name': STORAGE_BUCKET,
            'endpoint_url': os.environ.get('STORAGE_ENDPOINT'),
            'region_name': os.environ.get('STORAGE_REGION'),
            'access_key': os.environ.get('STORAGE_ACCESS_KEY'),
            'secret_key': os.environ.get('STORAGE_SECRET_KEY'),
            'custom_domain': _public.split('://', 1)[-1] if _public else None,
            'querystring_auth': False,     # public bucket: plain, permanent links
            'file_overwrite': False,
            'object_parameters': {'CacheControl': 'public, max-age=31536000, immutable'},
            'signature_version': 's3v4',
            'addressing_style': 'path',
        },
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
    # Render puts a proxy in front of the app; this makes rate limits use the
    # visitor's address rather than the proxy's
    'NUM_PROXIES': int(os.environ['NUM_PROXIES']) if os.environ.get('NUM_PROXIES') else None,
}

# Rate limits and other short-lived data. Shared through Redis when there is
# one, so limits hold across processes and restarts.
CACHES = {
    'default': (
        {'BACKEND': 'django.core.cache.backends.redis.RedisCache', 'LOCATION': REDIS_URL}
        if REDIS_URL and not TESTING else
        {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}
    )
}
if DEBUG:
    REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'].append('rest_framework.renderers.BrowsableAPIRenderer')

SPECTACULAR_SETTINGS = {
    'TITLE': 'VibeSkool API',
    'DESCRIPTION': 'Accounts, learning paths, progress and classrooms for VibeSkool.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'DISABLE_ERRORS_AND_WARNINGS': True,  # it can't infer every hand-written view; that's fine
    'ENABLE_DJANGO_DEPLOY_CHECK': False,
}

# Same token format, secret and lifetime as the old server, so sign-ins from
# before the move to Django keep working.
JWT_SECRET = os.environ.get('JWT_SECRET') or SECRET_KEY
require_secret('JWT_SECRET', JWT_SECRET)
JWT_ALGORITHM = 'HS256'
JWT_LIFETIME = timedelta(days=7)

# Password reset links work once and for an hour
PASSWORD_RESET_TIMEOUT = 60 * 60

# Email (password resets, tutor approvals). Printed to the console in
# development. In production: Brevo's API (BREVO_API_KEY), or any SMTP server.
# BREVO_API_KEY sends through Brevo's web API: use it on Render's free plan,
# which blocks the SMTP ports. Otherwise EMAIL_HOST for any SMTP server.
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '')
EMAIL_BACKEND = (
    'apps.accounts.brevo.BrevoEmailBackend' if BREVO_API_KEY
    else 'django.core.mail.backends.smtp.EmailBackend' if EMAIL_HOST
    else 'django.core.mail.backends.console.EmailBackend'
)
EMAIL_PORT = int(os.environ.get('EMAIL_PORT') or 587)
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_SSL = env_bool('EMAIL_USE_SSL', EMAIL_PORT == 465)
EMAIL_USE_TLS = not EMAIL_USE_SSL and env_bool('EMAIL_USE_TLS', True)
EMAIL_TIMEOUT = 15
# Quotes pasted around the value (common in dashboards) are not part of it
DEFAULT_FROM_EMAIL = (os.environ.get('DEFAULT_FROM_EMAIL') or '').strip().strip('"\'').strip() \
    or 'VibeSkool <no-reply@localhost>'
SERVER_EMAIL = DEFAULT_FROM_EMAIL
# Who hears about new tutor requests (comma-separated). Defaults to staff accounts.
TUTOR_REQUEST_EMAILS = env_list('TUTOR_REQUEST_EMAILS')

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')

# AI tutor (Gemini)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')

# The sandbox that runs students' exercise code. Never this server.
# Judge0 through RapidAPI: set JUDGE0_KEY (and JUDGE0_URL / JUDGE0_HOST for
# another Judge0 server). Or a self-hosted Piston: set PISTON_URL instead.
JUDGE0_URL = (os.environ.get('JUDGE0_URL') or 'https://judge0-ce.p.rapidapi.com').rstrip('/')
JUDGE0_KEY = os.environ.get('JUDGE0_KEY', '')
JUDGE0_HOST = os.environ.get('JUDGE0_HOST') or JUDGE0_URL.split('://', 1)[-1].split('/')[0]
# Judge0 language ids. CE 1.13+: 93 = Node.js 18.15, 92 = Python 3.11.2.
JUDGE0_LANGUAGES = {
    'javascript': int(os.environ.get('JUDGE0_JS_ID') or 93),
    'python': int(os.environ.get('JUDGE0_PYTHON_ID') or 92),
}
PISTON_URL = os.environ.get('PISTON_URL', '').rstrip('/')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
# This API's own public address, for links in emails (e.g. to the admin).
# Render provides its hostname, so this only needs setting elsewhere.
PUBLIC_API_URL = (os.environ.get('PUBLIC_API_URL')
                  or (f"https://{os.environ['RENDER_EXTERNAL_HOSTNAME']}" if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else '')
                  or 'http://localhost:8000').rstrip('/')
CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', FRONTEND_URL)
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', FRONTEND_URL)
# Pages allowed to open a live-update socket. Any origin in development.
WEBSOCKET_ALLOWED_ORIGINS = ['*'] if DEBUG else CORS_ALLOWED_ORIGINS

# The admin lives here. A less obvious path means fewer password-guessing bots.
ADMIN_PATH = (os.environ.get('ADMIN_PATH') or 'admin').strip('/') + '/'

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', True)
    SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', str(60 * 60 * 24 * 365)))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool('SECURE_HSTS_INCLUDE_SUBDOMAINS', False)
    # Subdomain HSTS and the preload list belong to whoever owns the domain
    # (onrender.com isn't ours); turn them on once the API has its own domain.
    SILENCED_SYSTEM_CHECKS = ['security.W005', 'security.W021']
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
    SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
    X_FRAME_OPTIONS = 'DENY'

# Error reports. Set SENTRY_DSN (sentry.io, free tier) to be told when
# something breaks for a user, with the stack trace. No personal data is sent.
SENTRY_DSN = os.environ.get('SENTRY_DSN', '')
if SENTRY_DSN and not TESTING:
    import sentry_sdk

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=os.environ.get('SENTRY_ENVIRONMENT', 'development' if DEBUG else 'production'),
        release=os.environ.get('RENDER_GIT_COMMIT') or None,
        traces_sample_rate=float(os.environ.get('SENTRY_TRACES_SAMPLE_RATE', '0.05')),
        send_default_pii=False,
    )

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': os.environ.get('LOG_LEVEL', 'INFO')},
    # 4xx answers are normal API traffic, not warnings
    'loggers': {'django.request': {'level': 'ERROR' if TESTING else 'WARNING'}},
}
