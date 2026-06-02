import { motion, AnimatePresence } from 'motion/react';
import { useMemo } from 'react';
import { PARTICLE_BURSTS } from '../../lib/petAnimations';
import { ParticleBurst } from './ReactionOverlay';

interface LevelUpSequenceProps {
  level: number;
  isOpen: boolean;
  onComplete: () => void;
}

const STAGES = [
  { key: 'buildUp',  duration: 600 },
  { key: 'charge',   duration: 700 },
  { key: 'flash',    duration: 500 },
  { key: 'reveal',   duration: 800 },
  { key: 'celebrate',duration: 1500 },
  { key: 'settle',   duration: 600 },
] as const;

export default function LevelUpSequence({ level, isOpen, onComplete }: LevelUpSequenceProps) {
  const particles = useMemo(() => {
    const cfg = PARTICLE_BURSTS.level_up;
    return Array.from({ length: 3 }, (_, i) => (
      <ParticleBurst key={`particle-${i}`} config={cfg} x={40 + i * 10} y={30 + (i % 2) * 20} />
    ));
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.2 } }}
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{
              backgroundColor: [
                'rgba(0,0,0,0)',
                'rgba(99,102,241,0.15)',
                'rgba(139,92,246,0.25)',
                'rgba(0,0,0,0)',
              ],
            }}
            transition={{ duration: STAGES.reduce((a, s) => a + s.duration, 0) / 1000, ease: 'easeInOut' }}
          />

          {/* Level number */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: [0.3, 1.4, 0.8, 1.2, 0.9, 1.1, 1],
              opacity: [0, 1, 1, 1, 1, 1, 1],
              y: [40, -20, 10, -10, 5, -5, 0],
            }}
            transition={{
              duration: 1.6,
              ease: [0.34, 1.56, 0.64, 1],
              times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
            }}
          >
            <motion.div
              className="text-7xl font-black tracking-tighter"
              style={{
                background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 24px rgba(99,102,241,0.4))',
              }}
              animate={{
                scale: [1, 1.08, 0.95, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Lv.{level}
            </motion.div>
            <motion.div
              className="text-sm font-bold uppercase tracking-[0.3em] mt-2"
              style={{
                color: 'rgba(167,139,250,0.8)',
                textShadow: '0 0 20px rgba(99,102,241,0.3)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1], y: [10, 0] }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              Level Up!
            </motion.div>
          </motion.div>

          {/* Particles */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {particles}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
