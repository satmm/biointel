import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { UploadZone } from '../components/analyze/UploadZone';
import { SearchBar } from '../components/analyze/SearchBar';
import { ExampleSpecies } from '../components/analyze/ExampleSpecies';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');

  return (
    <div className="min-h-screen bg-[var(--void)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-[120px] pb-[80px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center text-center mb-12"
        >
          <div className="border-[0.5px] border-[rgba(15,255,232,0.25)] rounded-full px-[14px] py-[5px] mb-6">
            <span className="font-mono text-[11px] tracking-[0.12em] text-[var(--teal)] uppercase">SPECIES ANALYSIS</span>
          </div>
          
          <h1 className="font-heading font-bold text-[42px] text-[var(--text-primary)] mb-4">
            What are you studying today?
          </h1>
          
          <p className="font-body text-[16px] text-[var(--text-secondary)] max-w-[500px]">
            Upload an image or search by name to generate a complete research intelligence profile.
          </p>
        </motion.div>

        <div className="w-full max-w-[640px] flex justify-center mb-8">
          <div className="bg-[var(--void-3)] border-[0.5px] border-[var(--border)] rounded-full p-[6px] flex">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-full font-body text-[14px] font-medium transition-all ${
                activeTab === 'upload' 
                  ? 'bg-[var(--teal-dim)] border-[0.5px] border-[var(--border-hover)] text-[var(--teal)]' 
                  : 'text-[var(--text-secondary)] border-[0.5px] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              Upload Image
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-2 rounded-full font-body text-[14px] font-medium transition-all ${
                activeTab === 'search' 
                  ? 'bg-[var(--teal-dim)] border-[0.5px] border-[var(--border-hover)] text-[var(--teal)]' 
                  : 'text-[var(--text-secondary)] border-[0.5px] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              Search by name
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center min-h-[350px]">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <UploadZone />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full pt-10"
              >
                <SearchBar />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ExampleSpecies />
      </main>

      <Footer />
    </div>
  );
}
