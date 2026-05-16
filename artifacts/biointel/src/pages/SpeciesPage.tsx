import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SpeciesHero } from '../components/species/SpeciesHero';
import { QuickFactsGrid } from '../components/species/QuickFactsGrid';
import { IntelligenceHub } from '../components/species/IntelligenceHub';
import { mockBengalTiger } from '../lib/mockData';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { getSpecies, apiSpeciesToFrontend } from '../lib/api';
import type { Species } from '../lib/types';
import { Loader2, Microscope, ChevronLeft } from 'lucide-react';

export default function SpeciesPage() {
  const params = useParams<{ id: string }>();
  const speciesId = params.id || 'bengal-tiger';

  const [species, setSpecies] = useState<Species>(mockBengalTiger);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getSpecies(speciesId)
      .then(data => setSpecies(apiSpeciesToFrontend(data)))
      .catch(() => setSpecies(mockBengalTiger))
      .finally(() => setLoading(false));
  }, [speciesId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--void)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[var(--teal)] animate-spin" />
            <span className="font-mono text-[13px] text-[var(--text-tertiary)] tracking-widest uppercase">Loading intelligence profile...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--void)] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6">
        {/* Cool back-to-analyze button */}
        <div className="pt-[88px] pb-0 flex items-center">
          <Link
            href="/analyze"
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--void-2)] border-[0.5px] border-[rgba(15,255,232,0.15)] hover:border-[var(--teal)] hover:bg-[var(--teal-dim)] transition-all duration-200"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[var(--teal)] group-hover:-translate-x-0.5 transition-transform" />
            <Microscope className="w-3.5 h-3.5 text-[var(--teal)]" />
            <span className="font-mono text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--teal)] tracking-widest uppercase transition-colors">
              New Scan
            </span>
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--teal)] opacity-60 group-hover:opacity-100 group-hover:shadow-[0_0_6px_var(--teal)] transition-all" />
          </Link>
        </div>

        <SpeciesHero species={species} />
        <QuickFactsGrid species={species} />
        <IntelligenceHub
          speciesId={speciesId}
          speciesName={species.commonName}
          scientificName={species.scientificName}
        />
      </main>

      <Footer />
    </div>
  );
}
