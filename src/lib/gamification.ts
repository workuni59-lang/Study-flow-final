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

export interface SessionRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  xpEarned: number;
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
  sessionHistory: SessionRecord[];
  hasShield: boolean;
  isPremium: boolean;
}

export type AtmosphereId = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate' | 'cyan' | 'pink' | 'neon';

export type WallpaperId =
  // Animated / Abstract
  | 'none' | 'minimal' | 'dots' | 'mesh' | 'aurora' | 'stardust' | 'cyberpunk' | 'zen'
  // Forests & Trees
  | 'forest' | 'misty-forest' | 'bamboo-grove' | 'autumn-woods' | 'rainforest' | 'pine-trail'
  // Mountains & Landscapes
  | 'mountain' | 'mountain-lake' | 'volcanic-peak' | 'rolling-hills' | 'canyon' | 'cliff-sunset'
  // Water & Ocean
  | 'ocean' | 'coastal-sunrise' | 'tropical-beach' | 'waterfall' | 'river-valley' | 'ice-cave'
  // Sky & Weather
  | 'desert' | 'northern-lights' | 'stormy-sky' | 'golden-sunset' | 'clouds-above'
  // Urban & Architecture
  | 'tokyo' | 'rainy-street' | 'city-sunset' | 'night-city' | 'bridge-lights' | 'alley-rain' | 'rooftop-night'
  // Cozy & Interior
  | 'cafe' | 'library' | 'cozy-room' | 'window-rain' | 'bookshelf' | 'candlelight'
  // Space & Cosmic
  | 'space-station' | 'cosmic' | 'starry-peaks' | 'nebula' | 'deep-space' | 'planet-glow'
  // Animals
  | 'wolf-mountain' | 'owl-night' | 'deer-forest' | 'whale-ocean' | 'butterfly-field'
  // Minimal & Aesthetic
  | 'white-minimal' | 'paper-texture' | 'marble' | 'gradient-dusk' | 'linen-texture'
  // Flowers & Plants
  | 'lavender-fields' | 'cherry-blossom' | 'sunflower-field' | 'rose-garden' | 'tulip-field'
  // Special
  | 'custom';

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
  category?: string;
  brightness?: 'light' | 'dark' | 'vibrant';
  environment?: 'nature' | 'urban' | 'abstract' | 'interior' | 'scenic';
}

// ─── ATMOSPHERES ────────────────────────────────────────────────

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

// ─── WALLPAPERS (55 total) ─────────────────────────────────────

export const WALLPAPERS: Wallpaper[] = [
  // ── ANIMATED / ABSTRACT (free) ──
  { id: 'none', name: 'Disabled', isPremium: false, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },
  { id: 'minimal', name: 'Clean Solid', isPremium: false, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },
  { id: 'mesh', name: 'Animated Mesh', isPremium: false, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },
  { id: 'cyberpunk', name: 'Cyber Library', isPremium: false, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },

  // ── ANIMATED / ABSTRACT (premium) ──
  { id: 'dots', name: 'Focus Dots', isPremium: true, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },
  { id: 'aurora', name: 'Arctic Aurora', isPremium: true, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },
  { id: 'stardust', name: 'Deep Space', isPremium: true, type: 'animated', category: 'Abstract', brightness: 'dark', environment: 'abstract' },
  { id: 'zen', name: 'Zen Garden', isPremium: true, type: 'animated', category: 'Abstract', brightness: 'vibrant', environment: 'abstract' },

  // ── FORESTS & TREES ──
  { id: 'forest', name: 'Emerald Forest', isPremium: true, type: 'image', category: 'Forests', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'misty-forest', name: 'Misty Forest', isPremium: false, type: 'image', category: 'Forests', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'bamboo-grove', name: 'Bamboo Grove', isPremium: true, type: 'image', category: 'Forests', url: 'https://images.unsplash.com/photo-1545239705-1564e58b9e4a?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'autumn-woods', name: 'Autumn Woods', isPremium: true, type: 'image', category: 'Forests', url: 'https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'rainforest', name: 'Rainforest Canopy', isPremium: true, type: 'image', category: 'Forests', url: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'pine-trail', name: 'Pine Trail', isPremium: true, type: 'image', category: 'Forests', url: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── MOUNTAINS & LANDSCAPES ──
  { id: 'mountain', name: 'Silent Peak', isPremium: true, type: 'image', category: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'mountain-lake', name: 'Mountain Lake', isPremium: true, type: 'image', category: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'volcanic-peak', name: 'Volcanic Peak', isPremium: true, type: 'image', category: 'Mountains', url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'rolling-hills', name: 'Rolling Hills', isPremium: false, type: 'image', category: 'Mountains', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'canyon', name: 'Grand Canyon', isPremium: true, type: 'image', category: 'Mountains', url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'cliff-sunset', name: 'Cliff Sunset', isPremium: true, type: 'image', category: 'Mountains', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── WATER & OCEAN ──
  { id: 'ocean', name: 'Deep Blue', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'coastal-sunrise', name: 'Coastal Sunrise', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'tropical-beach', name: 'Tropical Beach', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'waterfall', name: 'Hidden Waterfall', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'river-valley', name: 'River Valley', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'ice-cave', name: 'Ice Cave', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },

  // ── SKY & WEATHER ──
  { id: 'desert', name: 'Golden Sands', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'northern-lights', name: 'Northern Lights', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'stormy-sky', name: 'Stormy Sky', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'golden-sunset', name: 'Golden Sunset', isPremium: false, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'clouds-above', name: 'Above the Clouds', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },

  // ── URBAN & ARCHITECTURE ──
  { id: 'tokyo', name: 'Tokyo Midnight', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'urban' },
  { id: 'rainy-street', name: 'Rainy Seattle', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },
  { id: 'city-sunset', name: 'City Sunset', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'urban' },
  { id: 'night-city', name: 'Night City', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },
  { id: 'bridge-lights', name: 'Bridge Lights', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'urban' },
  { id: 'alley-rain', name: 'Alley in Rain', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },
  { id: 'rooftop-night', name: 'Rooftop Night', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },

  // ── COZY & INTERIOR ──
  { id: 'cafe', name: 'Rainy Cafe', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'library', name: 'Old Library', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },
  { id: 'cozy-room', name: 'Cozy Room', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'window-rain', name: 'Rainy Window', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },
  { id: 'bookshelf', name: 'Bookshelf', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },
  { id: 'candlelight', name: 'Candlelight', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },

  // ── SPACE & COSMIC ──
  { id: 'space-station', name: 'Orbit View', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'urban' },
  { id: 'cosmic', name: 'Cosmic Horizon', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'starry-peaks', name: 'Starry Peaks', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'nebula', name: 'Nebula', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'deep-space', name: 'Deep Space', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'planet-glow', name: 'Planet Glow', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── ANIMALS ──
  { id: 'wolf-mountain', name: 'Wolf on Mountain', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'owl-night', name: 'Owl at Night', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'deer-forest', name: 'Deer in Forest', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'whale-ocean', name: 'Whale Ocean', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'butterfly-field', name: 'Butterfly Field', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── MINIMAL & AESTHETIC ──
  { id: 'white-minimal', name: 'White Minimal', isPremium: false, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'paper-texture', name: 'Paper Texture', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'marble', name: 'Marble Surface', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1561214078-f3247647fc5e?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'gradient-dusk', name: 'Gradient Dusk', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'abstract' },
  { id: 'linen-texture', name: 'Linen Texture', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },

  // ── FLOWERS & PLANTS ──
  { id: 'lavender-fields', name: 'Lavender Fields', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'sunflower-field', name: 'Sunflower Field', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'rose-garden', name: 'Rose Garden', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'tulip-field', name: 'Tulip Field', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── SPECIAL ──
  { id: 'custom', name: 'Custom URL', isPremium: true, type: 'custom', category: 'Special', brightness: 'dark', environment: 'abstract' },
];

// ─── ACHIEVEMENTS ──────────────────────────────────────────────

// ─── PET SYSTEM ──────────────────────────────────────────────────

export type PetHealth = 'happy' | 'neutral' | 'weak' | 'dormant';

export type PetEventType =
  | 'task_done'
  | 'streak_lost'
  | 'exam_soon'
  | 'focus_done'
  | 'neglect'
  | 'level_up'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'mistake'
  | 'task_streak'
  | 'consecutive_task';

export interface ReactionEvent extends PetEvent {
  metadata?: {
    streakCount?: number;
    taskDifficulty?: string;
    achievementRarity?: string;
    level?: number;
    consecutiveCount?: number;
  };
}

export interface PetEvent {
  type: PetEventType;
  id: number;
}

export interface PetState {
  species: string;
  name: string;
  hunger: number;
  health: PetHealth;
  lastFedAt: string;
  lastInteractedAt: string;
  foodInventory: { foodId: string; quantity: number }[];
  skin?: string;
  unlockedSpecies: string[];
  unlockedSkins: string[];
  totalFed: number;
}

export interface PetFood {
  id: string;
  name: string;
  icon: string;
  hungerValue: number;
  rarity: Rarity;
  source: 'focus' | 'task' | 'mastery';
  sourceAmount: number;
}

export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  colors: { body: string; accent: string; eyes: string; glow: string };
  idleAnim: 'float' | 'bounce' | 'sway';
  isPremium: boolean;
  unlockLevel: number;
  scale: number;
}

export interface PetSkin {
  id: string;
  speciesId: string;
  name: string;
  description: string;
  colors: { body: string; accent: string; eyes: string; glow: string };
  isPremium: boolean;
  price: number;
  unlockLevel: number;
  spriteUrl?: string;
  rarity: Rarity;
}

export const PET_SKINS: PetSkin[] = [
  // ── Pixie ──
  { id: 'pixie_base', speciesId: 'pixie', name: 'Default', description: 'A gentle star spirit that drifts through focused minds.', colors: { body: '#a5b4fc', accent: '#6366f1', eyes: '#fff', glow: '#a5b4fc' }, isPremium: false, price: 0, unlockLevel: 1, rarity: 'Common' },
  { id: 'pixie_crimson', speciesId: 'pixie', name: 'Crimson', description: 'Electric cyan — a cool, focused aura.', colors: { body: '#22d3ee', accent: '#06b6d4', eyes: '#fff', glow: '#22d3ee' }, isPremium: true, price: 500, unlockLevel: 1, rarity: 'Rare' },
  { id: 'pixie_royal', speciesId: 'pixie', name: 'Royal', description: 'Regal purple — wisdom of a thousand study sessions.', colors: { body: '#a78bfa', accent: '#7c3aed', eyes: '#e9d5ff', glow: '#a78bfa' }, isPremium: true, price: 1000, unlockLevel: 1, rarity: 'Epic' },
  { id: 'pixie_starlight', speciesId: 'pixie', name: 'Starlight', description: 'Golden warmth like the first star at dusk.', colors: { body: '#fde68a', accent: '#f59e0b', eyes: '#fff', glow: '#fde68a' }, isPremium: true, price: 0, unlockLevel: 3, rarity: 'Common' },
  { id: 'pixie_cosmic', speciesId: 'pixie', name: 'Cosmic', description: 'Deep space nebula — infinite focus.', colors: { body: '#1e1b4b', accent: '#7c3aed', eyes: '#c4b5fd', glow: '#312e81' }, isPremium: true, price: 1200, unlockLevel: 1, rarity: 'Epic' },
  // ── Ember ──
  { id: 'ember_base', speciesId: 'ember', name: 'Default', description: 'The warm fire spirit.', colors: { body: '#fbbf24', accent: '#f97316', eyes: '#fff', glow: '#fbbf24' }, isPremium: true, price: 0, unlockLevel: 1, rarity: 'Common' },
  { id: 'ember_cobalt', speciesId: 'ember', name: 'Cobalt', description: 'Cold blue flame.', colors: { body: '#38bdf8', accent: '#0284c7', eyes: '#fff', glow: '#38bdf8' }, isPremium: true, price: 600, unlockLevel: 1, rarity: 'Rare' },
  { id: 'ember_verdant', speciesId: 'ember', name: 'Verdant', description: 'Mystical green fire.', colors: { body: '#4ade80', accent: '#16a34a', eyes: '#fff', glow: '#4ade80' }, isPremium: true, price: 0, unlockLevel: 5, rarity: 'Common' },
  { id: 'ember_void', speciesId: 'ember', name: 'Void', description: 'Dark flame that consumes light.', colors: { body: '#a78bfa', accent: '#7c3aed', eyes: '#c4b5fd', glow: '#a78bfa' }, isPremium: true, price: 1200, unlockLevel: 1, rarity: 'Epic' },
  // ── Lumina ──
  { id: 'lumina_base', speciesId: 'lumina', name: 'Default', description: 'The crystal fox.', colors: { body: '#e879f9', accent: '#6366f1', eyes: '#fff', glow: '#e879f9' }, isPremium: true, price: 0, unlockLevel: 1, rarity: 'Common' },
  { id: 'lumina_silver', speciesId: 'lumina', name: 'Silver', description: 'Lunar silver coat.', colors: { body: '#cbd5e1', accent: '#64748b', eyes: '#fff', glow: '#cbd5e1' }, isPremium: true, price: 800, unlockLevel: 1, rarity: 'Rare' },
  { id: 'lumina_prismatic', speciesId: 'lumina', name: 'Prismatic', description: 'Shifts through all colors.', colors: { body: '#f472b6', accent: '#a855f7', eyes: '#fff', glow: '#e879f9' }, isPremium: true, price: 1500, unlockLevel: 1, rarity: 'Legendary' },
  // ── Nimbus ──
  { id: 'nimbus_base', speciesId: 'nimbus', name: 'Default', description: 'A fluffy cloud cat.', colors: { body: '#67e8f9', accent: '#06b6d4', eyes: '#fff', glow: '#67e8f9' }, isPremium: true, price: 0, unlockLevel: 1, rarity: 'Common' },
  { id: 'nimbus_storm', speciesId: 'nimbus', name: 'Storm', description: 'Dark thundercloud.', colors: { body: '#64748b', accent: '#334155', eyes: '#fff', glow: '#64748b' }, isPremium: true, price: 800, unlockLevel: 1, rarity: 'Rare' },
  { id: 'nimbus_sunset', speciesId: 'nimbus', name: 'Sunset', description: 'Golden hour glow.', colors: { body: '#fbbf24', accent: '#f97316', eyes: '#fff', glow: '#fbbf24' }, isPremium: true, price: 0, unlockLevel: 8, rarity: 'Common' },
];

export const PET_SPECIES: PetSpecies[] = [
  { id: 'pixie', name: 'Pixie', description: 'A floating star spirit that glows brighter with every focus session.', colors: { body: '#a5b4fc', accent: '#6366f1', eyes: '#fff', glow: '#a5b4fc' }, idleAnim: 'float', isPremium: false, unlockLevel: 1, scale: 1 },
  { id: 'ember', name: 'Ember', description: 'A warm fire spirit fueled by your focus sessions.', colors: { body: '#fbbf24', accent: '#f97316', eyes: '#fff', glow: '#fbbf24' }, idleAnim: 'bounce', isPremium: true, unlockLevel: 1, scale: 1 },
  { id: 'lumina', name: 'Lumina', description: 'A crystal fox that radiates calm and wisdom.', colors: { body: '#e879f9', accent: '#6366f1', eyes: '#fff', glow: '#e879f9' }, idleAnim: 'sway', isPremium: true, unlockLevel: 1, scale: 1.2 },
  { id: 'nimbus', name: 'Nimbus', description: 'A cloud cat that drifts through your study sessions.', colors: { body: '#67e8f9', accent: '#06b6d4', eyes: '#fff', glow: '#67e8f9' }, idleAnim: 'float', isPremium: true, unlockLevel: 1, scale: 1.1 },
];

export const PET_FOODS: PetFood[] = [
  { id: 'star-snack', name: 'Star Snack', icon: 'Star', hungerValue: 15, rarity: 'Common', source: 'task', sourceAmount: 1 },
  { id: 'focus-berry', name: 'Focus Berry', icon: 'Circle', hungerValue: 25, rarity: 'Common', source: 'focus', sourceAmount: 900 },
  { id: 'mastery-meal', name: 'Mastery Meal', icon: 'Trophy', hungerValue: 40, rarity: 'Rare', source: 'mastery', sourceAmount: 1 },
  { id: 'time-gem', name: 'Time Gem', icon: 'Gem', hungerValue: 60, rarity: 'Epic', source: 'focus', sourceAmount: 3600 },
];

export const PET_HUNGER_DECAY_PER_HOUR = 5;
export const PET_WEAK_THRESHOLD = 20;
export const PET_WEAK_DURATION_MS = 2 * 60 * 60 * 1000;
export const PET_DORMANT_THRESHOLD = 0;
export const PET_DORMANT_DURATION_MS = 4 * 60 * 60 * 1000;

export const INITIAL_PET_STATE: PetState = {
  species: 'pixie',
  name: 'Pixie',
  hunger: 80,
  health: 'neutral',
  lastFedAt: new Date().toISOString(),
  lastInteractedAt: new Date().toISOString(),
  foodInventory: [{ foodId: 'star-snack', quantity: 3 }],
  unlockedSpecies: ['pixie'],
  unlockedSkins: ['pixie_base'],
  totalFed: 0,
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first study task.', icon: 'CheckCircle', rarity: 'Common', requirement: 1, type: 'tasks' },
  { id: 'task-master', title: 'Task Master', description: 'Complete 50 tasks.', icon: 'Zap', rarity: 'Rare', requirement: 50, type: 'tasks' },
  { id: 'deep-diver', title: 'Deep Diver', description: 'Focus for a total of 10 hours.', icon: 'Waves', rarity: 'Rare', requirement: 36000, type: 'focus' },
  { id: 'consistency-king', title: 'Consistency King', description: 'Maintain a 7-day study streak.', icon: 'Flame', rarity: 'Epic', requirement: 7, type: 'streak' },
  { id: 'mastery-path', title: 'Mastery Path', description: 'Master 10 topics (Green status).', icon: 'Trophy', rarity: 'Legendary', requirement: 10, type: 'mastery' }
];

// ─── XP & LEVELING ────────────────────────────────────────────

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
