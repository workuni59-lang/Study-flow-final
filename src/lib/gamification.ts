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

export type AtmosphereId = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate' | 'cyan' | 'pink' | 'neon';
export type WallpaperId = 'none' | 'minimal' | 'dots' | 'mesh' | 'aurora' | 'stardust' | 'cyberpunk' | 'zen' | 'tokyo' | 'forest' | 'cafe' | 'mountain' | 'library' | 'ocean' | 'desert' | 'space-station' | 'rainy-street' | 'custom';

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
  type: 'animated' | 'image' | 'custom';
  url?: string;
  category?: 'Nature' | 'Urban' | 'Cozy' | 'Abstract';
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
  { id: 'neon', name: 'Elite Neon', color: 'bg-fuchsia-600', isPremium: true, levelRequired: 1 },
];

export const WALLPAPERS: Wallpaper[] = [
  { id: 'none', name: 'Disabled', isPremium: false, type: 'animated' },
  { id: 'minimal', name: 'Clean Solid', isPremium: false, type: 'animated' },
  { id: 'dots', name: 'Focus Dots', isPremium: false, type: 'animated' },
  { id: 'mesh', name: 'Animated Mesh', isPremium: true, type: 'animated' },
  { id: 'aurora', name: 'Arctic Aurora', isPremium: true, type: 'animated' },
  { id: 'stardust', name: 'Deep Space', isPremium: true, type: 'animated' },
  { id: 'cyberpunk', name: 'Cyber Library', isPremium: true, type: 'animated' },
  { id: 'zen', name: 'Zen Garden', isPremium: true, type: 'animated' },
  
  // NATURE
  { id: 'forest', name: 'Emerald Forest', isPremium: true, type: 'image', category: 'Nature', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2000&q=80' },
  { id: 'mountain', name: 'Silent Peak', isPremium: true, type: 'image', category: 'Nature', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80' },
  { id: 'ocean', name: 'Deep Blue', isPremium: true, type: 'image', category: 'Nature', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80' },
  { id: 'desert', name: 'Golden Sands', isPremium: true, type: 'image', category: 'Nature', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2000&q=80' },
  
  // URBAN
  { id: 'tokyo', name: 'Tokyo Midnight', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000&q=80' },
  { id: 'rainy-street', name: 'Rainy Seattle', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1515549832467-8c441fe749dc?auto=format&fit=crop&w=2000&q=80' },
  
  // COZY
  { id: 'cafe', name: 'Rainy Cafe', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2000&q=80' },
  { id: 'library', name: 'Old Library', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80' },
  
  // ABSTRACT / SPACE
  { id: 'space-station', name: 'Orbit View', isPremium: true, type: 'image', category: 'Abstract', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=80' },

  // SPECIAL
  { id: 'custom', name: 'Custom URL', isPremium: true, type: 'custom' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first study task.', icon: 'CheckCircle', rarity: 'Common', requirement: 1, type: 'tasks' },
  { id: 'task-master', title: 'Task Master', description: 'Complete 50 tasks.', icon: 'Zap', rarity: 'Rare', requirement: 50, type: 'tasks' },
  { id: 'deep-diver', title: 'Deep Diver', description: 'Focus for a total of 10 hours.', icon: 'Waves', rarity: 'Rare', requirement: 36000, type: 'focus' },
  { id: 'consistency-king', title: 'Consistency King', description: 'Maintain a 7-day study streak.', icon: 'Flame', rarity: 'Epic', requirement: 7, type: 'streak' },
  { id: 'mastery-path', title: 'Mastery Path', description: 'Master 10 topics (Green status).', icon: 'Trophy', rarity: 'Legendary', requirement: 10, type: 'mastery' }
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
  return { level, currentXP: currentLevelXP, requiredXP: requiredForNext, percentage: (currentLevelXP / requiredForNext) * 100 };
};
