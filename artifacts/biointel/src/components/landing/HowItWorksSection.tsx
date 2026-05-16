import { motion } from 'framer-motion';
import { SectionLabel } from '../ui/SectionLabel';
import { ImagePlus, ScanSearch, Microscope, BookOpenText, Sparkles } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Upload", desc: "Upload any species image or drag and drop", icon: <ImagePlus className="w-[28px] h-[28px] text-[var(--teal)]" /> },
    { num: "02", title: "Detect", desc: "YOLOv8 locates the subject in the frame", icon: <ScanSearch className="w-[28px] h-[28px] text-[var(--teal)]" /> },
    { num: "03", title: "Identify", desc: "BioCLIP matches against 450,000 species", icon: <Microscope className="w-[28px] h-[28px] text-[var(--teal)]" /> },
    { num: "04", title: "Research", desc: "AI retrieves and synthesizes scientific data", icon: <BookOpenText className="w-[28px] h-[28px] text-[var(--teal)]" /> },
    { num: "05", title: "Insights", desc: "7-dimension intelligence report generated", icon: <Sparkles className="w-[28px] h-[28px] text-[var(--teal)]" /> },
  ];

  return (
    <section className="bg-[var(--void-2)] py-[120px] px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <SectionLabel text="02 / HOW IT WORKS" />
          <h2 className="font-heading font-bold text-[48px] text-[var(--text-primary)]">
            From image to insight in seconds.
          </h2>
        </motion.div>

        <div className="flex flex-col md:flex-row relative">
          <div className="hidden md:block absolute top-[28px] left-[5%] right-[5%] h-[1px] bg-[var(--border)] z-0" />
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="flex-1 flex flex-row md:flex-col items-start md:items-center relative z-10 mb-8 md:mb-0"
            >
              <div className="flex flex-col items-center md:items-center mr-6 md:mr-0">
                <div className="font-mono text-[11px] text-[var(--teal)] tracking-[0.1em] mb-4">{step.num}</div>
                <div className="w-[56px] h-[56px] rounded-full bg-[var(--teal-dim)] flex items-center justify-center mb-6">
                  {step.icon}
                </div>
              </div>
              <div className="flex flex-col pt-2 md:pt-0 md:items-center text-left md:text-center md:px-4">
                <h3 className="font-heading font-medium text-[16px] text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="font-body text-[14px] text-[var(--text-secondary)]">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
