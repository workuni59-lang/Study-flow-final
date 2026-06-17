import { motion, type Variants } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import type { PetAnimation } from '../../lib/gamification';

const PET_VARIANTS: Record<PetAnimation, Variants> = {
  idle: {
    initial: { y: 0, scale: 1, rotate: 0 },
    animate: {
      y: [0, -4, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  bounce: {
    initial: { y: 0, scale: 1 },
    animate: {
      y: [0, -12, -12, 0],
      scale: [1, 1.05, 1.05, 1],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' },
    },
  },
  spin: {
    initial: { rotate: 0, scale: 1 },
    animate: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  droop: {
    initial: { y: 0, scale: 1, rotate: 0 },
    animate: {
      y: [0, 2, 0],
      rotate: [0, -2, 0],
      scale: [1, 0.97, 1],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
  },
};

const SPECIES_EMOJI: Record<string, string> = {
  pixie: '\u2728',
  ember: '\uD83D\uDD25',
  lumina: '\uD83E\uDD8A',
  nimbus: '\uD83D\uDCA8',
};

interface PetWidgetProps {
  size?: number;
}

export const PetWidget = ({ size = 120 }: PetWidgetProps) => {
  const { petState, petAnimation } = useStudy();
  const species = petState.species || 'pixie';
  const emoji = SPECIES_EMOJI[species] || '\u2728';
  const variant = PET_VARIANTS[petAnimation] || PET_VARIANTS.idle;

  return (
    <motion.div
      className="flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      variants={variant}
      initial="initial"
      animate="animate"
    >
      <span style={{ fontSize: size * 0.6, lineHeight: 1 }}>
        {emoji}
      </span>
    </motion.div>
  );
};
