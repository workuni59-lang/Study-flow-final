import type { RankTier } from './types';

export const RANK_TIERS: RankTier[] = [
  { id: 1, title: 'Novice Learner', icon: '🌱', minLevel: 1, maxLevel: 4, description: 'Every master was once a beginner.' },
  { id: 2, title: 'Dedicated Student', icon: '📚', minLevel: 5, maxLevel: 9, description: 'Consistency is the foundation of mastery.' },
  { id: 3, title: 'Knowledge Seeker', icon: '🔍', minLevel: 10, maxLevel: 14, description: 'The pursuit of knowledge never ends.' },
  { id: 4, title: 'Focus Practitioner', icon: '🎯', minLevel: 15, maxLevel: 19, description: 'Sharp focus yields sharp results.' },
  { id: 5, title: 'Academic Explorer', icon: '🧭', minLevel: 20, maxLevel: 29, description: 'Exploring the frontiers of understanding.' },
  { id: 6, title: 'Elite Scholar', icon: '🏆', minLevel: 30, maxLevel: 39, description: 'A distinguished mind in the making.' },
  { id: 7, title: 'Master Researcher', icon: '💎', minLevel: 40, maxLevel: 49, description: 'Depth of knowledge, breadth of wisdom.' },
  { id: 8, title: 'Grand Academic', icon: '👑', minLevel: 50, maxLevel: 69, description: 'A pillar of the learning community.' },
  { id: 9, title: 'Legendary Scholar', icon: '🌟', minLevel: 70, maxLevel: 99, description: 'Your dedication echoes through time.' },
  { id: 10, title: 'Study Titan', icon: '🚀', minLevel: 100, maxLevel: Infinity, description: 'Beyond mastery — you define excellence.' },
];

export const getRankForLevel = (level: number): RankTier => {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (level >= RANK_TIERS[i].minLevel) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
};

export const getNextRank = (level: number): RankTier | null => {
  const current = getRankForLevel(level);
  const nextIdx = RANK_TIERS.indexOf(current) + 1;
  if (nextIdx >= RANK_TIERS.length) return null;
  return RANK_TIERS[nextIdx];
};

export const wasRankPromotion = (oldLevel: number, newLevel: number): RankTier | null => {
  const oldRank = getRankForLevel(oldLevel);
  const newRank = getRankForLevel(newLevel);
  if (newRank.id > oldRank.id) return newRank;
  return null;
};
