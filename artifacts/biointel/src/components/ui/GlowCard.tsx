import { ReactNode } from 'react';

export function GlowCard({ children, accentColor, className = '' }: { children: ReactNode, accentColor?: string, className?: string }) {
  return (
    <div 
      className={`bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[28px] transition-all duration-300 hover:shadow-[0_0_40px_rgba(15,255,232,0.04)] ${className}`}
      style={{ '--hover-border': accentColor || 'var(--border-hover)' } as any}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor || 'var(--border-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {children}
    </div>
  );
}
