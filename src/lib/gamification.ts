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
  // Moods (CSS Gradient — animated/static)
  | 'ember-glow' | 'frost-mint' | 'twilight-sky' | 'warm-latte' | 'charcoal'
  | 'blush' | 'lavender-dream' | 'midnight-ocean' | 'golden-hour' | 'northern-sky'
  | 'rose-quartz' | 'cobalt-night' | 'harvest' | 'moonlit-fog' | 'terra-cotta'
  | 'cozy-warm' | 'forest-deep'
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
  { id: 'amber', name: 'Focus Gold', color: 'bg-orange-500', isPremium: true, levelRequired: 1 },
  { id: 'violet', name: 'Midnight', color: 'bg-purple-600', isPremium: true, levelRequired: 1 },
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
  { id: 'ocean', name: 'Deep Blue', isPremium: false, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'coastal-sunrise', name: 'Coastal Sunrise', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'tropical-beach', name: 'Tropical Beach', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'waterfall', name: 'Hidden Waterfall', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'river-valley', name: 'River Valley', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'ice-cave', name: 'Ice Cave', isPremium: true, type: 'image', category: 'Water', url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },

  // ── SKY & WEATHER ──
  { id: 'desert', name: 'Golden Sands', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },
  { id: 'northern-lights', name: 'Northern Lights', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1430132594682-16e1185b17c5?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'stormy-sky', name: 'Stormy Sky', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'golden-sunset', name: 'Golden Sunset', isPremium: false, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1749276873098-7e44bd10575c?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'clouds-above', name: 'Above the Clouds', isPremium: true, type: 'image', category: 'Sky & Weather', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'nature' },

  // ── URBAN & ARCHITECTURE ──
  { id: 'tokyo', name: 'Tokyo Midnight', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'urban' },
  { id: 'rainy-street', name: 'Rainy Seattle', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },
  { id: 'city-sunset', name: 'City Sunset', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'urban' },
  { id: 'night-city', name: 'Night City', isPremium: false, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1662730738534-1ca761dfafcf?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },
  { id: 'bridge-lights', name: 'Bridge Lights', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'urban' },
  { id: 'alley-rain', name: 'Alley in Rain', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },
  { id: 'rooftop-night', name: 'Rooftop Night', isPremium: true, type: 'image', category: 'Urban', url: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'urban' },

  // ── COZY & INTERIOR ──
  { id: 'cafe', name: 'Rainy Cafe', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'library', name: 'Old Library', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },
  { id: 'cozy-room', name: 'Cozy Room', isPremium: false, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'window-rain', name: 'Rainy Window', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1536267933728-f5cffe426327?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },
  { id: 'bookshelf', name: 'Bookshelf', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },
  { id: 'candlelight', name: 'Candlelight', isPremium: true, type: 'image', category: 'Cozy', url: 'https://images.unsplash.com/photo-1726750226670-25e1e56ef39f?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'interior' },

  // ── SPACE & COSMIC ──
  { id: 'space-station', name: 'Orbit View', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'urban' },
  { id: 'cosmic', name: 'Cosmic Horizon', isPremium: false, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'starry-peaks', name: 'Starry Peaks', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'nebula', name: 'Nebula', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'deep-space', name: 'Deep Space', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'planet-glow', name: 'Planet Glow', isPremium: true, type: 'image', category: 'Space', url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── ANIMALS ──
  { id: 'wolf-mountain', name: 'Wolf on Mountain', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1766314286734-f041d0585922?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'owl-night', name: 'Owl at Night', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1698873246095-2a6be6f1b5b8?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'deer-forest', name: 'Deer in Forest', isPremium: false, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1761502186429-ecf63a1929f1?auto=format&fit=crop&w=2000&q=80', brightness: 'dark', environment: 'nature' },
  { id: 'whale-ocean', name: 'Whale Ocean', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'butterfly-field', name: 'Butterfly Field', isPremium: true, type: 'image', category: 'Animals', url: 'https://images.unsplash.com/photo-1635769291721-5ce8eecd11b9?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── MINIMAL & AESTHETIC ──
  { id: 'white-minimal', name: 'White Minimal', isPremium: false, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'paper-texture', name: 'Paper Texture', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'marble', name: 'Marble Surface', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1694378061101-bf38a2fcc596?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },
  { id: 'gradient-dusk', name: 'Gradient Dusk', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'abstract' },
  { id: 'linen-texture', name: 'Linen Texture', isPremium: true, type: 'image', category: 'Minimal', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=2000&q=80', brightness: 'light', environment: 'interior' },

  // ── FLOWERS & PLANTS ──
  { id: 'lavender-fields', name: 'Lavender Fields', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1740652646168-0d1557a6e8c4?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'sunflower-field', name: 'Sunflower Field', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1566923846852-0db2f110f6dd?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'rose-garden', name: 'Rose Garden', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1765124048840-1cdccf9009a8?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },
  { id: 'tulip-field', name: 'Tulip Field', isPremium: true, type: 'image', category: 'Flowers', url: 'https://images.unsplash.com/photo-1749694562670-55caba958ba7?auto=format&fit=crop&w=2000&q=80', brightness: 'vibrant', environment: 'nature' },

  // ── MOODS (CSS Gradient — animated/static) ──
  // Free
  { id: 'ember-glow', name: 'Ember Glow', isPremium: false, type: 'animated', category: 'Moods', brightness: 'vibrant', environment: 'abstract' },
  { id: 'frost-mint', name: 'Frost Mint', isPremium: false, type: 'animated', category: 'Moods', brightness: 'light', environment: 'abstract' },
  { id: 'twilight-sky', name: 'Twilight Sky', isPremium: false, type: 'animated', category: 'Moods', brightness: 'dark', environment: 'abstract' },
  { id: 'warm-latte', name: 'Warm Latte', isPremium: false, type: 'animated', category: 'Moods', brightness: 'light', environment: 'abstract' },
  { id: 'charcoal', name: 'Charcoal', isPremium: false, type: 'animated', category: 'Moods', brightness: 'dark', environment: 'abstract' },
  // Premium
  { id: 'blush', name: 'Blush', isPremium: true, type: 'animated', category: 'Moods', brightness: 'light', environment: 'abstract' },
  { id: 'lavender-dream', name: 'Lavender Dream', isPremium: true, type: 'animated', category: 'Moods', brightness: 'vibrant', environment: 'abstract' },
  { id: 'midnight-ocean', name: 'Midnight Ocean', isPremium: true, type: 'animated', category: 'Moods', brightness: 'dark', environment: 'abstract' },
  { id: 'golden-hour', name: 'Golden Hour', isPremium: true, type: 'animated', category: 'Moods', brightness: 'vibrant', environment: 'abstract' },
  { id: 'northern-sky', name: 'Northern Sky', isPremium: true, type: 'animated', category: 'Moods', brightness: 'vibrant', environment: 'abstract' },
  { id: 'rose-quartz', name: 'Rose Quartz', isPremium: true, type: 'animated', category: 'Moods', brightness: 'light', environment: 'abstract' },
  { id: 'cobalt-night', name: 'Cobalt Night', isPremium: true, type: 'animated', category: 'Moods', brightness: 'dark', environment: 'abstract' },
  { id: 'harvest', name: 'Harvest', isPremium: true, type: 'animated', category: 'Moods', brightness: 'vibrant', environment: 'abstract' },
  { id: 'moonlit-fog', name: 'Moonlit Fog', isPremium: true, type: 'animated', category: 'Moods', brightness: 'light', environment: 'abstract' },
  { id: 'terra-cotta', name: 'Terra Cotta', isPremium: true, type: 'animated', category: 'Moods', brightness: 'vibrant', environment: 'abstract' },
  { id: 'cozy-warm', name: 'Cozy Warm', isPremium: false, type: 'animated', category: 'Moods', brightness: 'light', environment: 'abstract' },
  { id: 'forest-deep', name: 'Forest Deep', isPremium: false, type: 'animated', category: 'Moods', brightness: 'dark', environment: 'abstract' },

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
  mood: PetMood;
  moodLastUpdated: string;
  lastLevelUpAt: number;
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
  mood: 'neutral',
  moodLastUpdated: new Date().toISOString(),
  lastLevelUpAt: 0,
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
// ─── FORMALIZED XP & LEVELING ────────────────────────────────────

export const XP_TASK_BASE = 20;
export const XP_FOCUS_SESSION = 15;
export const XP_STREAK_BONUS_PER_DAY = 10;
export const MAX_LEVEL = 50;

export const xpForNextLevel = (level: number): number => {
  if (level >= MAX_LEVEL) return Infinity;
  return level * level * 100;
};

export const calculateFormalLevel = (totalXpEarned: number): number => {
  let level = 1;
  let remaining = totalXpEarned;
  while (level < MAX_LEVEL) {
    const needed = xpForNextLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  return level;
};

export const getFormalProgress = (totalXpEarned: number) => {
  let level = 1;
  let remaining = totalXpEarned;
  while (level < MAX_LEVEL) {
    const needed = xpForNextLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  const required = xpForNextLevel(level);
  return {
    level,
    currentXP: remaining,
    requiredXP: required === Infinity ? 0 : required,
    percentage: required === Infinity ? 100 : (remaining / required) * 100,
  };
};

export const priorityMultiplier = (priority?: string): number => {
  if (priority === 'High Yield') return 1.5;
  if (priority === 'Deep Review') return 2.0;
  return 1.0;
};

export const estimatedMinutesMultiplier = (mins?: number): number => {
  if (!mins || mins <= 25) return 1.0;
  if (mins <= 50) return 1.5;
  return 2.0;
};

// ─── THEME PRESETS (bundled atmosphere + wallpaper + settings) ──

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  atmosphere: string;
  wallpaper: string;
  brightness: number;
  saturation: number;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cozy',
    name: 'Cozy',
    description: 'Warm rose tones, soft lighting, intimate atmosphere',
    icon: '☕',
    atmosphere: 'rose',
    wallpaper: 'cozy-room',
    brightness: 80,
    saturation: 120,
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep emerald greens, nature immersion, calming presence',
    icon: '🌲',
    atmosphere: 'emerald',
    wallpaper: 'forest',
    brightness: 85,
    saturation: 130,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep indigo, dark and focused, minimal distractions',
    icon: '🌙',
    atmosphere: 'indigo',
    wallpaper: 'mesh',
    brightness: 70,
    saturation: 100,
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    description: 'Warm amber glow, energizing morning vibes',
    icon: '🌅',
    atmosphere: 'amber',
    wallpaper: 'golden-sunset',
    brightness: 90,
    saturation: 110,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool cyan depths, calm and serene focus',
    icon: '🌊',
    atmosphere: 'cyan',
    wallpaper: 'ocean',
    brightness: 85,
    saturation: 105,
  },
];

// ─── GOLD SYSTEM ─────────────────────────────────────────────────

export const GOLD_TASK_BASE = 5;
export const GOLD_LEVEL_UP_MULTIPLIER = 10;
export const GOLD_QUEST_DAILY = 25;
export const GOLD_QUEST_WEEKLY = 50;
export const GOLD_QUEST_MILESTONE = 100;

export const goldForTask = (priority?: string): number => {
  return Math.round(GOLD_TASK_BASE * priorityMultiplier(priority));
};

export const goldForSubjectTask = (priority?: string, subject?: { topics: { mastery: string }[] }): number => {
  let multiplier = priorityMultiplier(priority);
  
  // Bonus multiplier for subjects with unmastered (Red) topics
  if (subject && subject.topics.some(t => t.mastery === 'Red')) {
    multiplier += 0.5;
  }
  
  return Math.round(GOLD_TASK_BASE * multiplier);
};

export const goldForLevelUp = (newLevel: number): number => {
  return GOLD_LEVEL_UP_MULTIPLIER * newLevel;
};

// ─── PET MOOD & ANIMATION ────────────────────────────────────────

export type PetMood = 'happy' | 'neutral' | 'tired' | 'excited';
export type PetAnimation = 'idle' | 'bounce' | 'spin' | 'droop';

export const getPetMood = (
  sessionsToday: number,
  lastLevelUp: number,
  _tiredAt?: string | null,
): PetMood => {
  const now = Date.now();
  const excitedWindow = 60_000;
  if (lastLevelUp && (now - lastLevelUp) < excitedWindow) return 'excited';
  if (sessionsToday >= 3) return 'happy';
  if (sessionsToday >= 1) return 'neutral';
  return 'tired';
};

export const getPetAnimation = (mood: PetMood): PetAnimation => {
  switch (mood) {
    case 'happy': return 'bounce';
    case 'excited': return 'spin';
    case 'tired': return 'droop';
    default: return 'idle';
  }
};

// ─── TIERED QUEST SYSTEM ─────────────────────────────────────────

export interface GameQuest {
  id: string;
  title: string;
  description: string;
  tier: 'daily' | 'weekly' | 'milestone';
  metric: 'tasks_completed' | 'sessions_completed' | 'streak_days' | 'xp_earned';
  goal: number;
  reward: { xp: number; gold: number };
}

export const SEED_QUESTS: GameQuest[] = [
  // Daily
  { id: 'daily-1', title: 'Morning Momentum', description: 'Complete 3 tasks today.', tier: 'daily', metric: 'tasks_completed', goal: 3, reward: { xp: 40, gold: 25 } },
  { id: 'daily-2', title: 'Focus Flow', description: 'Complete 2 focus sessions today.', tier: 'daily', metric: 'sessions_completed', goal: 2, reward: { xp: 30, gold: 25 } },
  { id: 'daily-3', title: 'Streak Keeper', description: 'Log in today to keep your streak alive.', tier: 'daily', metric: 'streak_days', goal: 1, reward: { xp: 20, gold: 15 } },
  // Weekly
  { id: 'weekly-1', title: 'Weekly Warrior', description: 'Complete 20 tasks this week.', tier: 'weekly', metric: 'tasks_completed', goal: 20, reward: { xp: 150, gold: 50 } },
  { id: 'weekly-2', title: 'Deep Focus', description: 'Complete 10 focus sessions this week.', tier: 'weekly', metric: 'sessions_completed', goal: 10, reward: { xp: 200, gold: 50 } },
  // Milestone
  { id: 'mile-1', title: 'Century Mark', description: 'Complete 100 tasks total.', tier: 'milestone', metric: 'tasks_completed', goal: 100, reward: { xp: 500, gold: 100 } },
  { id: 'mile-2', title: 'Marathon Mind', description: 'Accumulate 50 focus sessions total.', tier: 'milestone', metric: 'sessions_completed', goal: 50, reward: { xp: 1000, gold: 100 } },
  { id: 'mile-3', title: 'Streak Legend', description: 'Reach a 30-day streak.', tier: 'milestone', metric: 'streak_days', goal: 30, reward: { xp: 2000, gold: 100 } },
  { id: 'mile-4', title: 'XP Hunter', description: 'Earn 10,000 total XP.', tier: 'milestone', metric: 'xp_earned', goal: 10000, reward: { xp: 1500, gold: 100 } },
  { id: 'mile-5', title: 'Unstoppable', description: 'Complete all milestone quests.', tier: 'milestone', metric: 'tasks_completed', goal: 500, reward: { xp: 5000, gold: 100 } },
];

export const getQuestsByTier = (tier: GameQuest['tier']) =>
  SEED_QUESTS.filter(q => q.tier === tier);

export const shouldResetQuests = (tier: GameQuest['tier'], lastResetDate: string | null): boolean => {
  if (!lastResetDate) return true;
  const last = new Date(lastResetDate);
  const now = new Date();
  if (tier === 'daily') {
    return last.toDateString() !== now.toDateString();
  }
  if (tier === 'weekly') {
    const dayOfWeek = now.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - daysSinceMonday);
    thisMonday.setHours(0, 0, 0, 0);
    return last < thisMonday;
  }
  return false;
};

// ─── SHOP ────────────────────────────────────────────────────────

export interface ShopItem {
  id: string;
  name: string;
  type: 'theme' | 'pet_skin' | 'badge_frame';
  cost: number;
  unlocked: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'theme-neon', name: 'Neon Atmosphere', type: 'theme', cost: 200, unlocked: false },
  { id: 'theme-rose', name: 'Sunset Peach Atmosphere', type: 'theme', cost: 150, unlocked: false },
  { id: 'theme-amber', name: 'Focus Gold Atmosphere', type: 'theme', cost: 150, unlocked: false },
  { id: 'theme-cyan', name: 'Glacier Atmosphere', type: 'theme', cost: 250, unlocked: false },
  { id: 'skin-crimson', name: 'Crimson Pixie Skin', type: 'pet_skin', cost: 300, unlocked: false },
  { id: 'skin-cobalt', name: 'Cobalt Ember Skin', type: 'pet_skin', cost: 350, unlocked: false },
  { id: 'skin-silver', name: 'Silver Lumina Skin', type: 'pet_skin', cost: 400, unlocked: false },
  { id: 'frame-royal', name: 'Royal Badge Frame', type: 'badge_frame', cost: 500, unlocked: false },
  { id: 'frame-cosmic', name: 'Cosmic Badge Frame', type: 'badge_frame', cost: 750, unlocked: false },
];

// ─── HP / STAKES SYSTEM ──────────────────────────────────────────

export const MAX_HP = 100;
export const HP_DECAY_PER_MISSED_DAY = 10;
export const HP_REGEN_PER_SESSION = 5;

export interface HpState {
  current: number;
  max: number;
  lastDecayDate: string | null;
}

export const INITIAL_HP: HpState = {
  current: 100,
  max: MAX_HP,
  lastDecayDate: null,
};

export const checkDailyHp = (
  hp: HpState,
  tasksDueYesterday: number,
  tasksCompletedYesterday: number,
  lastActiveDate: string | null,
): HpState => {
  const today = new Date().toISOString().split('T')[0];
  if (!lastActiveDate || lastActiveDate === today) return hp;
  const lastDate = new Date(lastActiveDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return hp;
  let newHp = hp.current;
  if (tasksDueYesterday > 0 && tasksCompletedYesterday === 0 && hp.lastDecayDate !== today) {
    newHp = Math.max(0, newHp - HP_DECAY_PER_MISSED_DAY);
  }
  return { ...hp, current: newHp, lastDecayDate: today };
};

export const regenHp = (hp: HpState): HpState => ({
  ...hp,
  current: Math.min(hp.max, hp.current + HP_REGEN_PER_SESSION),
});
