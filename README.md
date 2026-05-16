# BioIntel

BioIntel is an AI-powered Species Intelligence and Research Platform. It lets a user upload a species image or search by species name, then generates a research-style profile with taxonomy, conservation status, ecological role, population signals, evolutionary context, morphology, behavior, ecosystem relationships, and related research papers.

The project is built as a local full-stack workspace with a React frontend, a FastAPI AI backend, optional TypeScript workspace services, and external model integrations for vision and biological intelligence.

## Use Cases

- Species image identification for wildlife, plants, and biological research workflows.
- Rapid biological profile generation for conservation, education, and field research.
- Taxonomy lookup and scientific-name discovery from common species names.
- Conservation triage using IUCN-style risk labels and population trend signals.
- Interactive species intelligence reports with evolutionary, anatomical, behavioral, ecosystem, and conservation sections.
- Research assistance for students, educators, conservation teams, wildlife photographers, and biodiversity analysts.

## What The App Does

- Upload an image and identify the likely species using a vision model.
- Search species by name using iNaturalist taxonomy search.
- Open a species profile with:
  - Common name and scientific name.
  - Kingdom, phylum, class, order, family, and genus.
  - Habitat, lifespan, diet, speed, population, and trend.
  - IUCN-style conservation status.
  - AI-generated intelligence tabs.
  - Ecosystem graph and population trend view.
  - Research-paper lookup.
- Generate PDF reports from species intelligence.
- Fall back to iNaturalist taxonomy and local heuristics when AI profile data is incomplete.

## Models And AI Providers

### Groq

Groq is used for:

- Vision-based image identification.
- Structured species profile generation.
- Intelligence generation for evolution, anatomy, behavior, ecosystem, and conservation tabs.

Configured model names live in:

```text
artifacts/biointel-api/app/core/config.py
```

Current defaults:

```text
Vision model: meta-llama/llama-4-scout-17b-16e-instruct
Text model:   llama-3.3-70b-versatile
```

### HuggingFace

HuggingFace is configured for optional BioCLIP and iNaturalist-style inference support.

Current defaults:

```text
BioCLIP model:       imageomics/bioclip
iNaturalist model:   google/vit-large-patch16-224
Embedding model:     BAAI/bge-small-en-v1.5
```

### iNaturalist

iNaturalist API is used for:

- Species autocomplete search.
- Taxonomy metadata.
- Scientific names.
- Conservation status hints.
- Default species images.
- Wikipedia summary metadata when available.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Recharts
- react-force-graph-2d
- Lucide React
- Wouter routing
- React Query support
- jsPDF report generation

Frontend app:

```text
artifacts/biointel
```

### Backend

- Python 3.12
- FastAPI
- Uvicorn
- Pydantic v2
- pydantic-settings
- httpx
- Pillow
- python-multipart
- asyncpg
- pgvector
- Groq SDK

Backend app:

```text
artifacts/biointel-api
```

### Workspace And Tooling

- pnpm workspaces
- TypeScript project references
- Node.js
- esbuild
- Rollup
- Drizzle ORM packages
- OpenAPI/Zod/client generation packages

## Project Structure

```text
.
├── artifacts/
│   ├── biointel/             # React + Vite frontend
│   ├── biointel-api/         # FastAPI AI backend
│   ├── api-server/           # TypeScript Express workspace API
│   └── mockup-sandbox/       # Mockup/dev sandbox
├── lib/
│   ├── api-client-react/     # Generated React API client
│   ├── api-spec/             # OpenAPI contract
│   ├── api-zod/              # Generated Zod schemas
│   └── db/                   # Drizzle schema/config
├── scripts/                  # Workspace scripts
├── attached_assets/          # Local images and prompt assets
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Local Setup

These steps are written for Windows PowerShell. The same project can run on macOS/Linux with equivalent shell syntax.

### 1. Prerequisites

Install:

- Node.js 22 or newer
- pnpm 11 or newer
- Python 3.12
- Git

Check versions:

```powershell
node -v
pnpm -v
python --version
```

### 2. Install Node Dependencies

From the repo root:

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\Asset-Manager
pnpm install --ignore-scripts
```

Why `--ignore-scripts` on Windows:

The root `preinstall` script uses Unix `sh`. Windows PowerShell does not include `sh` by default, so skipping lifecycle scripts is the easiest local setup path.

If Vite reports missing native optional packages on Windows, install these workspace dev dependencies:

```powershell
pnpm add -D -w @rollup/rollup-win32-x64-msvc@4.59.0 --ignore-scripts
pnpm add -D -w @esbuild/win32-x64@0.27.3 --ignore-scripts
pnpm add -D -w lightningcss-win32-x64-msvc@1.31.1 --ignore-scripts
pnpm add -D -w @tailwindcss/oxide-win32-x64-msvc@4.2.1 --ignore-scripts
```

### 3. Create Backend Virtual Environment

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\Asset-Manager\artifacts\biointel-api
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a local file:

```text
artifacts/biointel-api/.env
```

Use this template:

```env
SESSION_SECRET=replace-with-a-long-random-secret
GROQ_API_KEY=replace-with-your-groq-key
HUGGINGFACE_TOKEN=replace-with-your-huggingface-token
SUPABASE_URL=
SUPABASE_KEY=
DATABASE_URL=
BASE_PATH=/backend
```

Do not commit `.env`. The repo ignores local env files.

`GROQ_API_KEY` is required for real vision identification and AI intelligence generation. Without it, the backend can still return some fallback species data, but model-powered features will be limited.

`HUGGINGFACE_TOKEN` is optional for some fallback model paths, but recommended.

`DATABASE_URL` is optional for local mock/fallback mode. If omitted, the backend skips database setup.

### 5. Start The Backend

In one terminal:

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\Asset-Manager\artifacts\biointel-api
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Verify:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/backend/health
```

Expected health shape:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "services": {
    "groq": "configured",
    "huggingface": "configured",
    "database": "not_configured",
    "supabase": "not_configured",
    "bioclip": "ready",
    "embeddings": "ready"
  }
}
```

### 6. Start The Frontend

In a second terminal:

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\Asset-Manager
$env:PORT="3001"
$env:BASE_PATH="/"
pnpm --filter @workspace/biointel exec vite --config vite.config.ts --host 0.0.0.0
```

Open:

```text
http://localhost:3001/
```

The frontend proxies backend calls from:

```text
/backend
```

to:

```text
http://localhost:8000
```

## Useful Commands

Run frontend typecheck:

```powershell
pnpm --filter @workspace/biointel run typecheck
```

Run all TypeScript checks:

```powershell
pnpm run typecheck
```

Build frontend:

```powershell
pnpm --filter @workspace/biointel run build
```

Run backend syntax checks:

```powershell
cd artifacts\biointel-api
.\.venv\Scripts\python.exe -m py_compile app\main.py app\api\routes\species.py app\core\config.py
```

## Main API Endpoints

Backend base URL:

```text
http://localhost:8000/backend
```

Health:

```text
GET /backend/health
```

Image identification:

```text
POST /backend/api/identify/upload
```

Species search:

```text
GET /backend/api/identify/search?q=tiger&limit=8
```

Species profile:

```text
GET /backend/api/species/{species_id}
```

Ecosystem graph:

```text
GET /backend/api/species/{species_id}/ecosystem
```

Population trend:

```text
GET /backend/api/species/{species_id}/population
```

AI intelligence:

```text
POST /backend/api/intelligence/generate
```

Example intelligence request:

```json
{
  "species_name": "Northern White Rhinoceros",
  "scientific_name": "Ceratotherium simum cottoni",
  "dimension": "evolution"
}
```

## How The Species Profile Works

The profile flow is:

1. The frontend asks for `/backend/api/species/{species_id}`.
2. The backend checks the database if `DATABASE_URL` is configured.
3. If no database row exists, it checks local mock species.
4. If not mocked, it queries iNaturalist.
5. It asks Groq to generate structured biological facts.
6. If Groq is unavailable or returns incomplete data, it uses iNaturalist taxonomy and fallback heuristics.
7. The frontend renders the species hero, quick facts, and intelligence tabs.

This fallback path prevents profile cards from showing mostly `Unknown` when AI output is unavailable.

## Troubleshooting

### Backend says Groq is missing

Check that this file exists:

```text
artifacts/biointel-api/.env
```

Then restart the backend. `.env` is read when the Python process starts.

### Pydantic rejects an env variable

If you add a new key to `.env`, it must either be declared in:

```text
artifacts/biointel-api/app/core/config.py
```

or Pydantic settings must be configured to allow extra fields.

### Frontend cannot connect to backend

Make sure backend is running on port `8000`:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/backend/health
```

Make sure frontend is running with:

```powershell
$env:PORT="3001"
$env:BASE_PATH="/"
```

### Vite fails with missing Rollup, esbuild, lightningcss, or Tailwind oxide package

Install the Windows native packages listed in the setup section, then restart Vite.

### Image upload returns service unavailable

Most likely causes:

- `GROQ_API_KEY` is missing or invalid.
- The Groq model name is unavailable.
- Network access to Groq is blocked.
- The uploaded file is not JPEG, PNG, or WEBP.

### Species details show Unknown

This should now be reduced by the fallback profile builder. If a species still has unknown values, it means both the model and iNaturalist metadata did not provide enough information for that specific species.

## Security Notes

- Never commit `.env`.
- Rotate API keys if they were shared in chat, screenshots, commits, or logs.
- Keep `.env.example` as placeholders only.
- Avoid printing API keys in terminal output.
- Treat generated reports as user data if they include uploaded images or private research notes.

## Current Limitations

- The app can run without a database, but persistence and caching are limited.
- Some profile facts depend on external API availability.
- AI model responses can be incomplete or temporarily unavailable.
- Population data is mocked or estimated for many species unless backed by a real database.
- HuggingFace model inference may require valid account access and sufficient quota.

## License

This workspace declares the MIT license in `package.json`.
