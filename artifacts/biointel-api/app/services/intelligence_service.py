from app.ai.groq_client import generate_intelligence_dimension
from app.database.connection import get_pool
from app.core.logging import get_logger

logger = get_logger(__name__)

VALID_DIMENSIONS = {"evolution", "anatomy", "behavior", "ecosystem", "conservation"}


async def get_intelligence(
    species_name: str,
    scientific_name: str,
    dimension: str,
    context: str = "",
) -> dict:
    if dimension not in VALID_DIMENSIONS:
        raise ValueError(f"Invalid dimension '{dimension}'. Must be one of: {VALID_DIMENSIONS}")

    cache_key = f"{scientific_name}:{dimension}"

    pool = await get_pool()
    if pool:
        cached = await _get_cached(pool, scientific_name, dimension)
        if cached:
            logger.info("Returning cached intelligence", cache_key=cache_key)
            return {"content": cached, "dimension": dimension, "confidence": 0.95, "cached": True}

    content = await generate_intelligence_dimension(
        species_name, scientific_name, dimension, context
    )

    if pool:
        await _cache_intelligence(pool, scientific_name, dimension, content)

    return {"content": content, "dimension": dimension, "confidence": 0.88, "cached": False}


async def _get_cached(pool, scientific_name: str, dimension: str) -> str | None:
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT rs.content FROM research_sections rs
                JOIN species s ON rs.species_id = s.id
                WHERE s.scientific_name = $1 AND rs.dimension = $2
                """,
                scientific_name, dimension,
            )
            return row["content"] if row else None
    except Exception as exc:
        logger.error("Cache lookup failed", error=str(exc))
        return None


async def _cache_intelligence(pool, scientific_name: str, dimension: str, content: str) -> None:
    try:
        async with pool.acquire() as conn:
            species_row = await conn.fetchrow(
                "SELECT id FROM species WHERE scientific_name = $1", scientific_name
            )
            if species_row:
                await conn.execute(
                    """
                    INSERT INTO research_sections (species_id, dimension, content, model)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (species_id, dimension) DO UPDATE
                    SET content = EXCLUDED.content, created_at = NOW()
                    """,
                    species_row["id"], dimension, content, "groq/llama-3.3-70b-versatile",
                )
    except Exception as exc:
        logger.error("Cache write failed", error=str(exc))
