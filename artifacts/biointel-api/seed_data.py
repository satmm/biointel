"""
Seed the BioIntel database with sample species data.
Run: cd artifacts/biointel-api && python3 seed_data.py
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "")

SEED_SPECIES = [
    {
        "id": "bengal-tiger",
        "common_name": "Bengal Tiger",
        "scientific_name": "Panthera tigris tigris",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": "Carnivora",
        "family": "Felidae",
        "genus": "Panthera",
        "iucn_status": "EN",
        "habitat": "Tropical Forest",
        "lifespan": "10–15 years",
        "diet": "Carnivore",
        "top_speed": "65 km/h",
        "population": "~3,900 wild",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/tiger/800/600",
        "thumbnail_url": "https://picsum.photos/seed/tiger/400/300",
    },
    {
        "id": "monarch-butterfly",
        "common_name": "Monarch Butterfly",
        "scientific_name": "Danaus plexippus",
        "kingdom": "Animalia",
        "phylum": "Arthropoda",
        "class": "Insecta",
        "order": "Lepidoptera",
        "family": "Nymphalidae",
        "genus": "Danaus",
        "iucn_status": "EN",
        "habitat": "Meadows, prairies",
        "lifespan": "2–6 weeks",
        "diet": "Herbivore",
        "top_speed": "30 km/h",
        "population": "~300M (migratory)",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/butterfly/800/600",
        "thumbnail_url": "https://picsum.photos/seed/butterfly/400/300",
    },
    {
        "id": "humpback-whale",
        "common_name": "Humpback Whale",
        "scientific_name": "Megaptera novaeangliae",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": "Artiodactyla",
        "family": "Balaenopteridae",
        "genus": "Megaptera",
        "iucn_status": "LC",
        "habitat": "Oceans worldwide",
        "lifespan": "45–100 years",
        "diet": "Filter feeder",
        "top_speed": "25 km/h",
        "population": "~80,000",
        "population_trend": "Increasing",
        "image_url": "https://picsum.photos/seed/whale/800/600",
        "thumbnail_url": "https://picsum.photos/seed/whale/400/300",
    },
    {
        "id": "venus-flytrap",
        "common_name": "Venus Flytrap",
        "scientific_name": "Dionaea muscipula",
        "kingdom": "Plantae",
        "phylum": "Tracheophyta",
        "class": "Magnoliopsida",
        "order": "Caryophyllales",
        "family": "Droseraceae",
        "genus": "Dionaea",
        "iucn_status": "VU",
        "habitat": "Subtropical wetlands",
        "lifespan": "20+ years",
        "diet": "Carnivorous",
        "top_speed": "N/A",
        "population": "~130,000 wild",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/flytrap/800/600",
        "thumbnail_url": "https://picsum.photos/seed/flytrap/400/300",
    },
    {
        "id": "emperor-penguin",
        "common_name": "Emperor Penguin",
        "scientific_name": "Aptenodytes forsteri",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Aves",
        "order": "Sphenisciformes",
        "family": "Spheniscidae",
        "genus": "Aptenodytes",
        "iucn_status": "NT",
        "habitat": "Antarctic ice sheets",
        "lifespan": "20 years",
        "diet": "Fish, squid, krill",
        "top_speed": "10 km/h (land)",
        "population": "~270,000–280,000",
        "population_trend": "Declining",
        "image_url": "https://picsum.photos/seed/penguin/800/600",
        "thumbnail_url": "https://picsum.photos/seed/penguin/400/300",
    },
    {
        "id": "komodo-dragon",
        "common_name": "Komodo Dragon",
        "scientific_name": "Varanus komodoensis",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Reptilia",
        "order": "Squamata",
        "family": "Varanidae",
        "genus": "Varanus",
        "iucn_status": "EN",
        "habitat": "Tropical savanna forest",
        "lifespan": "30 years",
        "diet": "Carnivore",
        "top_speed": "20 km/h",
        "population": "~1,400 wild",
        "population_trend": "Stable",
        "image_url": "https://picsum.photos/seed/komodo/800/600",
        "thumbnail_url": "https://picsum.photos/seed/komodo/400/300",
    },
]

ECOSYSTEM_RELATIONSHIPS = [
    ("bengal-tiger", "monarch-butterfly", "competition", 0.1),
]


async def seed():
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL not set. Cannot seed database.")
        return

    conn = await asyncpg.connect(DATABASE_URL)
    print(f"Connected to database. Seeding {len(SEED_SPECIES)} species...")

    for sp in SEED_SPECIES:
        await conn.execute(
            """
            INSERT INTO species (
                id, common_name, scientific_name, kingdom, phylum, class,
                "order", family, genus, iucn_status, habitat, lifespan, diet,
                top_speed, population, population_trend, image_url, thumbnail_url
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            ON CONFLICT (id) DO UPDATE SET
                common_name = EXCLUDED.common_name,
                iucn_status = EXCLUDED.iucn_status,
                updated_at = NOW()
            """,
            sp["id"], sp["common_name"], sp["scientific_name"],
            sp["kingdom"], sp["phylum"], sp["class"], sp["order"],
            sp["family"], sp["genus"], sp["iucn_status"], sp["habitat"],
            sp["lifespan"], sp["diet"], sp["top_speed"], sp["population"],
            sp["population_trend"], sp["image_url"], sp["thumbnail_url"],
        )
        print(f"  ✓ {sp['common_name']}")

    await conn.close()
    print("\nSeed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
