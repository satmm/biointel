from app.ai.embeddings import generate_embedding
from app.database.connection import get_pool
from app.core.logging import get_logger

logger = get_logger(__name__)


async def embed_and_store(text: str, species_id: str | None = None) -> dict:
    embedding = await generate_embedding(text)
    dimensions = len(embedding)

    pool = await get_pool()
    if pool and species_id:
        try:
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO embeddings (species_id, text_content, embedding, model)
                    VALUES ($1, $2, $3::vector, $4)
                    """,
                    species_id,
                    text,
                    str(embedding),
                    "BAAI/bge-small-en-v1.5",
                )
                logger.info("Embedding stored", species_id=species_id, dims=dimensions)
        except Exception as exc:
            logger.error("Failed to store embedding", error=str(exc))

    return {"embedding": embedding, "model": "BAAI/bge-small-en-v1.5", "dimensions": dimensions}


async def find_similar_species(query_text: str, limit: int = 5) -> list[dict]:
    query_embedding = await generate_embedding(query_text)
    pool = await get_pool()

    if not pool:
        logger.warning("No database — returning empty similarity results")
        return []

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT e.species_id, s.common_name, s.scientific_name,
                       1 - (e.embedding <=> $1::vector) AS similarity
                FROM embeddings e
                JOIN species s ON e.species_id = s.id
                ORDER BY e.embedding <=> $1::vector
                LIMIT $2
                """,
                str(query_embedding),
                limit,
            )
            return [dict(row) for row in rows]
    except Exception as exc:
        logger.error("Vector similarity search failed", error=str(exc))
        return []
