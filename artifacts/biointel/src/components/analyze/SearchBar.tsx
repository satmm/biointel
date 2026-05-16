import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { searchSpecies, ApiSearchResult } from '../../lib/api';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ApiSearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || q.length < 2) return;
    setIsSearching(true);
    setError(null);
    setResults(null);
    try {
      const data = await searchSpecies(q);
      if (data.length === 1) {
        setLocation(`/species/${data[0].id}`);
      } else if (data.length > 1) {
        setResults(data);
      } else {
        setError('No species found. Try a different name.');
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setResults(null); setError(null); }}
          placeholder="e.g. Bengal Tiger, Monarch Butterfly..."
          className="w-full bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[12px] px-[20px] py-[16px] pr-[50px] font-body text-[16px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-hover)] focus:shadow-[0_0_0_3px_rgba(15,255,232,0.08)] transition-all"
        />
        <button type="submit" disabled={isSearching} className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--teal)] transition-colors disabled:opacity-50">
          {isSearching ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Search className="w-[18px] h-[18px]" />}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--void-2)] border-[0.5px] border-[rgba(255,59,92,0.3)] rounded-[10px]">
          <AlertCircle className="w-4 h-4 text-[var(--red-ext)] shrink-0" />
          <span className="font-body text-[13px] text-[var(--text-secondary)]">{error}</span>
        </div>
      )}

      {results && results.length > 1 && (
        <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[12px] overflow-hidden">
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setLocation(`/species/${r.id}`)}
              className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-[rgba(15,255,232,0.04)] transition-colors text-left ${i > 0 ? 'border-t-[0.5px] border-[var(--border)]' : ''}`}
            >
              <img src={r.thumbnail_url} alt={r.common_name} className="w-10 h-10 rounded-[6px] object-cover opacity-80" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-body text-[14px] text-[var(--text-primary)] truncate">{r.common_name}</span>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)] truncate">{r.scientific_name}</span>
              </div>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                r.iucn_status === 'CR' || r.iucn_status === 'EN' ? 'text-[var(--red-ext)] bg-[var(--red-dim)]' :
                r.iucn_status === 'VU' || r.iucn_status === 'NT' ? 'text-[var(--amber)] bg-[rgba(245,166,35,0.1)]' :
                'text-[var(--green-safe)] bg-[rgba(34,197,94,0.1)]'
              }`}>{r.iucn_status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
