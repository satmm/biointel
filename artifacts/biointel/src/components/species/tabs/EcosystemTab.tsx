import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Network } from 'lucide-react';
import { getEcosystem, ApiEcosystemNode, ApiEcosystemLink } from '../../../lib/api';
import { IntelligenceBlock } from './IntelligenceBlock';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d').then(m => ({ default: (m as any).default ?? (m as any) }))) as any;

interface Props {
  speciesId: string;
  speciesName: string;
  scientificName: string;
}

export function EcosystemTab({ speciesId, speciesName, scientificName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [graphData, setGraphData] = useState<{ nodes: ApiEcosystemNode[]; links: ApiEcosystemLink[] } | null>(null);

  useEffect(() => {
    getEcosystem(speciesId)
      .then(data => setGraphData({ nodes: data.nodes, links: data.links }))
      .catch(() => {});
  }, [speciesId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: 480 });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const colorMap: Record<string, string> = {
    focal: '#0FFFE8',
    prey: '#85B7EB',
    competitor: '#F97316',
    scavenger: '#888780',
    habitat: '#22C55E',
  };

  const getLinkColor = (link: any) => {
    if (link.type === 'predation') return 'rgba(255,59,92,0.3)';
    if (link.type === 'competition') return 'rgba(245,166,35,0.3)';
    return 'rgba(15,255,232,0.15)';
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center gap-3">
        <Network className="text-[var(--green-safe)] w-[18px] h-[18px]" />
        <h3 className="font-heading font-medium text-[20px] text-[var(--text-primary)]">Ecosystem relationship network</h3>
      </div>

      <div className="flex flex-col">
        <div ref={containerRef} className="border-[0.5px] border-[var(--border)] rounded-t-[16px] overflow-hidden bg-[#0D1117] h-[480px] w-full">
          <Suspense fallback={<div style={{ height: '480px', background: '#0D1117' }} />}>
            {graphData ? (
              <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeColor={(node: any) => colorMap[node.group] || '#0FFFE8'}
                linkColor={getLinkColor}
                nodeLabel="id"
                backgroundColor="#0D1117"
                cooldownTicks={100}
                onEngineStop={() => {}}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0D1117]">
                <span className="font-mono text-[12px] text-[var(--text-tertiary)]">Loading ecosystem data...</span>
              </div>
            )}
          </Suspense>
        </div>
        <div className="bg-[var(--void-2)] border-b-[0.5px] border-x-[0.5px] border-[var(--border)] rounded-b-[16px] p-4 flex flex-wrap gap-6 justify-center">
          {Object.entries({ 'Focal species': '#0FFFE8', 'Prey': '#85B7EB', 'Competitor': '#F97316', 'Scavenger': '#888780', 'Habitat': '#22C55E' }).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-body text-[12px] text-[var(--text-secondary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <IntelligenceBlock
        speciesName={speciesName}
        scientificName={scientificName}
        dimension="ecosystem"
        accentColor="var(--green-safe)"
      >
        {(content) => {
          const paragraphs = content.split(/\n\n+/).filter(Boolean);
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paragraphs.length >= 2 ? (
                paragraphs.map((para, i) => (
                  <p key={i} className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">{para}</p>
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
