import { 
  CloudRain, Waves, Bird, Flame, Wind, CloudLightning, 
  Droplets, Mountain, Trees, Moon, Snowflake, Train, 
  Coffee as CafeIcon, Ship, Cat, Clock, Radio, Headphones, 
  Music2, Sparkles 
} from 'lucide-react';

export type AudioCategory = 'Nature' | 'Urban' | 'Interior' | 'Focus' | 'Music' | 'Binaural';
export type LoadingStrategy = 'webaudio' | 'html5';

export interface SoundAsset {
  id: string;
  name: string;
  icon: any;
  url: string;
  category: AudioCategory;
  isPremium: boolean;
  strategy: LoadingStrategy;
  baseVolume: number;
}

export const AUDIO_ASSETS: SoundAsset[] = [
  // ── Nature ────────────────────────────────────────────────────
  { id: 'rain', name: 'Soft Rain', icon: CloudRain, category: 'Nature', isPremium: false, strategy: 'webaudio', baseVolume: 0.5, url: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, category: 'Nature', isPremium: false, strategy: 'webaudio', baseVolume: 0.5, url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3' },
  { id: 'birds', name: 'Morning Birds', icon: Bird, category: 'Nature', isPremium: false, strategy: 'webaudio', baseVolume: 0.4, url: 'https://www.soundjay.com/nature/forest-birds-1.mp3' },
  { id: 'fire', name: 'Fireplace', icon: Flame, category: 'Nature', isPremium: false, strategy: 'webaudio', baseVolume: 0.6, url: 'https://orangefreesounds.com/wp-content/uploads/2021/01/Fireplace-sound-effect.mp3' },
  { id: 'wind', name: 'Gentle Wind', icon: Wind, category: 'Nature', isPremium: false, strategy: 'webaudio', baseVolume: 0.5, url: 'https://www.soundjay.com/nature/wind-01.mp3' },
  { id: 'thunderstorm', name: 'Thunderstorm', icon: CloudLightning, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.6, url: 'https://www.chosic.com/wp-content/uploads/2021/07/Rain-and-Thunder.mp3' },
  { id: 'heavy-rain', name: 'Heavy Rain', icon: Droplets, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2023/01/White-noise-heavy-rain.mp3' },
  { id: 'waterfall', name: 'Waterfall', icon: Mountain, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.4, url: 'https://www.ata.org/wp-content/uploads/2019/09/Multnomah-Falls.mp3' },
  { id: 'forest', name: 'Forest Night', icon: Trees, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2014/10/Night-forest-sounds.mp3' },
  { id: 'summer-night', name: 'Summer Night', icon: Moon, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2020/09/Crickets-chirping-at-night.mp3' },
  { id: 'countryside', name: 'Countryside', icon: Mountain, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://bigsoundbank.com/static/mp3/0097.mp3' },
  { id: 'snow', name: 'Snowy Day', icon: Snowflake, category: 'Nature', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2024/01/Cold-winter-wind-sound-effect.mp3' },

  // ── Urban ────────────────────────────────────────────────────
  { id: 'nyc-morning', name: 'NYC Morning', icon: Train, category: 'Urban', isPremium: true, strategy: 'webaudio', baseVolume: 0.8, url: 'https://www.soundjay.com/ambient/city-traffic-1.mp3' },
  { id: 'street-cafe', name: 'Street Cafe', icon: CafeIcon, category: 'Urban', isPremium: true, strategy: 'webaudio', baseVolume: 0.6, url: 'https://www.chosic.com/wp-content/uploads/2021/07/Coffee-Shop-Ambience.mp3' },
  { id: 'paris-cafe', name: 'Paris Cafe', icon: CafeIcon, category: 'Urban', isPremium: false, strategy: 'webaudio', baseVolume: 0.5, url: 'https://www.soundjay.com/ambient/restaurant-ambience-01.mp3' },
  { id: 'train', name: 'Commuter Train', icon: Train, category: 'Urban', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://www.soundjay.com/ambient/train-ride-1.mp3' },
  { id: 'airport', name: 'Airport Terminal', icon: Ship, category: 'Urban', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2016/01/Airport-ambience.mp3' },

  // ── Interior ──────────────────────────────────────────────────
  { id: 'cat-purr', name: 'Cat Purr', icon: Cat, category: 'Interior', isPremium: true, strategy: 'webaudio', baseVolume: 0.7, url: 'https://blog.lehle.com/wp-content/uploads/2017/11/cat-purr.mp3' },
  { id: 'clock-ticking', name: 'Clock Ticking', icon: Clock, category: 'Interior', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'http://www.pdsounds.org/audio/download/216/STE-025.mp3' },
  { id: 'fan', name: 'Room Fan', icon: Wind, category: 'Interior', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2018/05/Fan-noises-for-sleeping.mp3' },
  { id: 'keyboard', name: 'Laptop Keyboard', icon: Radio, category: 'Interior', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://bigsoundbank.com/static/mp3/0229.mp3' },
  { id: 'office', name: 'Office Ambience', icon: Headphones, category: 'Interior', isPremium: true, strategy: 'webaudio', baseVolume: 0.5, url: 'https://orangefreesounds.com/wp-content/uploads/2023/02/Office-ambience-sound-effect.mp3' },

  // ── Focus & Music ──────────────────────────────────────────────
  { id: 'lofi', name: 'Focus Lofi', icon: Headphones, category: 'Music', isPremium: false, strategy: 'html5', baseVolume: 0.9, url: 'https://archive.org/download/lofi-hip-hop-beats-to-relax-study-to/Lofi%20Hip%20Hop%20Beats%20-%201.mp3' },
  { id: 'deep-focus', name: 'Deep Focus', icon: Music2, category: 'Focus', isPremium: true, strategy: 'html5', baseVolume: 0.8, url: 'https://archive.org/download/ZenMeditationMusicSoothingMusicRelaxingMusicMeditationZenBinauralBeats3236/Zen%20Meditation%20Music%2C%20Soothing%20Music%2C%20Relaxing%20Music%20Meditation%2C%20Zen%2C%20Binaural%20Beats%2C%20%E2%98%AF3236.mp3' },
  { id: 'white-noise', name: 'White Noise', icon: Waves, category: 'Focus', isPremium: true, strategy: 'webaudio', baseVolume: 0.4, url: 'https://www.soundjay.com/ambient/white-noise-01.mp3' },
  { id: 'pink-noise', name: 'Pink Noise', icon: Waves, category: 'Focus', isPremium: true, strategy: 'webaudio', baseVolume: 0.4, url: 'https://orangefreesounds.com/wp-content/uploads/2022/02/Pink-noise.mp3' },

  // ── Binaural Brainwaves ────────────────────────────────────────
  { id: 'gamma', name: 'Gamma Waves', icon: Waves, category: 'Binaural', isPremium: true, strategy: 'html5', baseVolume: 0.7, url: 'https://archive.org/download/ZenMeditationMusicSoothingMusicRelaxingMusicMeditationZenBinauralBeats3236/3%20Hour%20Relaxing%20Guitar%20Music%20Meditation%20Music%2C%20Instrumental%20Music%2C%20Calming%20Music%2C%20Soft%20Music%2C%20%E2%98%AF2432.mp3' },
  { id: 'beta', name: 'Beta Waves', icon: Waves, category: 'Binaural', isPremium: true, strategy: 'html5', baseVolume: 0.7, url: 'https://archive.org/download/ZenMeditationMusicSoothingMusicRelaxingMusicMeditationZenBinauralBeats3236/2%20HOUR%20LONG%20Piano%20Music%20for%20Studying%2C%20Concentrating%2C%20and%20Focusing%20Playlist.mp3' },
  { id: 'alpha', name: 'Alpha Waves', icon: Waves, category: 'Binaural', isPremium: true, strategy: 'html5', baseVolume: 0.7, url: 'https://archive.org/download/ZenMeditationMusicSoothingMusicRelaxingMusicMeditationZenBinauralBeats3236/Tibetan%20Meditation%20Music%2C%20Soothing%20Music%2C%20Relaxing%20Music%20Meditation%2C%20Binaural%20Beats%2C%20%E2%98%AF3186.mp3' },
  { id: 'theta', name: 'Theta Waves', icon: Waves, category: 'Binaural', isPremium: true, strategy: 'webaudio', baseVolume: 0.6, url: 'https://archive.org/download/Sleep_Music-5629/Shoreline.mp3' },
  { id: 'delta', name: 'Delta Waves', icon: Moon, category: 'Binaural', isPremium: true, strategy: 'html5', baseVolume: 0.7, url: 'https://archive.org/download/ZenMeditationMusicSoothingMusicRelaxingMusicMeditationZenBinauralBeats3236/Sleep%20Music%20Delta%20Waves%20Relaxing%20Music%20to%20Help%20you%20Sleep%2C%20Deep%20Sleep%2C%20Inner%20Peace.mp3' },
];

export const CATEGORIES: AudioCategory[] = ['Nature', 'Urban', 'Interior', 'Focus', 'Music', 'Binaural'];
