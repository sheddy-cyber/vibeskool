from django.conf import settings


def media_url(field):
    """Full URL for an uploaded file, or '' if there is none.

    Absolute so it works wherever the React app is served from; MEDIA_ORIGIN
    points at wherever the files are actually hosted.
    """
    if not field:
        return ''
    url = field.url
    if url.startswith('http'):
        return url
    return f'{settings.MEDIA_ORIGIN}{url}'
