from fastapi import APIRouter, HTTPException, status
from app.services.intelligence_service import get_intelligence
from app.services.embedding_service import embed_and_store, find_similar_species
from app.schemas.species import IntelligenceRequest, IntelligenceResponse, EmbeddingRequest, EmbeddingResponse
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/intelligence", tags=["Species Intelligence"])

VALID_DIMENSIONS = {"evolution", "anatomy", "behavior", "ecosystem", "conservation"}


@router.post(
    "/generate",
    response_model=IntelligenceResponse,
    summary="Generate AI intelligence for a specific research dimension",
    description="Powered by Groq's Llama 3.3 70B. Generates research-grade content for one of 5 biological dimensions.",
)
async def generate_intelligence(request: IntelligenceRequest):
    if request.dimension not in VALID_DIMENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid dimension. Must be one of: {sorted(VALID_DIMENSIONS)}",
        )

    result = await get_intelligence(
        request.species_name,
        request.scientific_name,
        request.dimension,
        request.context or "",
    )
    return IntelligenceResponse(**result)


@router.post(
    "/embed",
    response_model=EmbeddingResponse,
    summary="Generate semantic embedding for species text",
    description="Uses BAAI/bge-small-en-v1.5 via HuggingFace Inference API. Stores in pgvector.",
)
async def generate_embedding_endpoint(request: EmbeddingRequest):
    result = await embed_and_store(request.text, request.species_id)
    return EmbeddingResponse(**result)


@router.get(
    "/similar",
    response_model=list[dict],
    summary="Find semantically similar species using vector search",
    description="Embeds query text and performs cosine similarity search against stored species embeddings.",
)
async def find_similar(q: str, limit: int = 5):
    if not q.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query cannot be empty")
    results = await find_similar_species(q.strip(), limit=min(limit, 20))
    return results
