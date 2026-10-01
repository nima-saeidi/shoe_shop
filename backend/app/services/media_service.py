import io
import os
import uuid

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import BadRequestError

# Maps Pillow's *verified* image format to a safe file extension. We deliberately
# do NOT trust the client-supplied filename extension or Content-Type header for
# this decision — both are attacker-controlled and can be spoofed (e.g. uploading
# a script renamed to "photo.png" with a forged "image/png" Content-Type). Instead
# we sniff the real file bytes and only ever write out one of these extensions.
ALLOWED_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp", "GIF": ".gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


async def save_uploaded_image(file: UploadFile, subdir: str = "") -> str:
    """Validates (by decoding the actual bytes) and stores an uploaded image, returning its public URL."""
    # Read with a hard cap so a malicious/huge upload can't exhaust memory before we
    # even get to size validation.
    content = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise BadRequestError("حجم فایل نباید بیشتر از ۵ مگابایت باشد")
    if not content:
        raise BadRequestError("فایل ارسالی خالی است")

    try:
        with Image.open(io.BytesIO(content)) as probe:
            probe.verify()
        with Image.open(io.BytesIO(content)) as probe:
            image_format = probe.format
    except (UnidentifiedImageError, OSError, ValueError):
        raise BadRequestError("فایل ارسالی یک تصویر معتبر نیست")

    ext = ALLOWED_FORMATS.get(image_format or "")
    if not ext:
        raise BadRequestError("فقط فایل‌های تصویری با فرمت JPG، PNG، WEBP یا GIF مجاز هستند")

    target_dir = os.path.join(settings.UPLOAD_DIR, subdir) if subdir else settings.UPLOAD_DIR
    os.makedirs(target_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(target_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    url_path = f"/static/uploads/{subdir}/{filename}" if subdir else f"/static/uploads/{filename}"
    return url_path.replace("\\", "/")
