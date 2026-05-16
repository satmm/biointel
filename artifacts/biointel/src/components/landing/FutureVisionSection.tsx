import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { SectionLabel } from '../ui/SectionLabel';

export function FutureVisionSection() {
  return (
    <section className="bg-[var(--void)] py-[120px] px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center w-full"
        >
          <SectionLabel text="05 / THE MISSION" />
          
          <h2 className="font-heading font-bold text-[48px] text-[var(--text-primary)] mb-6 max-w-[800px] leading-tight">
            Every species. Every relationship. Every insight. Accessible to anyone.
          </h2>
          
          <p className="font-body text-[18px] text-[var(--text-secondary)] max-w-[600px] mb-16">
            We're building the most comprehensive biological intelligence platform to accelerate research and conservation efforts worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[20px] p-[40px]">
            <div className="font-heading font-bold text-[52px] text-[var(--teal)] mb-2">8.7M</div>
            <div className="font-body text-[15px] text-[var(--text-secondary)]">estimated species on Earth</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[20px] p-[40px]">
            <div className="font-heading font-bold text-[52px] text-[var(--amber)] mb-2">1M+</div>
            <div className="font-body text-[15px] text-[var(--text-secondary)]">threatened with extinction</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[20px] p-[40px]">
            <div className="font-heading font-bold text-[52px] text-[var(--red-ext)] mb-2">3%</div>
            <div className="font-body text-[15px] text-[var(--text-secondary)]">have been scientifically described</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <h3 className="font-heading font-medium text-[24px] text-[var(--text-primary)] mb-8">Start exploring.</h3>
          <Link href="/analyze" className="bg-[var(--teal)] text-[#080C10] rounded-[8px] px-[28px] py-[14px] font-heading font-medium text-[15px] hover:opacity-85 hover:scale-105 transition-all">
            Analyze a species
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
