import { AnimatePresence, motion } from 'motion/react';
import { bounceIn, sparklePop, type ParticleBurstPreset, type ParticleConfig } from '../../lib/petAnimations';

interface ReactionOverlayProps {
  particles: ParticleConfig | null;
  onComplete?: () => void;
}

export function ParticleBurst({ config, x, y, onComplete }: { key?: string | number; config: ParticleBurstPreset | ParticleConfig; x?: number; y?: number; onComplete?: () => void }) {
  const cfg = config as ParticleBurstPreset;
  const particles = Array.from({ length: config.count }, (_, i) => {
    const angle = (i / config.count) * 360 + Math.random() * 20;
    const distance = config.spread * (0.4 + Math.random() * 0.6);
    const r = cfg.rotateRandom ? Math.random() * 720 : 360;
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180) * distance,
      y: Math.sin((angle * Math.PI) / 180) * distance - (cfg.fadeIn ? 20 : 0),
      delay: Math.random() * 0.12,
      scale: 0.3 + Math.random() * 0.7,
      rotate: cfg.rotateRandom ? Math.random() * 360 : 0,
    };
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <AnimatePresence onExitComplete={onComplete}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ left: `${x ?? 50}%`, top: `${y ?? 50}%` }}
            variants={sparklePop}
            initial="hidden"
            animate="animate"
            exit="hidden"
            transition={{ delay: p.delay }}
          >
            <span
              className="block drop-shadow-lg will-change-transform"
              style={{
                fontSize: config.size === 'lg' ? '1.5rem' : config.size === 'md' ? '1.2rem' : '0.9rem',
                transform: `scale(${p.scale}) rotate(${p.rotate}deg)`,
              }}
            >
              {config.emoji}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ParticleTrail({ config, x, y }: { config: ParticleBurstPreset; x: number; y: number }) {
  const trails = Array.from({ length: Math.min(config.count, 4) }, (_, i) => {
    const angle = (i / 4) * 360;
    const dist = config.spread * 0.3;
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180) * dist,
      y: Math.sin((angle * Math.PI) / 180) * dist,
      delay: 0.08 * i,
    };
  });

  return (
    <>
      {trails.map(t => (
        <motion.div
          key={`trail-${t.id}`}
          className="absolute pointer-events-none"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0.6, scale: 0.8, x: 0, y: 0 }}
          animate={{
            opacity: [0.6, 0],
            scale: [0.8, 0.3],
            x: t.x,
            y: t.y,
          }}
          transition={{ duration: config.duration * 0.6, delay: t.delay, ease: 'easeOut' }}
        >
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{config.emoji}</span>
        </motion.div>
      ))}
    </>
  );
}

/* ─── REWARD ANIMATIONS ──────────────────────────────────── */

interface CoinBurstProps {
  count?: number;
  onComplete?: () => void;
}

export function CoinBurst({ count = 5, onComplete }: CoinBurstProps) {
  const coins = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const dist = 60 + Math.random() * 40;
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180) * dist,
      y: Math.sin((angle * Math.PI) / 180) * dist - 40,
      delay: i * 0.06,
    };
  });

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {coins.map(c => (
        <motion.div
          key={c.id}
          className="absolute pointer-events-none"
          style={{ left: '50%', top: '50%' }}
          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.3, 0.8, 1],
            opacity: [0, 1, 1, 0],
            x: c.x,
            y: [0, c.y - 20, c.y],
          }}
          transition={{ duration: 0.8, delay: c.delay, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className="text-xl drop-shadow-lg">🪙</span>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

interface XpFloatProps {
  amount: number;
  x?: number;
  y?: number;
  onComplete?: () => void;
}

export function XpFloat({ amount, x = 50, y = 50, onComplete }: XpFloatProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${x}%`, top: `${y}%` }}
        initial={{ opacity: 0, scale: 0.3, y: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.3, 1.2, 1, 0.5],
          y: [0, -40, -80],
        }}
        transition={{ duration: 1.2, ease: 'easeOut', times: [0, 0.15, 0.5, 1] }}
      >
        <span
          className="font-black text-sm drop-shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          +{amount} XP
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

interface FloatingRewardProps {
  emoji: string;
  text: string;
  x?: number;
  onComplete?: () => void;
}

export function FloatingReward({ emoji, text, x = 50, onComplete }: FloatingRewardProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        className="absolute pointer-events-none flex flex-col items-center gap-1"
        style={{ left: `${x}%`, top: '60%' }}
        initial={{ opacity: 0, scale: 0.3, y: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.3, 1.2, 1.1, 0.5],
          y: [0, -60, -120],
        }}
        transition={{ duration: 1.5, ease: 'easeOut', times: [0, 0.15, 0.4, 1] }}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 drop-shadow-lg">{text}</span>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── TEXT POPUP ────────────────────────────────────────────────── */

interface TextPopupProps {
  text: string;
  emoji?: string;
  visible: boolean;
}

export function TextPopup({ text, emoji, visible }: TextPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none whitespace-nowrap"
          variants={bounceIn}
          initial="hidden"
          animate="animate"
          exit="exit"
        >
          {emoji && <span className="text-base">{emoji}</span>}
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70 drop-shadow-xl">
            {text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── EXPORTED ROOT COMPONENT ──────────────────────────────────── */

export default function ReactionOverlay({ particles, onComplete }: ReactionOverlayProps) {
  if (!particles) return null;
  const cfg = particles as ParticleBurstPreset;
  return (
    <>
      <ParticleBurst config={cfg} onComplete={onComplete} />
      {cfg.trail && <ParticleTrail config={cfg} x={50} y={50} />}
    </>
  );
}
