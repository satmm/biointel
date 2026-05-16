export function ParticleField() {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    color: i % 2 === 0 ? 'var(--teal)' : 'var(--amber)',
    opacity: i % 2 === 0 ? 0.4 : 0.3,
    size: Math.random() * 2 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            left: p.left,
            top: p.top,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
          }}
        />
      ))}
    </div>
  );
}
