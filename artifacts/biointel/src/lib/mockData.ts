import { Species, EcosystemNode, EcosystemLink } from './types';

export const mockBengalTiger: Species = {
  id: 'bengal-tiger',
  commonName: 'Bengal Tiger',
  scientificName: 'Panthera tigris tigris',
  kingdom: 'Animalia',
  phylum: 'Chordata',
  class: 'Mammalia',
  order: 'Carnivora',
  family: 'Felidae',
  genus: 'Panthera',
  iucnStatus: 'EN',
  habitat: 'Tropical Forest',
  lifespan: '10–15 years',
  diet: 'Carnivore',
  topSpeed: '65 km/h',
  population: '~3,900 wild',
  populationTrend: 'Declining',
  imageUrl: 'https://picsum.photos/seed/tiger/800/600',
  thumbnailUrl: 'https://picsum.photos/seed/tiger/400/300'
};

export const exampleSpecies: Species[] = [
  mockBengalTiger,
  { id: 'monarch-butterfly', commonName: 'Monarch Butterfly', scientificName: 'Danaus plexippus', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Insecta', order: 'Lepidoptera', family: 'Nymphalidae', genus: 'Danaus', iucnStatus: 'LC', habitat: 'Diverse', lifespan: '2-6 weeks', diet: 'Herbivore', topSpeed: '9 km/h', population: 'Unknown', populationTrend: 'Declining', imageUrl: 'https://picsum.photos/seed/butterfly/800/600', thumbnailUrl: 'https://picsum.photos/seed/butterfly/400/300' },
  { id: 'humpback-whale', commonName: 'Humpback Whale', scientificName: 'Megaptera novaeangliae', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Balaenopteridae', genus: 'Megaptera', iucnStatus: 'LC', habitat: 'Oceans', lifespan: '45-50 years', diet: 'Carnivore', topSpeed: '25 km/h', population: '84,000', populationTrend: 'Increasing', imageUrl: 'https://picsum.photos/seed/whale/800/600', thumbnailUrl: 'https://picsum.photos/seed/whale/400/300' },
  { id: 'venus-flytrap', commonName: 'Venus Flytrap', scientificName: 'Dionaea muscipula', kingdom: 'Plantae', phylum: 'Tracheophyta', class: 'Magnoliopsida', order: 'Caryophyllales', family: 'Droseraceae', genus: 'Dionaea', iucnStatus: 'VU', habitat: 'Bogs', lifespan: '20 years', diet: 'Carnivore', topSpeed: '0 km/h', population: 'Unknown', populationTrend: 'Declining', imageUrl: 'https://picsum.photos/seed/flytrap/800/600', thumbnailUrl: 'https://picsum.photos/seed/flytrap/400/300' },
  { id: 'emperor-penguin', commonName: 'Emperor Penguin', scientificName: 'Aptenodytes forsteri', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Sphenisciformes', family: 'Spheniscidae', genus: 'Aptenodytes', iucnStatus: 'NT', habitat: 'Antarctica', lifespan: '20 years', diet: 'Carnivore', topSpeed: '9 km/h', population: '595,000', populationTrend: 'Stable', imageUrl: 'https://picsum.photos/seed/penguin/800/600', thumbnailUrl: 'https://picsum.photos/seed/penguin/400/300' },
  { id: 'komodo-dragon', commonName: 'Komodo Dragon', scientificName: 'Varanus komodoensis', kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia', order: 'Squamata', family: 'Varanidae', genus: 'Varanus', iucnStatus: 'EN', habitat: 'Islands', lifespan: '30 years', diet: 'Carnivore', topSpeed: '20 km/h', population: '3,000', populationTrend: 'Stable', imageUrl: 'https://picsum.photos/seed/komodo/800/600', thumbnailUrl: 'https://picsum.photos/seed/komodo/400/300' }
];

export const mockBengalTigerEcosystem: { nodes: EcosystemNode[], links: EcosystemLink[] } = {
  nodes: [
    { id: 'Bengal Tiger', group: 'focal', val: 20 },
    { id: 'Chital Deer', group: 'prey', val: 14 },
    { id: 'Sambar Deer', group: 'prey', val: 14 },
    { id: 'Wild Boar', group: 'prey', val: 12 },
    { id: 'Gaur', group: 'prey', val: 10 },
    { id: 'Leopard', group: 'competitor', val: 13 },
    { id: 'Dhole', group: 'competitor', val: 10 },
    { id: 'Vulture', group: 'scavenger', val: 8 },
    { id: 'Jackal', group: 'scavenger', val: 7 },
    { id: 'Tropical Forest', group: 'habitat', val: 6 },
    { id: 'Grassland', group: 'habitat', val: 5 },
  ],
  links: [
    { source: 'Bengal Tiger', target: 'Chital Deer', type: 'predation' },
    { source: 'Bengal Tiger', target: 'Sambar Deer', type: 'predation' },
    { source: 'Bengal Tiger', target: 'Wild Boar', type: 'predation' },
    { source: 'Bengal Tiger', target: 'Gaur', type: 'predation' },
    { source: 'Bengal Tiger', target: 'Leopard', type: 'competition' },
    { source: 'Bengal Tiger', target: 'Dhole', type: 'competition' },
    { source: 'Vulture', target: 'Bengal Tiger', type: 'scavenging' },
    { source: 'Jackal', target: 'Bengal Tiger', type: 'scavenging' },
    { source: 'Bengal Tiger', target: 'Tropical Forest', type: 'habitat' },
    { source: 'Chital Deer', target: 'Grassland', type: 'habitat' },
  ]
};

export const mockBengalTigerPopulation = [
  { year: 1900, population: 100000 },
  { year: 1920, population: 60000 },
  { year: 1940, population: 30000 },
  { year: 1960, population: 15000 },
  { year: 1980, population: 7000 },
  { year: 2000, population: 4000 },
  { year: 2010, population: 3200 },
  { year: 2020, population: 3900 },
  { year: 2024, population: 3900 },
];

export const mockLandingGraphData = {
  nodes: [
    { id: 'Tiger', group: 'predator', val: 18 }, { id: 'Deer', group: 'prey', val: 14 },
    { id: 'Rabbit', group: 'prey', val: 10 }, { id: 'Eagle', group: 'predator', val: 16 },
    { id: 'Mouse', group: 'prey', val: 8 }, { id: 'Fox', group: 'predator', val: 12 },
    { id: 'Grassland', group: 'habitat', val: 6 }, { id: 'Forest', group: 'habitat', val: 6 },
  ],
  links: [
    { source: 'Tiger', target: 'Deer' }, { source: 'Tiger', target: 'Rabbit' },
    { source: 'Eagle', target: 'Mouse' }, { source: 'Eagle', target: 'Rabbit' },
    { source: 'Fox', target: 'Rabbit' }, { source: 'Fox', target: 'Mouse' },
    { source: 'Tiger', target: 'Forest' }, { source: 'Grassland', target: 'Deer' },
    { source: 'Grassland', target: 'Rabbit' },
  ]
};
