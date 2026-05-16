import { Scan } from 'lucide-react';
import { IntelligenceBlock } from './IntelligenceBlock';

interface Props {
  speciesName: string;
  scientificName: string;
}

export function AnatomyTab({ speciesName, scientificName }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Scan className="text-[var(--teal)] w-[18px] h-[18px]" />
          <h3 className="font-heading font-medium text-[16px] text-[var(--text-primary)]">Morphology & anatomy</h3>
        </div>

        <IntelligenceBlock
          speciesName={speciesName}
          scientificName={scientificName}
          dimension="anatomy"
          accentColor="var(--teal)"
        >
          {(content) => (
            <p className="font-body text-[15px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {content}
            </p>
          )}
        </IntelligenceBlock>
      </div>

      <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[28px] flex flex-col gap-4 justify-center">
        <h4 className="font-heading font-medium text-[15px] text-[var(--text-primary)] mb-2">Physical profile</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'SPECIES', value: speciesName },
            { label: 'TAXONOMY', value: scientificName },
            { label: 'CLASSIFICATION', value: 'AI Analyzed' },
            { label: 'DATA SOURCE', value: 'Llama 3.3 70B' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="font-mono text-[10px] text-[var(--teal)] uppercase tracking-wide">{item.label}</div>
              <div className="font-body text-[13px] text-[var(--text-primary)] truncate">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
