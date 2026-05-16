import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, BookOpen, AlertCircle, Calendar, Users } from 'lucide-react';

interface Paper {
  title: string;
  authors: string[];
  journal: string | null;
  year: number | null;
  doi: string;
  url: string;
  abstract_snippet: string | null;
}

interface Props {
  speciesId: string;
  scientificName: string;
}

export function ResearchPapersTab({ speciesId, scientificName }: Props) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ scientific_name: scientificName, limit: '8' });
    fetch(`/backend/api/species/${speciesId}/papers?${params}`)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(setPapers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [speciesId, scientificName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--purple-evo)]" />
        <span className="font-mono text-[11px] text-[var(--text-tertiary)] tracking-widest uppercase">
          Searching CrossRef database...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-[var(--void-2)] border border-[var(--border)] rounded-[14px]">
        <AlertCircle className="w-4 h-4 text-[var(--red-ext)] shrink-0" />
        <span className="font-body text-[14px] text-[var(--text-secondary)]">
          Could not reach the paper database. Please try again.
        </span>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] gap-3">
        <BookOpen className="w-8 h-8 text-[var(--text-tertiary)] opacity-40" />
        <span className="font-body text-[14px] text-[var(--text-secondary)]">
          No indexed papers found for this species.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--purple-evo)]" />
          <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest">
            {papers.length} papers · CrossRef database · click to open
          </span>
        </div>
      </div>

      {papers.map((paper, i) => (
        <a
          key={paper.doi}
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-[var(--void-2)] border-[0.5px] border-[var(--border)] hover:border-[rgba(140,100,200,0.4)] hover:bg-[rgba(140,100,200,0.04)] rounded-[14px] px-5 py-4 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--void-3)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
              <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{i + 1}</span>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <h3 className="font-body font-medium text-[14px] text-[var(--text-primary)] leading-snug group-hover:text-[rgba(140,100,200,0.9)] transition-colors line-clamp-2">
                {paper.title}
              </h3>

              {paper.abstract_snippet && (
                <p className="font-body text-[12px] text-[var(--text-tertiary)] leading-relaxed line-clamp-2">
                  {paper.abstract_snippet}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-1">
                {paper.authors.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                    <Users className="w-3 h-3 shrink-0" />
                    <span className="font-mono truncate max-w-[200px]">{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
                  </div>
                )}
                {paper.year && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="font-mono">{paper.year}</span>
                  </div>
                )}
                {paper.journal && (
                  <span className="font-mono text-[10px] bg-[rgba(140,100,200,0.1)] text-[rgba(140,100,200,0.8)] border border-[rgba(140,100,200,0.2)] px-2 py-0.5 rounded-full truncate max-w-[180px]">
                    {paper.journal}
                  </span>
                )}
                <span className="font-mono text-[10px] text-[var(--text-tertiary)] truncate">
                  doi:{paper.doi}
                </span>
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[rgba(140,100,200,0.8)] transition-colors shrink-0 mt-1" />
          </div>
        </a>
      ))}

      <p className="font-mono text-[10px] text-[var(--text-tertiary)] text-center mt-2">
        Papers sourced from CrossRef · BioIntel links to publishers, we do not host papers
      </p>
    </div>
  );
}
