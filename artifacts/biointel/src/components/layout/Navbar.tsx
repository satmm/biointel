import { useState, useEffect } from 'react';
import { Link } from 'wouter';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b-[0.5px] ${scrolled ? 'bg-[rgba(8,12,16,0.85)] backdrop-blur-xl border-[var(--border)]' : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-[6px] h-[6px] rounded-full bg-[var(--teal)] group-hover:shadow-[0_0_8px_var(--teal)] transition-shadow" />
          <span className="font-heading font-medium text-[var(--teal)] text-lg tracking-tight">BioIntel</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Platform', 'Research', 'About'].map(item => (
            <span key={item} className="font-body text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
              {item}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}
