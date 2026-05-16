import React, { Suspense, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionLabel } from '../ui/SectionLabel';
import { mockLandingGraphData } from '../../lib/mockData';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d').then(m => ({ default: (m as any).default ?? (m as any) }))) as any;

export function VisualizationPreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: 420 });
      }
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const colorMap: Record<string, string> = {
    predator: '#FF3B5C',
    prey: '#0FFFE8',
    habitat: '#22C55E'
  };

  return (
    <section className="bg-[var(--void-2)] py-[120px] px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <SectionLabel text="04 / VISUALIZATIONS" />
          <h2 className="font-heading font-bold text-[48px] text-[var(--text-primary)]">
            See the web of life.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <p className="font-body text-[18px] text-[var(--text-secondary)] leading-relaxed">
              Ecosystem relationships, visualized in real time.
            </p>
            <ul className="flex flex-col gap-4">
              {['Phylogenetic evolution trees', 'Predator-prey force graphs', 'Population trend charts', 'Climate vulnerability maps'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
                  <span className="font-body text-[16px] text-[var(--text-primary)]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            ref={containerRef}
            className="border-[0.5px] border-[var(--border)] rounded-[16px] overflow-hidden bg-[#0D1117] h-[420px] w-full"
          >
            <Suspense fallback={<div style={{ height: '420px', background: '#0D1117' }} />}>
              <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={mockLandingGraphData}
                nodeColor={(node: any) => colorMap[node.group] || '#0FFFE8'}
                linkColor={() => 'rgba(15,255,232,0.2)'}
                nodeLabel="id"
                backgroundColor="#0D1117"
                cooldownTicks={100}
                onEngineStop={() => {}}
              />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
