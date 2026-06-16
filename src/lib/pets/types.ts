export type PetMood = 'excited' | 'happy' | 'neutral' | 'tired' | 'asleep';

export type PetPerformanceTier = 'low' | 'mid' | 'high';

export interface PetColors {
  body: string;
  accent: string;
  eyes: string;
  glow: string;
}

export interface PetSkin {
  id: string;
  name: string;
  speciesId: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  colors: PetColors;
  silhouette?: string; // SVG path override
  accessory?: string; // SVG overlay component name
  ambientParticles?: string[];
  unlock: {
    type: 'default' | 'level' | 'gold' | 'premium' | 'achievement';
    value?: number | string;
  };
}

export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  vibe: string;
  idleMotion: 'float' | 'bounce' | 'sway' | 'pulse';
  passiveBonus: string;
  isPremium: boolean;
  defaultColors: PetColors;
  scale: number;
}

export interface PetFood {
  id: string;
  name: string;
  icon: string; // SVG path or emoji
  hungerValue: number;
  source: 'task' | 'focus' | 'streak' | 'achievement';
  sourceCount: number;
  rarity: 'common' | 'rare' | 'epic';
}

export interface PetFoodQuantity {
  foodId: string;
  quantity: number;
}

export interface PetState {
  // Identity
  name: string;
  speciesId: string;
  skinId: string | null;

  // Emotional
  mood: PetMood;
  moodExpiresAt: number | null; // Timestamp when 'excited' ends

  // Food
  hunger: number; // 0-100
  foodInventory: PetFoodQuantity[];

  // Progression
  level: number;
  totalXp: number;
  totalFed: number;
  totalInteractions: number;
  daysTogether: number;
  lastActiveDate: string | null; // For absence detection

  // Unlocks
  unlockedSpecies: string[];
  unlockedSkins: string[];

  // Position
  position: { x: number; y: number } | null;

  // Metadata
  firstMetAt: string; // ISO date
  lastFedAt: string | null;
  lastInteractedAt: string | null;
}
