# BioIntel

An AI-powered Species Intelligence & Research Platform. Upload any species image and receive research-grade biological intelligence — from evolutionary lineage to conservation risk — powered by AI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/biointel run dev` — run the BioIntel frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not required for mock-data frontend)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion, Recharts, react-force-graph-2d, Lucide React
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/biointel/src/`
  - Pages: `src/pages/` (LandingPage, AnalyzePage, SpeciesPage)
  - Components: `src/components/` (layout, landing, analyze, species, ui)
  - Mock data: `src/lib/mockData.ts`
  - Types: `src/lib/types.ts`
- API Server: `artifacts/api-server/src/`
- DB Schema: `lib/db/src/schema/`
- API Contract: `lib/api-spec/openapi.yaml`

## Architecture decisions

- Dark-mode-only site — no light mode toggle, all colors use CSS custom properties defined in `index.css`.
- Mock-data mode: all 3 pages are fully functional with no backend (hardcoded Bengal Tiger as the primary example).
- `react-force-graph-2d` is dynamically imported via React.lazy + Suspense to avoid SSR/browser-API issues.
- Recharts components for heavy chart views are also dynamically loaded.
- Font utilities (`font-heading`, `font-body`, `font-mono`) are registered in Tailwind's `@theme inline` block to work with `@apply`.

## Product

- **Landing page**: Cinematic hero, About, How It Works (5-step), 7 Intelligence Pillars, live ecosystem force graph preview, Future Vision + stats.
- **Analyze page**: Upload zone with drag-and-drop, image preview + scan effect, search by name tab, 6 example species chips.
- **Species page**: Species hero with scanning animation + corner brackets, quick facts grid, 5-tab Intelligence Hub (Evolution, Anatomy, Behavior, Ecosystem, Conservation) with phylogenetic tree SVG, Recharts charts, force graph, and population trend chart.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Font utilities must be in `@theme inline` in `index.css`, not in `@layer utilities`, for Tailwind v4 `@apply` to work.
- `react-force-graph-2d` default export may differ — use `(m as any).default ?? (m as any)` when dynamic importing.
- All colors use `var(--void)`, `var(--teal)`, etc. CSS variables — never hardcode hex in components (except canvas-based graph APIs).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
