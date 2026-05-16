import re
import httpx
from html import unescape
from fastapi import APIRouter, HTTPException, status
from app.database.connection import get_pool
from app.ai.groq_client import generate_species_profile
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/species", tags=["Species"])

INAT_API = "https://api.inaturalist.org/v1"

MOCK_SPECIES = {
    "bengal-tiger": {
        "id": "bengal-tiger",
        "common_name": "Bengal Tiger",
        "scientific_name": "Panthera tigris tigris",
        "kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia",
        "order": "Carnivora", "family": "Felidae", "genus": "Panthera",
        "iucn_status": "EN", "habitat": "Tropical Forest", "lifespan": "10–15 years",
        "diet": "Carnivore", "top_speed": "65 km/h", "population": "~3,900 wild",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/tiger/800/600",
        "thumbnail_url": "https://picsum.photos/seed/tiger/400/300",
    },
    "monarch-butterfly": {
        "id": "monarch-butterfly",
        "common_name": "Monarch Butterfly",
        "scientific_name": "Danaus plexippus",
        "kingdom": "Animalia", "phylum": "Arthropoda", "class": "Insecta",
        "order": "Lepidoptera", "family": "Nymphalidae", "genus": "Danaus",
        "iucn_status": "EN", "habitat": "Meadows, prairies", "lifespan": "2–6 weeks",
        "diet": "Herbivore", "top_speed": "30 km/h", "population": "~300M (migratory)",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/butterfly/800/600",
        "thumbnail_url": "https://picsum.photos/seed/butterfly/400/300",
    },
    "humpback-whale": {
        "id": "humpback-whale",
        "common_name": "Humpback Whale",
        "scientific_name": "Megaptera novaeangliae",
        "kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia",
        "order": "Artiodactyla", "family": "Balaenopteridae", "genus": "Megaptera",
        "iucn_status": "LC", "habitat": "Oceans worldwide", "lifespan": "45–100 years",
        "diet": "Filter feeder", "top_speed": "25 km/h", "population": "~80,000",
        "population_trend": "Increasing",
        "image_url": "https://picsum.photos/seed/whale/800/600",
        "thumbnail_url": "https://picsum.photos/seed/whale/400/300",
    },
    "venus-flytrap": {
        "id": "venus-flytrap",
        "common_name": "Venus Flytrap",
        "scientific_name": "Dionaea muscipula",
        "kingdom": "Plantae", "phylum": "Tracheophyta", "class": "Magnoliopsida",
        "order": "Caryophyllales", "family": "Droseraceae", "genus": "Dionaea",
        "iucn_status": "VU", "habitat": "Subtropical wetlands", "lifespan": "20+ years",
        "diet": "Carnivorous", "top_speed": "N/A", "population": "~130,000 wild",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/flytrap/800/600",
        "thumbnail_url": "https://picsum.photos/seed/flytrap/400/300",
    },
    "emperor-penguin": {
        "id": "emperor-penguin",
        "common_name": "Emperor Penguin",
        "scientific_name": "Aptenodytes forsteri",
        "kingdom": "Animalia", "phylum": "Chordata", "class": "Aves",
        "order": "Sphenisciformes", "family": "Spheniscidae", "genus": "Aptenodytes",
        "iucn_status": "NT", "habitat": "Antarctic ice sheets", "lifespan": "20 years",
        "diet": "Fish, squid, krill", "top_speed": "10 km/h (land), 24 km/h (swim)",
        "population": "~270,000–280,000", "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/penguin/800/600",
        "thumbnail_url": "https://picsum.photos/seed/penguin/400/300",
    },
    "komodo-dragon": {
        "id": "komodo-dragon",
        "common_name": "Komodo Dragon",
        "scientific_name": "Varanus komodoensis",
        "kingdom": "Animalia", "phylum": "Chordata", "class": "Reptilia",
        "order": "Squamata", "family": "Varanidae", "genus": "Varanus",
        "iucn_status": "EN", "habitat": "Tropical savanna forest", "lifespan": "30 years",
        "diet": "Carnivore", "top_speed": "20 km/h", "population": "~1,400 wild",
        "population_trend": "Stable",
        "image_url": "https://picsum.photos/seed/komodo/800/600",
        "thumbnail_url": "https://picsum.photos/seed/komodo/400/300",
    },
}


def _to_slug(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


def _strip_html(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", unescape(value))).strip()


def _first_available(*values: str | None, default: str = "Unknown") -> str:
    for value in values:
        if value and value.strip() and value.strip().lower() != "unknown":
            return value.strip()
    return default


def _taxonomy_from_ancestors(ancestors: list[dict], scientific_name: str) -> dict[str, str]:
    taxonomy = {rank: "" for rank in ("kingdom", "phylum", "class", "order", "family", "genus")}
    for ancestor in ancestors:
        rank = ancestor.get("rank")
        if rank in taxonomy:
            taxonomy[rank] = ancestor.get("name", "")

    # iNaturalist puts the current taxon outside ancestors. For species/subspecies,
    # the genus is reliably the first scientific-name token when no genus ancestor is present.
    if not taxonomy["genus"] and scientific_name:
        taxonomy["genus"] = scientific_name.split()[0]

    return taxonomy


def _profile_fallback(common: str, scientific: str, iucn: str, inat_data: dict | None) -> dict[str, str]:
    """Build useful non-AI facts from iNaturalist metadata and the species summary."""
    summary = _strip_html(inat_data.get("summary") if inat_data else "")
    text = f"{common} {scientific} {summary}".lower()
    taxonomy = inat_data.get("taxonomy", {}) if inat_data else {}

    habitat = "Unknown"
    if any(term in text for term in ("grassland", "savanna", "savannah", "woodland")):
        habitat = "Grasslands, savannas, and open woodlands"
    elif any(term in text for term in ("forest", "rainforest", "woodland")):
        habitat = "Forests and woodlands"
    elif any(term in text for term in ("ocean", "marine", "coastal", "reef")):
        habitat = "Marine and coastal waters"
    elif any(term in text for term in ("wetland", "marsh", "swamp")):
        habitat = "Wetlands"

    diet = "Unknown"
    if any(term in text for term in ("grazer", "grazing", "grass")):
        diet = "Herbivore; primarily grasses"
    elif any(term in text for term in ("herbivore", "leaves", "browse", "plants")):
        diet = "Herbivore"
    elif any(term in text for term in ("carnivore", "predator", "prey")):
        diet = "Carnivore"
    elif any(term in text for term in ("omnivore", "omnivorous")):
        diet = "Omnivore"

    population = "Unknown"
    if "northern white rhinoceros" in text:
        population = "2 living individuals"
    elif match := re.search(r"(?:only|about|around|approximately|estimated)\s+([\w,.-]+)\s+(?:individuals|remain|left)", text):
        population = match.group(1).capitalize()

    trend = "Declining" if iucn in {"CR", "EN", "VU", "NT"} else "Unknown"

    top_speed = "Unknown"
    lifespan = "Unknown"
    if "rhinoceros" in text or "rhino" in text:
        top_speed = "Up to 40-50 km/h"
        lifespan = "40-50 years"

    return {
        "kingdom": taxonomy.get("kingdom") or "Animalia",
        "phylum": taxonomy.get("phylum") or "Chordata",
        "class": taxonomy.get("class") or "Unknown",
        "order": taxonomy.get("order") or "Unknown",
        "family": taxonomy.get("family") or "Unknown",
        "genus": taxonomy.get("genus") or (scientific.split()[0] if scientific else "Unknown"),
        "scientific_name": scientific,
        "habitat": habitat,
        "lifespan": lifespan,
        "diet": diet,
        "top_speed": top_speed,
        "population": population,
        "population_trend": trend,
    }


async def _fetch_from_inaturalist(species_id: str) -> dict | None:
    """Try to find species info from iNaturalist by slug-matching the name."""
    query = species_id.replace("-", " ")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{INAT_API}/taxa/autocomplete",
                params={"q": query, "per_page": 5, "rank": "species,subspecies"},
            )
            resp.raise_for_status()
            data = resp.json()
            for taxon in data.get("results", []):
                scientific = taxon.get("name", "")
                common = taxon.get("preferred_common_name") or taxon.get("english_common_name") or scientific
                if not scientific:
                    continue
                slug = _to_slug(common or scientific)
                if slug == species_id or _to_slug(scientific) == species_id:
                    conservation = taxon.get("conservation_status", {})
                    iucn = "DD"
                    if isinstance(conservation, dict):
                        s = conservation.get("status_name", "")
                        for code in ("CR", "EN", "VU", "NT", "LC", "EX", "EW", "DD"):
                            if code.lower() in s.lower():
                                iucn = code
                                break
                    default_photo = taxon.get("default_photo")
                    thumb = None
                    if default_photo:
                        thumb = default_photo.get("medium_url") or default_photo.get("square_url")
                    image = thumb.replace("square", "medium") if thumb else f"https://picsum.photos/seed/{species_id}/800/600"
                    detail = {}
                    try:
                        detail_resp = await client.get(f"{INAT_API}/taxa/{taxon.get('id')}")
                        detail_resp.raise_for_status()
                        detail_results = detail_resp.json().get("results", [])
                        detail = detail_results[0] if detail_results else {}
                    except Exception as exc:
                        logger.warning("iNaturalist taxon detail lookup failed", species_id=species_id, error=str(exc))

                    ancestors = detail.get("ancestors") or []
                    taxonomy = _taxonomy_from_ancestors(ancestors, scientific)
                    return {
                        "inat_id": taxon.get("id"),
                        "common_name": common,
                        "scientific_name": scientific,
                        "iucn_status": iucn,
                        "image_url": image,
                        "thumbnail_url": thumb or f"https://picsum.photos/seed/{species_id}/400/300",
                        "taxonomy": taxonomy,
                        "summary": detail.get("wikipedia_summary", ""),
                        "wikipedia_url": detail.get("wikipedia_url") or taxon.get("wikipedia_url"),
                    }
    except Exception as exc:
        logger.warning("iNaturalist lookup failed", species_id=species_id, error=str(exc))
    return None


async def _generate_species_from_groq(species_id: str, inat_data: dict | None) -> dict:
    """Generate full species profile via Groq for any species not in mock DB."""
    common = inat_data["common_name"] if inat_data else species_id.replace("-", " ").title()
    scientific = inat_data["scientific_name"] if inat_data else ""
    iucn = inat_data["iucn_status"] if inat_data else "DD"
    image_url = inat_data["image_url"] if inat_data else f"https://picsum.photos/seed/{species_id}/800/600"
    thumb_url = inat_data["thumbnail_url"] if inat_data else f"https://picsum.photos/seed/{species_id}/400/300"

    logger.info("Generating dynamic species profile via Groq", species=common)
    fallback = _profile_fallback(common, scientific, iucn, inat_data)
    generated = await generate_species_profile(common, scientific)
    profile = {**fallback, **{k: v for k, v in generated.items() if v and str(v).lower() != "unknown"}}

    return {
        "id": species_id,
        "common_name": common,
        "scientific_name": _first_available(scientific, profile.get("scientific_name"), default=""),
        "kingdom": profile.get("kingdom", "Animalia"),
        "phylum": profile.get("phylum", "Chordata"),
        "class": profile.get("class", "Unknown"),
        "order": profile.get("order", "Unknown"),
        "family": profile.get("family", "Unknown"),
        "genus": profile.get("genus", "Unknown"),
        "iucn_status": iucn,
        "habitat": profile.get("habitat", "Unknown"),
        "lifespan": profile.get("lifespan", "Unknown"),
        "diet": profile.get("diet", "Unknown"),
        "top_speed": profile.get("top_speed", "Unknown"),
        "population": profile.get("population", "Unknown"),
        "population_trend": profile.get("population_trend", "Unknown"),
        "image_url": image_url,
        "thumbnail_url": thumb_url,
    }


@router.get("", response_model=list[dict], summary="List all species in the database")
async def list_species(limit: int = 20, offset: int = 0):
    pool = await get_pool()
    if pool:
        try:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT * FROM species ORDER BY common_name LIMIT $1 OFFSET $2",
                    limit, offset,
                )
                if rows:
                    return [dict(r) for r in rows]
        except Exception as exc:
            logger.error("DB list_species failed", error=str(exc))

    items = list(MOCK_SPECIES.values())
    return items[offset: offset + limit]


@router.get("/{species_id}", response_model=dict, summary="Get species by ID")
async def get_species(species_id: str):
    pool = await get_pool()
    if pool:
        try:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("SELECT * FROM species WHERE id = $1", species_id)
                if row:
                    return dict(row)
        except Exception as exc:
            logger.error("DB get_species failed", error=str(exc))

    if species_id in MOCK_SPECIES:
        return MOCK_SPECIES[species_id]

    inat_data = await _fetch_from_inaturalist(species_id)
    profile = await _generate_species_from_groq(species_id, inat_data)
    return profile


@router.get("/{species_id}/ecosystem", response_model=dict, summary="Get ecosystem graph for a species")
async def get_ecosystem(species_id: str):
    species = MOCK_SPECIES.get(species_id)
    focal = species["common_name"] if species else species_id.replace("-", " ").title()

    nodes = [
        {"id": focal, "group": "focal", "val": 20},
        {"id": "Primary Prey", "group": "prey", "val": 14},
        {"id": "Secondary Prey", "group": "prey", "val": 11},
        {"id": "Sympatric Predator", "group": "competitor", "val": 13},
        {"id": "Scavenger", "group": "scavenger", "val": 8},
        {"id": "Primary Habitat", "group": "habitat", "val": 6},
        {"id": "Secondary Habitat", "group": "habitat", "val": 5},
    ]
    links = [
        {"source": focal, "target": "Primary Prey", "type": "predation"},
        {"source": focal, "target": "Secondary Prey", "type": "predation"},
        {"source": focal, "target": "Sympatric Predator", "type": "competition"},
        {"source": "Scavenger", "target": focal, "type": "scavenging"},
        {"source": focal, "target": "Primary Habitat", "type": "habitat"},
        {"source": "Primary Prey", "target": "Secondary Habitat", "type": "habitat"},
    ]

    if species_id == "bengal-tiger":
        nodes = [
            {"id": "Bengal Tiger", "group": "focal", "val": 20},
            {"id": "Chital Deer", "group": "prey", "val": 14},
            {"id": "Sambar Deer", "group": "prey", "val": 14},
            {"id": "Wild Boar", "group": "prey", "val": 12},
            {"id": "Gaur", "group": "prey", "val": 10},
            {"id": "Leopard", "group": "competitor", "val": 13},
            {"id": "Dhole", "group": "competitor", "val": 10},
            {"id": "Vulture", "group": "scavenger", "val": 8},
            {"id": "Jackal", "group": "scavenger", "val": 7},
            {"id": "Tropical Forest", "group": "habitat", "val": 6},
            {"id": "Grassland", "group": "habitat", "val": 5},
        ]
        links = [
            {"source": "Bengal Tiger", "target": "Chital Deer", "type": "predation"},
            {"source": "Bengal Tiger", "target": "Sambar Deer", "type": "predation"},
            {"source": "Bengal Tiger", "target": "Wild Boar", "type": "predation"},
            {"source": "Bengal Tiger", "target": "Gaur", "type": "predation"},
            {"source": "Bengal Tiger", "target": "Leopard", "type": "competition"},
            {"source": "Bengal Tiger", "target": "Dhole", "type": "competition"},
            {"source": "Vulture", "target": "Bengal Tiger", "type": "scavenging"},
            {"source": "Jackal", "target": "Bengal Tiger", "type": "scavenging"},
            {"source": "Bengal Tiger", "target": "Tropical Forest", "type": "habitat"},
            {"source": "Chital Deer", "target": "Grassland", "type": "habitat"},
        ]

    return {"nodes": nodes, "links": links, "species_id": species_id}


@router.get("/{species_id}/population", response_model=list[dict], summary="Get population trend data")
async def get_population_trend(species_id: str):
    if species_id == "bengal-tiger":
        return [
            {"year": 1900, "population": 100000},
            {"year": 1920, "population": 60000},
            {"year": 1940, "population": 30000},
            {"year": 1960, "population": 15000},
            {"year": 1980, "population": 7000},
            {"year": 2000, "population": 4000},
            {"year": 2010, "population": 3200},
            {"year": 2020, "population": 3900},
            {"year": 2024, "population": 3900},
        ]
    if species_id == "humpback-whale":
        return [
            {"year": 1900, "population": 125000},
            {"year": 1940, "population": 35000},
            {"year": 1965, "population": 10000},
            {"year": 1986, "population": 12000},
            {"year": 2000, "population": 30000},
            {"year": 2010, "population": 55000},
            {"year": 2020, "population": 80000},
            {"year": 2024, "population": 84000},
        ]
    return [{"year": 2024, "population": 0, "note": "Population data not available for this species"}]
