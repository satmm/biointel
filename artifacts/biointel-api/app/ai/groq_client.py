from groq import AsyncGroq
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

MOCK_SUMMARIES = {
    "beginner": (
        "The Bengal Tiger is one of the world's most iconic big cats, instantly recognizable by its striking "
        "orange coat with black stripes. Found primarily in India's forests, this powerful predator is the "
        "apex hunter of its ecosystem — meaning no other animal naturally hunts it. Unfortunately, fewer than "
        "3,900 Bengal Tigers remain in the wild today, making them an endangered species. Their survival is "
        "threatened by habitat loss, poaching, and conflict with humans. Conservation efforts like Project "
        "Tiger have helped stabilize populations, but much work remains to secure their future."
    ),
    "scientific": (
        "Panthera tigris tigris (Bengal Tiger) is the nominotypical subspecies of Panthera tigris, classified "
        "within the family Felidae, order Carnivora. Phylogenetically, the Panthera lineage diverged from "
        "other felid genera approximately 10.8 million years ago, with the Bengal subspecies diverging from "
        "Siberian populations ~72,000 years ago during Pleistocene glaciation events. Morphologically, "
        "adult males attain body masses of 180–258 kg with a head-body length of 270–310 cm. The species "
        "exhibits solitary, territorial behavior with home range sizes of 60–100 km² for males. "
        "Reproductive parameters include a 93–110 day gestation and litter sizes of 2–4 cubs, "
        "with inter-birth intervals of 2–2.5 years."
    ),
    "conservation": (
        "Listed as Endangered (EN) on the IUCN Red List (2022 Assessment), the Bengal Tiger has experienced "
        "a 93% population decline since 1900, from an estimated 100,000 individuals to approximately 3,900 "
        "today. Primary drivers of decline include habitat fragmentation (85% impact severity), illegal "
        "trade and poaching (70%), human-wildlife conflict (55%), and prey base depletion (45%). "
        "India's Project Tiger, launched in 1973, established 54 tiger reserves covering 75,000 km². "
        "Recent population surveys indicate a modest recovery trend (+6% from 2018–2022), suggesting "
        "that coordinated conservation investment yields measurable results. Climate projections indicate "
        "that the Sundarbans mangrove habitat — home to ~100 tigers — faces 70% inundation risk "
        "under RCP 8.5 scenarios by 2070."
    ),
}


async def generate_summaries(
    species_name: str,
    scientific_name: str,
    species_data: dict,
) -> dict[str, str]:
    logger.info("Generating AI summaries", species=species_name)

    if not settings.groq_api_key:
        logger.warning("No Groq API key — returning mock summaries")
        return MOCK_SUMMARIES

    client = AsyncGroq(api_key=settings.groq_api_key)
    context = (
        f"Species: {species_name} ({scientific_name})\n"
        f"Conservation Status: {species_data.get('conservation_status', 'Unknown')}\n"
        f"Habitat: {species_data.get('habitat', 'Unknown')}\n"
        f"Diet: {species_data.get('diet', 'Unknown')}\n"
        f"Lifespan: {species_data.get('lifespan', 'Unknown')}\n"
        f"Ecosystem Role: {species_data.get('ecosystem_role', 'Unknown')}\n"
    )

    prompts = {
        "beginner": (
            f"Write a 3-sentence beginner-friendly explanation of the {species_name} ({scientific_name}). "
            f"Describe what makes it remarkable, its conservation status, and why it matters. "
            f"Use clear, engaging language suitable for a general audience. Context:\n{context}"
        ),
        "scientific": (
            f"Write a 4-sentence scientifically rigorous summary of {scientific_name}. "
            f"Include taxonomy, phylogenetics, key morphological traits, and behavioral ecology. "
            f"Use precise scientific terminology. Context:\n{context}"
        ),
        "conservation": (
            f"Write a 4-sentence conservation assessment for {species_name} ({scientific_name}). "
            f"Cover IUCN status, population trends, primary threat drivers, and ongoing conservation efforts. "
            f"Include quantitative data where possible. Context:\n{context}"
        ),
    }

    results: dict[str, str] = {}
    for key, prompt in prompts.items():
        try:
            response = await client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a world-class wildlife biologist and science communicator. Provide accurate, compelling species intelligence.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=350,
                temperature=0.4,
            )
            results[key] = response.choices[0].message.content.strip()
        except Exception as exc:
            logger.error("Groq summary generation failed", key=key, error=str(exc))
            results[key] = MOCK_SUMMARIES.get(key, "Summary unavailable.")

    return results


async def generate_species_profile(
    species_name: str,
    scientific_name: str,
) -> dict:
    """Generate structured species profile data via Groq for any species."""
    logger.info("Generating dynamic species profile", species=species_name)

    if not settings.groq_api_key:
        return {}

    prompt = (
        f"Return a JSON object with biological facts about {species_name}"
        + (f" ({scientific_name})" if scientific_name else "")
        + ". Include these exact keys: "
        "kingdom, phylum, class, order, family, genus, scientific_name, "
        "habitat, lifespan, diet, top_speed, population, population_trend. "
        "population_trend must be one of: Increasing, Stable, Declining, Unknown. "
        "Return ONLY the JSON object, no explanation, no markdown."
    )

    try:
        client = AsyncGroq(api_key=settings.groq_api_key)
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": "You are a wildlife biologist. Return only valid JSON with no markdown."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=300,
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as exc:
        logger.error("Groq species profile generation failed", species=species_name, error=str(exc))
        return {}


async def generate_intelligence_dimension(
    species_name: str,
    scientific_name: str,
    dimension: str,
    context: str = "",
) -> str:
    logger.info("Generating intelligence dimension", species=species_name, dimension=dimension)

    dimension_prompts = {
        "evolution": (
            f"Return a JSON object with evolutionary analysis of {species_name} ({scientific_name}). "
            "Use EXACTLY this structure with no extra keys: "
            '{"quick_facts": ['
            '{"label": "Family", "value": "..."}, '
            '{"label": "Order", "value": "..."}, '
            '{"label": "Divergence", "value": "~X million years ago"}, '
            '{"label": "Closest Relative", "value": "common name"}, '
            '{"label": "Native Region", "value": "..."}, '
            '{"label": "Key Adaptation", "value": "3-5 word phrase"}], '
            '"summary": "2-3 sentences covering evolutionary history, origin, and significance. Plain language.", '
            '"adaptations": [{"title": "2-3 word title", "description": "1 concise sentence"}, '
            '{"title": "...", "description": "..."}, {"title": "...", "description": "..."}], '
            '"phylogenetic_position": "1 sentence describing exact phylogenetic placement within the tree of life."}'
        ),
        "anatomy": (
            f"Describe the morphological and anatomical features of {species_name} ({scientific_name}). "
            f"Cover key adaptive traits, physiological specializations, and biomechanical adaptations. "
            f"150–200 words."
        ),
        "behavior": (
            f"Analyze the behavioral ecology of {species_name} ({scientific_name}). "
            f"Cover foraging strategy, territorial behavior, social structure, and reproductive behavior. "
            f"150–200 words."
        ),
        "ecosystem": (
            f"Explain the ecosystem role of {species_name} ({scientific_name}). "
            f"Cover trophic position, keystone species status, predator-prey dynamics, and trophic cascade effects. "
            f"150–200 words."
        ),
        "conservation": (
            f"Provide a conservation intelligence report for {species_name} ({scientific_name}). "
            f"Cover IUCN status, population trends, threat drivers, conservation actions, and future outlook. "
            f"150–200 words."
        ),
    }

    prompt = dimension_prompts.get(dimension, f"Provide biological intelligence about {species_name} ({scientific_name}).")
    if context:
        prompt += f"\n\nAdditional context: {context}"

    if not settings.groq_api_key:
        return f"AI-generated {dimension} intelligence for {species_name}. Connect your Groq API key to enable real-time generation."

    # Evolution returns structured JSON; all other dimensions return plain prose
    use_json = dimension == "evolution"

    try:
        client = AsyncGroq(api_key=settings.groq_api_key)
        kwargs: dict = dict(
            model=settings.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a research-grade wildlife biologist. "
                        + ("Return ONLY valid JSON, no markdown, no extra text." if use_json
                           else "Produce structured biological intelligence for a scientific platform.")
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=450,
            temperature=0.2,
        )
        if use_json:
            kwargs["response_format"] = {"type": "json_object"}

        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.error("Groq dimension generation failed", dimension=dimension, error=str(exc))
        return f"Intelligence generation temporarily unavailable. Error: {str(exc)[:100]}"
