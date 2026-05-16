import { GitBranch, Clock, MapPin, Dna, Zap, Trees } from 'lucide-react';
import { PhylogenyTree } from '../visualizations/PhylogenyTree';
import { IntelligenceBlock } from './IntelligenceBlock';

interface QuickFact { label: string; value: string; }
interface Adaptation { title: string; description: string; }
interface EvolutionData {
  quick_facts: QuickFact[];
  summary: string;
  adaptations: Adaptation[];
  phylogenetic_position: string;
}

const FACT_ICONS: Record<string, React.ReactNode> = {
  Family:           <Trees className="w-3 h-3" />,
  Order:            <GitBranch className="w-3 h-3" />,
  Divergence:       <Clock className="w-3 h-3" />,
  'Closest Relative': <Dna className="w-3 h-3" />,
  'Native Region':  <MapPin className="w-3 h-3" />,
  'Key Adaptation': <Zap className="w-3 h-3" />,
};

function parseEvolution(raw: string): EvolutionData | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const data = JSON.parse(raw.slice(start, end + 1));
    if (!data.quick_facts || !data.summary) return null;
    return data as EvolutionData;
  } catch {
    return null;
  }
}

function StructuredEvolution({ data, scientificName }: { data: EvolutionData; scientificName: string }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Quick-facts grid */}
      <div className="grid grid-cols-2 gap-2">
        {data.quick_facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col gap-1 bg-[rgba(139,92,246,0.05)] border-[0.5px] border-[rgba(139,92,246,0.15)] rounded-[10px] px-3 py-2.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--purple-evo)] opacity-70">
                {FACT_ICONS[fact.label] ?? <Dna className="w-3 h-3" />}
              </span>
              <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--text-tertiary)]">
                {fact.label}
              </span>
            </div>
            <span className="font-heading font-medium text-[13px] text-[var(--text-primary)] leading-snug">
              {fact.value}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[9px] tracking-widest uppercase text-[rgba(139,92,246,0.7)]">
          Evolutionary overview
        </span>
        <p className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Adaptations */}
      {data.adaptations?.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] tracking-widest uppercase text-[rgba(139,92,246,0.7)]">
            Key adaptations
          </span>
          <div className="flex flex-col gap-2">
            {data.adaptations.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-[var(--void-3)] border-[0.5px] border-[var(--border)] rounded-[8px] px-3 py-2.5"
              >
                <span className="w-[3px] h-full self-stretch bg-[var(--purple-evo)] rounded-full opacity-60 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-heading font-medium text-[13px] text-[var(--text-primary)]">
                    {a.title}
                  </span>
                  <span className="font-body text-[12px] text-[var(--text-tertiary)] leading-snug">
                    {a.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phylogenetic position */}
      {data.phylogenetic_position && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 bg-[rgba(139,92,246,0.04)] border-l-[2px] border-[var(--purple-evo)] rounded-r-[8px]">
          <GitBranch className="w-3.5 h-3.5 text-[var(--purple-evo)] shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
            {data.phylogenetic_position}
          </p>
        </div>
      )}

      {/* Scientific name tag */}
      <div className="flex items-center gap-2 pt-1">
        <span className="w-[5px] h-[5px] rounded-full bg-[var(--purple-evo)] opacity-50" />
        <span className="font-mono text-[10px] text-[var(--purple-evo)] opacity-60 italic">
          {scientificName}
        </span>
      </div>
    </div>
  );
}

function FallbackEvolution({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  );
}

interface Props {
  speciesName: string;
  scientificName: string;
}

export function EvolutionTab({ speciesName, scientificName }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <GitBranch className="text-[var(--purple-evo)] w-[18px] h-[18px]" />
          <h3 className="font-heading font-medium text-[16px] text-[var(--text-primary)]">
            Evolutionary lineage
          </h3>
        </div>

        <IntelligenceBlock
          speciesName={speciesName}
          scientificName={scientificName}
          dimension="evolution"
          accentColor="var(--purple-evo)"
        >
          {(content) => {
            const parsed = parseEvolution(content);
            return parsed
              ? <StructuredEvolution data={parsed} scientificName={scientificName} />
              : <FallbackEvolution content={content} />;
          }}
        </IntelligenceBlock>
      </div>

      <div className="h-full">
        <PhylogenyTree />
      </div>
    </div>
  );
}
