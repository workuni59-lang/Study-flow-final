import type { CSSProperties, ReactNode } from 'react';

export interface StopwatchWallpaperDef {
  id: string;
  label: string;
  swatchStyle: CSSProperties;
  bgStyle: CSSProperties;
  accentBorder: string;
  accentGlow: string;
  overlays?: (rm: boolean) => ReactNode;
}

export const STOPWATCH_WALLPAPERS: StopwatchWallpaperDef[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    swatchStyle: { background: 'linear-gradient(135deg, #1a1a3e, #2d1b69, #1a1a3e)' },
    bgStyle: {
      background: 'linear-gradient(135deg, #0d0d24, #1b0f3a, #0f0d2e, #1b0f3a, #0d0d24)',
      backgroundSize: '400% 400%',
      animation: 'sw-drift 12s ease-in-out infinite',
    },
    accentBorder: 'rgba(167,139,250,0.18)',
    accentGlow: 'rgba(167,139,250,0.08)',
    overlays: (rm) => (
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(129,140,248,0.06) 30%, rgba(167,139,250,0.04) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: rm ? 'none' : 'sw-aurora 8s ease-in-out infinite alternate',
        }}
      />
    ),
  },
  {
    id: 'monolith',
    label: 'Monolith',
    swatchStyle: { background: 'linear-gradient(135deg, #0a0a0f, #16162a, #0a0a0f)' },
    bgStyle: { background: 'linear-gradient(135deg, #050508, #0f0f1a, #050508)' },
    accentBorder: 'rgba(129,140,248,0.12)',
    accentGlow: 'rgba(129,140,248,0.05)',
    overlays: (rm) => (
      <div
        style={{
          position: 'absolute', top: '45%', left: '50%',
          width: '50vmin', height: '50vmin', borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)',
          animation: rm ? 'none' : 'sw-breathe 6s ease-in-out infinite',
        }}
      />
    ),
  },
  {
    id: 'wisp',
    label: 'Wisp',
    swatchStyle: { background: 'linear-gradient(180deg, #1a1410, #2d2018, #1a1410)' },
    bgStyle: { background: 'linear-gradient(180deg, #0f0d0a, #1a1410, #0f0d0a)' },
    accentBorder: 'rgba(245,158,11,0.15)',
    accentGlow: 'rgba(245,158,11,0.06)',
    overlays: (rm) => (
      <>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 45%, rgba(245,158,11,0.06) 0%, transparent 60%)',
          }}
        />
        {!rm && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {(Array.from({ length: 8 }) as undefined[]).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`,
                  borderRadius: '50%',
                  background: `rgba(245,158,11,${0.3 + (i % 4) * 0.1})`,
                  left: `${12 + (i * 23) % 76}%`,
                  filter: 'blur(1px)',
                  animation: `sw-float ${7 + (i % 4) * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 1.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </>
    ),
  },
];

export const STOPWATCH_WALLPAPER_IDS = STOPWATCH_WALLPAPERS.map(w => w.id);
export const STOPWATCH_WALLPAPER_DEFAULT = STOPWATCH_WALLPAPERS[0].id;
export const STOPWATCH_KEYFRAMES = `
@keyframes sw-drift { 0%,100% { background-position: 0% 50% } 25% { background-position: 100% 0% } 50% { background-position: 50% 100% } 75% { background-position: 100% 50% } }
@keyframes sw-aurora { 0% { opacity: 0.4; transform: translateY(0) } 100% { opacity: 1; transform: translateY(-10%) } }
@keyframes sw-breathe { 0%,100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1) } 50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.15) } }
@keyframes sw-float { 0%,100% { transform: translateY(0) translateX(0); opacity: 0 } 20% { opacity: 0.7 } 50% { opacity: 0.4 } 80% { opacity: 0.6 } 100% { transform: translateY(-100px) translateX(20px); opacity: 0 } }
`;
