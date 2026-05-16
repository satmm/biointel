import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-[var(--void-2)] border-t-[0.5px] border-[var(--border)] px-[40px] py-[48px]">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[6px] h-[6px] rounded-full bg-[var(--teal)]" />
            <span className="font-heading font-medium text-[var(--teal)] text-lg tracking-tight">BioIntel</span>
          </div>
          <div className="flex gap-6">
            {['Platform', 'Research', 'About'].map(item => (
              <span key={item} className="font-body text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center border-t-[0.5px] border-[var(--border)] pt-8">
          <span className="font-body text-[13px] text-[var(--text-secondary)]">© 2025 BioIntel</span>
          <span className="font-body text-[13px] text-[var(--text-tertiary)]">Built for science.</span>
        </div>
      </div>
    </footer>
  );
}
