"""Sends the site's email through Brevo's web API instead of SMTP.

Render's free plan blocks the ports email servers use (25, 465, 587), so
SMTP can't work there. Brevo's API is an ordinary HTTPS request, which is
allowed. Turned on by setting BREVO_API_KEY; Django's send_mail and
EmailMultiAlternatives work the same either way.
"""
import logging
from email.utils import getaddresses, parseaddr

import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

log = logging.getLogger(__name__)
API_URL = 'https://api.brevo.com/v3/smtp/email'


def _person(address):
    name, email = parseaddr(address)
    return {'email': email, **({'name': name} if name else {})}


class BrevoEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        sent = 0
        for message in email_messages:
            try:
                if self._send(message):
                    sent += 1
            except Exception:
                if not self.fail_silently:
                    raise
                log.exception('Brevo could not send "%s"', message.subject)
        return sent

    def _send(self, message):
        recipients = [{'email': e, **({'name': n} if n else {})} for n, e in getaddresses(message.to) if e]
        if not recipients:
            return False
        payload = {
            'sender': _person(message.from_email or settings.DEFAULT_FROM_EMAIL),
            'to': recipients,
            'subject': message.subject,
            'textContent': message.body,
        }
        html = next((content for content, mime in getattr(message, 'alternatives', []) if mime == 'text/html'), None)
        if html:
            payload['htmlContent'] = html
        if message.cc:
            payload['cc'] = [{'email': e} for _, e in getaddresses(message.cc) if e]
        if message.bcc:
            payload['bcc'] = [{'email': e} for _, e in getaddresses(message.bcc) if e]
        if message.reply_to:
            payload['replyTo'] = _person(message.reply_to[0])

        res = requests.post(
            API_URL,
            json=payload,
            headers={'api-key': settings.BREVO_API_KEY, 'accept': 'application/json'},
            timeout=settings.EMAIL_TIMEOUT,
        )
        if res.status_code >= 400:
            # e.g. 401 "unrecognised IP address": Brevo → Security → Authorised IPs
            raise RuntimeError(f'Brevo answered {res.status_code}: {res.text[:300]}')
        return True
