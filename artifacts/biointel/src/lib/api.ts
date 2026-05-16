const BASE = '/backend/api';

export interface ApiSpecies {
  id: string;
  common_name: string;
  scientific_name: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  iucn_status: string;
  habitat: string;
  lifespan: string;
  diet: string;
  top_speed: string;
  population: string;
  population_trend: string;
  image_url: string;
  thumbnail_url: string;
}

export interface ApiSearchResult {
  id: string;
  common_name: string;
  scientific_name: string;
  iucn_status: string;
  confidence: number;
  thumbnail_url: string;
}

export interface ApiIntelligence {
  dimension: string;
  content: string;
  confidence: number;
  cached: boolean;
}

export interface ApiEcosystemNode {
  id: string;
  group: string;
  val: number;
}

export interface ApiEcosystemLink {
  source: string;
  target: string;
  type: string;
}

export interface ApiEcosystem {
  nodes: ApiEcosystemNode[];
  links: ApiEcosystemLink[];
  species_id: string;
}

export interface ApiPopulationPoint {
  year: number;
  population: number;
}

export interface TopMatch {
  species: string;
  scientific_name: string;
  confidence: number;
}

export interface ApiImageIdentificationResult {
  success: boolean;
  identified: boolean;
  verified: boolean;
  confidence_level: 'high' | 'medium' | 'low';
  confidence: number;
  species_name: string | null;
  scientific_name: string | null;
  species_id: string | null;
  reasoning: string | null;
  image_quality: string;
  top_matches: TopMatch[];
  model_used: string;
  inference_ms: number;
  message: string | null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function searchSpecies(q: string): Promise<ApiSearchResult[]> {
  return apiFetch<ApiSearchResult[]>(`/identify/search?q=${encodeURIComponent(q)}&limit=8`);
}

export async function getSpecies(id: string): Promise<ApiSpecies> {
  return apiFetch<ApiSpecies>(`/species/${id}`);
}

export async function getEcosystem(id: string): Promise<ApiEcosystem> {
  return apiFetch<ApiEcosystem>(`/species/${id}/ecosystem`);
}

export async function getPopulation(id: string): Promise<ApiPopulationPoint[]> {
  return apiFetch<ApiPopulationPoint[]>(`/species/${id}/population`);
}

export async function getIntelligence(
  speciesName: string,
  scientificName: string,
  dimension: string,
): Promise<ApiIntelligence> {
  return apiFetch<ApiIntelligence>('/intelligence/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      species_name: speciesName,
      scientific_name: scientificName,
      dimension,
    }),
  });
}

export async function identifyImage(file: File): Promise<ApiImageIdentificationResult> {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<ApiImageIdentificationResult>('/identify/upload', { method: 'POST', body: form });
}

export function apiSpeciesToFrontend(s: ApiSpecies) {
  return {
    id: s.id,
    commonName: s.common_name,
    scientificName: s.scientific_name,
    kingdom: s.kingdom,
    phylum: s.phylum,
    class: s.class,
    order: s.order,
    family: s.family,
    genus: s.genus,
    iucnStatus: s.iucn_status as any,
    habitat: s.habitat,
    lifespan: s.lifespan,
    diet: s.diet as any,
    topSpeed: s.top_speed,
    population: s.population,
    populationTrend: s.population_trend as any,
    imageUrl: s.image_url,
    thumbnailUrl: s.thumbnail_url,
  };
}
