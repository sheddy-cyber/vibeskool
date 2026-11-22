"""Emails the site sends: password resets and tutor applications.

Every email has a plain-text version and an HTML version. The HTML is built
the way email apps expect: tables and inline styles, no web fonts, a hidden
preview line, and a button that still works when images are off. A failed
send is logged (and reaches Sentry) rather than shown to the person, so the
page never reveals whether an address has an account.
"""
import logging
from datetime import datetime, timezone as dt_timezone
from html import escape

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives

log = logging.getLogger(__name__)

BRAND = 'VibeSkool'
TAGLINE = 'Learn just enough code to build with AI.'
INK = '#14171F'
BODY = '#3A404C'
MUTED = '#6B7280'
LINE = '#E5E7EB'
CANVAS = '#F3F4F6'
ACCENT = '#1A73E8'
FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

ACCOUNT_REASON = f'You are receiving this email because you have a {BRAND} account.'
ADMIN_REASON = f'You are receiving this email because you are an administrator of {BRAND}.'


def site_url(path=''):
    return f"{settings.FRONTEND_URL.rstrip('/')}{path}"


# ── Building blocks ─────────────────────────────────────────────────
def _p(text, size=15, color=BODY, margin='0 0 16px'):
    return f'<p style="margin:{margin};font-family:{FONT};font-size:{size}px;line-height:1.6;color:{color}">{text}</p>'


def _button(label, url):
    # A table cell with a background colour: the button shows in every email app
    return (
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px">'
        f'<tr><td align="center" bgcolor="{ACCENT}" style="border-radius:8px">'
        f'<a href="{escape(url)}" target="_blank" style="display:inline-block;padding:13px 24px;font-family:{FONT};'
        f'font-size:15px;font-weight:600;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:8px">{escape(label)}</a>'
        '</td></tr></table>'
    )


def _fallback(url):
    return _p(
        f'If the button doesn\'t work, copy and paste this link into your browser:<br>'
        f'<a href="{escape(url)}" style="color:{ACCENT};word-break:break-all">{escape(url)}</a>',
        size=13, color=MUTED, margin='16px 0 0',
    )


def _details(rows):
    """A two-column table of label/value pairs."""
    cells = ''.join(
        f'<tr><td style="padding:10px 0;border-top:1px solid {LINE};width:140px;vertical-align:top;font-family:{FONT};'
        f'font-size:13px;color:{MUTED}">{escape(label)}</td>'
        f'<td style="padding:10px 0;border-top:1px solid {LINE};vertical-align:top;font-family:{FONT};font-size:14px;'
        f'line-height:1.5;color:{INK};white-space:pre-wrap">{escape(value)}</td></tr>'
        for label, value in rows
    )
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
            f'style="margin:8px 0 8px;border-bottom:1px solid {LINE}">{cells}</table>')


def _layout(title, preheader, body_html, reason):
    year = datetime.now(dt_timezone.utc).year
    logo = site_url('/email/mark-96.png')
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{escape(title)}</title>
<style>
  @media only screen and (max-width: 600px) {{
    .vs-card {{ padding: 28px 22px 24px !important; }}
    .vs-outer {{ padding: 20px 12px !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{CANVAS};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">{escape(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{CANVAS}" style="background:{CANVAS}">
<tr><td align="center" class="vs-outer" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
    <tr><td style="padding:0 4px 20px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:10px"><img src="{logo}" width="30" height="30" alt="" style="display:block;border:0"></td>
        <td style="vertical-align:middle;font-family:{FONT};font-size:20px;letter-spacing:-0.01em;color:{INK}"><strong style="font-weight:700">Vibe</strong><span style="font-weight:500">Skool</span></td>
      </tr></table>
    </td></tr>
    <tr><td bgcolor="#FFFFFF" class="vs-card" style="background:#FFFFFF;border:1px solid {LINE};border-radius:12px;padding:36px 36px 32px">
      <h1 style="margin:0 0 20px;font-family:{FONT};font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.01em;color:{INK}">{escape(title)}</h1>
      {body_html}
      {_p(f'The {BRAND} team', color=INK, margin='28px 0 0')}
    </td></tr>
    <tr><td style="padding:24px 8px 0;text-align:center">
      {_p(escape(reason), size=12, color=MUTED, margin='0 0 6px')}
      {_p(f'<a href="{escape(site_url())}" style="color:{MUTED};text-decoration:underline">{BRAND}</a> &middot; {escape(TAGLINE)}', size=12, color=MUTED, margin='0 0 6px')}
      {_p(f'&copy; {year} {BRAND}. All rights reserved.', size=12, color=MUTED, margin='0')}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>"""


def _text(title, paragraphs, action=None, details=None, after=(), reason=ACCOUNT_REASON):
    parts = [f"{title}\n{'=' * len(title)}", *paragraphs]
    if details:
        parts.append('\n'.join(f'{label}: {value}' for label, value in details))
    if action:
        parts.append(f'{action[0]}:\n{action[1]}')
    parts.extend(after)
    parts.append(f'The {BRAND} team')
    parts.append(f'--\n{reason}\n{BRAND} - {TAGLINE}\n{site_url()}')
    return '\n\n'.join(parts)


def send(to, subject, title, paragraphs, *, preheader='', action=None, details=None, after=(),
         reason=ACCOUNT_REASON, raise_errors=False):
    """Send one email.

    paragraphs: plain-text paragraphs (escaped for HTML); action: (button label, url);
    details: [(label, value)] shown as a small table; after: paragraphs below the button.
    """
    body = ''.join(_p(escape(t)) for t in paragraphs)
    if details:
        body += _details(details)
    if action:
        body += _button(*action)
    body += ''.join(_p(escape(t), size=14, color=MUTED, margin='16px 0 0') for t in after)
    if action:
        body += _fallback(action[1])
    html = _layout(title, preheader or paragraphs[0], body, reason)
    text = _text(title, paragraphs, action, details, after, reason)

    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, to if isinstance(to, list) else [to])
    msg.attach_alternative(html, 'text/html')
    try:
        msg.send()
        return True
    except Exception:
        log.exception('Could not send the email "%s"', subject)
        if raise_errors:
            raise
        return False


def first_name(user):
    return (user.display_name or '').split(' ')[0] or 'there'


# ── The emails ──────────────────────────────────────────────────────
def password_reset(user, link):
    return send(
        user.email,
        f'Reset your {BRAND} password',
        'Reset your password',
        [f'Hi {first_name(user)},',
         f'We received a request to reset the password for the {BRAND} account registered to {user.email}. '
         'Select the button below to choose a new password.',
         'For your security, this link can only be used once and expires in 1 hour. '
         'Once your password is changed, you will be signed out on your other devices.'],
        preheader='Use this link within the next hour to choose a new password.',
        action=('Reset password', link),
        after=["If you didn't request a password reset, you can safely ignore this email. "
               'Your password will not change, and no one can use this link without access to your inbox.'],
    )


def tutor_request_received(user):
    """Tell the admins someone has applied to teach."""
    to = settings.TUTOR_REQUEST_EMAILS or list(
        get_user_model().objects.filter(is_staff=True, is_active=True).values_list('email', flat=True))
    if not to:
        return False
    when = user.tutor_requested_at or datetime.now(dt_timezone.utc)
    details = [
        ('Name', user.display_name),
        ('Email', user.email),
        ('Signed up with', 'Google' if user.auth_provider == 'google' else 'Email and password'),
        ('Applied', when.astimezone(dt_timezone.utc).strftime('%d %B %Y, %H:%M UTC').lstrip('0')),
        ('Teaching interest', user.tutor_request_note or 'Not provided'),
    ]
    review = f'{settings.PUBLIC_API_URL}/{settings.ADMIN_PATH}accounts/user/?tutor_status__exact=pending'
    return send(
        to,
        f'New tutor application: {user.display_name}',
        'New tutor application',
        [f'{user.display_name} has applied to become a tutor on {BRAND}. '
         'Their account has student access until you review the application.'],
        preheader=f'{user.display_name} has applied to teach on {BRAND}.',
        details=details,
        action=('Review application', review),
        after=['In the admin, select the applicant and choose "Approve as tutors" or "Decline tutor requests". '
               'They will be notified by email either way.'],
        reason=ADMIN_REASON,
    )


def tutor_approved(user):
    return send(
        user.email,
        f'Your {BRAND} tutor application has been approved',
        f'Welcome to teaching on {BRAND}',
        [f'Hi {first_name(user)},',
         f'Good news: your application to teach on {BRAND} has been approved, and your account now has tutor access.',
         'You can now create classes and invite students with a join code, build courses and lessons, '
         "and review students' work and help them with their code."],
        preheader='Your account now has tutor access.',
        action=('Go to your teaching dashboard', site_url('/app/teaching')),
        after=['Already signed in? Refresh the page to see the Teaching section in the menu.'],
    )


def tutor_declined(user):
    return send(
        user.email,
        f'An update on your {BRAND} tutor application',
        'About your tutor application',
        [f'Hi {first_name(user)},',
         f'Thank you for your interest in teaching on {BRAND}. After reviewing your application, '
         "we're unable to approve tutor access at this time.",
         'Your account remains active with full access to lessons, skill checks and classes. '
         'You are welcome to apply again later from Settings, under Teaching. Telling us more about '
         'what you would like to teach helps us review it.'],
        preheader='Thank you for applying to teach on VibeSkool.',
        action=('Continue learning', site_url('/app/dashboard')),
    )


def test_message(user):
    """From the admin's "Send a test email" action."""
    return send(
        user.email,
        f'{BRAND} email test',
        'Email is working',
        [f'Hi {first_name(user)},',
         f'This is a test sent from your live {BRAND} server. If you are reading it, password reset '
         'emails and tutor application emails can be delivered.'],
        preheader='A test from your live VibeSkool server.',
        reason=ADMIN_REASON,
        raise_errors=True,
    )
