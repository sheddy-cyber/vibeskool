from django.apps import AppConfig
from django.db.models.signals import post_migrate

# Table prefixes Django owns in the shared database
DJANGO_TABLES = ('django_', 'auth_', 'accounts_', 'learning_', 'classrooms_', 'showcase_')


def lock_down_tables(using='default', **kwargs):
    """Turn on row-level security for Django's tables on Supabase.

    Supabase serves every table in the public schema through its REST API.
    With RLS on and no policies, that API can read nothing, while Django
    (connecting as the table owner) works as normal.
    """
    from django.db import connections
    conn = connections[using]
    if conn.vendor != 'postgresql':
        return
    with conn.cursor() as cur:
        cur.execute(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity"
        )
        for (table,) in cur.fetchall():
            if table.startswith(DJANGO_TABLES):
                cur.execute(f'ALTER TABLE public."{table}" ENABLE ROW LEVEL SECURITY')


class AccountsConfig(AppConfig):
    name = 'apps.accounts'

    def ready(self):
        post_migrate.connect(lock_down_tables, dispatch_uid='lock_down_tables')
        warn_if_email_is_off()


def warn_if_email_is_off():
    """On a live server, say so loudly if emails would only be printed here."""
    import logging
    from django.conf import settings
    if settings.DEBUG or getattr(settings, 'TESTING', False):
        return
    log = logging.getLogger('apps.accounts')
    if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
        log.warning(
            'EMAIL IS NOT SET UP: BREVO_API_KEY is missing, so password resets and tutor emails '
            'are only printed in this log, never sent. Add BREVO_API_KEY on Render (DEPLOYING.md, Part 3).')
    elif not sender_ok(settings.DEFAULT_FROM_EMAIL):
        log.warning(
            'EMAIL SENDER IS NOT SET: DEFAULT_FROM_EMAIL is %r, so the email service will refuse every '
            'email. Set it on Render to the sender you verified, e.g. VibeSkool <you@gmail.com>.',
            settings.DEFAULT_FROM_EMAIL)


def sender_ok(value):
    from email.utils import parseaddr
    address = parseaddr(value or '')[1]
    return '@' in address and not address.endswith('@localhost')
