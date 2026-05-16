import { Activity } from 'lucide-react';
import { IntelligenceBlock } from './IntelligenceBlock';

interface Props {
  speciesName: string;
  scientificName: string;
}

export function BehaviorTab({ speciesName, scientificName }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Activity className="text-[var(--amber)] w-[18px] h-[18px]" />
        <h3 className="font-heading font-medium text-[16px] text-[var(--text-primary)]">Behavioral intelligence</h3>
      </div>

      <IntelligenceBlock
        speciesName={speciesName}
        scientificName={scientificName}
        dimension="behavior"
        accentColor="var(--amber)"
      >
        {(content) => {
          const paragraphs = content.split(/\n\n+/).filter(Boolean);
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paragraphs.length >= 2 ? (
                paragraphs.map((para, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <p className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">{para}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2">
                  <p className="font-body text-[15px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{content}</p>
                </div>
              )}
            </div>
          );
        }}
      </IntelligenceBlock>
    </div>
  );
}
