export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  iucnStatus: 'EX'|'EW'|'CR'|'EN'|'VU'|'NT'|'LC'|'DD';
  habitat: string;
  lifespan: string;
  diet: 'Carnivore'|'Herbivore'|'Omnivore'|'Insectivore';
  topSpeed: string;
  population: string;
  populationTrend: 'Increasing'|'Stable'|'Declining'|'Unknown';
  imageUrl: string;
  thumbnailUrl: string;
}

export interface IntelligenceReport {
  speciesId: string;
  dimension: 'evolution'|'anatomy'|'behavior'|'ecosystem'|'conservation';
  content: string;
  citations: Citation[];
  confidence: number;
  generatedAt: string;
  cached: boolean;
}

export interface Citation {
  source: string;
  url: string;
  title: string;
  year: number;
}

export interface EcosystemNode {
  id: string;
  group: 'focal'|'prey'|'predator'|'competitor'|'scavenger'|'habitat';
  val: number;
}

export interface EcosystemLink {
  source: string;
  target: string;
  type: 'predation'|'competition'|'scavenging'|'habitat';
}
