export type AudioCategory = 'Weather' | 'Nature' | 'Lifestyle' | 'Interior' | 'Focus' | 'Niche';
export type AudioLayer = 'ambience' | 'music';

export interface SoundAsset {
  id: string;
  name: string;
  emoji: string;
  url: string;
  category: AudioCategory;
  layer: AudioLayer;
  isPremium: boolean;
  baseVolume: number;
  preload: boolean;
}

const OF = 'https://www.orangefreesounds.com/wp-content/uploads';

export const AUDIO_ASSETS: SoundAsset[] = [
  // ── Weather ──────────────────────────────────────────────────
  { id: 'light-rain', name: 'Light Rain', emoji: '🌦️', category: 'Weather', layer: 'ambience', isPremium: false, baseVolume: 0.45, preload: true, url: `${OF}/2018/11/Light-rain-sound-effect.mp3` },
  { id: 'heavy-rain', name: 'Heavy Rain', emoji: '🌧️', category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2025/02/Heavy-rainfall-sound-effect.mp3` },
  { id: 'thunderstorm', name: 'Thunderstorm', emoji: '⛈️', category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2022/06/Thunderstorm-ambience.mp3` },
  { id: 'wind', name: 'Wind', emoji: '🌬️', category: 'Weather', layer: 'ambience', isPremium: false, baseVolume: 0.4, preload: false, url: `${OF}/2020/06/Wind-rustling-leaves-sound-effect.mp3` },
  { id: 'light-rain-tent', name: 'Rain on Tent', emoji: '⛺️', category: 'Weather', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${OF}/2018/09/Rain-on-tent.mp3` },

  // ── Nature ───────────────────────────────────────────────────
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.4, preload: true, url: `https://orangefreesounds.com/wp-content/uploads/2022/07/Ocean-waves-sound-effect.mp3` },
  { id: 'birds', name: 'Birds in Woods', emoji: '🐦', category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.35, preload: true, url: `${OF}/2016/05/Chirping-birds.mp3` },
  { id: 'fireplace', name: 'Fireplace', emoji: '🔥', category: 'Nature', layer: 'ambience', isPremium: false, baseVolume: 0.6, preload: true, url: `${OF}/2021/01/Fireplace-sound-effect.mp3` },
  { id: 'countryside', name: 'Countryside Morning', emoji: '🧺', category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2019/05/Rain-falling-sound-in-the-village.mp3` },
  { id: 'summer-night', name: 'Summer Night', emoji: '🦗', category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2025/02/Summer-night-sound-effect.mp3` },
  { id: 'waterfall', name: 'Waterfall', emoji: '🌊', category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2021/07/Waterfall-sound-effect.mp3` },
  { id: 'campfire', name: 'Campfire', emoji: '🪵', category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.55, preload: false, url: `${OF}/2017/10/Campfire-sound.mp3` },
  { id: 'underwater', name: 'Underwater', emoji: '🤿', category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${OF}/2022/02/Underwater-sound.mp3` },
  { id: 'whales', name: 'Whales', emoji: '🐋', category: 'Nature', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2015/07/Whale-sounds.mp3` },

  // ── Lifestyle ────────────────────────────────────────────────
  { id: 'paris-cafe', name: 'Bustling Café', emoji: '☕️', category: 'Lifestyle', layer: 'ambience', isPremium: false, baseVolume: 0.45, preload: false, url: `${OF}/2020/02/Coffee-shop-background-noise.mp3` },
  { id: 'nyc-morning', name: 'NYC Morning', emoji: '🚕', category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.7, preload: false, url: `${OF}/2017/07/Traffic-noise-sound-effect.mp3` },
  { id: 'airport', name: 'Airport Terminal', emoji: '🛄', category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${OF}/2018/08/Large-airplane-landing.mp3` },
  { id: 'airplane-cabin', name: 'Airplane Cabin', emoji: '🛩️', category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2025/10/Airplane-boarding-sound-effect.mp3` },
  { id: 'commuter-train', name: 'Commuter Train', emoji: '🚃', category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `${OF}/2021/01/Train-interior-sound-effect.mp3` },
  { id: 'central-park', name: 'Central Park', emoji: '⛲️', category: 'Lifestyle', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2020/09/Walking-through-city-park-ambience.mp3` },

  // ── Interior ─────────────────────────────────────────────────
  { id: 'office', name: 'Office', emoji: '🏢', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2023/02/Office-ambience-sound-effect.mp3` },
  { id: 'room-fan', name: 'Room Fan', emoji: '🪭', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2018/05/Fan-noises-for-sleeping.mp3` },
  { id: 'keyboard', name: 'Laptop Keyboard', emoji: '⌨️', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2024/02/Keyboard-typing-sound-effect.mp3` },
  { id: 'clock-ticking', name: 'Clock Ticking', emoji: '🕰️', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2014/05/Ticking-clock-grandfather.mp3` },
  { id: 'cat-purr', name: 'Cat Purr', emoji: '🐈', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.6, preload: false, url: `${OF}/2021/09/Cat-purring-sound-effect.mp3` },
  { id: 'japanese-library', name: 'Japanese Library', emoji: '📚', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${OF}/2020/09/Walking-through-city-park-ambience.mp3` },
  { id: 'home-kitchen', name: 'Home Kitchen', emoji: '🍴', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.45, preload: false, url: `${OF}/2020/03/Peaceful-night-ambient-in-kitchen-sound-effect.mp3` },
  { id: 'air-conditioner', name: 'Air Conditioner', emoji: '❄️', category: 'Interior', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2019/02/Factory-air-conditioner-white-noise.mp3` },

  // ── Focus ────────────────────────────────────────────────────
  { id: 'white-noise', name: 'White Noise', emoji: '🧠', category: 'Focus', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2023/07/Free-white-noise.mp3` },
  { id: 'pink-noise', name: 'Pink Noise', emoji: '🧠', category: 'Focus', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${OF}/2014/11/Pink-noise.mp3` },
  { id: 'brown-noise', name: 'Brown Noise', emoji: '🧠', category: 'Focus', layer: 'ambience', isPremium: true, baseVolume: 0.35, preload: false, url: `${OF}/2014/11/Brown-noise.mp3` },


  // ── Niche ────────────────────────────────────────────────────
  { id: 'exam-hall', name: 'Exam Hall', emoji: '🙇', category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.2, preload: false, url: `https://www.orangefreesounds.com/wp-content/uploads/2021/08/Bank-office-ambience.mp3` },
  { id: 'bowling-alley', name: 'Bowling Alley', emoji: '🎳', category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2023/06/Indoor-playground-for-kids-ambience-sound-effect.mp3` },
  { id: 'record-player', name: 'Record Player Static', emoji: '📀', category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.4, preload: false, url: `${OF}/2014/08/Vinyl-noise-sound-effect.mp3` },
  { id: 'outer-space', name: 'Outer Space Rumble', emoji: '🪐', category: 'Niche', layer: 'ambience', isPremium: true, baseVolume: 0.5, preload: false, url: `https://orangefreesounds.com/wp-content/uploads/2022/09/Outer-space-sound-effect.mp3` },
];

export const CATEGORIES: AudioCategory[] = ['Weather', 'Nature', 'Lifestyle', 'Interior', 'Focus', 'Niche'];
