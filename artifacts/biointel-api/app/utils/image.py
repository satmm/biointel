import io
from PIL import Image
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = settings.max_image_size_mb * 1024 * 1024


def validate_image(data: bytes, content_type: str) -> None:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Unsupported image type: {content_type}. Allowed: {ALLOWED_CONTENT_TYPES}")
    if len(data) > MAX_BYTES:
        raise ValueError(f"Image too large: {len(data) / 1024 / 1024:.1f}MB. Max: {settings.max_image_size_mb}MB")


def preprocess_image(data: bytes, max_size: int = 1024) -> bytes:
    img = Image.open(io.BytesIO(data)).convert("RGB")

    if img.width > max_size or img.height > max_size:
        img.thumbnail((max_size, max_size), Image.LANCZOS)
        logger.info("Image resized", original_size=f"{img.width}x{img.height}")

    out = io.BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


def extract_image_metadata(data: bytes) -> dict:
    img = Image.open(io.BytesIO(data))
    return {
        "width": img.width,
        "height": img.height,
        "format": img.format,
        "mode": img.mode,
        "size_kb": round(len(data) / 1024, 1),
    }
