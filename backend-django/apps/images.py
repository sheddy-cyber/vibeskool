"""Image uploads: check them, shrink them, and strip their metadata.

Every upload is opened with Pillow (so a file that only claims to be an image
is refused), resized to a sensible maximum, and re-encoded as WebP. Re-encoding
also drops EXIF data, which can carry the GPS location of where a photo was taken.
"""
import io
import uuid

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP', 'GIF'}
Image.MAX_IMAGE_PIXELS = 40_000_000  # refuse decompression bombs


class ImageError(ValueError):
    """A message that is safe to show to the person uploading."""


def _open(upload):
    if upload.size > MAX_UPLOAD_BYTES:
        raise ImageError('That image is over 8 MB. Try a smaller one.')
    try:
        img = Image.open(upload)
        img.verify()  # checks the file is a real image
        upload.seek(0)
        img = Image.open(upload)
        fmt = img.format
        img.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise ImageError("That file isn't an image we can read. Use a PNG, JPG, WebP or GIF.")
    if fmt not in ALLOWED_FORMATS:
        raise ImageError('Use a PNG, JPG, WebP or GIF.')
    img = ImageOps.exif_transpose(img)  # respect phone camera rotation before dropping EXIF
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA' if 'A' in img.getbands() or img.mode == 'P' else 'RGB')
    return img


def _encode(img, quality=82):
    out = io.BytesIO()
    img.save(out, format='WEBP', quality=quality, method=6)
    return ContentFile(out.getvalue(), name=f'{uuid.uuid4().hex}.webp')


def project_preview(upload, max_size=(1600, 1000)):
    """A preview image for a project, at most 1600×1000, aspect ratio kept."""
    img = _open(upload)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    return _encode(img), img.size


def avatar(upload, size=256):
    """A square avatar, centre-cropped."""
    img = _open(upload)
    img = ImageOps.fit(img, (size, size), Image.Resampling.LANCZOS)
    return _encode(img, quality=86)
