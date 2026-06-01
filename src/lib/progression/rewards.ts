import type { MilestoneReward } from './types';

export const MILESTONE_REWARDS: MilestoneReward[] = [
  { level: 5, type: 'badge', id: 'bronze', name: 'Bronze Dedication Badge', description: 'Unlocked the Bronze Dedication badge.' },
  { level: 15, type: 'badge', id: 'silver', name: 'Silver Focus Badge', description: 'Unlocked the Silver Focus badge.' },
  { level: 30, type: 'badge', id: 'gold', name: 'Gold Mastery Badge', description: 'Unlocked the Gold Mastery badge.' },
  { level: 50, type: 'badge', id: 'platinum', name: 'Platinum Excellence Badge', description: 'Unlocked the Platinum Excellence badge.' },
  { level: 75, type: 'badge', id: 'diamond', name: 'Diamond Wisdom Badge', description: 'Unlocked the Diamond Wisdom badge.' },
  { level: 100, type: 'badge', id: 'legend', name: 'Transcendent Legend Badge', description: 'Unlocked the Transcendent Legend badge.' },
];

export const getRewardsAtLevel = (level: number): MilestoneReward[] =>
  MILESTONE_REWARDS.filter(r => r.level === level);

export const getRewardsBetweenLevels = (prevLevel: number, newLevel: number): MilestoneReward[] =>
  MILESTONE_REWARDS.filter(r => prevLevel < r.level && r.level <= newLevel);
