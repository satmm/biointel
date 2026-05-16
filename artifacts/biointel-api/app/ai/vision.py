"""
Groq Vision-based species identification.
Uses llama-3.2-11b-vision-preview to actually analyse the uploaded image.
Returns structured predictions with confidence scores and honest failure states.
"""

import base64
import json
import time
from groq import AsyncGroq
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

CONFIDENCE_HIGH = 0.75
CONFIDENCE_MEDIUM = 0.50

VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

SYSTEM_PROMPT = """\
You are an expert wildlife biologist and taxonomist with deep knowledge of all animal and plant species on Earth.
Your task is to identify species from images with scientific accuracy.
You must be honest about uncertainty — never fabricate identifications.
Always respond with valid JSON only, no markdown, no explanation outside the JSON."""

USER_PROMPT = """\
Analyse this species image carefully. Identify the organism shown.

Return a JSON object with EXACTLY these fields:
{
  "identified": true or false,
  "species_name": "Common Name" or null if unidentifiable,
  "scientific_name": "Genus species" or null,
  "confidence": 0.0 to 1.0 (your confidence in the PRIMARY identification),
  "reasoning": "brief 1-sentence explanation of what visual features led to this identification",
  "image_quality": "good", "poor", or "unclear",
  "top_matches": [
    {"species": "Name", "scientific_name": "Genus species", "confidence": 0.0},
    ...up to 5 matches ranked by confidence
  ]
}

Rules:
- If the image does not show a clearly identifiable living organism, set identified=false and confidence below 0.3
- If you can see an animal or plant but are unsure of exact species, still list your best guesses in top_matches with honest confidence values
- confidence must reflect your TRUE certainty — do not inflate scores
- top_matches must always be present (even if identified=false, list plausible possibilities)
- scientific_name must use proper binomial nomenclature
"""


async def identify_with_vision(image_bytes: bytes) -> dict:
    """
    Send image to Groq Vision for species identification.
    Returns a structured dict with predictions, confidence, and metadata.
    Raises ValueError for API/model errors so the route can handle them cleanly.
    """
    start = time.perf_counter()

    if not settings.groq_api_key:
        logger.error("No Groq API key configured for vision identification")
        raise ValueError("Vision identification requires a Groq API key.")

    # Encode image as base64
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    logger.info(
        "Sending image to Groq Vision",
        model=VISION_MODEL,
        image_size_kb=round(len(image_bytes) / 1024, 1),
        b64_size_kb=round(len(b64) / 1024, 1),
    )

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        response = await client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                        },
                        {"type": "text", "text": USER_PROMPT},
                    ],
                },
            ],
            max_tokens=600,
            temperature=0.1,
        )
    except Exception as exc:
        logger.error("Groq Vision API call failed", error=str(exc))
        raise ValueError(f"Vision model unavailable: {exc}") from exc

    elapsed = round((time.perf_counter() - start) * 1000, 1)
    raw_content = response.choices[0].message.content.strip()
    logger.info("Groq Vision response received", elapsed_ms=elapsed, raw_length=len(raw_content))
    logger.debug("Raw vision output", content=raw_content[:500])

    # Parse JSON — strip markdown code fences if present
    clean = raw_content
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip().rstrip("`").strip()

    try:
        data = json.loads(clean)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse vision JSON", raw=raw_content[:300], error=str(exc))
        raise ValueError(f"Vision model returned unparseable response: {exc}") from exc

    # Validate and normalise fields
    identified = bool(data.get("identified", False))
    species_name = data.get("species_name") or ""
    scientific_name = data.get("scientific_name") or ""
    confidence = float(data.get("confidence", 0.0))
    reasoning = data.get("reasoning", "")
    image_quality = data.get("image_quality", "unknown")
    top_matches_raw = data.get("top_matches", [])

    # Normalise top_matches
    top_matches = []
    for match in top_matches_raw[:5]:
        if isinstance(match, dict):
            top_matches.append({
                "species": match.get("species", "Unknown"),
                "scientific_name": match.get("scientific_name", ""),
                "confidence": float(match.get("confidence", 0.0)),
            })

    # Ensure primary prediction is first in top_matches if not already
    if identified and species_name and top_matches:
        first_slug = top_matches[0].get("species", "").lower().replace(" ", "")
        primary_slug = species_name.lower().replace(" ", "")
        if first_slug != primary_slug:
            top_matches.insert(0, {
                "species": species_name,
                "scientific_name": scientific_name,
                "confidence": confidence,
            })
            top_matches = top_matches[:5]

    # Derive confidence level
    if confidence >= CONFIDENCE_HIGH:
        confidence_level = "high"
    elif confidence >= CONFIDENCE_MEDIUM:
        confidence_level = "medium"
    else:
        confidence_level = "low"

    result = {
        "identified": identified and confidence >= CONFIDENCE_MEDIUM,
        "species_name": species_name if identified else None,
        "scientific_name": scientific_name if identified else None,
        "confidence": confidence,
        "confidence_level": confidence_level,
        "verified": confidence >= CONFIDENCE_HIGH,
        "reasoning": reasoning,
        "image_quality": image_quality,
        "top_matches": top_matches,
        "model_used": VISION_MODEL,
        "inference_ms": elapsed,
    }

    logger.info(
        "Vision identification complete",
        species=result["species_name"],
        confidence=confidence,
        confidence_level=confidence_level,
        verified=result["verified"],
        top_matches_count=len(top_matches),
        image_quality=image_quality,
        elapsed_ms=elapsed,
    )

    return result
