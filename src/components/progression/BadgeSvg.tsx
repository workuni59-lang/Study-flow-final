import React from 'react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

export const formatXP = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

interface BadgeSvgProps {
  tier: BadgeTier;
  size?: number;
  unlocked?: boolean;
  animate?: boolean;
}

const BOX_SHADOWS: Record<BadgeTier, string> = {
  bronze: '0 0 8px rgba(205,127,50,0.35), 0 0 20px rgba(205,127,50,0.1)',
  silver: '0 0 10px rgba(100,160,220,0.4), 0 0 24px rgba(100,160,220,0.12)',
  gold: '0 0 14px rgba(240,184,0,0.5), 0 0 30px rgba(240,184,0,0.15)',
  platinum: '0 0 14px rgba(180,130,220,0.5), 0 0 30px rgba(180,130,220,0.15)',
  diamond: '0 0 18px rgba(100,200,240,0.5), 0 0 36px rgba(100,200,240,0.15)',
  legend: '0 0 22px rgba(255,107,53,0.6), 0 0 40px rgba(255,107,53,0.2)',
};

const BORDER_COLORS: Record<BadgeTier, string> = {
  bronze: '#CD7F32', silver: '#64A0DC', gold: '#F0B800',
  platinum: '#B482DC', diamond: '#64C8F0', legend: '#FF6B35',
};

const COLORS: Record<BadgeTier, { outer: string; inner: string; fill: string; accent: string; text: string }> = {
  bronze: { outer: '#CD7F32', inner: '#A0522D', fill: '#E8C396', accent: '#8B5A2B', text: '#6B3A1F' },
  silver: { outer: '#B0B8C0', inner: '#8A95A0', fill: '#D0D5DC', accent: '#6B7B8D', text: '#3A4A5A' },
  gold: { outer: '#F0B800', inner: '#C89200', fill: '#FFDF73', accent: '#A67C00', text: '#7A5E00' },
  platinum: { outer: '#D4E0E8', inner: '#A8B8C8', fill: '#E8EFF5', accent: '#7A8B9E', text: '#4A5A6A' },
  diamond: { outer: '#7DD3EA', inner: '#38BDF8', fill: '#AEE8F8', accent: '#0284C7', text: '#0369A1' },
  legend: { outer: '#FF6B35', inner: '#E04820', fill: '#FF9A6C', accent: '#C03510', text: '#8A2508' },
};

const TIER_DOTS: Record<BadgeTier, number> = {
  bronze: 8, silver: 10, gold: 12, platinum: 14, diamond: 16, legend: 18,
};

function CenterIcon({ tier, accent }: { tier: BadgeTier; accent: string }) {
  switch (tier) {
    case 'bronze':
      return (
        <g>
          <path d="M38 72 L38 45 Q38 35 50 28 Q62 35 62 45 L62 72 L50 65 Z" fill={accent} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M50 22 L54 30 L62 32 L56 38 L58 46 L50 42 L42 46 L44 38 L38 32 L46 30 Z" fill="#FFD700" stroke="#fff" strokeWidth="1" />
        </g>
      );
    case 'silver':
      return (
        <g>
          <path d="M38 72 L42 62 L35 56 L45 54 L50 44 L55 54 L65 56 L58 62 L62 72 L50 66 Z" fill={accent} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="50" cy="42" r="7" fill="#fff" opacity="0.8" />
          <path d="M50 38 L52 42 L56 42 L53 45 L54 49 L50 47 L46 49 L47 45 L44 42 L48 42 Z" fill={accent} />
        </g>
      );
    case 'gold':
      return (
        <g>
          <path d="M40 72 C38 58 30 52 30 44 Q30 34 40 30 Q50 26 60 30 Q70 34 70 44 C70 52 62 58 60 72 L50 66 Z" fill={accent} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M50 35 L53 42 L60 42 L55 47 L57 54 L50 50 L43 54 L45 47 L40 42 L47 42 Z" fill="#FFD700" stroke="#fff" strokeWidth="0.8" />
        </g>
      );
    case 'platinum':
      return (
        <g>
          <polygon points="50,26 58,36 70,40 62,50 64,62 52,58 40,68 42,56 34,48 44,40" fill={accent} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="50,34 54,40 62,42 56,48 58,56 50,52 44,58 46,50 40,44 48,40" fill="#fff" opacity="0.9" />
          <circle cx="50" cy="42" r="4" fill={accent} />
        </g>
      );
    case 'diamond':
      return (
        <g>
          <path d="M50 22 L56 30 L66 34 L62 44 L66 56 L56 60 L50 70 L44 60 L34 56 L38 44 L34 34 L44 30 Z" fill={accent} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M50 28 L54 34 L62 36 L58 44 L60 54 L52 56 L50 64 L48 56 L40 54 L42 44 L38 36 L46 34 Z" fill="#ABE8F8" opacity="0.9" />
          <path d="M50 34 L52 38 L56 40 L52 42 L50 46 L48 42 L44 40 L48 38 Z" fill="#fff" />
        </g>
      );
    case 'legend':
      return (
        <g>
          <circle cx="50" cy="46" r="16" fill={accent} stroke="#fff" strokeWidth="1.5" />
          <path d="M50 30 L52 36 L58 38 L54 42 L56 48 L50 46 L44 48 L46 42 L42 38 L48 36 Z" fill="#fff" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + 22 * Math.cos(rad);
            const y1 = 46 + 22 * Math.sin(rad);
            const x2 = 50 + 28 * Math.cos(rad);
            const y2 = 46 + 28 * Math.sin(rad);
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />;
          })}
        </g>
      );
  }
}

export const BadgeSvg = ({ tier, size = 80, unlocked = true, animate = false }: BadgeSvgProps) => {
  const c = COLORS[tier];
  const dotCount = TIER_DOTS[tier];
  const dots: { angle: number }[] = Array.from({ length: dotCount }, (_, i) => ({
    angle: (360 / dotCount) * i,
  }));
  const borderColor = BORDER_COLORS[tier];

  const svg = (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${tier} badge`}>
      <title>{tier} badge</title>
      <defs>
        <radialGradient id={`shine-${tier}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`bg-${tier}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={c.fill} />
          <stop offset="100%" stopColor={c.inner} />
        </radialGradient>
        {tier === 'legend' && (
          <filter id="legend-pulse">
            <feGaussianBlur stdDeviation="3" result="blur">
              <animate attributeName="stdDeviation" values="2;5;2" dur="2s" repeatCount="indefinite" />
            </feGaussianBlur>
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>
      {animate && (
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite" />
      )}
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="6" transform="translate(1, 2)" />
      <circle
        cx="50" cy="50" r="44"
        fill={`url(#bg-${tier})`}
        stroke={borderColor}
        strokeWidth="3"
        filter={tier === 'legend' && unlocked ? 'url(#legend-pulse)' : undefined}
      />
      <circle cx="50" cy="50" r="36" fill="none" stroke={c.accent} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      <circle cx="50" cy="50" r="30" fill={c.fill} stroke={c.inner} strokeWidth="1.5" />
      <CenterIcon tier={tier} accent={c.accent} />
      {dots.map((d, i) => {
        const rad = (d.angle * Math.PI) / 180;
        const x = 50 + 40 * Math.cos(rad);
        const y = 50 + 40 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="1.5" fill={c.accent} opacity={unlocked ? 0.6 : 0.3} />;
      })}
      <circle cx="50" cy="50" r="44" fill={`url(#shine-${tier})`} />
      {(tier === 'gold' || tier === 'platinum' || tier === 'diamond' || tier === 'legend') && (
        <path d="M22 28 Q36 18 50 22 Q64 18 78 28" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      )}
    </svg>
  );

  if (!unlocked) {
    return (
      <div style={{ opacity: 0.75, display: 'inline-flex' }}>
        {svg}
      </div>
    );
  }

  return (
    <div style={{ boxShadow: BOX_SHADOWS[tier], borderRadius: '50%', display: 'inline-flex' }}>
      {svg}
    </div>
  );
};

export const BadgeDisplay = ({ tier, size = 64, unlocked = true, showLabel = true }: BadgeSvgProps & { showLabel?: boolean }) => {
  const labels: Record<BadgeTier, string> = {
    bronze: 'Bronze Dedication', silver: 'Silver Focus', gold: 'Gold Mastery',
    platinum: 'Platinum Excellence', diamond: 'Diamond Wisdom', legend: 'Transcendent Legend',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <BadgeSvg tier={tier} size={size} unlocked={unlocked} />
      {showLabel && (
        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: unlocked ? 'inherit' : '#94a3b8' }}>
          {labels[tier]}
        </span>
      )}
    </div>
  );
};
