import re
import time
import httpx
from app.ai.bioclip import identify_with_bioclip, identify_with_inaturalist, merge_predictions
from app.ai.groq_client import generate_summaries
from app.schemas.species import SpeciesIdentificationResponse, RelatedSpecies
from app.core.logging import get_logger

logger = get_logger(__name__)

IUCN_CODES = {
    "Extinct": "EX", "Extinct in the Wild": "EW",
    "Critically Endangered": "CR", "Endangered": "EN",
    "Vulnerable": "VU", "Near Threatened": "NT",
    "Least Concern": "LC", "Data Deficient": "DD",
}

INAT_API = "https://api.inaturalist.org/v1"


def _to_slug(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


def _inat_conservation_code(status: str | None) -> str:
    if not status:
        return "DD"
    upper = status.upper()
    for code in ("EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD"):
        if code in upper:
            return code
    return "DD"


async def search_species_by_name(query: str, limit: int = 10) -> list[dict]:
    logger.info("Searching species by name via iNaturalist", query=query, limit=limit)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{INAT_API}/taxa/autocomplete",
                params={"q": query, "per_page": limit, "rank": "species,subspecies"},
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for taxon in data.get("results", []):
                common = taxon.get("preferred_common_name") or taxon.get("english_common_name") or taxon.get("name", "")
                scientific = taxon.get("name", "")
                if not scientific:
                    continue
                conservation = taxon.get("conservation_status", {})
                iucn = _inat_conservation_code(
                    conservation.get("status_name") if isinstance(conservation, dict) else None
                )
                taxon_id = taxon.get("id", "")
                slug = _to_slug(common or scientific)
                thumb = None
                default_photo = taxon.get("default_photo")
                if default_photo:
                    thumb = default_photo.get("square_url") or default_photo.get("medium_url")
                results.append({
                    "id": slug,
                    "common_name": common or scientific,
                    "scientific_name": scientific,
                    "iucn_status": iucn,
                    "confidence": 1.0,
                    "thumbnail_url": thumb or f"https://picsum.photos/seed/{slug}/400/300",
                    "_taxon_id": taxon_id,
                })
            if results:
                return results[:limit]
    except Exception as exc:
        logger.warning("iNaturalist search failed, using fallback", error=str(exc))

    return []


async def run_identification_pipeline(image_bytes: bytes) -> SpeciesIdentificationResponse:
    start = time.perf_counter()
    logger.info("Starting identification pipeline", image_size_kb=round(len(image_bytes) / 1024, 1))

    bioclip_result, inaturalist_result = await _run_parallel_inference(image_bytes)
    merged = merge_predictions(bioclip_result, inaturalist_result)

    summaries = await generate_summaries(
        merged["species_name"],
        merged["scientific_name"],
        merged,
    )

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info("Identification pipeline complete", elapsed_ms=round(elapsed_ms, 1))

    related = [RelatedSpecies(**r) for r in merged.get("related_species", [])]

    return SpeciesIdentificationResponse(
        species_name=merged["species_name"],
        scientific_name=merged["scientific_name"],
        confidence=merged["confidence"],
        category=merged.get("category", "Unknown"),
        conservation_status=merged.get("conservation_status", "Data Deficient"),
        habitat=merged.get("habitat", "Unknown"),
        diet=merged.get("diet", "Unknown"),
        lifespan=merged.get("lifespan", "Unknown"),
        ecosystem_role=merged.get("ecosystem_role", "Unknown"),
        related_species=related,
        predators=merged.get("predators", []),
        ai_summary=summaries.get("beginner", ""),
        scientific_summary=summaries.get("scientific", ""),
        conservation_insight=summaries.get("conservation", ""),
        processing_time_ms=round(elapsed_ms, 1),
        model_used=merged.get("model_used", "bioclip"),
        fallback_used=merged.get("fallback_used", False),
    )


async def _run_parallel_inference(image_bytes: bytes) -> tuple[dict, dict]:
    import asyncio
    bioclip_task = asyncio.create_task(identify_with_bioclip(image_bytes))
    inaturalist_task = asyncio.create_task(identify_with_inaturalist(image_bytes))
    bioclip_result, inaturalist_result = await asyncio.gather(bioclip_task, inaturalist_task)
    return bioclip_result, inaturalist_result
