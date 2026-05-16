export function PhylogenyTree() {
  return (
    <div className="bg-[var(--void-2)] border-[0.5px] border-[var(--border)] rounded-[16px] p-[24px] w-full h-full min-h-[300px] flex items-center justify-center">
      <svg width="100%" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            .tree-line { stroke: var(--border); stroke-width: 1px; fill: none; }
            .tree-node { fill: var(--void-3); stroke: var(--border); stroke-width: 1px; }
            .tree-node-highlight { fill: var(--purple-evo); stroke: rgba(139,92,246,0.5); stroke-width: 2px; }
            .tree-label { font-family: 'JetBrains Mono', monospace; font-size: 12px; fill: rgba(240,246,246,0.5); }
            .tree-label-highlight { font-family: 'JetBrains Mono', monospace; font-size: 12px; fill: #F0F6F6; font-weight: 500; }
          `}
        </style>

        {/* Lines */}
        <path d="M 40 120 L 100 120" className="tree-line" />
        <path d="M 100 120 L 100 60 L 160 60" className="tree-line" />
        <path d="M 100 120 L 100 200 L 160 200" className="tree-line" />
        <path d="M 160 60 L 220 60" className="tree-line" />
        
        <path d="M 160 60 L 160 20 L 220 20" className="tree-line" />
        <path d="M 160 60 L 160 100 L 220 100" className="tree-line" />
        <path d="M 220 60 L 280 60" className="tree-line" />
        
        <path d="M 160 200 L 220 200" className="tree-line" />
        
        <path d="M 280 60 L 280 40 L 320 40" className="tree-line" />
        <path d="M 280 60 L 280 80 L 320 80" className="tree-line" />

        {/* Nodes */}
        <circle cx="40" cy="120" r="8" className="tree-node" />
        <circle cx="100" cy="120" r="8" className="tree-node" />
        <circle cx="160" cy="60" r="8" className="tree-node" />
        
        <circle cx="220" cy="20" r="8" className="tree-node" />
        <circle cx="220" cy="100" r="8" className="tree-node" />
        
        <circle cx="280" cy="60" r="8" className="tree-node" />
        
        <circle cx="320" cy="40" r="10" className="tree-node-highlight" />
        <circle cx="320" cy="80" r="8" className="tree-node" />
        
        <circle cx="220" cy="200" r="8" className="tree-node" />

        {/* Labels */}
        <text x="20" y="140" className="tree-label">Felidae</text>
        <text x="140" y="45" className="tree-label">Panthera</text>
        
        <text x="235" y="24" className="tree-label">P. leo (Lion)</text>
        <text x="235" y="104" className="tree-label">P. onca (Jaguar)</text>
        
        <text x="340" y="44" className="tree-label-highlight">P. tigris (Tiger)</text>
        <text x="340" y="84" className="tree-label">P. pardus (Leopard)</text>
        
        <text x="180" y="185" className="tree-label">Acinonyx</text>
        <text x="235" y="204" className="tree-label">A. jubatus (Cheetah)</text>
      </svg>
    </div>
  );
}
