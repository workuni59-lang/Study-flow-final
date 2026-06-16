import type { PetFood } from './types';

export const PET_FOODS: PetFood[] = [
  {
    id: 'star-snack',
    name: 'Star Snack',
    icon: '⭐',
    hungerValue: 15,
    source: 'task',
    sourceCount: 1,
    rarity: 'common'
  },
  {
    id: 'focus-bar',
    name: 'Focus Bar',
    icon: '🔋',
    hungerValue: 25,
    source: 'focus',
    sourceCount: 30, // 30 minutes
    rarity: 'common'
  },
  {
    id: 'streak-treat',
    name: 'Streak Treat',
    icon: '🍬',
    hungerValue: 20,
    source: 'streak',
    sourceCount: 3, // 3 day streak
    rarity: 'rare'
  },
  {
    id: 'mastery-meal',
    name: 'Mastery Meal',
    icon: '🍱',
    hungerValue: 40,
    source: 'achievement', // Re-using source types
    sourceCount: 1,
    rarity: 'rare'
  },
  {
    id: 'time-gem',
    name: 'Time Gem',
    icon: '💎',
    hungerValue: 60,
    source: 'focus',
    sourceCount: 120, // 2 hours
    rarity: 'epic'
  }
];

export const getFoodById = (id: string) => PET_FOODS.find(f => f.id === id);
