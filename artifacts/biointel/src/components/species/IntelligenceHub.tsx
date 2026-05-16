import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Scan, Activity, Network, ShieldAlert, BookOpen } from 'lucide-react';
import { EvolutionTab } from './tabs/EvolutionTab';
import { AnatomyTab } from './tabs/AnatomyTab';
import { BehaviorTab } from './tabs/BehaviorTab';
import { EcosystemTab } from './tabs/EcosystemTab';
import { ConservationTab } from './tabs/ConservationTab';
import { ResearchPapersTab } from './tabs/ResearchPapersTab';

interface Props {
  speciesId: string;
  speciesName: string;
  scientificName: string;
}

export function IntelligenceHub({ speciesId, speciesName, scientificName }: Props) {
  const [activeTab, setActiveTab] = useState('evolution');

  const tabs = [
    { id: 'evolution',   label: 'Evolution',   icon: <GitBranch className="w-4 h-4" />,   accent: 'var(--purple-evo)' },
    { id: 'anatomy',     label: 'Anatomy',     icon: <Scan className="w-4 h-4" />,         accent: 'var(--teal)' },
    { id: 'behavior',    label: 'Behavior',    icon: <Activity className="w-4 h-4" />,      accent: 'var(--amber)' },
    { id: 'ecosystem',   label: 'Ecosystem',   icon: <Network className="w-4 h-4" />,       accent: 'var(--green-safe)' },
    { id: 'conservation',label: 'Conservation',icon: <ShieldAlert className="w-4 h-4" />,   accent: 'var(--red-ext)' },
    { id: 'papers',      label: 'Research Papers', icon: <BookOpen className="w-4 h-4" />, accent: 'rgb(140,100,200)' },
  ];

  return (
    <div className="w-full flex flex-col mb-24">
      <div className="flex border-b-[0.5px] border-[var(--border)] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-[18px] py-[14px] font-body text-[14px] font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span style={{ color: activeTab === tab.id ? tab.accent : 'currentColor' }}>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-[-1px] left-0 w-full h-[2px]"
                style={{ backgroundColor: tab.accent }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="pt-[40px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'evolution'    && <EvolutionTab speciesName={speciesName} scientificName={scientificName} />}
            {activeTab === 'anatomy'      && <AnatomyTab speciesName={speciesName} scientificName={scientificName} />}
            {activeTab === 'behavior'     && <BehaviorTab speciesName={speciesName} scientificName={scientificName} />}
            {activeTab === 'ecosystem'    && <EcosystemTab speciesId={speciesId} speciesName={speciesName} scientificName={scientificName} />}
            {activeTab === 'conservation' && <ConservationTab speciesId={speciesId} speciesName={speciesName} scientificName={scientificName} />}
            {activeTab === 'papers'       && <ResearchPapersTab speciesId={speciesId} scientificName={scientificName} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
