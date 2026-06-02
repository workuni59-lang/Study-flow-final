export type EasingPreset =
  | 'snap' | 'smooth' | 'gentle' | 'bouncy' | 'stiff'
  | 'anticipate' | 'overshoot' | 'springy' | 'heavy' | 'float'
  | 'elastic' | 'squash' | 'stretch';

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

export type EasingTuple = [number, number, number, number];

export interface AnimationPreset {
  type: 'spring' | 'tween' | 'keyframes';
  config: SpringConfig | { duration: number; ease: EasingTuple | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' };
}

export const SPRINGS: Record<EasingPreset, SpringConfig> = {
  snap:     { stiffness: 400, damping: 30, mass: 0.5 },
  smooth:   { stiffness: 200, damping: 25 },
  gentle:   { stiffness: 120, damping: 20, mass: 1.2 },
  bouncy:   { stiffness: 250, damping: 12 },
  stiff:    { stiffness: 500, damping: 40, mass: 0.3 },
  anticipate: { stiffness: 180, damping: 8, mass: 0.8 },
  overshoot:  { stiffness: 300, damping: 10, mass: 0.6 },
  springy:  { stiffness: 150, damping: 6, mass: 0.7 },
  heavy:    { stiffness: 80,  damping: 18, mass: 2 },
  float:    { stiffness: 60,  damping: 15, mass: 1.5 },
  elastic:  { stiffness: 200, damping: 5, mass: 0.4 },
  squash:   { stiffness: 350, damping: 8, mass: 0.3 },
  stretch:  { stiffness: 250, damping: 6, mass: 0.5 },
};

export const EASING: Record<string, EasingTuple> = {
  anticipate:    [0.68, -0.6, 0.32, 1.6],
  overshoot:     [0.34, 1.56, 0.64, 1],
  bounceOut:     [0.34, 1.56, 0.64, 1],
  smoothOut:     [0, 0, 0.2, 1],
  smoothInOut:   [0.42, 0, 0.2, 1],
  gentleOut:     [0.25, 0.46, 0.45, 0.94],
  elasticOut:    [0.25, 0.46, 0.45, 1.4],
  backOut:       [0.175, 0.885, 0.32, 1.275],
  anticipateIn:  [0.36, 0.07, 0.19, 0.97],
};

export const TIMING = {
  fast:    0.15,
  normal:  0.3,
  slow:    0.5,
  float:   0.8,
  breathe: 2.5,
  idle:    3.5,
};

export function squashStretch(scaleY: number, scaleX: number, config?: SpringConfig) {
  return {
    scaleY,
    scaleX,
    transition: { type: 'spring' as const, ...(config ?? SPRINGS.squash) },
  };
}

export function anticipateScale(target: number, overshootAmount = 1.15) {
  return {
    scale: [1, overshootAmount, target],
    transition: { duration: 0.4, ease: EASING.anticipate },
  };
}

export function bounceSequenceY(height: number, count = 3) {
  const y: number[] = [0];
  for (let i = 0; i < count; i++) {
    y.push(-height / (i + 1));
    y.push(0);
  }
  return {
    y,
    transition: { duration: 0.6 * count, ease: EASING.bounceOut },
  };
}

export const ANIMATION_PRESETS = {
  idleBreathe: {
    y: [0, -3, 0, -1.5, 0],
    scaleY: [1, 1.008, 1, 1.004, 1],
    scaleX: [1, 0.995, 1, 0.997, 1],
    transition: { duration: TIMING.breathe, repeat: Infinity, ease: EASING.smoothInOut },
  },
  idleBlink: {
    scaleY: [1, 0.1, 1],
    transition: { duration: 0.15, ease: EASING.smoothOut },
  },
  idleLookAround: {
    x: [0, 8, 0, -8, 0],
    transition: { duration: 1.2, ease: EASING.gentleOut },
  },
  yawn: {
    scaleY: [1, 1.12, 1.15, 1.12, 1],
    scaleX: [1, 0.95, 0.92, 0.95, 1],
    y: [0, -4, -6, -4, 0],
    rotate: [0, 2, 0, -2, 0],
    transition: { duration: 1.8, ease: EASING.smoothInOut },
  },
  scratch: {
    rotate: [0, 15, 0, 12, 0, 10, 0],
    x: [0, 2, 0, 1.5, 0, 1, 0],
    transition: { duration: 1.2, ease: EASING.gentleOut },
  },
  excitedJump: {
    y: [0, -20, 0, -14, 0, -8, 0],
    scaleY: [1, 0.85, 1.1, 0.9, 1.05, 0.95, 1],
    scaleX: [1, 1.15, 0.9, 1.1, 0.95, 1.05, 1],
    transition: { duration: 0.7, ease: EASING.bounceOut },
  },
  happyWiggle: {
    rotate: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
    x: [0, -4, 4, -3, 3, -2, 2, -1, 1, 0],
    transition: { duration: 0.5, ease: EASING.gentleOut },
  },
  spin: {
    rotate: [0, 360],
    scale: [1, 1.2, 0.9, 1.15, 1],
    transition: { duration: 0.8, ease: EASING.anticipate },
  },
  eat: {
    scaleY: [1, 1.08, 1, 1.06, 1, 1.04, 1],
    scaleX: [1, 0.94, 1, 0.96, 1, 0.97, 1],
    y: [0, -3, 0, -2, 0, -1, 0],
    rotate: [0, 3, -2, 2, -1, 1, 0],
    transition: { duration: 0.8, ease: EASING.smoothInOut },
  },
  bellyRub: {
    rotate: [0, 5, 0, -5, 0, 4, -4, 0],
    scaleY: [1, 1.03, 0.98, 1.02, 0.99, 1.01, 1],
    transition: { duration: 1.5, ease: EASING.gentleOut },
  },
  leanIn: {
    x: [0, 6],
    rotate: [0, 4],
    scaleY: [1, 0.97],
    scaleX: [1, 1.03],
    transition: { duration: 0.3, ease: EASING.smoothOut },
  },
  leanOut: {
    x: [6, 0],
    rotate: [4, 0],
    scaleY: [0.97, 1],
    scaleX: [1.03, 1],
    transition: { duration: 0.4, ease: EASING.gentleOut },
  },
  chargeUp: {
    scale: [1, 0.95, 1.05, 0.9, 1.1, 0.85, 1.15],
    opacity: [1, 0.8, 1, 0.7, 1, 0.6, 1],
    transition: { duration: 0.6, ease: EASING.anticipate },
  },
  flashReveal: {
    scale: [1.15, 1.4, 0.8, 1.3, 0.9, 1.1, 1],
    opacity: [1, 0.3, 1, 0.5, 1, 0.8, 1],
    rotate: [0, -10, 10, -5, 5, -2, 0],
    transition: { duration: 0.8, ease: EASING.elasticOut },
  },
  evolutionGlow: {
    scale: [1, 1.3, 0.7, 1.5, 0.8, 1.4, 1],
    opacity: [1, 0.2, 0.8, 0.1, 0.9, 0.3, 1],
    rotate: [0, 15, -15, 10, -10, 5, 0],
    filter: ['brightness(1)', 'brightness(2)', 'brightness(0.5)', 'brightness(3)', 'brightness(0.8)', 'brightness(1.5)', 'brightness(1)'],
    transition: { duration: 1.5, ease: EASING.anticipate },
  } as any,
  celebrationCombo: {
    y: [0, -30, 0, -20, 0, -10, 0],
    rotate: [0, 360, 720],
    scale: [1, 0.8, 1.2, 0.9, 1.1, 1],
    transition: { duration: 1.2, ease: EASING.bounceOut },
  },
  shadowSquash: {
    scaleX: [1, 0.8, 1.15, 0.85, 1.05, 0.95, 1],
    opacity: [1, 0.6, 1, 0.7, 1, 0.9, 1],
    transition: { duration: 0.4, ease: EASING.bounceOut },
  },
  hoverIdle: {
    y: [0, -6, 0, -3, 0],
    transition: { duration: 3, repeat: Infinity, ease: EASING.smoothInOut },
  },
  progressPulse: {
    scale: [1, 1.04, 1, 1.02, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: EASING.smoothInOut },
  },
};

export const LEVEL_UP_TIMELINE = {
  buildUp: { duration: 400 },
  charge:  { duration: 500 },
  flash:   { duration: 300 },
  reveal:  { duration: 600 },
  celebrate: { duration: 1200 },
  settle:  { duration: 500 },
};

export const EVOLUTION_TIMELINE = {
  intro:     { duration: 600 },
  glowCharge: { duration: 800 },
  transform: { duration: 1200 },
  burst:     { duration: 500 },
  reveal:    { duration: 800 },
  settle:    { duration: 600 },
};
