import { useState, useMemo, useEffect, type Dispatch, type SetStateAction } from 'react';
import {
  Volume2, Youtube, Music2, Headphones, Crown, Sparkles, X, Loader2, AlertCircle,
  Play, Pause, Trash2, Heart, ChevronDown, ExternalLink, Radio
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { AUDIO_ASSETS, CATEGORIES } from '../../lib/audioRegistry';
import { ALERT_SOUNDS } from '../../lib/alertSounds';
import { storage } from '../../services/storage';

type TabId = 'sounds' | 'music' | 'playlists';

interface FavoriteEntry {
  name: string;
  type: string;
  uri: string;
}

export interface CuratedPlaylist {
  name: string;
  emoji: string;
  embedUrl: string;
  service: string;
}

const CURATED_PLAYLISTS: CuratedPlaylist[] = [
  { name: 'Lofi', emoji: '🎧', embedUrl: 'https://open.spotify.com/embed/playlist/4Zjli1P13J5mmSCD5iKAXK', service: 'Spotify' },
  { name: 'Rainy Day Lofi', emoji: '☔️', embedUrl: 'https://open.spotify.com/embed/playlist/0owPbYZr8bqzFfpzLmP8UV', service: 'Spotify' },
  { name: 'Paris Café', emoji: '🥐', embedUrl: 'https://open.spotify.com/embed/playlist/0VvruOaNjMu1B57ZefMf7B', service: 'Spotify' },
  { name: 'Relaxing Piano', emoji: '🎹', embedUrl: 'https://open.spotify.com/embed/playlist/1IE734A2agfLVvkOcL02Al', service: 'Spotify' },
  { name: 'Video Game Music', emoji: '👾', embedUrl: 'https://open.spotify.com/embed/playlist/022leh1qff2ArTYAAocO9i', service: 'Spotify' },
  { name: 'Jazzhop', emoji: '🎷', embedUrl: 'https://open.spotify.com/embed/playlist/2kzTQa3FcDDlJhhITcIBpX', service: 'Spotify' },
  { name: 'Lofi Girl', emoji: '🎧', embedUrl: 'https://www.youtube.com/embed/qGohtGC5Rtk?autoplay=0&controls=1&playsinline=1', service: 'YouTube' },
  { name: 'Alpha Waves', emoji: '💆', embedUrl: 'https://www.youtube.com/embed/WPni755-Krg?autoplay=0&controls=1&playsinline=1', service: 'YouTube' },
  { name: 'Beta Waves', emoji: '👨‍💻', embedUrl: 'https://www.youtube.com/embed/YWIhyOWxKPw?autoplay=0&controls=1&playsinline=1', service: 'YouTube' },
  { name: 'Gamma Waves', emoji: '🙇', embedUrl: 'https://www.youtube.com/embed/lkkGlVWvkLk?autoplay=0&controls=1&playsinline=1', service: 'YouTube' },
  { name: 'Theta Waves', emoji: '🧘', embedUrl: 'https://www.youtube.com/embed/dxGU80Ny0JQ?autoplay=0&controls=1&playsinline=1', service: 'YouTube' },
];

const loadFavorites = (): FavoriteEntry[] => {
  try {
    const raw = localStorage.getItem('study_flow_audio_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveFavorites = (favorites: FavoriteEntry[]) => {
  localStorage.setItem('study_flow_audio_favorites', JSON.stringify(favorites));
};

const convertToEmbedUrl = (url: string, service: string): string => {
  try {
    if (service === 'spotify') {
      // Already an embed URL
      if (url.includes('/embed/')) return url;
      // Convert spotify.com/playlist/XXX → spotify.com/embed/playlist/XXX
      const match = url.match(/open\.spotify\.com\/(playlist|track|album|episode)\/([a-zA-Z0-9]+)/);
      if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
    }
    if (service === 'youtube') {
      // Already an embed URL
      if (url.includes('/embed/')) return url;
      // Convert youtube.com/watch?v=XXX → youtube.com/embed/XXX
      const watchMatch = url.match(/(?:youtube\.com|youtu\.be)[\/\w]*(?:\?v=|\/)([a-zA-Z0-9_-]{11})/);
      if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&controls=1`;
    }
    if (service === 'apple-music') {
      // Convert music.apple.com → embed.music.apple.com
      const match = url.match(/https?:\/\/music\.apple\.com\/(.+)/);
      if (match) return `https://embed.music.apple.com/${match[1]}`;
      if (url.includes('embed.music.apple.com')) return url;
    }
  } catch {}
  return url;
};

interface AmbiencePanelProps {
  ambienceUrl: CuratedPlaylist | null;
  onAmbienceUrlChange: Dispatch<SetStateAction<CuratedPlaylist | null>>;
}

export const AmbiencePanel = ({ ambienceUrl, onAmbienceUrlChange }: AmbiencePanelProps) => {
  const {
    userStats, setShowPremiumModal, activeTracks, masterVolume,
    toggleTrack, setTrackVolume, stopAllTracks, setMasterVolume
  } = useStudy();

  const [activeTab, setActiveTab] = useState<TabId>('sounds');
  const [activeCategory, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(loadFavorites);
  const [customUrl, setCustomUrl] = useState('');
  const [customService, setCustomService] = useState<'spotify' | 'youtube' | 'apple-music'>('spotify');
  const [alertSound, setAlertSound] = useState(() => storage.getAlertSound() || 'sparkle');
  const [alertVolume, setAlertVolume] = useState(() => storage.getAlertVolume() ?? 0.75);

  useEffect(() => { saveFavorites(favorites); }, [favorites]);
  useEffect(() => { storage.saveAlertSound(alertSound); }, [alertSound]);
  useEffect(() => { storage.saveAlertVolume(alertVolume); }, [alertVolume]);

  const activeTrackList = useMemo(() => Object.keys(activeTracks), [activeTracks]);
  const trackCount = activeTrackList.length;
  const atMaxLayers = trackCount >= 5;
  const anyPlaying = useMemo(() =>
    Object.values(activeTracks).some(s => !(s as any).isError && !(s as any).isLoading),
    [activeTracks]
  );

  const filteredAssets = useMemo(() => {
    if (activeCategory === 'All') return AUDIO_ASSETS;
    return AUDIO_ASSETS.filter(a => a.category === activeCategory);
  }, [activeCategory]);

  const toggleAll = () => {
    if (anyPlaying) {
      stopAllTracks();
    } else {
      const toPlay = activeTrackList.length > 0
        ? activeTrackList
        : AUDIO_ASSETS.filter(a => !a.isPremium || userStats.isPremium).slice(0, 3).map(a => a.id);
      toPlay.forEach(id => toggleTrack(id));
    }
  };

  const isFavorite = (id: string) => favorites.some(f => f.uri === id);
  const toggleFavorite = (id: string, name: string) => {
    if (isFavorite(id)) {
      setFavorites(prev => prev.filter(f => f.uri !== id));
    } else {
      setFavorites(prev => [...prev, { name, type: 'sound', uri: id }]);
    }
  };

  const addCustomUrl = () => {
    if (!customUrl.trim()) return;
    const embedUrl = convertToEmbedUrl(customUrl.trim(), customService);
    setFavorites(prev => [...prev, {
      name: customUrl.trim().split('/').pop() || 'Custom',
      type: customService,
      uri: embedUrl
    }]);
    setCustomUrl('');
  };

  const removeFavorite = (idx: number) => {
    setFavorites(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Sounds Tab ────────────────────────────────────────────────
  const renderSoundsTab = () => (
    <div className="space-y-4">
      {/* Now Playing Bar */}
      {trackCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/10 border border-brand/20">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Sparkles className="w-3 h-3 text-brand shrink-0" />
            <span className="text-[10px] font-bold text-brand truncate">
              {trackCount}/5 · {activeTrackList.map(id => AUDIO_ASSETS.find(a => a.id === id)?.name).filter(Boolean).join(', ')}
            </span>
          </div>
          <button onClick={stopAllTracks} className="p-1 rounded-lg hover:bg-brand/20 text-brand/60 hover:text-brand transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Global Controls */}
      <div className="flex items-center gap-2">
        <button onClick={toggleAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all active:scale-95">
          {anyPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {anyPlaying ? 'Pause All' : 'Play'}
        </button>
        {trackCount > 0 && (
          <button onClick={stopAllTracks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-95">
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
        <div className="flex-1" />
        <div className="relative">
          <select value={activeCategory} onChange={e => setCategory(e.target.value)}
            className="appearance-none px-3 py-1.5 pr-7 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-0 cursor-pointer outline-none hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors">
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Sound Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${atMaxLayers ? 'opacity-60' : ''}`}>
        {filteredAssets.map(asset => {
          const trackState = activeTracks[asset.id];
          const isActive = !!trackState;
          const isLoading = trackState?.isLoading;
          const isError = trackState?.isError;
          const vol = trackState?.volume ?? asset.baseVolume;
          const fav = isFavorite(asset.id);

          return (
            <div key={asset.id}
              className={`relative rounded-[20px] p-3 transition-all group ${
                isActive
                  ? 'bg-brand/10 ring-2 ring-brand/20'
                  : 'bg-slate-50 dark:bg-white/[0.03] border border-transparent hover:border-slate-200 dark:hover:border-white/10'
                } ${atMaxLayers && !isActive ? 'cursor-not-allowed' : ''}`}>

              {/* Favorite Heart */}
              <button onClick={e => { e.stopPropagation(); toggleFavorite(asset.id, asset.name); }}
                className={`absolute top-2 right-2 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                  fav ? 'opacity-100 text-rose-500' : 'text-slate-400 hover:text-rose-400'
                }`}>
                <Heart className={`w-3 h-3 ${fav ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Sound Button (emoji) */}
              <button onClick={() => {
                if (asset.isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; }
                if (atMaxLayers && !isActive) return;
                toggleTrack(asset.id);
              }}
                className="w-full flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all text-xl relative ${
                  isActive
                    ? 'bg-brand/20 text-brand scale-110'
                    : 'bg-white dark:bg-white/5 shadow-sm group-hover:scale-105'
                }`}>
                  <span className={isActive && !isLoading && !isError ? 'animate-pulse' : ''}>{asset.emoji}</span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                      <Loader2 className="w-5 h-5 animate-spin text-brand" />
                    </div>
                  )}
                  {isError && (
                    <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-tight text-center leading-tight dark:text-white/80">{asset.name}</span>
              </button>

              {/* Per-track Volume Slider (always visible, disabled when inactive) */}
              <div className="mt-2 px-1">
                <input type="range" min="0" max="1" step="0.01"
                  disabled={!isActive || isLoading || isError}
                  value={vol}
                  onChange={(e) => setTrackVolume(asset.id, parseFloat(e.target.value))}
                  onClick={e => e.stopPropagation()}
                  className={`w-full h-1 rounded-full appearance-none cursor-pointer ${
                    isActive
                      ? 'bg-brand/20 accent-brand'
                      : 'bg-slate-200 dark:bg-white/10 opacity-30'
                  } ${!isActive ? 'cursor-default' : ''}`}
                />
              </div>

              {/* Premium Badge */}
              {asset.isPremium && !userStats.isPremium && (
                <div className="absolute top-2 left-2">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {atMaxLayers && (
        <p className="text-[9px] text-center text-slate-400 font-medium">Maximum 5 sounds reached</p>
      )}
    </div>
  );

  // ── My Music Tab ──────────────────────────────────────────────
  const renderMusicTab = () => (
    <div className="space-y-4">
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
        Paste a Spotify, YouTube, or Apple Music link to play it here.
      </p>

      <div className="flex gap-2">
        <select value={customService} onChange={e => setCustomService(e.target.value as any)}
          className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-[10px] font-bold text-slate-500 border-0 cursor-pointer outline-none">
          <option value="spotify">Spotify</option>
          <option value="youtube">YouTube</option>
          <option value="apple-music">Apple Music</option>
        </select>
        <input type="text" value={customUrl} onChange={e => setCustomUrl(e.target.value)}
          placeholder="Paste playlist URL..."
          onKeyDown={e => e.key === 'Enter' && addCustomUrl()}
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-[11px] outline-none placeholder:text-slate-400 dark:text-white/80 border-0" />
        <button onClick={addCustomUrl}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-brand text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all">
          Load
        </button>
      </div>

      {favorites.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Favorites</h4>
          {favorites.map((fav, idx) => (
            <div key={idx}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors group">
              <span className="text-base">{fav.type === 'spotify' ? '🎵' : fav.type === 'youtube' ? '📺' : fav.type === 'sound' ? '🔊' : '📻'}</span>
              <span className="flex-1 text-[11px] font-bold truncate dark:text-white/80">{fav.name}</span>
              {fav.type === 'sound' ? (
                <button onClick={() => toggleTrack(fav.uri)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                  <Play className="w-3 h-3" />
                </button>
              ) : (
                <button onClick={() => {
                  onAmbienceUrlChange({ name: fav.name, emoji: '🎵', embedUrl: fav.uri, service: fav.type });
                  setActiveTab('playlists');
                }}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              <button onClick={() => removeFavorite(idx)}
                className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Playlists Tab ─────────────────────────────────────────────
  const renderPlaylistsTab = () => (
    <div className="space-y-4">
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
        Curated playlists. Click to play in-app.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {CURATED_PLAYLISTS.map(pl => (
          <button key={pl.embedUrl} onClick={() => onAmbienceUrlChange(pl)}
            className={`flex items-center gap-3 p-3 rounded-[20px] transition-all group text-left ${
              ambienceUrl?.embedUrl === pl.embedUrl
                ? 'bg-brand/10 ring-2 ring-brand/20'
                : 'bg-slate-50 dark:bg-white/[0.03] border border-transparent hover:border-slate-200 dark:hover:border-white/10'
            }`}>
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
              {pl.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold truncate dark:text-white/80">{pl.name}</div>
              <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{pl.service}</div>
            </div>
            <Play className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.03]">
        {[
          { id: 'sounds' as TabId, label: 'Sounds', icon: Headphones },
          { id: 'music' as TabId, label: 'My Music', icon: Music2 },
          { id: 'playlists' as TabId, label: 'Playlists', icon: Radio },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-white/10 text-brand shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}>
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'sounds' && renderSoundsTab()}
      {activeTab === 'music' && renderMusicTab()}
      {activeTab === 'playlists' && renderPlaylistsTab()}

      {/* Master Volume */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Master Volume</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400">{Math.round(masterVolume * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-brand cursor-pointer"
        />
      </div>

      {/* Timer Alert Sound */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Timer Alert</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALERT_SOUNDS.map(a => (
            <button key={a.id} onClick={() => setAlertSound(a.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                alertSound === a.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/[0.03] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>
              <span>{a.emoji}</span>
              <span>{a.name}</span>
            </button>
          ))}
        </div>
        {alertSound !== 'none' && (
          <div className="flex items-center gap-3 px-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 w-12">Volume</span>
            <input type="range" min="0" max="1" step="0.01" value={alertVolume}
              onChange={(e) => setAlertVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-brand cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">{Math.round(alertVolume * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
