import { motion, AnimatePresence } from 'motion/react';
import { useMemo } from 'react';
import { PARTICLE_BURSTS } from '../../lib/petAnimations';
import { ParticleBurst } from './ReactionOverlay';

interface EvolutionSequenceProps {
  isOpen: boolean;
  petName: string;
  newSpecies: string;
  onComplete: () => void;
}

const EVO_PARTICLES = [
  PARTICLE_BURSTS.evolution,
  PARTICLE_BURSTS.star,
  PARTICLE_BURSTS.rainbow,
];

export default function EvolutionSequence({ isOpen, petName, newSpecies, onComplete }: EvolutionSequenceProps) {
  const particleLayers = useMemo(() => {
    return EVO_PARTICLES.map((cfg, i) => {
      const offset = 15 + i * 15;
      return (
        <ParticleBurst key={i} config={cfg} x={50} y={50} />
      );
    });
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {/* Light rays */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.5, 1, 1.3, 1],
              opacity: [0, 0.6, 0.2, 0.4, 0],
            }}
            transition={{ duration: 3, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.6, 1] }}
          />

          {/* Center glow */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{
              scale: [0, 1.3, 0.7, 1.5, 0.9, 1.2, 1],
              opacity: [0, 0.8, 0.4, 0.9, 0.5, 0.8, 1],
              rotate: [-30, 10, -15, 25, -10, 15, 0],
            }}
            transition={{
              duration: 2.5,
              ease: [0.34, 1.56, 0.64, 1],
              times: [0, 0.15, 0.3, 0.5, 0.65, 0.8, 1],
            }}
          >
            {/* Sparkle ring */}
            <motion.div
              className="text-6xl mb-4"
              animate={{
                scale: [1, 1.2, 0.8, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: 1 }}
            >
              ✨
            </motion.div>

            <motion.div
              className="text-4xl font-black tracking-tighter mb-2"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #e879f9, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 32px rgba(168,85,247,0.5))',
              }}
            >
              Evolution!
            </motion.div>

            <motion.div
              className="text-lg font-bold tracking-wider uppercase"
              style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 0 20px rgba(168,85,247,0.4)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1], y: [20, 0] }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {petName} evolved!
            </motion.div>
          </motion.div>

          {/* Particle rings */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {particleLayers}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
