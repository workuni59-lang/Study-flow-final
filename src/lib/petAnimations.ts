import type { Variants } from 'motion/react';

/* ─── CORE EASING CURVES ──────────────────────────────────── */
const EASE = {
  anticipate: [0.68, -0.6, 0.32, 1.6] as const,
  overshoot:  [0.34, 1.56, 0.64, 1] as const,
  smoothOut:  [0.0, 0.0, 0.2, 1] as const,
  smoothInOut: [0.42, 0, 0.2, 1] as const,
  gentleOut:  [0.25, 0.46, 0.45, 0.94] as const,
  elasticOut: [0.25, 0.46, 0.45, 1.4] as const,
  bounceOut:  [0.34, 1.56, 0.64, 1] as const,
};

/* ─── SQUASH & STRETCH ────────────────────────────────────── */

export const squashStretch: Variants = {
  hidden: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 1.18, 0.82, 1.05, 0.95, 1],
    scaleY: [1, 0.82, 1.18, 0.95, 1.05, 1],
    transition: {
      duration: 0.55,
      ease: EASE.anticipate,
      times: [0, 0.15, 0.35, 0.55, 0.75, 1],
    },
  },
};

export const bounceIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.3, 0.85, 1.1, 0.95, 1],
    opacity: [0, 1, 1, 1, 1, 1],
    transition: { duration: 0.6, ease: EASE.bounceOut, times: [0, 0.3, 0.5, 0.7, 0.85, 1] },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

/* ─── REACTION ANIMATIONS ─────────────────────────────────── */

export const celebrationCombo: Variants = {
  hidden: { scale: 1, rotate: 0, y: 0 },
  animate: {
    scale: [1, 1.25, 0.85, 1.15, 0.9, 1.08, 1],
    rotate: [0, -12, 12, -8, 8, -4, 0],
    y: [0, -28, 0, -18, 0, -8, 0],
    transition: {
      duration: 1,
      ease: EASE.overshoot,
      times: [0, 0.15, 0.3, 0.5, 0.65, 0.8, 1],
    },
  },
};

export const excitedSpin: Variants = {
  hidden: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 0.9, 1.2, 0.95, 1.1, 1],
    rotate: [0, 360, 720],
    transition: {
      duration: 1,
      ease: EASE.anticipate,
      times: [0, 0.4, 1],
    },
  },
};

export const happyJump: Variants = {
  hidden: { y: 0, scaleY: 1, scaleX: 1 },
  animate: {
    y: [0, -28, 4, -16, 2, -6, 0],
    scaleY: [1, 1.2, 0.8, 1.1, 0.9, 1.05, 1],
    scaleX: [1, 0.85, 1.15, 0.9, 1.08, 0.95, 1],
    transition: {
      duration: 0.65,
      ease: EASE.bounceOut,
      times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
    },
  },
};

export const confusedTilt: Variants = {
  hidden: { rotate: 0, scale: 1, x: 0 },
  animate: {
    rotate: [0, -18, 12, -8, 6, -3, 0],
    scale: [1, 0.93, 1.04, 0.97, 1.02, 0.98, 1],
    x: [0, -4, 3, -2, 1, 0, 0],
    transition: {
      duration: 0.7,
      ease: EASE.gentleOut,
      times: [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1],
    },
  },
};

export const sleepySway: Variants = {
  hidden: { rotate: 0, y: 0 },
  animate: {
    rotate: [0, -4, 0, 4, 0, -3, 0, 3, 0],
    y: [0, -2, 0, -2, 0, -1, 0, -1, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: EASE.smoothInOut,
      times: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 0.8, 0.9, 1],
    },
  },
};

export const anticipationBounce: Variants = {
  hidden: { y: 0, scale: 1 },
  animate: {
    y: [0, -6, 2, -4, 0],
    scale: [1, 0.92, 1.08, 0.96, 1.04],
    transition: {
      duration: 0.35,
      ease: EASE.anticipate,
      times: [0, 0.3, 0.5, 0.7, 1],
    },
  },
};

export const sparklePop: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: 0 },
  animate: {
    scale: [0, 1.4, 0.9, 1.1, 1],
    opacity: [0, 1, 0.8, 0.9, 0],
    rotate: [0, 180, 360],
    transition: { duration: 0.7, ease: EASE.smoothOut, times: [0, 0.2, 0.4, 0.6, 1] },
  },
};

export const overshootBounce: Variants = {
  hidden: { y: 0, scale: 1 },
  animate: {
    y: [0, -35, 8, -18, 4, -8, 0],
    scale: [1, 0.8, 1.12, 0.88, 1.06, 0.94, 1],
    transition: {
      duration: 0.7,
      ease: EASE.overshoot,
      times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
    },
  },
};

/* ─── IDLE ANIMATIONS ─────────────────────────────────────── */

export const floatIdle: Variants = {
  float: {
    y: [0, -7, -2, -5, 0, -3, -1, -4, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: EASE.smoothInOut,
      times: [0, 0.2, 0.35, 0.5, 0.6, 0.75, 0.85, 0.95, 1],
    },
  },
};

export const bounceIdle: Variants = {
  bounce: {
    y: [0, -5, 0, -3, 0, -4, 0, -2, 0],
    scaleY: [1, 1.04, 0.98, 1.03, 1, 1.02, 0.99, 1.01, 1],
    scaleX: [1, 0.97, 1.02, 0.98, 1, 0.99, 1.01, 1, 1],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: EASE.gentleOut,
      times: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 0.8, 0.9, 1],
    },
  },
};

export const swayIdle: Variants = {
  sway: {
    x: [0, 7, 0, -7, 0, 5, 0, -5, 0],
    rotate: [0, 3, 0, -3, 0, 2, 0, -2, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: EASE.smoothInOut,
      times: [0, 0.15, 0.3, 0.45, 0.55, 0.7, 0.8, 0.9, 1],
    },
  },
};

/* ─── ENHANCED IDLE ANIMATIONS ────────────────────────────── */

export const breathIdle: Variants = {
  breath: {
    y: [0, -3, 0, -1.5, 0],
    scaleY: [1, 1.01, 1, 1.005, 1],
    scaleX: [1, 0.995, 1, 0.997, 1],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: EASE.smoothInOut,
      times: [0, 0.3, 0.5, 0.75, 1],
    },
  },
};

export const blinkVariants: Variants = {
  hidden: { scaleY: 1 },
  animate: {
    scaleY: [1, 0.05, 1],
    transition: { duration: 0.12, ease: 'easeInOut', times: [0, 0.3, 1] },
  },
};

/* ─── NEW EXPRESSIVE ANIMATIONS ────────────────────────────── */

export const eatChew: Variants = {
  hidden: { scaleY: 1, scaleX: 1, y: 0, rotate: 0 },
  animate: {
    scaleY: [1, 1.1, 0.95, 1.08, 0.96, 1.06, 0.97, 1.04, 0.98, 1.02, 1],
    scaleX: [1, 0.93, 1.05, 0.94, 1.04, 0.95, 1.03, 0.96, 1.02, 0.97, 1],
    y: [0, -4, 1, -3, 1, -2, 1, -2, 0, -1, 0],
    rotate: [0, 4, -3, 3, -2, 2, -1, 1, 0],
    transition: {
      duration: 1.2,
      ease: EASE.gentleOut,
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    },
  },
};

export const satisfactionSettle: Variants = {
  hidden: { scaleY: 1, rotate: 0 },
  animate: {
    scaleY: [1, 1.08, 0.97, 1.04, 0.98, 1],
    rotate: [0, 3, -2, 2, -1, 0],
    y: [0, -2, 1, 0],
    transition: { duration: 0.8, ease: EASE.gentleOut, times: [0, 0.2, 0.5, 0.7, 0.85, 1] },
  },
};

export const scratchAnim: Variants = {
  hidden: { rotate: 0, x: 0, y: 0 },
  animate: {
    rotate: [0, 18, -3, 15, -2, 12, 0],
    x: [0, 3, -1, 2, 0, 1, 0],
    y: [0, -2, 1, -1, 0],
    scaleX: [1, 0.97, 1.02, 0.98, 1],
    transition: {
      duration: 1.4,
      ease: EASE.gentleOut,
      times: [0, 0.15, 0.3, 0.5, 0.65, 0.8, 1],
    },
  },
};

export const yawnAnim: Variants = {
  hidden: { scaleY: 1, y: 0, rotate: 0 },
  animate: {
    scaleY: [1, 1.15, 1.18, 1.12, 1.06, 1],
    scaleX: [1, 0.94, 0.9, 0.95, 0.98, 1],
    y: [0, -5, -8, -4, -2, 0],
    rotate: [0, 3, 0, -2, 0],
    transition: {
      duration: 2.2,
      ease: EASE.smoothInOut,
      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
    },
  },
};

export const leanInAnim: Variants = {
  hidden: { x: 0, rotate: 0, scaleY: 1, scaleX: 1 },
  animate: {
    x: [0, 8],
    rotate: [0, 5],
    scaleY: [1, 0.96],
    scaleX: [1, 1.04],
    transition: { duration: 0.35, ease: EASE.smoothOut },
  },
};

export const leanOutAnim: Variants = {
  hidden: { x: 8, rotate: 5, scaleY: 0.96, scaleX: 1.04 },
  animate: {
    x: [8, 3, 0],
    rotate: [5, 2, 0],
    scaleY: [0.96, 0.98, 1],
    scaleX: [1.04, 1.02, 1],
    transition: { duration: 0.45, ease: EASE.gentleOut, times: [0, 0.4, 1] },
  },
};

/* ─── LEVEL UP SEQUENCE ───────────────────────────────────── */

export const levelUpBuildUp: Variants = {
  hidden: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 0.92, 1.06, 0.88, 1.1],
    opacity: [1, 0.7, 1, 0.5, 1],
    transition: { duration: 0.5, ease: EASE.anticipate, times: [0, 0.2, 0.4, 0.6, 1] },
  },
};

export const levelUpCharge: Variants = {
  hidden: { scale: 1, rotate: 0, filter: 'brightness(1)' },
  animate: {
    scale: [1, 1.15, 0.95, 1.2],
    rotate: [0, 5, -5, 0],
    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(2)', 'brightness(1)'],
    transition: { duration: 0.6, ease: EASE.anticipate, times: [0, 0.3, 0.6, 1] },
  } as any,
};

export const levelUpFlash: Variants = {
  hidden: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.5, 0.5, 1.3, 0.7, 1],
    opacity: [1, 0.1, 0.9, 0.2, 0.8, 1],
    rotate: [0, -15, 20, -10, 10, 0],
    transition: { duration: 0.7, ease: EASE.elasticOut, times: [0, 0.15, 0.3, 0.5, 0.7, 1] },
  },
};

export const levelUpCelebrate: Variants = {
  hidden: { y: 0, scale: 1 },
  animate: {
    y: [0, -35, 0, -25, 0, -15, 0],
    scale: [1, 0.8, 1.15, 0.85, 1.1, 0.9, 1],
    rotate: [0, -8, 8, -5, 5, -2, 0],
    transition: {
      duration: 1.2,
      ease: EASE.bounceOut,
      times: [0, 0.12, 0.25, 0.4, 0.55, 0.75, 1],
    },
  },
};

/* ─── EVOLUTION SEQUENCE ──────────────────────────────────── */

export const evolutionIntro: Variants = {
  hidden: { scale: 1, opacity: 1, rotate: 0 },
  animate: {
    scale: [1, 0.9, 1.05, 0.85],
    opacity: [1, 0.6, 0.9, 0.4],
    rotate: [0, 3, -3, 0],
    transition: { duration: 0.6, ease: EASE.smoothInOut, times: [0, 0.3, 0.6, 1] },
  },
};

export const evolutionCharge: Variants = {
  hidden: { scale: 1, opacity: 1, filter: 'brightness(1)' },
  animate: {
    scale: [1, 1.2, 0.8, 1.4, 0.7, 1.5],
    opacity: [1, 0.3, 0.8, 0.15, 0.7, 0.1],
    rotate: [0, -10, 15, -20, 25, -30],
    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(2.5)', 'brightness(0.5)', 'brightness(3)', 'brightness(0.2)'],
    transition: { duration: 1.2, ease: EASE.anticipate, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
  } as any,
};

export const evolutionBurst: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  animate: {
    scale: [0.5, 2, 0.3, 1.8, 0.5, 1.5, 1],
    opacity: [0, 1, 0.2, 0.9, 0.3, 0.8, 1],
    rotate: [0, 45, -30, 20, -10, 5, 0],
    transition: { duration: 0.8, ease: EASE.elasticOut, times: [0, 0.1, 0.25, 0.4, 0.55, 0.75, 1] },
  },
};

export const evolutionReveal: Variants = {
  hidden: { scale: 1, opacity: 1, filter: 'brightness(1)' },
  animate: {
    scale: [1, 1.3, 0.9, 1.15, 1],
    opacity: [1, 0.2, 0.9, 0.5, 1],
    filter: ['brightness(1)', 'brightness(3)', 'brightness(0.8)', 'brightness(2)', 'brightness(1)'],
    transition: { duration: 0.8, ease: EASE.overshoot, times: [0, 0.2, 0.4, 0.6, 1] },
  } as any,
};

/* ─── STUDY PROGRESS ANIMATIONS ───────────────────────────── */

export const progressCurious: Variants = {
  animate: {
    rotate: [0, 8, -8, 5, -5, 0],
    x: [0, 4, -4, 2, -2, 0],
    scale: [1, 1.03, 0.98, 1.02, 0.99, 1],
    transition: { duration: 1.2, ease: EASE.gentleOut, times: [0, 0.15, 0.3, 0.5, 0.7, 1] },
  },
};

export const progressEncouraging: Variants = {
  animate: {
    y: [0, -4, 0, -3, 0],
    scaleY: [1, 1.03, 0.98, 1.02, 1],
    scaleX: [1, 0.98, 1.02, 0.99, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: EASE.smoothInOut, times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

export const progressExcited: Variants = {
  animate: {
    y: [0, -8, 0, -5, 0, -3, 0],
    scaleY: [1, 1.06, 0.95, 1.04, 0.97, 1.02, 1],
    scaleX: [1, 0.95, 1.05, 0.96, 1.03, 0.98, 1],
    rotate: [0, -2, 3, -1, 2, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: EASE.bounceOut,
      times: [0, 0.12, 0.25, 0.4, 0.55, 0.75, 1],
    },
  },
};

export const progressHype: Variants = {
  animate: {
    y: [0, -12, 2, -8, 1, -4, 0],
    scale: [1, 0.88, 1.1, 0.92, 1.06, 0.96, 1],
    rotate: [0, -4, 6, -3, 4, -1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: EASE.anticipate,
      times: [0, 0.12, 0.25, 0.4, 0.55, 0.75, 1],
    },
  },
};

/* ─── SHADOW PHYSICS ──────────────────────────────────────── */

export const shadowJump: Variants = {
  animate: {
    scaleX: [1, 0.7, 1.2, 0.8, 1.05, 0.95, 1],
    opacity: [1, 0.4, 0.9, 0.5, 0.8, 0.6, 1],
    transition: { duration: 0.5, ease: EASE.bounceOut, times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1] },
  },
};

export const shadowSquash: Variants = {
  animate: {
    scaleX: [1, 0.75, 1.1, 0.85, 1],
    opacity: [1, 0.5, 0.85, 0.6, 1],
    transition: { duration: 0.4, ease: EASE.bounceOut, times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

/* ─── IDLE BEHAVIOR ANIMATIONS ──────────────────────────── */

export const lookLeft: Variants = {
  hidden: { x: 0, rotate: 0 },
  animate: {
    x: [-6, -10, -8, -4, 0],
    rotate: [0, -4, -6, -3, 0],
    transition: { duration: 1.2, ease: EASE.smoothInOut, times: [0, 0.2, 0.4, 0.7, 1] },
  },
};

export const lookRight: Variants = {
  hidden: { x: 0, rotate: 0 },
  animate: {
    x: [6, 10, 8, 4, 0],
    rotate: [0, 4, 6, 3, 0],
    transition: { duration: 1.2, ease: EASE.smoothInOut, times: [0, 0.2, 0.4, 0.7, 1] },
  },
};

export const stretchAnim: Variants = {
  hidden: { scaleY: 1, scaleX: 1, y: 0 },
  animate: {
    scaleY: [1, 1.15, 1.2, 1.18, 1.12, 1],
    scaleX: [1, 0.92, 0.88, 0.9, 0.95, 1],
    y: [0, -6, -8, -6, -3, 0],
    transition: { duration: 1.5, ease: EASE.smoothInOut, times: [0, 0.15, 0.35, 0.55, 0.75, 1] },
  },
};

export const sleepyNod: Variants = {
  hidden: { y: 0, rotate: 0 },
  animate: {
    y: [0, -2, 2, -1, 3, 0, 1, 0],
    rotate: [0, 2, -1, 3, 0, 1, -1, 0],
    scaleY: [1, 0.97, 1.02, 0.98, 1.01, 0.99, 1],
    transition: { duration: 1.8, ease: EASE.smoothInOut, times: [0, 0.1, 0.25, 0.35, 0.5, 0.65, 0.8, 1] },
  },
};

export const curiousTilt: Variants = {
  hidden: { rotate: 0, scale: 1, x: 0 },
  animate: {
    rotate: [0, 12, 18, 14, 8, 4, 0],
    scale: [1, 1.02, 0.97, 1.01, 0.99, 1],
    x: [0, 2, 4, 3, 2, 1, 0],
    transition: { duration: 1.0, ease: EASE.smoothInOut, times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1] },
  },
};

export const earTwitch: Variants = {
  hidden: { rotate: 0, scale: 1 },
  animate: {
    rotate: [0, 8, -3, 5, -1, 0],
    scaleX: [1, 0.97, 1.02, 0.98, 1],
    transition: { duration: 0.3, ease: EASE.gentleOut, times: [0, 0.2, 0.4, 0.7, 1] },
  },
};

export const tailSwish: Variants = {
  hidden: { rotate: 0, x: 0 },
  animate: {
    rotate: [0, 12, -8, 15, -5, 8, -2, 0],
    transition: { duration: 0.8, ease: EASE.smoothInOut, times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1] },
  },
};

export const sniffAnim: Variants = {
  hidden: { scale: 1, x: 0, y: 0 },
  animate: {
    scale: [1, 1.02, 0.98, 1.01, 0.99, 1],
    x: [0, 2, -1, 1, 0, 0],
    y: [0, -1, 0, -1, 0],
    transition: { duration: 0.9, ease: EASE.smoothInOut, times: [0, 0.15, 0.3, 0.5, 0.7, 1] },
  },
};

export const sighAnim: Variants = {
  hidden: { scaleY: 1, y: 0 },
  animate: {
    scaleY: [1, 1.06, 1.1, 1.05, 1],
    y: [0, -2, -4, -2, 0],
    transition: { duration: 1.2, ease: EASE.smoothInOut, times: [0, 0.2, 0.5, 0.75, 1] },
  },
};

/* ─── FEEDING STAGE ANIMATIONS ────────────────────────────── */

export const feedNotice: Variants = {
  hidden: { x: 0, rotate: 0, scale: 1 },
  animate: {
    x: [0, 4, 0],
    rotate: [0, 6, -3, 0],
    scale: [1, 1.04, 1.02, 1],
    transition: { duration: 0.5, ease: EASE.smoothOut, times: [0, 0.25, 0.6, 1] },
  },
};

export const feedApproach: Variants = {
  hidden: { x: 0, y: 0 },
  animate: {
    x: [0, 8],
    y: [0, -2, 0, -1, 0],
    transition: { duration: 0.6, ease: EASE.smoothOut, times: [0, 0.2, 0.4, 0.6, 1] },
  },
};

export const feedOpenMouth: Variants = {
  hidden: { scaleY: 1, scaleX: 1, y: 0 },
  animate: {
    scaleY: [1, 1.1, 1.15, 1.1, 1],
    scaleX: [1, 0.93, 0.88, 0.92, 1],
    y: [0, -3, -5, -3, 0],
    transition: { duration: 0.5, ease: EASE.smoothInOut, times: [0, 0.2, 0.4, 0.7, 1] },
  },
};

export const feedChew: Variants = {
  hidden: { scaleY: 1, scaleX: 1, rotate: 0 },
  animate: {
    scaleY: [1, 1.08, 0.95, 1.06, 0.96, 1.04, 0.97, 1.02, 0.98, 1],
    scaleX: [1, 0.94, 1.04, 0.95, 1.03, 0.96, 1.02, 0.97, 1],
    rotate: [0, 3, -2, 3, -2, 2, -1, 1, 0],
    transition: { duration: 1.0, ease: EASE.gentleOut, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 1] },
  },
};

export const feedSwallow: Variants = {
  hidden: { scaleY: 1, y: 0 },
  animate: {
    scaleY: [1, 1.12, 1.18, 1.08, 1],
    y: [0, -2, -4, -2, 0],
    transition: { duration: 0.4, ease: EASE.smoothOut, times: [0, 0.2, 0.4, 0.7, 1] },
  },
};

/* ─── TAP REACTIONS (RANDOM POOL) ──────────────────────────── */

export const tapHappyBounce: Variants = {
  hidden: { y: 0, scale: 1 },
  animate: {
    y: [0, -24, 4, -12, 2, -6, 0],
    scale: [1, 0.82, 1.12, 0.88, 1.06, 0.94, 1],
    rotate: [0, -4, 6, -3, 4, -1, 0],
    transition: { duration: 0.7, ease: EASE.overshoot, times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] },
  },
};

export const tapGiggle: Variants = {
  hidden: { y: 0, scaleY: 1, scaleX: 1 },
  animate: {
    y: [0, -6, 2, -4, 1, -2, 0],
    scaleY: [1, 1.12, 0.9, 1.08, 0.92, 1.04, 1],
    scaleX: [1, 0.9, 1.1, 0.92, 1.06, 0.96, 1],
    rotate: [0, 3, -2, 2, -1, 1, 0],
    transition: { duration: 0.6, ease: EASE.bounceOut, times: [0, 0.1, 0.25, 0.4, 0.55, 0.75, 1] },
  },
};

export const tapCurious: Variants = {
  hidden: { x: 0, rotate: 0, scale: 1 },
  animate: {
    x: [0, 6, -2, 4, -1, 0],
    rotate: [0, 14, -4, 8, -2, 0],
    scale: [1, 0.96, 1.03, 0.98, 1.01, 1],
    transition: { duration: 0.8, ease: EASE.smoothInOut, times: [0, 0.15, 0.3, 0.5, 0.7, 1] },
  },
};

export const tapExcitedWiggle: Variants = {
  hidden: { x: 0, y: 0, rotate: 0 },
  animate: {
    x: [0, -8, 6, -5, 4, -3, 2, -1, 0],
    y: [0, -3, 1, -2, 1, -1, 0],
    rotate: [0, -6, 8, -5, 6, -3, 2, -1, 0],
    transition: { duration: 0.5, ease: EASE.anticipate, times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.75, 0.9, 1] },
  },
};

export const tapSmallJump: Variants = {
  hidden: { y: 0, scaleY: 1, scaleX: 1 },
  animate: {
    y: [0, -30, 0],
    scaleY: [1, 0.75, 1.08, 0.95, 1],
    scaleX: [1, 1.2, 0.93, 1.05, 1],
    rotate: [0, -5, 3, -2, 0],
    transition: { duration: 0.6, ease: EASE.overshoot, times: [0, 0.15, 0.35, 0.65, 1] },
  },
};

export const TAP_REACTIONS: Variants[] = [
  tapHappyBounce,
  tapGiggle,
  tapCurious,
  tapExcitedWiggle,
  tapSmallJump,
];

/* ─── FEEDING REACTIONS (POST-EAT) ──────────────────────────── */

export const feedHappyDance: Variants = {
  hidden: { y: 0, rotate: 0, scale: 1 },
  animate: {
    y: [0, -6, 2, -4, 1, -3, 0, -2, 0],
    rotate: [0, 5, -4, 4, -3, 3, -2, 1, 0],
    scale: [1, 0.95, 1.06, 0.96, 1.04, 0.97, 1.02, 0.98, 1],
    transition: { duration: 1.2, ease: EASE.smoothInOut, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] },
  },
};

export const feedHeartBurst: Variants = {
  hidden: { scale: 1, y: 0 },
  animate: {
    scale: [1, 1.15, 0.9, 1.08, 1],
    y: [0, -4, 2, -2, 0],
    transition: { duration: 0.8, ease: EASE.bounceOut, times: [0, 0.2, 0.4, 0.7, 1] },
  },
};

export const feedSpin: Variants = {
  hidden: { rotate: 0, scale: 1 },
  animate: {
    rotate: [0, 360, 720],
    scale: [1, 0.9, 1.1, 0.95, 1],
    transition: { duration: 1.0, ease: EASE.anticipate, times: [0, 0.3, 0.6, 0.8, 1] },
  },
};

export const feedBellyRub: Variants = {
  hidden: { rotate: 0, scaleY: 1, y: 0 },
  animate: {
    rotate: [0, 8, -5, 6, -3, 3, 0],
    scaleY: [1, 1.08, 0.95, 1.05, 0.97, 1.02, 1],
    y: [0, -2, 1, -1, 0],
    transition: { duration: 1.2, ease: EASE.gentleOut, times: [0, 0.1, 0.25, 0.4, 0.55, 0.75, 1] },
  },
};

export const feedExcitedHop: Variants = {
  hidden: { y: 0, scaleY: 1, scaleX: 1 },
  animate: {
    y: [0, -20, 0, -14, 0, -8, 0],
    scale: [1, 0.8, 1.12, 0.85, 1.08, 0.9, 1],
    transition: { duration: 0.9, ease: EASE.bounceOut, times: [0, 0.12, 0.25, 0.4, 0.55, 0.75, 1] },
  },
};

export const FEED_REACTIONS: Variants[] = [
  feedHappyDance,
  feedHeartBurst,
  feedSpin,
  feedBellyRub,
  feedExcitedHop,
];

/* ─── COLLECTIONS ─────────────────────────────────────────── */

export const IDLE_VARIANTS: Record<string, Variants> = {
  float: floatIdle,
  bounce: bounceIdle,
  sway: swayIdle,
};

export const IDLE_MOTIONS: Record<string, Variants> = {
  breathe: breathIdle,
  blink: blinkVariants,
  scratch: scratchAnim,
  yawn: yawnAnim,
  look_left: lookLeft,
  look_right: lookRight,
  stretch: stretchAnim,
  sleepy_nod: sleepyNod,
  curious_tilt: curiousTilt,
  ear_twitch: earTwitch,
  tail_swish: tailSwish,
  sniff: sniffAnim,
  sigh: sighAnim,
};

export const REACTION_ANIMATIONS: Record<string, Variants> = {
  happy_jump: happyJump,
  celebration: celebrationCombo,
  excited_spin: excitedSpin,
  confused: confusedTilt,
  overshoot: overshootBounce,
  anticipation: anticipationBounce,
  squash_stretch: squashStretch,
  eat: eatChew,
  satisfied: satisfactionSettle,
  lean_in: leanInAnim,
  lean_out: leanOutAnim,
  scratch: scratchAnim,
  yawn: yawnAnim,
  charge_up: levelUpCharge,
  flash_reveal: levelUpFlash,
  level_up_celebrate: levelUpCelebrate,
  evolution_intro: evolutionIntro,
  evolution_charge: evolutionCharge,
  evolution_burst: evolutionBurst,
  evolution_reveal: evolutionReveal,
  progress_curious: progressCurious,
  progress_encouraging: progressEncouraging,
  progress_excited: progressExcited,
  progress_hype: progressHype,
  look_left: lookLeft,
  look_right: lookRight,
  stretch: stretchAnim,
  sleepy_nod: sleepyNod,
  curious_tilt: curiousTilt,
  ear_twitch: earTwitch,
  tail_swish: tailSwish,
  sniff: sniffAnim,
  sigh: sighAnim,
  feed_notice: feedNotice,
  feed_approach: feedApproach,
  feed_open_mouth: feedOpenMouth,
  feed_chew: feedChew,
  feed_swallow: feedSwallow,
  tap_happy_bounce: tapHappyBounce,
  tap_giggle: tapGiggle,
  tap_curious: tapCurious,
  tap_excited_wiggle: tapExcitedWiggle,
  tap_small_jump: tapSmallJump,
  feed_happy_dance: feedHappyDance,
  feed_heart_burst: feedHeartBurst,
  feed_spin: feedSpin,
  feed_belly_rub: feedBellyRub,
  feed_excited_hop: feedExcitedHop,
};

/* ─── PARTICLE BURST CONFIGS ──────────────────────────────── */

export interface ParticleConfig {
  count: number;
  emoji: string;
  spread: number;
  duration: number;
  size: 'sm' | 'md' | 'lg';
}

export interface ParticleBurstPreset extends ParticleConfig {
  trail?: boolean;
  fadeIn?: boolean;
  rotateRandom?: boolean;
}

export const PARTICLE_BURSTS: Record<string, ParticleBurstPreset> = {
  heart_small:   { count: 6,  emoji: '❤️', spread: 60,  duration: 0.8,  size: 'sm', trail: false },
  heart_big:     { count: 12, emoji: '❤️', spread: 90,  duration: 1.2,  size: 'md', trail: true },
  sparkle:       { count: 8,  emoji: '✨', spread: 80,  duration: 1,    size: 'sm', rotateRandom: true },
  star:          { count: 6,  emoji: '⭐', spread: 70,  duration: 1,    size: 'md', trail: true },
  celebration:   { count: 14, emoji: '🎉', spread: 120, duration: 1.5,  size: 'lg', trail: true },
  confetti_party:{ count: 20, emoji: '🎊', spread: 140, duration: 1.8,  size: 'lg', trail: true },
  sleepy:        { count: 3,  emoji: '💤', spread: 30,  duration: 2,    size: 'sm', trail: true },
  rainbow:       { count: 7,  emoji: '🌈', spread: 100, duration: 1.5,  size: 'md', trail: false },
  fire:          { count: 8,  emoji: '🔥', spread: 60,  duration: 1,    size: 'sm', rotateRandom: true },
  trophy:        { count: 5,  emoji: '🏆', spread: 80,  duration: 1.5,  size: 'lg', trail: false },
  coins:         { count: 8,  emoji: '🪙', spread: 70,  duration: 1.2,  size: 'md', trail: true, rotateRandom: true },
  xp:            { count: 6,  emoji: '✨', spread: 60,  duration: 1,    size: 'sm', trail: true, fadeIn: true },
  level_up:      { count: 16, emoji: '⭐', spread: 150, duration: 1.8,  size: 'lg', trail: true, rotateRandom: true },
  evolution:     { count: 24, emoji: '✨', spread: 180, duration: 2,    size: 'lg', trail: true, rotateRandom: true, fadeIn: true },
};
