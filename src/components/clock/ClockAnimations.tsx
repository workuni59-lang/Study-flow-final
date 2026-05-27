import type { Variants, Transition } from 'motion/react';

export const digitTransition: Variants = {
  initial: { y: 20, opacity: 0, scale: 0.95, filter: 'blur(4px)' },
  animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { y: -20, opacity: 0, scale: 0.95, filter: 'blur(4px)' },
};

export const flipDigitTransition: Variants = {
  initial: { rotateX: -90, opacity: 0 },
  animate: { rotateX: 0, opacity: 1 },
  exit: { rotateX: 90, opacity: 0 },
};

export const styleFadeTransition: Variants = {
  initial: { opacity: 0, scale: 0.97, filter: 'blur(6px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.03, filter: 'blur(6px)' },
};

export const breathingGlow: Variants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
  },
};

export const ambientPulse: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
  },
};

export const focusPulse: Variants = {
  animate: {
    scale: [1, 1.008, 1],
    opacity: [0.9, 1, 0.9],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const celebrationBounce: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.15, 0.95, 1.08, 1],
    rotate: [0, -3, 3, -2, 0],
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
};

export const floatHover: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const sweepTransition: Transition = {
  type: 'spring',
  stiffness: 80,
  damping: 15,
  mass: 0.8,
};

export const softTransition: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

export const tickTransition: Transition = {
  duration: 0.25,
  ease: 'easeInOut',
};

export function getAnimationIntensity(intensity: number): number {
  return Math.max(0, Math.min(100, intensity));
}

export function shouldAnimate(intensity: number): boolean {
  return intensity > 5;
}
