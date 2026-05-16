from pydantic import BaseModel, Field
from typing import Optional


class SpeciesIdentificationRequest(BaseModel):
    image_url: Optional[str] = None


class SpeciesSearchRequest(BaseModel):
    query: str
    limit: int = Field(default=10, ge=1, le=50)


class RelatedSpecies(BaseModel):
    name: str
    scientific_name: str
    similarity: float


class TopMatch(BaseModel):
    species: str
    scientific_name: str
    confidence: float


class ImageIdentificationResponse(BaseModel):
    """Response from the vision-based image identification pipeline."""
    success: bool
    identified: bool
    verified: bool
    confidence_level: str  # "high" | "medium" | "low"
    confidence: float
    species_name: Optional[str] = None
    scientific_name: Optional[str] = None
    species_id: Optional[str] = None
    reasoning: Optional[str] = None
    image_quality: str
    top_matches: list[TopMatch]
    model_used: str
    inference_ms: float
    message: Optional[str] = None


class SpeciesIdentificationResponse(BaseModel):
    """Legacy response schema kept for internal pipeline compatibility."""
    species_name: str
    scientific_name: str
    confidence: float
    category: str
    conservation_status: str
    habitat: str
    diet: str
    lifespan: str
    ecosystem_role: str
    related_species: list[RelatedSpecies]
    predators: list[str]
    ai_summary: str
    scientific_summary: str
    conservation_insight: str
    image_url: Optional[str] = None
    processing_time_ms: float
    model_used: str
    fallback_used: bool = False


class SpeciesSearchResult(BaseModel):
    id: str
    common_name: str
    scientific_name: str
    iucn_status: str
    confidence: float
    thumbnail_url: Optional[str] = None


class IntelligenceRequest(BaseModel):
    species_name: str
    scientific_name: str
    dimension: str = Field(
        description="One of: evolution, anatomy, behavior, ecosystem, conservation"
    )
    context: Optional[str] = None


class IntelligenceResponse(BaseModel):
    dimension: str
    content: str
    confidence: float
    cached: bool = False


class EmbeddingRequest(BaseModel):
    text: str
    species_id: Optional[str] = None


class EmbeddingResponse(BaseModel):
    embedding: list[float]
    model: str
    dimensions: int


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict[str, str]
