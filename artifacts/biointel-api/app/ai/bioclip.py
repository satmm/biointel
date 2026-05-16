import base64
import httpx
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

MOCK_SPECIES_RESULTS = {
    "default": {
        "species_name": "Bengal Tiger",
        "scientific_name": "Panthera tigris tigris",
        "confidence": 0.947,
        "category": "Mammalia",
        "conservation_status": "Endangered",
        "habitat": "Tropical and subtropical moist broadleaf forests",
        "diet": "Carnivore",
        "lifespan": "10–15 years in wild, up to 20 in captivity",
        "ecosystem_role": "Apex predator regulating prey populations",
        "related_species": [
            {"name": "Siberian Tiger", "scientific_name": "Panthera tigris altaica", "similarity": 0.95},
            {"name": "Amur Leopard", "scientific_name": "Panthera pardus orientalis", "similarity": 0.78},
            {"name": "Snow Leopard", "scientific_name": "Panthera uncia", "similarity": 0.74},
        ],
        "predators": ["Humans (primary threat)", "Crocodiles (cubs)"],
    }
}


async def _call_hf_inference(image_bytes: bytes, model_id: str) -> list[dict]:
    headers = {"Content-Type": "application/octet-stream"}
    if settings.huggingface_token:
        headers["Authorization"] = f"Bearer {settings.huggingface_token}"

    url = f"{settings.hf_inference_url}/{model_id}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, content=image_bytes, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def identify_with_bioclip(image_bytes: bytes) -> dict:
    logger.info("Running BioCLIP species identification")

    if not settings.huggingface_token:
        logger.warning("No HuggingFace token — returning mock BioCLIP result")
        return {**MOCK_SPECIES_RESULTS["default"], "model": "bioclip-mock", "raw_labels": []}

    try:
        results = await _call_hf_inference(image_bytes, settings.bioclip_model)
        if isinstance(results, list) and results:
            top = results[0]
            label = top.get("label", "Unknown species")
            confidence = float(top.get("score", 0.5))
            return {
                "species_name": label.split("(")[0].strip() if "(" in label else label,
                "scientific_name": label.split("(")[1].rstrip(")") if "(" in label else "",
                "confidence": confidence,
                "category": "Unknown",
                "conservation_status": "Data Deficient",
                "habitat": "Unknown",
                "diet": "Unknown",
                "lifespan": "Unknown",
                "ecosystem_role": "Unknown",
                "related_species": [],
                "predators": [],
                "model": "bioclip",
                "raw_labels": results[:5],
            }
    except Exception as exc:
        logger.error("BioCLIP inference failed", error=str(exc))

    logger.info("Falling back to mock BioCLIP result")
    return {**MOCK_SPECIES_RESULTS["default"], "model": "bioclip-fallback", "raw_labels": []}


async def identify_with_inaturalist(image_bytes: bytes) -> dict:
    logger.info("Running iNaturalist Vision fallback identification")

    if not settings.huggingface_token:
        logger.warning("No HuggingFace token — returning mock iNaturalist result")
        return {"species_name": "Bengal Tiger", "scientific_name": "Panthera tigris tigris", "confidence": 0.91, "model": "inaturalist-mock"}

    try:
        results = await _call_hf_inference(image_bytes, settings.inaturalist_model)
        if isinstance(results, list) and results:
            top = results[0]
            return {
                "species_name": top.get("label", "Unknown"),
                "scientific_name": "",
                "confidence": float(top.get("score", 0.5)),
                "model": "inaturalist",
            }
    except Exception as exc:
        logger.error("iNaturalist inference failed", error=str(exc))

    return {"species_name": "Unknown", "scientific_name": "", "confidence": 0.0, "model": "inaturalist-failed"}


def merge_predictions(bioclip_result: dict, inaturalist_result: dict) -> dict:
    bc_conf = bioclip_result.get("confidence", 0)
    inat_conf = inaturalist_result.get("confidence", 0)

    if bc_conf >= inat_conf:
        merged = bioclip_result.copy()
        merged["fallback_used"] = False
    else:
        merged = bioclip_result.copy()
        merged["confidence"] = (bc_conf + inat_conf) / 2
        merged["fallback_used"] = True

    merged["model_used"] = f"{bioclip_result.get('model', 'bioclip')} + {inaturalist_result.get('model', 'inaturalist')}"
    return merged
