import httpx
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def generate_embedding(text: str) -> list[float]:
    logger.info("Generating text embedding", model=settings.embedding_model)

    if not settings.huggingface_token:
        logger.warning("No HuggingFace token — returning mock embedding (384 dims)")
        import hashlib
        seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
        import random
        rng = random.Random(seed)
        return [rng.gauss(0, 0.1) for _ in range(384)]

    url = f"{settings.hf_inference_url}/{settings.embedding_model}"
    headers = {
        "Authorization": f"Bearer {settings.huggingface_token}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                url,
                json={"inputs": text, "options": {"wait_for_model": True}},
                headers=headers,
            )
            resp.raise_for_status()
            result = resp.json()
            if isinstance(result, list) and result:
                if isinstance(result[0], list):
                    return result[0]
                return result
    except Exception as exc:
        logger.error("Embedding generation failed", error=str(exc))

    import hashlib, random
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    return [rng.gauss(0, 0.1) for _ in range(384)]
