export interface RankTier {
  id: number;
  title: string;
  icon: string;
  minLevel: number;
  maxLevel: number;
  description: string;
}

export interface ProgressionBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  levelRequired: number;
}

export interface MilestoneReward {
  level: number;
  type: 'badge' | 'title' | 'cosmetic' | 'pet' | 'feature';
  id: string;
  name: string;
  description: string;
}

export interface ProgressionState {
  level: number;
  totalXp: number;
  currentXp: number;
  xpForNext: number;
  percentage: number;
  rank: RankTier;
  nextRank: RankTier | null;
}

export const MAX_LEVEL = 100;
