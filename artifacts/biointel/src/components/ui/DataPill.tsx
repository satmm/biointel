import { ReactNode } from 'react';

export function DataPill({ children, color = 'var(--teal)' }: { children: ReactNode, color?: string }) {
  return (
    <span 
      className="inline-flex font-mono text-[12px] px-[12px] py-[4px] rounded-full border-[0.5px]"
      style={{ 
        color, 
        borderColor: color.replace(')', ', 0.25)').replace('rgb', 'rgba').replace('var(--purple-evo)', 'rgba(139,92,246,0.25)').replace('var(--teal)', 'rgba(15,255,232,0.25)'),
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('var(--purple-evo)', 'rgba(139,92,246,0.1)').replace('var(--teal)', 'rgba(15,255,232,0.1)')
      }}
    >
      {children}
    </span>
  );
}
