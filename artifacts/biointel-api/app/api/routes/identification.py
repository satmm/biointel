import re
import time
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.ai.vision import identify_with_vision
from app.services.identification_service import search_species_by_name
from app.utils.image import validate_image, preprocess_image, extract_image_metadata
from app.schemas.species import ImageIdentificationResponse, TopMatch, SpeciesSearchResult
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/identify", tags=["Species Identification"])


def _to_slug(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


@router.post(
    "/upload",
    response_model=ImageIdentificationResponse,
    summary="Identify species from uploaded image using Groq Vision AI",
    description=(
        "Uploads an image to Groq's llama-4-scout vision model for real species identification. "
        "Returns confidence-gated results: verified (>75%), uncertain (50-75%), or failed (<50%). "
        "No fake/hallucinated data is returned for uncertain or failed identifications."
    ),
)
async def identify_species_from_upload(
    file: UploadFile = File(..., description="Species image (JPEG, PNG, WEBP, max 10MB)"),
):
    start = time.perf_counter()

    if not file.content_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing content type")

    image_bytes = await file.read()

    # Validate
    try:
        validate_image(image_bytes, file.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    metadata = extract_image_metadata(image_bytes)
    logger.info(
        "Image received for vision identification",
        filename=file.filename,
        content_type=file.content_type,
        **metadata,
    )

    # Preprocess
    processed_bytes = preprocess_image(image_bytes)
    logger.info(
        "Image preprocessed",
        original_kb=round(len(image_bytes) / 1024, 1),
        processed_kb=round(len(processed_bytes) / 1024, 1),
    )

    # Run Groq Vision
    try:
        vision_result = await identify_with_vision(processed_bytes)
    except ValueError as exc:
        logger.error("Vision identification failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )

    elapsed_total = round((time.perf_counter() - start) * 1000, 1)
    confidence = vision_result["confidence"]
    confidence_level = vision_result["confidence_level"]
    identified = vision_result["identified"]
    verified = vision_result["verified"]
    species_name = vision_result.get("species_name")
    scientific_name = vision_result.get("scientific_name") or ""

    # Build top_matches list
    top_matches = [
        TopMatch(
            species=m["species"],
            scientific_name=m.get("scientific_name", ""),
            confidence=round(m["confidence"], 3),
        )
        for m in vision_result.get("top_matches", [])
    ]

    # Derive species_id slug for frontend routing
    species_id = _to_slug(species_name) if species_name else None

    # Build user-facing message
    if verified:
        message = None  # Frontend navigates directly
    elif identified:
        message = (
            f"Possible match: {species_name}. "
            "Confidence is moderate — please confirm by selecting from the options below."
        )
    elif vision_result.get("image_quality") in ("poor", "unclear"):
        message = "Image quality is too low for reliable identification. Please upload a clearer photo."
    else:
        message = (
            "Unable to confidently identify the species in this image. "
            "Please upload a clearer photo or try searching by name instead."
        )

    logger.info(
        "Identification response ready",
        success=identified,
        verified=verified,
        confidence_level=confidence_level,
        confidence=confidence,
        species=species_name,
        species_id=species_id,
        top_matches_count=len(top_matches),
        image_quality=vision_result.get("image_quality"),
        total_elapsed_ms=elapsed_total,
    )

    return ImageIdentificationResponse(
        success=identified,
        identified=identified,
        verified=verified,
        confidence_level=confidence_level,
        confidence=round(confidence, 3),
        species_name=species_name,
        scientific_name=scientific_name if scientific_name else None,
        species_id=species_id,
        reasoning=vision_result.get("reasoning"),
        image_quality=vision_result.get("image_quality", "unknown"),
        top_matches=top_matches,
        model_used=vision_result.get("model_used", "groq-vision"),
        inference_ms=vision_result.get("inference_ms", elapsed_total),
        message=message,
    )


@router.get(
    "/search",
    response_model=list[SpeciesSearchResult],
    summary="Search species by name",
    description="Full-text search via iNaturalist API. Not modified.",
)
async def search_species(q: str, limit: int = 10):
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must be at least 2 characters",
        )
    results = await search_species_by_name(q.strip(), limit=min(limit, 50))
    return [SpeciesSearchResult(**r) for r in results]
