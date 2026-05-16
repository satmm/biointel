import asyncpg
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool | None:
    global _pool
    if _pool is None and settings.database_url:
        try:
            _pool = await asyncpg.create_pool(
                settings.database_url,
                min_size=2,
                max_size=10,
                command_timeout=30,
            )
            logger.info("Database pool created")
        except Exception as exc:
            logger.error("Failed to create database pool", error=str(exc))
            _pool = None
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("Database pool closed")


async def setup_database() -> None:
    pool = await get_pool()
    if not pool:
        logger.warning("No database connection — skipping schema setup")
        return

    async with pool.acquire() as conn:
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        await conn.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS species (
                id TEXT PRIMARY KEY,
                common_name TEXT NOT NULL,
                scientific_name TEXT NOT NULL,
                kingdom TEXT DEFAULT 'Animalia',
                phylum TEXT,
                class TEXT,
                "order" TEXT,
                family TEXT,
                genus TEXT,
                iucn_status TEXT DEFAULT 'DD',
                habitat TEXT,
                lifespan TEXT,
                diet TEXT,
                top_speed TEXT,
                population TEXT,
                population_trend TEXT DEFAULT 'Unknown',
                image_url TEXT,
                thumbnail_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS uploads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                original_filename TEXT,
                stored_url TEXT,
                species_id TEXT REFERENCES species(id),
                confidence FLOAT,
                model_used TEXT,
                processing_time_ms FLOAT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS embeddings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                species_id TEXT REFERENCES species(id),
                text_content TEXT NOT NULL,
                embedding vector(384),
                model TEXT DEFAULT 'BAAI/bge-small-en-v1.5',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS ecosystem_relationships (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                source_species_id TEXT REFERENCES species(id),
                target_species_id TEXT REFERENCES species(id),
                relationship_type TEXT NOT NULL,
                strength FLOAT DEFAULT 1.0,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS research_sections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                species_id TEXT REFERENCES species(id),
                dimension TEXT NOT NULL,
                content TEXT NOT NULL,
                confidence FLOAT,
                model TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(species_id, dimension)
            );
        """)

        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_species_name ON species USING gin (common_name gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS idx_species_scientific ON species USING gin (scientific_name gin_trgm_ops);
        """)

    logger.info("Database schema ready")
