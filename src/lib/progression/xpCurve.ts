import { MAX_LEVEL } from './types';

export const xpForLevel = (level: number): number => {
  if (level >= MAX_LEVEL) return Infinity;
  return level * level * 100;
};

export const totalXpForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
};

export const calculateLevel = (totalXp: number): number => {
  let level = 1;
  let remaining = totalXp;
  while (level < MAX_LEVEL) {
    const needed = xpForLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  return level;
};

export const getProgress = (totalXp: number) => {
  let level = 1;
  let remaining = totalXp;
  while (level < MAX_LEVEL) {
    const needed = xpForLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  const required = xpForLevel(level);
  return {
    level,
    currentXp: remaining,
    xpForNext: required === Infinity ? 0 : required,
    percentage: required === Infinity ? 100 : (remaining / required) * 100,
  };
};
