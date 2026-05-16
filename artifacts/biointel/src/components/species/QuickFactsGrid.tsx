import { MapPin, Clock, Utensils, Zap, Users, TrendingDown } from 'lucide-react';
import { Species } from '../../lib/types';

export function QuickFactsGrid({ species }: { species: Species }) {
  const facts = [
    { icon: <MapPin className="w-4 h-4 text-[var(--teal)]" />, label: "HABITAT", value: species.habitat },
    { icon: <Clock className="w-4 h-4 text-[var(--amber)]" />, label: "LIFESPAN", value: species.lifespan },
    { icon: <Utensils className="w-4 h-4 text-[var(--red-ext)]" />, label: "DIET", value: species.diet },
    { icon: <Zap className="w-4 h-4 text-[var(--green-safe)]" />, label: "TOP SPEED", value: species.topSpeed },
    { icon: <Users className="w-4 h-4 text-[var(--purple-evo)]" />, label: "POPULATION", value: species.population },
    { icon: <TrendingDown className="w-4 h-4 text-[var(--red-ext)]" />, label: "TREND", value: species.populationTrend },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
      {facts.map((fact, idx) => (
        <div key={idx} className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[12px] p-[20px] pb-[24px]">
          <div className="flex items-center gap-2 mb-3">
            {fact.icon}
            <span className="font-mono text-[12px] text-[var(--text-tertiary)] uppercase tracking-[0.08em]">{fact.label}</span>
          </div>
          <div className="font-heading font-medium text-[24px] text-[var(--text-primary)]">
            {fact.value}
          </div>
        </div>
      ))}
    </div>
  );
}
