import { useEffect, useState } from 'react';

export function ConfidenceBar({ value, label = "AI identification confidence" }: { value: number, label?: string }) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFill(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-[var(--teal)] font-mono text-[11px] uppercase tracking-wider">
        <span>{label}</span>
        <span className="font-medium text-[13px]">{value.toFixed(1)}%</span>
      </div>
      <div className="h-[4px] bg-[var(--void-3)] rounded-[2px] overflow-hidden">
        <div 
          className="h-full bg-[var(--teal)] transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
}
