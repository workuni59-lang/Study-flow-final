import type { ParticleCategory } from './gamification';

export interface ParticlePreset {
  category: ParticleCategory;
  count: number;
  mobileCount: number;
  sizeMin: number;
  sizeMax: number;
  depthMin: number;
  depthMax: number;
  driftSpeed: number;
  driftAmplitude: number;
  swayX: number;
  swayY: number;
  swayZ: number;
  opacity: number;
  blendMode: 'additive' | 'normal';
  colorPalette: { r: number; g: number; b: number; weight: number }[];
  warmAccentChance: number;
  warmPalette?: { r: number; g: number; b: number }[];
  twinkleSpeed: number;
  direction?: { x: number; y: number; z: number };
  textureType: 'circle' | 'sharp' | 'star';
  shootingStarInterval?: [number, number];
}

export const PARTICLE_PRESETS: Record<ParticleCategory, ParticlePreset> = {
  ember: {
    category: 'ember',
    count: 80,
    mobileCount: 25,
    sizeMin: 0.4,
    sizeMax: 1.2,
    depthMin: 3,
    depthMax: 20,
    driftSpeed: 0.004,
    driftAmplitude: 0.06,
    swayX: 0.3,
    swayY: 0.5,
    swayZ: 0.2,
    opacity: 0.2,
    blendMode: 'additive',
    textureType: 'circle',
    colorPalette: [
      { r: 0.95, g: 0.92, b: 1.0, weight: 0.88 },
    ],
    warmAccentChance: 0.12,
    warmPalette: [
      { r: 1.0, g: 0.75, b: 0.55 },
      { r: 1.0, g: 0.85, b: 0.65 },
    ],
    twinkleSpeed: 0.004,
  },

  space: {
    category: 'space',
    count: 250,
    mobileCount: 80,
    sizeMin: 0.06,
    sizeMax: 0.22,
    depthMin: 8,
    depthMax: 60,
    driftSpeed: 0.0004,
    driftAmplitude: 0.004,
    swayX: 0.03,
    swayY: 0.04,
    swayZ: 0.01,
    opacity: 0.55,
    blendMode: 'additive',
    textureType: 'star',
    colorPalette: [
      { r: 1.0, g: 1.0, b: 1.0, weight: 0.6 },
      { r: 0.9, g: 0.92, b: 1.0, weight: 0.25 },
      { r: 0.85, g: 0.88, b: 1.0, weight: 0.1 },
      { r: 1.0, g: 0.98, b: 0.92, weight: 0.05 },
    ],
    warmAccentChance: 0,
    twinkleSpeed: 0.012,
    shootingStarInterval: [8, 20],
  },

  snow: {
    category: 'snow',
    count: 100,
    mobileCount: 30,
    sizeMin: 0.3,
    sizeMax: 1.0,
    depthMin: 1,
    depthMax: 20,
    driftSpeed: 0.001,
    driftAmplitude: 0.1,
    swayX: 0.4,
    swayY: 0.3,
    swayZ: 0.1,
    opacity: 0.25,
    blendMode: 'additive',
    textureType: 'circle',
    colorPalette: [
      { r: 1.0, g: 1.0, b: 1.0, weight: 0.6 },
      { r: 0.95, g: 0.98, b: 1.0, weight: 0.4 },
    ],
    warmAccentChance: 0,
    twinkleSpeed: 0.002,
    direction: { x: 0, y: -0.3, z: 0 },
  },

  rain: {
    category: 'rain',
    count: 100,
    mobileCount: 30,
    sizeMin: 0.3,
    sizeMax: 0.8,
    depthMin: 3,
    depthMax: 20,
    driftSpeed: 0.003,
    driftAmplitude: 0.04,
    swayX: 0.2,
    swayY: 0.5,
    swayZ: 0.1,
    opacity: 0.2,
    blendMode: 'additive',
    textureType: 'circle',
    colorPalette: [
      { r: 0.85, g: 0.9, b: 1.0, weight: 0.5 },
      { r: 0.7, g: 0.75, b: 1.0, weight: 0.3 },
      { r: 0.9, g: 0.95, b: 1.0, weight: 0.2 },
    ],
    warmAccentChance: 0,
    twinkleSpeed: 0.004,
  },
};
