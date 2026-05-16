import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ParticleField } from '../ui/ParticleField';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] w-full flex items-center justify-center bg-[var(--void)] overflow-hidden pt-20">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(15, 255, 232, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 255, 232, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(15,255,232,0.04) 0%, transparent 70%)' }} />
      
      <ParticleField />
      
      <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(15,255,232,0.3)] to-transparent animate-[scan_8s_linear_infinite]" />

      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-[0.5px] border-[rgba(15,255,232,0.25)] rounded-full px-[14px] py-[5px] mb-8"
        >
          <span className="font-mono text-[11px] tracking-[0.12em] text-[var(--teal)] uppercase">AI-POWERED BIODIVERSITY INTELLIGENCE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-heading font-bold text-[40px] md:text-[64px] leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] mb-6"
        >
          Understand every living thing<br />
          <span className="text-[var(--teal)]">on Earth.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="font-body text-[18px] text-[var(--text-secondary)] max-w-[500px] leading-[1.65] mb-10"
        >
          Upload any species image and receive research-grade intelligence — from evolutionary lineage to conservation risk — powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-row items-center gap-[14px]"
        >
          <Link href="/analyze" className="bg-[var(--teal)] text-[#080C10] rounded-[8px] px-[28px] py-[14px] font-heading font-medium text-[15px] hover:opacity-85 hover:scale-105 transition-all">
            Analyze a species
          </Link>
          <button className="bg-transparent border-[0.5px] border-[rgba(255,255,255,0.12)] text-[var(--text-secondary)] rounded-[8px] px-[28px] py-[14px] font-heading font-medium text-[15px] hover:border-[rgba(255,255,255,0.25)] transition-colors">
            See how it works
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="border-t-[0.5px] border-[var(--border)] pt-[32px] mt-[48px] flex w-full justify-center"
        >
          <div className="flex flex-row items-center divide-x divide-[var(--border)]">
            <div className="flex flex-col items-center px-8">
              <span className="font-heading font-bold text-3xl text-[var(--text-primary)] mb-1">450,000+</span>
              <span className="font-body text-[12px] text-[var(--text-secondary)]">species supported</span>
            </div>
            <div className="flex flex-col items-center px-8">
              <span className="font-heading font-bold text-3xl text-[var(--text-primary)] mb-1">7</span>
              <span className="font-body text-[12px] text-[var(--text-secondary)]">research dimensions</span>
            </div>
            <div className="flex flex-col items-center px-8">
              <span className="font-heading font-bold text-3xl text-[var(--text-primary)] mb-1">Real-time</span>
              <span className="font-body text-[12px] text-[var(--text-secondary)]">AI analysis</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
