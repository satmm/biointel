import { useEffect, useState } from 'react';
import { ConservationBadge } from '../ui/ConservationBadge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { Download, Share2, Loader2 } from 'lucide-react';
import { Species } from '../../lib/types';
import { generateSpeciesPdf } from '../../lib/pdfGenerator';

export function SpeciesHero({ species }: { species: Species }) {
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await generateSpeciesPdf(species);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full min-h-[500px] flex flex-col md:flex-row gap-12 mt-20 mb-16">
      <div className="flex-1 relative rounded-[20px] border-[0.5px] border-[var(--border)] overflow-hidden aspect-4/3 md:aspect-auto">
        <img src={species.imageUrl} alt={species.commonName} className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,16,0.9)] to-transparent via-transparent" />

        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[var(--teal)] opacity-60" />
        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[var(--teal)] opacity-60" />
        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[var(--teal)] opacity-60" />
        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[var(--teal)] opacity-60" />

        {mounted && (
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--teal)] animate-[scan_1.5s_ease-in-out_once] shadow-[0_0_8px_var(--teal)]" />
        )}

        <div className="absolute bottom-6 left-6 font-mono italic text-[14px] text-[var(--teal)]">
          {species.scientificName}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-4">
          <ConservationBadge status={species.iucnStatus} />
        </div>

        <h1 className="font-heading font-bold text-[48px] text-[var(--text-primary)] leading-tight mb-2">
          {species.commonName}
        </h1>

        <div className="font-mono italic text-[18px] text-[var(--teal)] mb-6">
          {species.scientificName}
        </div>

        <div className="font-mono text-[12px] text-[var(--text-tertiary)] flex flex-wrap gap-2 mb-10">
          <span>{species.kingdom}</span>
          <span>/</span>
          <span>{species.phylum}</span>
          <span>/</span>
          <span>{species.class}</span>
          <span>/</span>
          <span>{species.order}</span>
          <span>/</span>
          <span>{species.family}</span>
        </div>

        <div className="mb-10 w-full max-w-[400px]">
          <ConfidenceBar value={94.7} />
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-[20px] py-[10px] rounded-[8px] bg-[var(--void-3)] border-[0.5px] border-[var(--border)] text-[var(--text-primary)] font-heading font-medium text-[14px] hover:border-[var(--teal)] hover:bg-[var(--teal-dim)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[var(--teal)]" />
                <span className="text-[var(--teal)]">Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download report
              </>
            )}
          </button>
          <button className="flex items-center gap-2 px-[20px] py-[10px] rounded-[8px] bg-[var(--void-3)] border-[0.5px] border-[var(--border)] text-[var(--text-primary)] font-heading font-medium text-[14px] hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.02)] transition-all">
            <Share2 className="w-4 h-4" />
            Share species
          </button>
        </div>
      </div>
    </div>
  );
}
