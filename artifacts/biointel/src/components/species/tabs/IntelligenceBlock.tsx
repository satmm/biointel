import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { getIntelligence } from '../../../lib/api';

interface Props {
  speciesName: string;
  scientificName: string;
  dimension: string;
  accentColor: string;
  children: (content: string) => React.ReactNode;
}

export function IntelligenceBlock({ speciesName, scientificName, dimension, accentColor, children }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setContent(null);
    getIntelligence(speciesName, scientificName, dimension)
      .then(r => setContent(r.content))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [speciesName, scientificName, dimension]);

  if (loading) {
    return (
      <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[28px] flex flex-col gap-3 min-h-[160px] justify-center items-center">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: accentColor }} />
        <span className="font-mono text-[11px] text-[var(--text-tertiary)] tracking-widest uppercase">Generating AI intelligence...</span>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[28px] flex flex-col gap-3">
        <p className="font-body text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Intelligence data unavailable. Check your API configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[28px] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: accentColor }}>AI Generated · Groq Llama 3.3 70B</span>
      </div>
      {children(content)}
    </div>
  );
}
