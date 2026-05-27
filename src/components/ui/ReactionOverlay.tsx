import { AnimatePresence, motion } from 'motion/react';
import { bounceIn, sparklePop, type ParticleConfig } from '../../lib/petAnimations';

interface ReactionOverlayProps {
  particles: ParticleConfig | null;
  onComplete?: () => void;
}

function ParticleBurst({ config, onComplete }: { config: ParticleConfig; onComplete?: () => void }) {
  const particles = Array.from({ length: config.count }, (_, i) => {
    const angle = (i / config.count) * 360 + Math.random() * 20;
    const distance = config.spread * (0.5 + Math.random() * 0.5);
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180) * distance,
      y: Math.sin((angle * Math.PI) / 180) * distance,
      delay: Math.random() * 0.15,
      scale: 0.4 + Math.random() * 0.6,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence onExitComplete={onComplete}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute top-1/2 left-1/2"
            variants={sparklePop}
            initial="hidden"
            animate="animate"
            exit="hidden"
            transition={{ delay: p.delay }}
            style={{ x: p.x, y: p.y }}
          >
            <span
              className="block drop-shadow-lg"
              style={{
                fontSize: config.size === 'lg' ? '1.5rem' : config.size === 'md' ? '1.2rem' : '0.9rem',
                transform: `scale(${p.scale})`,
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

/* ─── TEXT POPUP ────────────────────────────────────────────────── */

interface TextPopupProps {
  text: string;
  emoji?: string;
  visible: boolean;
}

function TextPopup({ text, emoji, visible }: TextPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none whitespace-nowrap"
          variants={bounceIn}
          initial="hidden"
          animate="animate"
          exit="exit"
        >
          {emoji && <span className="text-sm">{emoji}</span>}
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 drop-shadow-lg">
            {text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── EXPORTED COMPONENT ────────────────────────────────────────── */

export default function ReactionOverlay({ particles, onComplete }: ReactionOverlayProps) {
  if (!particles) return null;
  return (
    <>
      <ParticleBurst config={particles} onComplete={onComplete} />
    </>
  );
}

export { TextPopup, ParticleBurst };
