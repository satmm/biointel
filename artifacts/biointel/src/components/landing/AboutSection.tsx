import { motion } from 'framer-motion';
import { SectionLabel } from '../ui/SectionLabel';
import { GlowCard } from '../ui/GlowCard';
import { Dna, Globe, ShieldAlert } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="bg-[var(--void)] py-[120px] px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionLabel text="01 / ABOUT THE PLATFORM" />
          
          <h2 className="font-heading font-bold text-[48px] text-[var(--text-primary)] mb-6 leading-tight">
            Not just identification.<br />
            <span className="text-[var(--teal)]">Biological intelligence.</span>
          </h2>
          
          <p className="font-body text-[17px] text-[var(--text-secondary)] max-w-[560px] leading-[1.75] mb-16">
            BioIntel transforms a single photograph into a complete scientific profile. We combine computer vision, ecological databases, evolutionary trees, and large language models to generate insights that would take a researcher weeks to compile.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <GlowCard accentColor="var(--purple-evo)">
              <Dna className="text-[var(--purple-evo)] w-6 h-6 mb-4" />
              <h3 className="font-heading font-medium text-[18px] text-[var(--text-primary)] mb-3">Evolutionary lineage</h3>
              <p className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Trace ancestry back millions of years. Understand clade relationships and divergence events.
              </p>
            </GlowCard>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <GlowCard accentColor="var(--teal)">
              <Globe className="text-[var(--teal)] w-6 h-6 mb-4" />
              <h3 className="font-heading font-medium text-[18px] text-[var(--text-primary)] mb-3">Ecological context</h3>
              <p className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Map predator-prey networks, habitat dependencies, and keystone ecosystem roles.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <GlowCard accentColor="var(--amber)">
              <ShieldAlert className="text-[var(--amber)] w-6 h-6 mb-4" />
              <h3 className="font-heading font-medium text-[18px] text-[var(--text-primary)] mb-3">Conservation intelligence</h3>
              <p className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Real-time IUCN status, population trends, and climate vulnerability scoring.
              </p>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
