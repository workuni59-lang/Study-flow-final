import type { Variants } from 'motion/react';

/* ─── EXPRESSIVE ANIMATION PRESETS ───────────────────────────── */

export const squashStretch: Variants = {
  hidden: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 1.15, 0.85, 1],
    scaleY: [1, 0.85, 1.15, 1],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      times: [0, 0.2, 0.4, 1],
    },
  },
};

export const bounceIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 12,
      mass: 0.5,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const celebrationCombo: Variants = {
  hidden: { scale: 1, rotate: 0, y: 0 },
  animate: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    rotate: [0, -8, 8, -4, 0],
    y: [0, -20, 0, -10, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      times: [0, 0.2, 0.4, 0.7, 1],
    },
  },
};

export const excitedSpin: Variants = {
  hidden: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.15, 1],
    rotate: [0, 360, 0],
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
      times: [0, 0.6, 1],
    },
  },
};

export const happyJump: Variants = {
  hidden: { y: 0, scaleY: 1, scaleX: 1 },
  animate: {
    y: [0, -24, 0],
    scaleY: [1, 1.15, 1],
    scaleX: [1, 0.9, 1],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      times: [0, 0.4, 1],
    },
  },
};

export const confusedTilt: Variants = {
  hidden: { rotate: 0, scale: 1 },
  animate: {
    rotate: [0, -15, 10, -5, 0],
    scale: [1, 0.95, 1.02, 0.98, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

export const sleepySway: Variants = {
  hidden: { rotate: 0, y: 0 },
  animate: {
    rotate: [0, -3, 0, 3, 0],
    y: [0, -2, 0, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

export const anticipationBounce: Variants = {
  hidden: { y: 0, scale: 1 },
  animate: {
    y: [0, -4, 0],
    scale: [1, 0.95, 1.05],
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

export const sparklePop: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: 0 },
  animate: {
    scale: [0, 1.3, 1],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      times: [0, 0.3, 1],
    },
  },
};

export const overshootBounce: Variants = {
  hidden: { y: 0, scale: 1 },
  animate: {
    y: [0, -30, 5, -10, 0],
    scale: [1, 0.85, 1.08, 0.95, 1],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      times: [0, 0.3, 0.5, 0.7, 1],
    },
  },
};

export const floatIdle: Variants = {
  float: {
    y: [0, -6, 0, -3, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.3, 0.6, 0.8, 1],
    },
  },
};

export const bounceIdle: Variants = {
  bounce: {
    y: [0, -4, 0],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const swayIdle: Variants = {
  sway: {
    x: [0, 6, 0, -6, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

/* ─── IDLE ANIMATION MAP ─────────────────────────────────────── */

export const IDLE_VARIANTS: Record<string, Variants> = {
  float: floatIdle,
  bounce: bounceIdle,
  sway: swayIdle,
};

/* ─── REACTION ANIMATION MAP ─────────────────────────────────── */

export const REACTION_ANIMATIONS: Record<string, Variants> = {
  happy_jump: happyJump,
  celebration: celebrationCombo,
  excited_spin: excitedSpin,
  confused: confusedTilt,
  overshoot: overshootBounce,
  anticipation: anticipationBounce,
  squash_stretch: squashStretch,
};

/* ─── PARTICLE BURST CONFIGS ─────────────────────────────────── */

export interface ParticleConfig {
  count: number;
  emoji: string;
  spread: number;
  duration: number;
  size: 'sm' | 'md' | 'lg';
}

export const PARTICLE_BURSTS: Record<string, ParticleConfig> = {
  heart_small: { count: 6, emoji: '❤️', spread: 60, duration: 0.8, size: 'sm' },
  heart_big: { count: 10, emoji: '❤️', spread: 90, duration: 1.2, size: 'md' },
  sparkle: { count: 8, emoji: '✨', spread: 80, duration: 1, size: 'sm' },
  star: { count: 6, emoji: '⭐', spread: 70, duration: 1, size: 'md' },
  celebration: { count: 12, emoji: '🎉', spread: 120, duration: 1.5, size: 'lg' },
  confetti_party: { count: 16, emoji: '🎊', spread: 140, duration: 1.8, size: 'lg' },
  sleepy: { count: 3, emoji: '💤', spread: 30, duration: 2, size: 'sm' },
  rainbow: { count: 7, emoji: '🌈', spread: 100, duration: 1.5, size: 'md' },
  fire: { count: 8, emoji: '🔥', spread: 60, duration: 1, size: 'sm' },
  trophy: { count: 5, emoji: '🏆', spread: 80, duration: 1.5, size: 'lg' },
};
