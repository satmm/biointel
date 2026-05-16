import React, { Suspense, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getPopulation, ApiPopulationPoint } from '../../../lib/api';
import { IntelligenceBlock } from './IntelligenceBlock';

const ResponsiveContainer = React.lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const AreaChart = React.lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const Area = React.lazy(() => import('recharts').then(m => ({ default: m.Area })));
const XAxis = React.lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const CartesianGrid = React.lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
const ReferenceLine = React.lazy(() => import('recharts').then(m => ({ default: m.ReferenceLine })));

interface Props {
  speciesId: string;
  speciesName: string;
  scientificName: string;
}

export function ConservationTab({ speciesId, speciesName, scientificName }: Props) {
  const [populationData, setPopulationData] = useState<ApiPopulationPoint[]>([]);

  useEffect(() => {
    getPopulation(speciesId)
      .then(data => setPopulationData(data))
      .catch(() => {});
  }, [speciesId]);

  const firstPop = populationData[0]?.population ?? 0;
  const lastPop = populationData[populationData.length - 1]?.population ?? 0;
  const declinePct = firstPop > 0 ? Math.round(((firstPop - lastPop) / firstPop) * 100) : null;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-3">
        <ShieldAlert className="text-[var(--red-ext)] w-[18px] h-[18px]" />
        <h3 className="font-heading font-medium text-[16px] text-[var(--text-primary)]">Conservation status</h3>
      </div>

      <IntelligenceBlock
        speciesName={speciesName}
        scientificName={scientificName}
        dimension="conservation"
        accentColor="var(--red-ext)"
      >
        {(content) => {
          const paragraphs = content.split(/\n\n+/).filter(Boolean);
          return (
            <div className="flex flex-col gap-4">
              {paragraphs.map((para, i) => (
                <p key={i} className="font-body text-[15px] text-[var(--text-secondary)] leading-relaxed">{para}</p>
              ))}
            </div>
          );
        }}
      </IntelligenceBlock>

      {populationData.length > 1 && (
        <div className="flex flex-col gap-8">
          {declinePct !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[12px] p-[16px]">
                <div className="font-heading font-bold text-[28px] text-[var(--text-primary)] mb-1">
                  {lastPop.toLocaleString()}
                </div>
                <div className="font-body text-[13px] text-[var(--text-secondary)]">current estimate</div>
              </div>
              <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[12px] p-[16px]">
                <div className="font-heading font-bold text-[28px] text-[var(--text-primary)] mb-1">
                  {declinePct > 0 ? `${declinePct}%` : `+${Math.abs(declinePct)}%`}
                </div>
                <div className="font-body text-[13px] text-[var(--text-secondary)]">
                  {declinePct > 0 ? 'decline since records began' : 'increase since records began'}
                </div>
              </div>
              <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[12px] p-[16px]">
                <div className="font-heading font-bold text-[28px] text-[var(--text-primary)] mb-1">
                  {firstPop.toLocaleString()}
                </div>
                <div className="font-body text-[13px] text-[var(--text-secondary)]">
                  historic peak (~{populationData[0]?.year})
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[24px]">
            <h3 className="font-heading font-medium text-[16px] text-[var(--text-primary)] mb-6">
              Population trend ({populationData[0]?.year} – {populationData[populationData.length - 1]?.year})
            </h3>
            <div className="h-[300px] w-full">
              <Suspense fallback={<div className="w-full h-full bg-[var(--void-3)] animate-pulse rounded" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={populationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--red-ext)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--red-ext)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                    <ReferenceLine x={2010} stroke="var(--teal)" strokeDasharray="3 3" label={{ position: 'top', value: 'Conservation efforts', fill: 'var(--teal)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Area type="monotone" dataKey="population" stroke="var(--red-ext)" strokeWidth={2} fillOpacity={1} fill="url(#colorPop)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
