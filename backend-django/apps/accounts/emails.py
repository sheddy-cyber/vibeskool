"""Emails the site sends: password resets and tutor requests.

Plain text with a light HTML version. A failed send is logged rather than
shown to the person, so the page never leaks whether an address exists.
"""
import logging
from html import escape

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives

log = logging.getLogger(__name__)

HTML = """<!doctype html>
<html><body style="margin:0;padding:32px 16px;background:#F5F5F2;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1F2430">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E6E4DE;border-radius:14px;padding:28px">
    <p style="margin:0 0 20px;font-weight:700;font-size:16px;letter-spacing:-0.01em">VibeSkool</p>
    {body}
  </div>
  <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#8A8F98;text-align:center">You're getting this because of your VibeSkool account.</p>
</body></html>"""


def _paragraphs(lines):
    return ''.join(f'<p style="margin:0 0 14px;font-size:15px;line-height:1.55">{escape(line)}</p>' for line in lines)


def _button(label, url):
    return (f'<p style="margin:22px 0"><a href="{escape(url)}" style="display:inline-block;background:#1F2430;color:#FFFFFF;'
            f'text-decoration:none;font-weight:600;font-size:14px;padding:11px 18px;border-radius:999px">{escape(label)}</a></p>')


def send(to, subject, lines, action=None, after=()):
    """lines: paragraphs before the button; action: (label, url); after: paragraphs below it."""
    text = '\n\n'.join([*lines, *([f'{action[0]}: {action[1]}'] if action else []), *after])
    html = HTML.format(body=_paragraphs(lines) + (_button(*action) if action else '') + _paragraphs(after))
    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, to if isinstance(to, list) else [to])
    msg.attach_alternative(html, 'text/html')
    try:
        msg.send()
        return True
    except Exception:
        log.exception('Could not send the email "%s"', subject)
        return False


def first_name(user):
    return (user.display_name or '').split(' ')[0] or 'there'


def password_reset(user, link):
    return send(
        user.email,
        'Reset your VibeSkool password',
        [f'Hi {first_name(user)},', 'Someone (hopefully you) asked to reset the password for this account. '
         'The link works once, for the next hour.'],
        ('Choose a new password', link),
        ["If you didn't ask for this, ignore this email. Your password stays as it is."],
    )


def tutor_request_received(user):
    """Tell the admins someone wants to teach."""
    to = settings.TUTOR_REQUEST_EMAILS or list(
        get_user_model().objects.filter(is_staff=True, is_active=True).values_list('email', flat=True))
    if not to:
        return False
    lines = [f'{user.display_name} ({user.email}) asked to become a tutor.']
    if user.tutor_request_note:
        lines.append(f'What they want to teach: {user.tutor_request_note}')
    lines.append('Approve or decline them in the admin: Users, then filter by "Tutor status: Waiting for approval".')
    return send(to, f'Tutor request from {user.display_name}', lines)


def tutor_approved(user):
    return send(
        user.email,
        "You're a VibeSkool tutor",
        [f'Hi {first_name(user)},', 'Your request to teach was approved. You can now create classes, '
         'write courses and help students with their code.'],
        ('Open your teaching space', f"{settings.FRONTEND_URL.rstrip('/')}/app/teaching"),
    )


def tutor_declined(user):
    return send(
        user.email,
        'About your VibeSkool tutor request',
        [f'Hi {first_name(user)},', "We can't take you on as a tutor right now. Your account stays as it is, "
         'and you can keep learning. You can ask again from Settings later.'],
    )
