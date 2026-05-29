import { useState } from 'react';
import { Volume2, Headphones, Crown, Youtube, Music2, Moon, Bird, Flame, CloudLightning, Coffee as CafeIcon, CloudRain, Waves, Sparkles, Wind, Droplets, Trees, Cat, Clock, Mountain, Snowflake, Radio, Train, Ship } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface SoundTrack {
  id: string;
  name: string;
  icon: any;
  url: string;
  isPremium: boolean;
  category: string;
}

const AMBIENCE_LIBRARY: SoundTrack[] = [
  // Free sounds (Nature)
  { id: 'rain', name: 'Soft Rain', icon: CloudRain, url: 'https://assets.mixkit.co/active_storage/sfx/2455/2455-preview.mp3', isPremium: false, category: 'Nature' },
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2457/2457-preview.mp3', isPremium: false, category: 'Nature' },
  { id: 'birds', name: 'Morning Birds', icon: Bird, url: 'https://assets.mixkit.co/active_storage/sfx/2472/2472-preview.mp3', isPremium: false, category: 'Nature' },
  { id: 'fire', name: 'Fireplace', icon: Flame, url: 'https://assets.mixkit.co/active_storage/sfx/2456/2456-preview.mp3', isPremium: false, category: 'Nature' },
  { id: 'wind', name: 'Gentle Wind', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2469/2469-preview.mp3', isPremium: false, category: 'Nature' },

  // Free sounds (Urban & Interior)
  { id: 'cafe', name: 'Paris Cafe', icon: CafeIcon, url: 'https://assets.mixkit.co/active_storage/sfx/444/444-preview.mp3', isPremium: false, category: 'Urban' },
  { id: 'lofi', name: 'Focus Lofi', icon: Headphones, url: 'https://assets.mixkit.co/music/292/292.mp3', isPremium: false, category: 'Music' },

  // Premium sounds (Nature)
  { id: 'thunderstorm', name: 'Thunderstorm', icon: CloudLightning, url: 'https://assets.mixkit.co/active_storage/sfx/2450/2450-preview.mp3', isPremium: true, category: 'Nature' },
  { id: 'heavy-rain', name: 'Heavy Rain', icon: Droplets, url: 'https://assets.mixkit.co/active_storage/sfx/2453/2453-preview.mp3', isPremium: true, category: 'Nature' },
  { id: 'waterfall', name: 'Waterfall', icon: Mountain, url: 'https://assets.mixkit.co/active_storage/sfx/2468/2468-preview.mp3', isPremium: true, category: 'Nature' },
  { id: 'forest', name: 'Forest Night', icon: Trees, url: 'https://assets.mixkit.co/active_storage/sfx/2470/2470-preview.mp3', isPremium: true, category: 'Nature' },
  { id: 'summer-night', name: 'Summer Night', icon: Moon, url: 'https://assets.mixkit.co/active_storage/sfx/2467/2467-preview.mp3', isPremium: true, category: 'Nature' },
  { id: 'countryside', name: 'Countryside', icon: Mountain, url: 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3', isPremium: true, category: 'Nature' },
  { id: 'snow', name: 'Snowy Day', icon: Snowflake, url: 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3', isPremium: true, category: 'Nature' },

  // Premium sounds (Urban)
  { id: 'nyc-morning', name: 'NYC Morning', icon: Train, url: 'https://assets.mixkit.co/active_storage/sfx/2463/2463-preview.mp3', isPremium: true, category: 'Urban' },
  { id: 'street-cafe', name: 'Street Cafe', icon: CafeIcon, url: 'https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3', isPremium: true, category: 'Urban' },
  { id: 'train', name: 'Commuter Train', icon: Train, url: 'https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3', isPremium: true, category: 'Urban' },
  { id: 'airport', name: 'Airport Terminal', icon: Ship, url: 'https://assets.mixkit.co/active_storage/sfx/2449/2449-preview.mp3', isPremium: true, category: 'Urban' },

  // Premium sounds (Interior)
  { id: 'cat-purr', name: 'Cat Purr', icon: Cat, url: 'https://assets.mixkit.co/active_storage/sfx/2451/2451-preview.mp3', isPremium: true, category: 'Interior' },
  { id: 'clock-ticking', name: 'Clock Ticking', icon: Clock, url: 'https://assets.mixkit.co/active_storage/sfx/2454/2454-preview.mp3', isPremium: true, category: 'Interior' },
  { id: 'fan', name: 'Room Fan', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2448/2448-preview.mp3', isPremium: true, category: 'Interior' },
  { id: 'keyboard', name: 'Laptop Keyboard', icon: Radio, url: 'https://assets.mixkit.co/active_storage/sfx/2461/2461-preview.mp3', isPremium: true, category: 'Interior' },
  { id: 'office', name: 'Office Ambience', icon: Headphones, url: 'https://assets.mixkit.co/active_storage/sfx/2460/2460-preview.mp3', isPremium: true, category: 'Interior' },

  // Premium sounds (Focus)
  { id: 'white-noise', name: 'White Noise', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2135/2135-preview.mp3', isPremium: true, category: 'Focus' },
  { id: 'pink-noise', name: 'Pink Noise', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2134/2134-preview.mp3', isPremium: true, category: 'Focus' },
  { id: 'brown-noise', name: 'Brown Noise', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2133/2133-preview.mp3', isPremium: true, category: 'Focus' },
  { id: 'deep-focus', name: 'Deep Focus', icon: Music2, url: 'https://assets.mixkit.co/music/27/27.mp3', isPremium: true, category: 'Focus' },
  { id: 'meditation', name: 'Meditation', icon: Sparkles, url: 'https://assets.mixkit.co/music/109/109.mp3', isPremium: true, category: 'Focus' },

  // Premium sounds (Music)
  { id: 'digital-dreams', name: 'Digital Dreams', icon: Sparkles, url: 'https://assets.mixkit.co/music/175/175.mp3', isPremium: true, category: 'Music' },
  { id: 'night-walk', name: 'Night Walk', icon: Moon, url: 'https://assets.mixkit.co/music/135/135.mp3', isPremium: true, category: 'Music' },

  // Binaural brainwaves
  { id: 'gamma', name: 'Gamma Waves', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2132/2132-preview.mp3', isPremium: true, category: 'Binaural' },
  { id: 'beta', name: 'Beta Waves', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2131/2131-preview.mp3', isPremium: true, category: 'Binaural' },
  { id: 'alpha', name: 'Alpha Waves', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2130/2130-preview.mp3', isPremium: true, category: 'Binaural' },
  { id: 'theta', name: 'Theta Waves', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2129/2129-preview.mp3', isPremium: true, category: 'Binaural' },
  { id: 'delta', name: 'Delta Waves', icon: Moon, url: 'https://assets.mixkit.co/active_storage/sfx/2128/2128-preview.mp3', isPremium: true, category: 'Binaural' },
];

const CATEGORIES = ['All', 'Nature', 'Urban', 'Interior', 'Focus', 'Music', 'Binaural'];

export const AmbiencePanel = () => {
  const { userStats, setShowPremiumModal, activeTrackId, masterVolume, playAudio, stopAudio, setMasterVolume } = useStudy();
  const [showAll, setShowAll] = useState(false);
  const [category, setCategory] = useState('All');

  const filtered = category === 'All' ? AMBIENCE_LIBRARY : AMBIENCE_LIBRARY.filter(t => t.category === category);
  const visible = showAll ? filtered : filtered.filter(t => !t.isPremium || userStats.isPremium).slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Active track indicator */}
      {activeTrackId && (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand/10 border border-brand/20">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-medium text-brand">
            Playing: {AMBIENCE_LIBRARY.find(t => t.id === activeTrackId)?.name || activeTrackId}
          </span>
          <button onClick={stopAudio} className="ml-auto text-[9px] text-white/40 hover:text-white/70 underline underline-offset-2">Stop</button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${category === c ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Track grid */}
      <div className="grid grid-cols-3 gap-2">
        {visible.map(track => (
          <button key={track.id} onClick={() => {
            if (track.isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; }
            if (activeTrackId === track.id) { stopAudio(); return; }
            playAudio(track.url, track.id);
          }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all relative ${
              activeTrackId === track.id
                ? 'bg-brand/20 text-brand ring-1 ring-brand/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <track.icon className={`w-4 h-4 ${activeTrackId === track.id ? 'animate-pulse' : ''}`} />
            <span className="text-[8px] font-semibold uppercase tracking-tight text-center line-clamp-1">{track.name}</span>
            {track.isPremium && !userStats.isPremium && (
              <Crown className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-500" />
            )}
          </button>
        ))}
      </div>

      {filtered.length > 6 && (
        <button onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {showAll ? 'Show Less' : `Show All (${filtered.length - 6} more)`}
        </button>
      )}

      {/* Volume slider */}
      <div className="flex items-center gap-3 px-1">
        <Volume2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input type="range" min="0" max="1" step="0.01" value={masterVolume} onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-brand cursor-pointer" />
      </div>

      {/* YouTube lofi embed */}
      <details className="group">
        <summary className="flex items-center gap-2 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <Youtube className="w-3.5 h-3.5" />
          YouTube Stream
        </summary>
        <div className="mt-2 rounded-xl overflow-hidden bg-black/10 dark:bg-white/5 border border-slate-200 dark:border-slate-700">
          <iframe width="100%" height="180" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&controls=0" title="Lofi" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full"></iframe>
        </div>
      </details>
    </div>
  );
};
