import type { ProgressionBadge } from './types';

export const PROGRESSION_BADGES: ProgressionBadge[] = [
  { id: 'bronze', name: 'Bronze Dedication', icon: '🥉', description: 'Reached level 5 — the first milestone on your journey.', rarity: 'Common', levelRequired: 5 },
  { id: 'silver', name: 'Silver Focus', icon: '🥈', description: 'Reached level 15 — focus is becoming second nature.', rarity: 'Rare', levelRequired: 15 },
  { id: 'gold', name: 'Gold Mastery', icon: '🥇', description: 'Reached level 30 — a true master of discipline.', rarity: 'Epic', levelRequired: 30 },
  { id: 'platinum', name: 'Platinum Excellence', icon: '🏅', description: 'Reached level 50 — excellence is your standard.', rarity: 'Epic', levelRequired: 50 },
  { id: 'diamond', name: 'Diamond Wisdom', icon: '💎', description: 'Reached level 75 — wisdom earned through relentless effort.', rarity: 'Legendary', levelRequired: 75 },
  { id: 'legend', name: 'Transcendent Legend', icon: '🏆', description: 'Reached level 100 — you have transcended all limits.', rarity: 'Legendary', levelRequired: 100 },
];

export const getBadgesForLevel = (level: number): ProgressionBadge[] =>
  PROGRESSION_BADGES.filter(b => level >= b.levelRequired);

export const getNewlyUnlockedBadges = (prevLevel: number, newLevel: number): ProgressionBadge[] =>
  PROGRESSION_BADGES.filter(b => prevLevel < b.levelRequired && newLevel >= b.levelRequired);
