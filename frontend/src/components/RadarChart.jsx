const STAT_KEYS = ['pace', 'shooting', 'passing', 'dribbling', 'defense', 'physical'];

export function RadarChart({ stats }) {
  const size = 260;
  const center = size / 2;
  const radius = 92;

  const points = STAT_KEYS.map((key, index) => {
    const angle = (Math.PI * 2 * index) / STAT_KEYS.length - Math.PI / 2;
    const value = (stats[key] || 1) / 99;
    const x = center + Math.cos(angle) * radius * value;
    const y = center + Math.sin(angle) * radius * value;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
      {[0.2, 0.4, 0.6, 0.8, 1].map((factor) => (
        <circle
          key={factor}
          cx={center}
          cy={center}
          r={radius * factor}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
        />
      ))}
      {STAT_KEYS.map((label, index) => {
        const angle = (Math.PI * 2 * index) / STAT_KEYS.length - Math.PI / 2;
        const x = center + Math.cos(angle) * (radius + 22);
        const y = center + Math.sin(angle) * (radius + 22);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="11"
            fill="rgba(226,232,240,0.8)"
            className="uppercase"
          >
            {label.slice(0, 4)}
          </text>
        );
      })}
      <polygon points={points} fill="rgba(56,189,248,0.35)" stroke="rgba(125,211,252,0.95)" strokeWidth="2" />
    </svg>
  );
}
