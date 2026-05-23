export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  rarity: Rarity;
  requirement: number;
  type: 'tasks' | 'focus' | 'streak' | 'mastery';
}

export interface Badge {
  id: string;
  achievementId: string;
  unlockedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  requirement: number;
  progress: number;
  type: 'focus' | 'tasks' | 'mastery';
  completed: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  totalFocusSeconds: number;
  totalTasksCompleted: number;
  dailyXPHistory: Record<string, number>;
  hasShield: boolean;
  isPremium: boolean;
}

export type AtmosphereId = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate' | 'cyan' | 'pink';
export type WallpaperId = 'minimal' | 'dots' | 'mesh' | 'aurora' | 'stardust';

export interface Atmosphere {
  id: AtmosphereId;
  name: string;
  color: string;
  isPremium: boolean;
  levelRequired: number;
}

export interface Wallpaper {
  id: WallpaperId;
  name: string;
  isPremium: boolean;
}

export const ATMOSPHERES: Atmosphere[] = [
  { id: 'indigo', name: 'Indigo Flow', color: 'bg-indigo-600', isPremium: false, levelRequired: 1 },
  { id: 'slate', name: 'Monochrome', color: 'bg-slate-700', isPremium: false, levelRequired: 1 },
  { id: 'emerald', name: 'Deep Forest', color: 'bg-emerald-600', isPremium: false, levelRequired: 3 },
  { id: 'rose', name: 'Sunset Peach', color: 'bg-rose-500', isPremium: true, levelRequired: 1 },
  { id: 'amber', name: 'Focus Gold', color: 'bg-amber-500', isPremium: true, levelRequired: 1 },
  { id: 'violet', name: 'Midnight', color: 'bg-violet-600', isPremium: true, levelRequired: 1 },
  { id: 'cyan', name: 'Glacier', color: 'bg-cyan-500', isPremium: true, levelRequired: 1 },
  { id: 'pink', name: 'Sakura', color: 'bg-pink-500', isPremium: true, levelRequired: 1 },
];

export const WALLPAPERS: Wallpaper[] = [
  { id: 'minimal', name: 'Clean Solid', isPremium: false },
  { id: 'dots', name: 'Focus Dots', isPremium: false },
  { id: 'mesh', name: 'Animated Mesh', isPremium: true },
  { id: 'aurora', name: 'Arctic Aurora', isPremium: true },
  { id: 'stardust', name: 'Deep Space', isPremium: true },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your first study task.',
    icon: 'CheckCircle',
    rarity: 'Common',
    requirement: 1,
    type: 'tasks'
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 50 tasks.',
    icon: 'Zap',
    rarity: 'Rare',
    requirement: 50,
    type: 'tasks'
  },
  {
    id: 'deep-diver',
    title: 'Deep Diver',
    description: 'Focus for a total of 10 hours.',
    icon: 'Waves',
    rarity: 'Rare',
    requirement: 36000,
    type: 'focus'
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Maintain a 7-day study streak.',
    icon: 'Flame',
    rarity: 'Epic',
    requirement: 7,
    type: 'streak'
  },
  {
    id: 'mastery-path',
    title: 'Mastery Path',
    description: 'Master 10 topics (Green status).',
    icon: 'Trophy',
    rarity: 'Legendary',
    requirement: 10,
    type: 'mastery'
  }
];

export const ATMOSPHERE_REQUIREMENTS: Record<string, number> = {
  indigo: 1,
  slate: 1,
  emerald: 3,
  rose: 5,
  amber: 7,
  violet: 10
};

export const XP_PER_TASK = 50;
export const XP_PER_FOCUS_MINUTE = 10;
export const XP_LEVEL_BASE = 1000;
export const XP_LEVEL_MULTIPLIER = 1.2;

export const calculateLevel = (xp: number): number => {
  let level = 1;
  let xpRequired = XP_LEVEL_BASE;
  while (xp >= xpRequired) {
    xp -= xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * XP_LEVEL_MULTIPLIER);
  }
  return level;
};

export const getXPForLevel = (level: number): number => {
  let xpRequired = XP_LEVEL_BASE;
  for (let i = 1; i < level; i++) {
    xpRequired = Math.floor(xpRequired * XP_LEVEL_MULTIPLIER);
  }
  return xpRequired;
};

export const getProgressToNextLevel = (xp: number) => {
  let currentLevelXP = xp;
  let level = 1;
  let requiredForNext = XP_LEVEL_BASE;
  
  while (currentLevelXP >= requiredForNext) {
    currentLevelXP -= requiredForNext;
    level++;
    requiredForNext = Math.floor(requiredForNext * XP_LEVEL_MULTIPLIER);
  }
  
  return {
    level,
    currentXP: currentLevelXP,
    requiredXP: requiredForNext,
    percentage: (currentLevelXP / requiredForNext) * 100
  };
};
