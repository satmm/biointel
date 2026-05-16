Below is a Google Docs-ready report you can copy paste.

# BioIntel Project Architecture Report

## 1. Project Overview

BioIntel is an AI-powered Species Intelligence and Research Platform. The system allows users to either upload an image of a species or search for a species by name. After identification or selection, the platform generates a complete biological intelligence profile that includes taxonomy, habitat, lifespan, diet, conservation status, population trend, ecosystem role, evolution, anatomy, behavior, research papers, and downloadable PDF reports.

The project is built as a full-stack application with:

Frontend: React, Vite, TypeScript, Tailwind CSS  
Backend: FastAPI, Python, Pydantic  
AI/ML Providers: Groq, HuggingFace, iNaturalist  
Report Generation: jsPDF  
Optional Database Layer: PostgreSQL, pgvector, asyncpg

The application is designed to work even if some AI responses are incomplete. It uses fallback data from iNaturalist and internal fallback logic to prevent blank or unknown species profiles.

---

# 2. High-Level Architecture

The application has three main layers:

## 2.1 Frontend Layer

Location:

```text
artifacts/biointel
```

Responsibilities:

- Provides user interface.
- Handles image upload.
- Handles species name search.
- Displays species profile.
- Calls backend APIs.
- Shows AI-generated intelligence tabs.
- Generates downloadable PDF reports in the browser.

Main frontend technologies:

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- react-force-graph-2d
- Lucide React
- jsPDF

## 2.2 Backend API Layer

Location:

```text
artifacts/biointel-api
```

Responsibilities:

- Receives uploaded images.
- Validates and preprocesses images.
- Calls AI vision model through Groq.
- Searches iNaturalist for species metadata.
- Generates AI intelligence content.
- Provides species profile APIs.
- Provides ecosystem and population APIs.
- Provides embedding and similarity APIs.
- Handles fallback data when AI output is incomplete.

Main backend technologies:

- FastAPI
- Uvicorn
- Pydantic
- pydantic-settings
- httpx
- Pillow
- Groq SDK
- asyncpg
- pgvector

## 2.3 External AI and Data Providers

The project uses multiple external systems:

Groq:

- Used for vision-based image identification.
- Used for structured species profile generation.
- Used for biological intelligence generation.

HuggingFace:

- Used for optional BioCLIP species identification support.
- Used for optional iNaturalist-style image model support.
- Used for embeddings through `BAAI/bge-small-en-v1.5`.

iNaturalist:

- Used for species search.
- Used for taxonomy data.
- Used for scientific names.
- Used for conservation status.
- Used for species images.
- Used for Wikipedia summary metadata.

---

# 3. Important Project Folders

```text
artifacts/biointel
```

This is the main frontend React application.

```text
artifacts/biointel-api
```

This is the main FastAPI backend used by the frontend.

```text
artifacts/biointel-api/app/api/routes
```

Contains backend API route files.

Important files:

```text
identification.py
species.py
intelligence.py
papers.py
```

```text
artifacts/biointel-api/app/ai
```

Contains AI provider logic.

Important files:

```text
vision.py
groq_client.py
bioclip.py
embeddings.py
```

```text
artifacts/biointel/src/lib/api.ts
```

Frontend API wrapper. All frontend calls to backend are defined here.

```text
artifacts/biointel/src/lib/pdfGenerator.ts
```

PDF report generation logic.

---

# 4. Frontend Routing Architecture

The frontend has three main pages.

## 4.1 Landing Page

File:

```text
artifacts/biointel/src/pages/LandingPage.tsx
```

Purpose:

- Introduces BioIntel.
- Shows platform sections.
- Provides navigation toward species analysis.

## 4.2 Analyze Page

File:

```text
artifacts/biointel/src/pages/AnalyzePage.tsx
```

Purpose:

- Allows the user to upload an image.
- Allows the user to search species by name.
- Shows example species.

Important components:

```text
UploadZone.tsx
SearchBar.tsx
ExampleSpecies.tsx
```

## 4.3 Species Page

File:

```text
artifacts/biointel/src/pages/SpeciesPage.tsx
```

Purpose:

- Displays complete species profile.
- Shows species hero section.
- Shows quick facts.
- Shows AI intelligence tabs.
- Allows PDF report download.

Important components:

```text
SpeciesHero.tsx
QuickFactsGrid.tsx
IntelligenceHub.tsx
```

---

# 5. Complete Image Upload Flow

This section explains exactly what happens when a user uploads an image.

## Step 1: User Uploads Image In Frontend

Frontend component:

```text
artifacts/biointel/src/components/analyze/UploadZone.tsx
```

The user drags and drops an image or selects a file from the computer.

Supported formats:

```text
JPEG
PNG
WEBP
```

The frontend creates a preview using:

```text
URL.createObjectURL(file)
```

The UI then shows the uploaded image and enables the “Analyse this species” button.

## Step 2: User Clicks Analyse

When the user clicks the analyse button, this function runs:

```text
handleAnalyze()
```

Inside `handleAnalyze()`:

1. Scan state changes to `scanning`.
2. UI shows preprocessing/scanning status.
3. Frontend calls:

```text
identifyImage(file)
```

This function is defined in:

```text
artifacts/biointel/src/lib/api.ts
```

It sends a `FormData` request to:

```text
POST /backend/api/identify/upload
```

Frontend proxy sends this request to the FastAPI backend running on:

```text
http://localhost:8000
```

## Step 3: Backend Receives Image Upload

Backend route:

```text
artifacts/biointel-api/app/api/routes/identification.py
```

Endpoint:

```text
POST /backend/api/identify/upload
```

Function:

```text
identify_species_from_upload()
```

Backend actions:

1. Checks if the uploaded file has a content type.
2. Reads image bytes.
3. Validates image type and size.
4. Extracts image metadata.
5. Preprocesses the image.
6. Sends image to Groq vision model.

Image validation and preprocessing happen through:

```text
artifacts/biointel-api/app/utils/image.py
```

## Step 4: Backend Calls Groq Vision Model

AI vision file:

```text
artifacts/biointel-api/app/ai/vision.py
```

Main function:

```text
identify_with_vision(image_bytes)
```

Responsible model:

```text
meta-llama/llama-4-scout-17b-16e-instruct
```

This model receives:

- The image as base64 data.
- A system prompt asking it to behave like a wildlife biologist and taxonomist.
- A user prompt asking it to return strict JSON.

Expected model output:

```json
{
  "identified": true,
  "species_name": "Common Name",
  "scientific_name": "Genus species",
  "confidence": 0.94,
  "reasoning": "Brief visual explanation",
  "image_quality": "good",
  "top_matches": [
    {
      "species": "Name",
      "scientific_name": "Genus species",
      "confidence": 0.94
    }
  ]
}
```

## Step 5: Backend Normalizes Model Result

The backend parses the Groq JSON and normalizes it.

It calculates:

```text
confidence_level
```

Rules:

```text
confidence >= 0.75  => high
confidence >= 0.50  => medium
otherwise           => low
```

It also calculates:

```text
verified
```

Rule:

```text
verified = confidence >= 0.75
```

It creates:

```text
species_id
```

Example:

```text
Northern White Rhinoceros
```

becomes:

```text
northern-white-rhinoceros
```

## Step 6: Backend Sends Response To Frontend

The backend returns:

```json
{
  "success": true,
  "identified": true,
  "verified": true,
  "confidence_level": "high",
  "confidence": 0.947,
  "species_name": "Northern White Rhinoceros",
  "scientific_name": "Ceratotherium simum cottoni",
  "species_id": "northern-white-rhinoceros",
  "reasoning": "...",
  "image_quality": "good",
  "top_matches": [],
  "model_used": "meta-llama/llama-4-scout-17b-16e-instruct",
  "inference_ms": 1234,
  "message": null
}
```

## Step 7: Frontend Handles Upload Result

Frontend file:

```text
UploadZone.tsx
```

If `verified` is true and `species_id` exists:

```text
/species/{species_id}
```

Example:

```text
/species/northern-white-rhinoceros
```

The frontend automatically redirects to the species profile page.

If the result is medium confidence:

- The UI shows top matches.
- The user can manually select one.

If the result fails:

- The UI shows an error message.
- It may show possible candidates if available.

---

# 6. Complete Species Search Flow

This section explains what happens when a user searches by species name.

## Step 1: User Types Species Name

Frontend component:

```text
artifacts/biointel/src/components/analyze/SearchBar.tsx
```

The user enters a query such as:

```text
Tiger
Northern White Rhino
Monarch Butterfly
```

When the form is submitted, frontend calls:

```text
searchSpecies(q)
```

Defined in:

```text
artifacts/biointel/src/lib/api.ts
```

API call:

```text
GET /backend/api/identify/search?q={query}&limit=8
```

## Step 2: Backend Handles Search Request

Backend route:

```text
artifacts/biointel-api/app/api/routes/identification.py
```

Endpoint:

```text
GET /backend/api/identify/search
```

This calls:

```text
search_species_by_name()
```

Defined in:

```text
artifacts/biointel-api/app/services/identification_service.py
```

## Step 3: Backend Calls iNaturalist

The backend calls:

```text
https://api.inaturalist.org/v1/taxa/autocomplete
```

Parameters:

```text
q = user search query
per_page = limit
rank = species,subspecies
```

iNaturalist returns possible species matches.

Each result includes:

- Common name
- Scientific name
- Taxon ID
- Conservation status
- Thumbnail image
- Rank information

## Step 4: Backend Converts iNaturalist Result

The backend converts each iNaturalist taxon into frontend-friendly format:

```json
{
  "id": "bengal-tiger",
  "common_name": "Bengal Tiger",
  "scientific_name": "Panthera tigris tigris",
  "iucn_status": "EN",
  "confidence": 1.0,
  "thumbnail_url": "..."
}
```

## Step 5: Frontend Shows Or Redirects

Frontend behavior:

If only one result is found:

```text
Redirect directly to /species/{id}
```

If multiple results are found:

```text
Show selectable search results
```

If no result is found:

```text
Show “No species found. Try a different name.”
```

---

# 7. Species Profile Loading Flow

After upload or search, the user reaches:

```text
/species/{species_id}
```

Example:

```text
/species/northern-white-rhinoceros
```

## Step 1: Species Page Reads Route ID

Frontend file:

```text
artifacts/biointel/src/pages/SpeciesPage.tsx
```

It reads the route parameter:

```text
speciesId
```

Then it calls:

```text
getSpecies(speciesId)
```

Defined in:

```text
artifacts/biointel/src/lib/api.ts
```

API call:

```text
GET /backend/api/species/{species_id}
```

## Step 2: Backend Species Endpoint Runs

Backend file:

```text
artifacts/biointel-api/app/api/routes/species.py
```

Endpoint:

```text
GET /backend/api/species/{species_id}
```

Function:

```text
get_species(species_id)
```

The backend tries multiple data sources in this order:

1. Database, if configured.
2. Local mock species.
3. iNaturalist API.
4. Groq-generated profile.
5. Fallback profile builder.

## Step 3: Database Check

If `DATABASE_URL` is configured, the backend checks PostgreSQL:

```sql
SELECT * FROM species WHERE id = $1
```

If a row exists, it returns database data.

If no database is configured, this step is skipped.

## Step 4: Mock Species Check

The backend has local mock species for examples like:

```text
bengal-tiger
monarch-butterfly
humpback-whale
venus-flytrap
emperor-penguin
komodo-dragon
```

If the requested species is in mock data, the backend returns it immediately.

## Step 5: iNaturalist Lookup

If not found in mock data, backend calls iNaturalist.

Function:

```text
_fetch_from_inaturalist(species_id)
```

It uses:

```text
/taxa/autocomplete
/taxa/{taxon_id}
```

The backend extracts:

- Common name
- Scientific name
- IUCN status
- Species image
- Thumbnail image
- Taxonomy ancestors
- Wikipedia summary
- iNaturalist taxon ID

The taxonomy ancestors are used to get:

```text
kingdom
phylum
class
order
family
genus
```

## Step 6: Groq Species Profile Generation

Backend then calls:

```text
generate_species_profile()
```

File:

```text
artifacts/biointel-api/app/ai/groq_client.py
```

Responsible model:

```text
llama-3.3-70b-versatile
```

This model is asked to return structured JSON with:

```text
kingdom
phylum
class
order
family
genus
scientific_name
habitat
lifespan
diet
top_speed
population
population_trend
```

## Step 7: Fallback Profile Builder

If Groq is missing, unavailable, or returns incomplete fields, the backend uses fallback logic in:

```text
species.py
```

This fallback uses:

- iNaturalist taxonomy
- iNaturalist summary
- conservation status
- basic biological heuristics

Example:

For Northern White Rhinoceros, fallback can infer:

```text
class: Mammalia
order: Perissodactyla
family: Rhinocerotidae
genus: Ceratotherium
habitat: Grasslands, savannas, and open woodlands
diet: Herbivore
population: 2 living individuals
population_trend: Declining
```

This prevents the frontend from showing mostly `Unknown`.

## Step 8: Frontend Converts API Data

Frontend file:

```text
artifacts/biointel/src/lib/api.ts
```

Function:

```text
apiSpeciesToFrontend()
```

It converts backend snake_case fields into frontend camelCase fields.

Example:

```text
common_name -> commonName
scientific_name -> scientificName
iucn_status -> iucnStatus
top_speed -> topSpeed
population_trend -> populationTrend
```

## Step 9: Frontend Renders Profile

The species page renders:

```text
SpeciesHero
QuickFactsGrid
IntelligenceHub
Footer
```

---

# 8. Intelligence Tabs Flow

The species page has AI intelligence tabs:

```text
Evolution
Anatomy
Behavior
Ecosystem
Conservation
Research Papers
```

Frontend component:

```text
artifacts/biointel/src/components/species/IntelligenceHub.tsx
```

Each tab loads content separately.

## 8.1 Evolution Tab

Frontend:

```text
EvolutionTab.tsx
```

Uses:

```text
IntelligenceBlock.tsx
```

Calls:

```text
getIntelligence(speciesName, scientificName, "evolution")
```

API:

```text
POST /backend/api/intelligence/generate
```

Backend:

```text
artifacts/biointel-api/app/api/routes/intelligence.py
```

Service:

```text
artifacts/biointel-api/app/services/intelligence_service.py
```

AI function:

```text
generate_intelligence_dimension()
```

Model:

```text
llama-3.3-70b-versatile
```

Evolution tab expects structured JSON:

```json
{
  "quick_facts": [],
  "summary": "...",
  "adaptations": [],
  "phylogenetic_position": "..."
}
```

The frontend parses this JSON and renders:

- Family
- Order
- Divergence
- Closest relative
- Native region
- Key adaptation
- Evolutionary overview
- Adaptation cards
- Phylogenetic position

## 8.2 Anatomy Tab

Frontend:

```text
AnatomyTab.tsx
```

Calls:

```text
POST /backend/api/intelligence/generate
```

With:

```json
{
  "dimension": "anatomy"
}
```

Groq generates morphology and anatomical content.

Expected content:

- Physical traits
- Body structure
- Adaptations
- Physiological specializations
- Biomechanics

## 8.3 Behavior Tab

Frontend:

```text
BehaviorTab.tsx
```

Dimension:

```text
behavior
```

Groq generates behavioral ecology content.

Expected content:

- Foraging strategy
- Territorial behavior
- Social structure
- Reproduction
- Communication
- Movement patterns

## 8.4 Ecosystem Tab

Frontend:

```text
EcosystemTab.tsx
```

This uses two kinds of data:

1. AI-generated ecosystem intelligence.
2. Ecosystem graph API.

AI API:

```text
POST /backend/api/intelligence/generate
```

Graph API:

```text
GET /backend/api/species/{species_id}/ecosystem
```

Backend graph endpoint:

```text
species.py
```

The graph contains nodes and links.

Example nodes:

```text
Focal species
Primary prey
Secondary prey
Sympatric predator
Scavenger
Primary habitat
Secondary habitat
```

Example links:

```text
predation
competition
scavenging
habitat
```

The frontend renders this with graph visualization.

## 8.5 Conservation Tab

Frontend:

```text
ConservationTab.tsx
```

Uses:

```text
POST /backend/api/intelligence/generate
GET /backend/api/species/{species_id}/population
```

The conservation AI content covers:

- IUCN status
- Population trend
- Threat drivers
- Conservation actions
- Future outlook

Population API gives chart data.

Example:

```json
[
  {
    "year": 2024,
    "population": 0,
    "note": "Population data not available for this species"
  }
]
```

For known mocked species like Bengal Tiger and Humpback Whale, more detailed time-series population data is returned.

## 8.6 Research Papers Tab

Frontend:

```text
ResearchPapersTab.tsx
```

Backend:

```text
artifacts/biointel-api/app/api/routes/papers.py
```

Purpose:

- Search for relevant research papers.
- Use species ID or scientific name as query.
- Display paper-style research results to the user.

---

# 9. Download Report Button Flow

The Download Report button is located in:

```text
artifacts/biointel/src/components/species/SpeciesHero.tsx
```

Button label:

```text
Download report
```

## Step 1: User Clicks Button

When the user clicks the button, this function runs:

```text
handleDownload()
```

It sets:

```text
downloading = true
```

The button changes to:

```text
Generating PDF...
```

## Step 2: Frontend Calls PDF Generator

The function calls:

```text
generateSpeciesPdf(species)
```

File:

```text
artifacts/biointel/src/lib/pdfGenerator.ts
```

## Step 3: PDF Generator Fetches Intelligence

Inside `generateSpeciesPdf()`, the frontend calls all intelligence APIs in parallel:

```text
evolution
anatomy
behavior
ecosystem
conservation
```

It uses:

```text
Promise.allSettled()
```

This means if one AI section fails, the whole PDF does not crash. Successful sections are still included.

Each intelligence request calls:

```text
POST /backend/api/intelligence/generate
```

## Step 4: Evolution JSON Is Flattened

The evolution response is structured JSON.

For the PDF, this JSON is converted into readable text:

- Phylogenetic position
- Summary
- Quick facts
- Key adaptations

This makes it suitable for a PDF report.

## Step 5: Species Image Is Loaded

The PDF generator fetches the species image URL:

```text
species.imageUrl
```

It converts the image into a base64 data URL using:

```text
FileReader
```

If image loading fails, the PDF uses a fallback visual block with the species initial.

## Step 6: jsPDF Creates PDF

Library used:

```text
jsPDF
```

The PDF contains:

Page 1:

- BioIntel title
- Species image
- Common name
- Scientific name
- Taxonomy breadcrumb
- IUCN status
- Quick facts:
  - Diet
  - Habitat
  - Lifespan
  - Population

Page 2 and onward:

- Evolution
- Anatomy
- Behavior
- Ecosystem
- Conservation

The PDF uses custom colors, section headers, badges, wrapped text, and page footers.

## Step 7: Browser Downloads File

The final line saves the file:

```text
doc.save(`${species.commonName.toLowerCase().replace(/\s+/g, '-')}-biointel-profile.pdf`)
```

Example downloaded filename:

```text
northern-white-rhinoceros-biointel-profile.pdf
```

Important note:

The PDF is generated fully on the frontend. The backend does not create the PDF file. The backend only provides the intelligence content used inside the PDF.

---

# 10. API Responsibilities

## 10.1 Health API

Endpoint:

```text
GET /backend/health
```

File:

```text
app/main.py
```

Purpose:

- Confirms backend is running.
- Shows configured services.

Returns:

```text
groq
huggingface
database
supabase
bioclip
embeddings
```

## 10.2 Image Identification API

Endpoint:

```text
POST /backend/api/identify/upload
```

File:

```text
app/api/routes/identification.py
```

Purpose:

- Accept image upload.
- Validate image.
- Preprocess image.
- Send image to Groq vision model.
- Return species identification result.

Responsible model:

```text
meta-llama/llama-4-scout-17b-16e-instruct
```

## 10.3 Species Search API

Endpoint:

```text
GET /backend/api/identify/search?q={query}&limit={limit}
```

File:

```text
app/api/routes/identification.py
```

Service:

```text
app/services/identification_service.py
```

Purpose:

- Search species by name.
- Query iNaturalist autocomplete API.
- Return possible species matches.

External provider:

```text
iNaturalist API
```

## 10.4 Species Profile API

Endpoint:

```text
GET /backend/api/species/{species_id}
```

File:

```text
app/api/routes/species.py
```

Purpose:

- Return full species profile.
- Use DB if available.
- Use mock data if available.
- Use iNaturalist if needed.
- Use Groq for generated facts.
- Use fallback logic if Groq is incomplete.

Responsible model:

```text
llama-3.3-70b-versatile
```

External data provider:

```text
iNaturalist API
```

## 10.5 Ecosystem Graph API

Endpoint:

```text
GET /backend/api/species/{species_id}/ecosystem
```

File:

```text
app/api/routes/species.py
```

Purpose:

- Return ecosystem graph nodes and links.
- Used by the ecosystem visualization tab.

Returns:

```text
nodes
links
species_id
```

## 10.6 Population Trend API

Endpoint:

```text
GET /backend/api/species/{species_id}/population
```

File:

```text
app/api/routes/species.py
```

Purpose:

- Return population time-series data.
- Used by conservation charts.

For some known species, it returns detailed mocked historical data.

For unknown species, it returns a placeholder data point.

## 10.7 Intelligence Generation API

Endpoint:

```text
POST /backend/api/intelligence/generate
```

File:

```text
app/api/routes/intelligence.py
```

Purpose:

- Generate AI intelligence for one biological dimension.

Allowed dimensions:

```text
evolution
anatomy
behavior
ecosystem
conservation
```

Responsible model:

```text
llama-3.3-70b-versatile
```

## 10.8 Embedding API

Endpoint:

```text
POST /backend/api/intelligence/embed
```

File:

```text
app/api/routes/intelligence.py
```

Purpose:

- Generate semantic embedding for species text.
- Store embedding in pgvector if database is configured.

Responsible model:

```text
BAAI/bge-small-en-v1.5
```

Provider:

```text
HuggingFace
```

## 10.9 Similar Species API

Endpoint:

```text
GET /backend/api/intelligence/similar?q={query}&limit={limit}
```

File:

```text
app/api/routes/intelligence.py
```

Purpose:

- Embed a query.
- Search similar stored species embeddings.
- Return semantically similar species.

Requires:

```text
DATABASE_URL
pgvector
stored embeddings
```

## 10.10 Research Papers API

Endpoint:

```text
GET /backend/api/species/{species_id}/papers
```

File:

```text
app/api/routes/papers.py
```

Purpose:

- Search and return research paper results related to a species.
- Uses species ID or scientific name as the query.

---

# 11. Model Responsibility By Level

## Level 1: Image Understanding

Model:

```text
meta-llama/llama-4-scout-17b-16e-instruct
```

Provider:

```text
Groq
```

Used in:

```text
app/ai/vision.py
```

Responsibility:

- Look at uploaded image.
- Identify organism.
- Return species name.
- Return scientific name.
- Return confidence.
- Return top possible matches.
- Return visual reasoning.
- Return image quality.

## Level 2: Species Fact Generation

Model:

```text
llama-3.3-70b-versatile
```

Provider:

```text
Groq
```

Used in:

```text
app/ai/groq_client.py
```

Function:

```text
generate_species_profile()
```

Responsibility:

- Generate structured facts:
  - Taxonomy
  - Habitat
  - Lifespan
  - Diet
  - Speed
  - Population
  - Trend

## Level 3: Biological Intelligence Generation

Model:

```text
llama-3.3-70b-versatile
```

Provider:

```text
Groq
```

Function:

```text
generate_intelligence_dimension()
```

Responsibility:

- Generate detailed research-style content for:
  - Evolution
  - Anatomy
  - Behavior
  - Ecosystem
  - Conservation

## Level 4: Embeddings And Similarity

Model:

```text
BAAI/bge-small-en-v1.5
```

Provider:

```text
HuggingFace
```

Used in:

```text
app/ai/embeddings.py
```

Responsibility:

- Convert text into vector embeddings.
- Enable semantic similarity search with pgvector.

## Level 5: Taxonomy And Reference Metadata

Provider:

```text
iNaturalist
```

Responsibility:

- Search species names.
- Provide scientific names.
- Provide taxonomy ancestors.
- Provide IUCN-like conservation status.
- Provide images.
- Provide Wikipedia summaries when available.

---

# 12. Error Handling And Fallback Architecture

The project is designed with fallback layers.

## If Groq Vision Fails

The upload endpoint returns a service error.

Frontend shows:

```text
Vision analysis service is unavailable. Please try again.
```

## If Species Profile Generation Fails

The backend does not return a blank profile.

Instead, it uses:

- iNaturalist taxonomy
- iNaturalist summary
- fallback biological rules

This prevents fields like class, order, family, habitat, diet, and population from becoming completely unknown.

## If Intelligence Generation Fails

The backend returns a temporary unavailable message.

The frontend intelligence block shows a fallback unavailable state.

In PDF generation, `Promise.allSettled()` ensures partial failures do not break the whole report.

## If Database Is Missing

The backend logs:

```text
No database connection - skipping schema setup
```

The app still works using:

- Mock species
- iNaturalist
- Groq
- fallback logic

---

# 13. Environment Variables

Main backend env file:

```text
artifacts/biointel-api/.env
```

Template:

```env
SESSION_SECRET=your-secret
GROQ_API_KEY=your-groq-key
HUGGINGFACE_TOKEN=your-huggingface-token
SUPABASE_URL=
SUPABASE_KEY=
DATABASE_URL=
BASE_PATH=/backend
```

Important variables:

```text
GROQ_API_KEY
```

Required for real image identification and AI intelligence generation.

```text
HUGGINGFACE_TOKEN
```

Used for HuggingFace inference and embeddings.

```text
DATABASE_URL
```

Optional. Enables PostgreSQL and pgvector storage.

```text
BASE_PATH
```

Default:

```text
/backend
```

This is why backend APIs are served under:

```text
/backend/api/...
```

---

# 14. Complete End-To-End Example

Example: user uploads rhinoceros image.

1. User uploads image in `UploadZone`.
2. Frontend sends image to:

```text
POST /backend/api/identify/upload
```

3. FastAPI validates and preprocesses image.
4. Groq vision model identifies it as:

```text
Northern White Rhinoceros
Ceratotherium simum cottoni
```

5. Backend returns:

```text
species_id = northern-white-rhinoceros
```

6. Frontend redirects to:

```text
/species/northern-white-rhinoceros
```

7. Species page calls:

```text
GET /backend/api/species/northern-white-rhinoceros
```

8. Backend searches iNaturalist and gets taxonomy.
9. Backend asks Groq for profile facts.
10. If Groq output is incomplete, fallback fills missing fields.
11. Frontend renders species hero and quick facts.
12. Intelligence tabs call:

```text
POST /backend/api/intelligence/generate
```

13. Groq generates research-style content.
14. User clicks Download Report.
15. Frontend fetches all intelligence sections.
16. jsPDF creates a PDF in the browser.
17. Browser downloads:

```text
northern-white-rhinoceros-biointel-profile.pdf
```

---

# 15. Summary

BioIntel follows a layered AI architecture:

Frontend handles user interaction and visualization.  
FastAPI backend handles validation, routing, AI orchestration, and fallback logic.  
Groq handles image understanding and biological intelligence generation.  
HuggingFace supports optional image model and embedding workflows.  
iNaturalist provides trusted taxonomy and species reference metadata.  
jsPDF generates final downloadable reports directly in the browser.

The most important architectural strength of the project is that it does not depend on a single model response. It combines AI model outputs with trusted biodiversity APIs and fallback logic, making the platform more reliable for real species research workflows.
