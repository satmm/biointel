import { motion } from 'framer-motion';
import { SectionLabel } from '../ui/SectionLabel';
import { GitBranch, Scan, Thermometer, Activity, Network, Dna, ShieldAlert } from 'lucide-react';

export function IntelligencePillarsSection() {
  const pillars = [
    { accent: '#8B5CF6', title: 'Evolution & phylogeny', desc: 'Lineage, cladistics, divergence timelines', icon: <GitBranch /> },
    { accent: '#0FFFE8', title: 'Morphology & anatomy', desc: 'Adaptive traits, biomechanics, physiology', icon: <Scan /> },
    { accent: '#F97316', title: 'Ecophysiology', desc: 'Thermal tolerance, energy allocation', icon: <Thermometer /> },
    { accent: '#F5A623', title: 'Behavioral ecology', desc: 'Hunting, migration, social structures', icon: <Activity /> },
    { accent: '#22C55E', title: 'Population ecology', desc: 'Predator-prey dynamics, ecosystem roles', icon: <Network /> },
    { accent: '#8B5CF6', title: 'Genomics & molecular', desc: 'Adaptation genes, selection signatures', icon: <Dna /> },
    { accent: '#FF3B5C', title: 'Conservation & climate', desc: 'Extinction risk, habitat loss, climate models', icon: <ShieldAlert /> },
  ];

  return (
    <section className="bg-[var(--void)] py-[120px] px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <SectionLabel text="03 / RESEARCH DIMENSIONS" />
          <h2 className="font-heading font-bold text-[48px] text-[var(--text-primary)]">
            Seven layers of biological understanding.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[24px] min-h-[160px] relative transition-all duration-300 hover:scale-[1.02] ${idx === 6 ? 'lg:col-span-3 lg:w-1/3 lg:mx-auto' : ''}`}
              style={{ '--hover-border': p.accent } as any}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = p.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="absolute top-6 right-6 w-2 h-2 rounded-full" style={{ backgroundColor: p.accent }} />
              <div className="mb-4" style={{ color: p.accent }}>{p.icon}</div>
              <h3 className="font-heading font-medium text-[18px] text-[var(--text-primary)] mb-2">{p.title}</h3>
              <p className="font-body text-[14px] text-[var(--text-secondary)]">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
