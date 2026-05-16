import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { IntelligencePillarsSection } from '../components/landing/IntelligencePillarsSection';
import { VisualizationPreviewSection } from '../components/landing/VisualizationPreviewSection';
import { FutureVisionSection } from '../components/landing/FutureVisionSection';

export default function LandingPage() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <HowItWorksSection />
          <IntelligencePillarsSection />
          <VisualizationPreviewSection />
          <FutureVisionSection />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
