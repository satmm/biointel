import { useLocation } from 'wouter';
import { exampleSpecies } from '../../lib/mockData';

export function ExampleSpecies() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col items-center mt-12 gap-4">
      <span className="font-body text-[13px] text-[var(--text-tertiary)]">Try an example</span>
      <div className="flex flex-wrap justify-center gap-3">
        {exampleSpecies.map(species => (
          <button
            key={species.id}
            onClick={() => setLocation(`/species/${species.id}`)}
            className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-full px-[16px] py-[8px] font-body text-[13px] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {species.commonName}
          </button>
        ))}
      </div>
    </div>
  );
}
