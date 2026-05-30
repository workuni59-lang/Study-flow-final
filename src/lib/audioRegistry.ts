import {
  CloudRain, Waves, Bird, Flame, Wind, CloudLightning,
  Droplets, Mountain, Trees, Moon, Snowflake, Train,
  Coffee as CafeIcon, Ship, Cat, Clock, Radio, Headphones,
  Music2, Sparkles, Volume2, Mic2, Plane, BookOpen,
  Thermometer, Home, Utensils, Tent, Fish, Dumbbell,
  Disc3, Orbit
} from 'lucide-react';

export type AudioCategory = 'Weather' | 'Nature' | 'Lifestyle' | 'Interior' | 'Focus' | 'Niche';
export type AudioLayer = 'ambience' | 'music';

export interface SoundAsset {
  id: string;
  name: string;
  icon: any;
  url: string;
  fallbackUrl?: string;
  category: AudioCategory;
  layer: AudioLayer;
  isPremium: boolean;
  baseVolume: number;
  preload: boolean;
}

const GH = 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio';

export const AUDIO_ASSETS: SoundAsset[] = [
  // ── Weather ──────────────────────────────────────────────────
  { id: 'rain', name: 'Rain', icon: CloudRain, category: 'Weather', layer: 'ambience', isPremium: false, baseVolume: 0.5, preload: true, url: `${GH}/ambient/rain.mp3` },
  { id: 'light-rain', name: 'Light Rain', icon: Droplets, category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `${GH}/ambient/light_rain.mp3`, fallbackUrl: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'heavy-rain', name: 'Heavy Rain', icon: CloudRain, category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/heavy_rain.mp3`, fallbackUrl: 'https://orangefreesounds.com/wp-content/uploads/2023/01/White-noise-heavy-rain.mp3' },
  { id: 'thunderstorm', name: 'Thunderstorm', icon: CloudLightning, category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: `${GH}/ambient/thunderstorm.mp3`, fallbackUrl: 'https://www.chosic.com/wp-content/uploads/2021/07/Rain-and-Thunder.mp3' },
  { id: 'wind', name: 'Wind', icon: Wind, category: 'Weather', layer: 'ambience', isPremium: false, baseVolume: 0.4, preload: false, url: `${GH}/ambient/wind.mp3`, fallbackUrl: 'https://www.soundjay.com/nature/wind-01.mp3' },
  { id: 'light-rain-tent', name: 'Rain on Tent', icon: Tent, category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/rain_on_tent.mp3`, fallbackUrl: 'https://orangefreesounds.com/wp-content/uploads/2020/09/Rain-on-tent.mp3' },

  // ── Nature ───────────────────────────────────────────────────
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.4, preload: true, url: `${GH}/ambient/ocean.mp3` },
  { id: 'birds', name: 'Birds in Woods', icon: Bird, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.35, preload: true, url: `${GH}/ambient/birds.mp3` },
  { id: 'fireplace', name: 'Fireplace', icon: Flame, category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.6, preload: true, url: `${GH}/ambient/fireplace.mp3` },
  { id: 'countryside', name: 'Countryside Morning', icon: Mountain, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/countryside.mp3` },
  { id: 'summer-night', name: 'Summer Night', icon: Moon, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `${GH}/ambient/summer_night.mp3` },
  { id: 'waterfall', name: 'Waterfall', icon: Mountain, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/waterfall.mp3` },
  { id: 'campfire', name: 'Campfire', icon: Flame, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: `${GH}/ambient/campfire.mp3`, fallbackUrl: 'https://orangefreesounds.com/wp-content/uploads/2021/01/Fireplace-sound-effect.mp3' },
  { id: 'deep-sea', name: 'Deep Sea', icon: Fish, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/deep_sea.mp3`, fallbackUrl: 'https://bigsoundbank.com/static/mp3/0229.mp3' },
  { id: 'underwater', name: 'Underwater', icon: Waves, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${GH}/ambient/underwater.mp3` },
  { id: 'whales', name: 'Whales', icon: Fish, category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/whales.mp3` },

  // ── Lifestyle ────────────────────────────────────────────────
  { id: 'paris-cafe', name: 'Bustling Café', icon: CafeIcon, category: 'Lifestyle', layer: 'ambience', isPremium: false, baseVolume: 0.45, preload: false, url: `${GH}/ambient/paris_cafe.mp3`, fallbackUrl: 'https://www.soundjay.com/ambient/restaurant-ambience-01.mp3' },
  { id: 'nyc-morning', name: 'NYC Morning', icon: Train, category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.7, preload: false, url: `${GH}/ambient/nyc_morning.mp3`, fallbackUrl: 'https://www.soundjay.com/ambient/city-traffic-1.mp3' },
  { id: 'street-cafe', name: 'Street Café', icon: CafeIcon, category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: `${GH}/ambient/street_cafe.mp3`, fallbackUrl: 'https://www.chosic.com/wp-content/uploads/2021/07/Coffee-Shop-Ambience.mp3' },
  { id: 'airport', name: 'Airport Terminal', icon: Ship, category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/airport.mp3`, fallbackUrl: 'https://orangefreesounds.com/wp-content/uploads/2016/01/Airport-ambience.mp3' },
  { id: 'airplane-cabin', name: 'Airplane Cabin', icon: Plane, category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/airplane_cabin.mp3` },
  { id: 'commuter-train', name: 'Commuter Train', icon: Train, category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/commuter_train.mp3`, fallbackUrl: 'https://www.soundjay.com/ambient/train-ride-1.mp3' },
  { id: 'central-park', name: 'Central Park', icon: Trees, category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/central_park.mp3` },

  // ── Interior ─────────────────────────────────────────────────
  { id: 'office', name: 'Office', icon: Radio, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/office.mp3`, fallbackUrl: 'https://orangefreesounds.com/wp-content/uploads/2023/02/Office-ambience-sound-effect.mp3' },
  { id: 'room-fan', name: 'Room Fan', icon: Wind, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/room_fan.mp3`, fallbackUrl: 'https://orangefreesounds.com/wp-content/uploads/2018/05/Fan-noises-for-sleeping.mp3' },
  { id: 'keyboard', name: 'Laptop Keyboard', icon: Radio, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `${GH}/ambient/keyboard.mp3`, fallbackUrl: 'https://bigsoundbank.com/static/mp3/0229.mp3' },
  { id: 'clock-ticking', name: 'Clock Ticking', icon: Clock, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/clock_ticking.mp3` },
  { id: 'cat-purr', name: 'Cat Purr', icon: Cat, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.6, preload: false, url: `${GH}/ambient/cat_purr.mp3` },
  { id: 'japanese-library', name: 'Japanese Library', icon: BookOpen, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${GH}/ambient/japanese_library.mp3` },
  { id: 'home-kitchen', name: 'Home Kitchen', icon: Home, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `${GH}/ambient/home_kitchen.mp3` },
  { id: 'air-conditioner', name: 'Air Conditioner', icon: Thermometer, category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/air_conditioner.mp3` },

  // ── Focus ────────────────────────────────────────────────────
  { id: 'white-noise', name: 'White Noise', icon: Volume2, category: 'Focus', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${GH}/ambient/white_noise.mp3`, fallbackUrl: 'https://www.soundjay.com/ambient/white-noise-01.mp3' },
  { id: 'pink-noise', name: 'Pink Noise', icon: Volume2, category: 'Focus', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${GH}/ambient/pink_noise.mp3` },
  { id: 'brown-noise', name: 'Brown Noise', icon: Volume2, category: 'Focus', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${GH}/ambient/brown_noise.mp3` },
  { id: 'gamma', name: 'Gamma Waves', icon: Sparkles, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: `${GH}/binaural/gamma.mp3` },
  { id: 'beta', name: 'Beta Waves', icon: Sparkles, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: `${GH}/binaural/beta.mp3` },
  { id: 'alpha', name: 'Alpha Waves', icon: Sparkles, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: `${GH}/binaural/alpha.mp3` },
  { id: 'theta', name: 'Theta Waves', icon: Sparkles, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: `${GH}/binaural/theta.mp3` },
  { id: 'delta', name: 'Delta Waves', icon: Moon, category: 'Focus', layer: 'music', isPremium: true, baseVolume: 0.6, preload: false, url: `${GH}/binaural/delta.mp3` },

  // ── Niche ────────────────────────────────────────────────────
  { id: 'exam-hall', name: 'Exam Hall', icon: BookOpen, category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/exam_hall.mp3` },
  { id: 'bowling-alley', name: 'Bowling Alley', icon: Dumbbell, category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/bowling_alley.mp3` },
  { id: 'record-player', name: 'Record Player Static', icon: Disc3, category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${GH}/ambient/record_player.mp3` },
  { id: 'outer-space', name: 'Outer Space Rumble', icon: Orbit, category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${GH}/ambient/outer_space.mp3` },
];

export const CATEGORIES: AudioCategory[] = ['Weather', 'Nature', 'Lifestyle', 'Interior', 'Focus', 'Niche'];
