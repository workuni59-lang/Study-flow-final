import { 
  CloudRain, Waves, Bird, Flame, Wind, CloudLightning, 
  Droplets, Mountain, Trees, Moon, Snowflake, Train, 
  Coffee as CafeIcon, Ship, Cat, Clock, Radio, Headphones, 
  Music2, Sparkles, Volume2, Mic2
} from 'lucide-react';

export type AudioCategory = 'Nature' | 'Urban' | 'Interior' | 'Focus' | 'Music' | 'Binaural';
export type AudioLayer = 'ambience' | 'music';

export interface SoundAsset {
  id: string;
  name: string;
  icon: any;
  url: string;
  category: AudioCategory;
  layer: AudioLayer;
  isPremium: boolean;
  baseVolume: number;
  preload: boolean;
}

/**
 * Verified CORS-friendly high-uptime URLs.
 * Sourced from GitHub mirrors and stable CDNs to prevent silent failures.
 */
export const AUDIO_ASSETS: SoundAsset[] = [
  // ── Ambience Layer (Multiple concurrent allowed) ──────────────
  { id: 'rain', name: 'Soft Rain', icon: CloudRain, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.5, preload: true, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/rain.mp3' },
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.4, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/ocean.mp3' },
  { id: 'birds', name: 'Morning Birds', icon: Bird, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.35, preload: true, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/birds.mp3' },
  { id: 'fire', name: 'Fireplace', icon: Flame, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.6, preload: true, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/fireplace.mp3' },
  { id: 'wind', name: 'Gentle Wind', icon: Wind, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.4, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/wind.mp3' },
  { id: 'thunderstorm', name: 'Thunderstorm', icon: CloudLightning, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/thunderstorm.mp3' },
  { id: 'heavy-rain', name: 'Heavy Rain', icon: Droplets, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/heavy_rain.mp3' },
  { id: 'waterfall', name: 'Waterfall', icon: Mountain, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/waterfall.mp3' },
  { id: 'summer-night', name: 'Summer Night', icon: Moon, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/summer_night.mp3' },
  { id: 'countryside', name: 'Countryside', icon: Mountain, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/countryside.mp3' },

  { id: 'nyc-morning', name: 'NYC Morning', icon: Train, category: 'Urban', layer: 'ambience', isPremium: true, baseVolume: 0.7, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/nyc_morning.mp3' },
  { id: 'street-cafe', name: 'Street Cafe', icon: CafeIcon, category: 'Urban', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/street_cafe.mp3' },
  { id: 'paris-cafe', name: 'Paris Cafe', icon: CafeIcon, category: 'Urban', layer: 'ambience', isPremium: false, baseVolume: 0.45, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/paris_cafe.mp3' },
  { id: 'airport', name: 'Airport Terminal', icon: Ship, category: 'Urban', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/airport.mp3' },

  { id: 'cat-purr', name: 'Cat Purr', icon: Cat, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.6, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/cat_purr.mp3' },
  { id: 'clock-ticking', name: 'Clock Ticking', icon: Clock, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/clock_ticking.mp3' },
  { id: 'room-fan', name: 'Room Fan', icon: Wind, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/room_fan.mp3' },
  { id: 'keyboard', name: 'Laptop Keyboard', icon: Radio, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/keyboard.mp3' },
  { id: 'office', name: 'Office Ambience', icon: Headphones, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/ambient/office.mp3' },

  // ── Music Layer (Exclusive - Only one at a time) ──────────────
  { id: 'lofi', name: 'Focus Lofi', icon: Headphones, category: 'Music', layer: 'music', isPremium: false, baseVolume: 0.8, preload: true, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/music/lofi_1.mp3' },
  { id: 'deep-focus', name: 'Deep Focus', icon: Music2, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.7, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/music/deep_focus.mp3' },
  { id: 'white-noise', name: 'White Noise', icon: Volume2, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.35, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/focus/white_noise.mp3' },
  { id: 'pink-noise', name: 'Pink Noise', icon: Volume2, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.35, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/focus/pink_noise.mp3' },

  // ── Binaural Layer (Music layer mapping) ──────────────────────
  { id: 'gamma', name: 'Gamma Waves', icon: Sparkles, category: 'Binaural', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/binaural/gamma.mp3' },
  { id: 'beta', name: 'Beta Waves', icon: Sparkles, category: 'Binaural', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/binaural/beta.mp3' },
  { id: 'alpha', name: 'Alpha Waves', icon: Sparkles, category: 'Binaural', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/binaural/alpha.mp3' },
  { id: 'theta', name: 'Theta Waves', icon: Sparkles, category: 'Binaural', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/binaural/theta.mp3' },
  { id: 'delta', name: 'Delta Waves', icon: Moon, category: 'Binaural', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/binaural/delta.mp3' },
];

export const CATEGORIES: AudioCategory[] = ['Nature', 'Urban', 'Interior', 'Focus', 'Music', 'Binaural'];
