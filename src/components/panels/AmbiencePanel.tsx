import { useState, useMemo, useEffect } from 'react';
import {
  Volume2, Youtube, Music2, Headphones, Crown, Sparkles, X, Loader2, AlertCircle,
  Play, Pause, Trash2, Heart, ChevronDown, ExternalLink, Radio
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { AUDIO_ASSETS, CATEGORIES, SoundAsset } from '../../lib/audioRegistry';
import { storage } from '../../services/storage';
import { ALERT_SOUNDS } from '../../lib/alertSounds';

type TabId = 'sounds' | 'music' | 'playlists';

interface PlaylistEntry {
  name: string;
  emoji: string;
  uri: string;
  service: 'spotify' | 'youtube' | 'apple-music' | 'soundcloud' | 'amazon-music';
}

const CURATED_PLAYLISTS: PlaylistEntry[] = [
  { name: 'Lofi', emoji: '🎧', uri: 'https://open.spotify.com/embed/playlist/4Zjli1P13J5mmSCD5iKAXK', service: 'spotify' },
  { name: 'Rainy Day Lofi', emoji: '☔️', uri: 'https://open.spotify.com/embed/playlist/0owPbYZr8bqzFfpzLmP8UV', service: 'spotify' },
  { name: 'Paris Café', emoji: '🥐', uri: 'https://open.spotify.com/embed/playlist/0VvruOaNjMu1B57ZefMf7B', service: 'spotify' },
  { name: 'Relaxing Piano', emoji: '🎹', uri: 'https://open.spotify.com/embed/playlist/1IE734A2agfLVvkOcL02Al', service: 'spotify' },
  { name: 'Video Game Music', emoji: '👾', uri: 'https://open.spotify.com/embed/playlist/022leh1qff2ArTYAAocO9i', service: 'spotify' },
  { name: 'Jazzhop', emoji: '🎷', uri: 'https://open.spotify.com/embed/playlist/2kzTQa3FcDDlJhhITcIBpX', service: 'spotify' },
  { name: 'Lofi Girl', emoji: '🎧', uri: 'https://www.youtube.com/embed/jfKfPfyJRdk', service: 'youtube' },
];

interface FavoriteEntry {
  name: string;
  type: string;
  uri: string;
}

const loadFavorites = (): FavoriteEntry[] => {
  try {
    const raw = localStorage.getItem('study_flow_audio_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveFavorites = (favorites: FavoriteEntry[]) => {
  localStorage.setItem('study_flow_audio_favorites', JSON.stringify(favorites));
};

export const AmbiencePanel = () => {
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
  const toggleFavorite = (asset: SoundAsset) => {
    if (isFavorite(asset.id)) {
      setFavorites(prev => prev.filter(f => f.uri !== asset.id));
    } else {
      setFavorites(prev => [...prev, { name: asset.name, type: 'sound', uri: asset.id }]);
    }
  };

  const addCustomUrl = () => {
    if (!customUrl.trim()) return;
    setFavorites(prev => [...prev, {
      name: customUrl.split('/').pop() || 'Custom',
      type: customService,
      uri: customUrl
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
      {activeTrackList.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/10 border border-brand/20">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Sparkles className="w-3 h-3 text-brand shrink-0" />
            <span className="text-[10px] font-bold text-brand truncate">
              {activeTrackList.map(id => AUDIO_ASSETS.find(a => a.id === id)?.name).filter(Boolean).join(', ')}
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
        {activeTrackList.length > 0 && (
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
            <option value="All">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filteredAssets.map(asset => {
          const trackState = activeTracks[asset.id];
          const isActive = !!trackState;
          const isLoading = trackState?.isLoading;
          const isError = trackState?.isError;
          const fav = isFavorite(asset.id);

          return (
            <div key={asset.id}
              className={`relative rounded-[20px] p-3 transition-all group ${
                isActive
                  ? 'bg-brand/10 ring-2 ring-brand/20'
                  : 'bg-slate-50 dark:bg-white/[0.03] border border-transparent hover:border-slate-200 dark:hover:border-white/10'
              }`}>

              {/* Favorite Heart */}
              <button onClick={e => { e.stopPropagation(); toggleFavorite(asset); }}
                className={`absolute top-2 right-2 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                  fav ? 'opacity-100 text-rose-500' : 'text-slate-400 hover:text-rose-400'
                }`}>
                <Heart className={`w-3 h-3 ${fav ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Sound Button */}
              <button onClick={() => {
                if (asset.isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; }
                toggleTrack(asset.id);
              }}
                className="w-full flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-brand/30 scale-110'
                    : 'bg-white dark:bg-white/5 shadow-sm group-hover:scale-105'
                }`}>
                  <asset.icon className={`w-4.5 h-4.5 ${isActive && !isLoading && !isError ? 'animate-pulse' : ''}`} />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                  )}
                  {isError && (
                    <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5">
                      <AlertCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-tight text-center leading-tight line-clamp-1 dark:text-white/80">{asset.name}</span>
              </button>

              {/* Per-track Volume Slider (visible when active) */}
              {isActive && (
                <div className="mt-2 px-1">
                  <input type="range" min="0" max="1" step="0.01"
                    disabled={isLoading || isError}
                    value={trackState?.volume ?? asset.baseVolume}
                    onChange={(e) => setTrackVolume(asset.id, parseFloat(e.target.value))}
                    onClick={e => e.stopPropagation()}
                    className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-brand cursor-pointer disabled:opacity-30"
                  />
                </div>
              )}

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
    </div>
  );

  // ── My Music Tab ──────────────────────────────────────────────
  const renderMusicTab = () => (
    <div className="space-y-4">
      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
        Add external playlists or streams to your favorites.
      </div>

      {/* Add Custom URL */}
      <div className="flex gap-2">
        <select value={customService} onChange={e => setCustomService(e.target.value as any)}
          className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-[10px] font-bold text-slate-500 border-0 cursor-pointer outline-none">
          <option value="spotify">Spotify</option>
          <option value="youtube">YouTube</option>
          <option value="apple-music">Apple Music</option>
        </select>
        <input type="text" value={customUrl} onChange={e => setCustomUrl(e.target.value)}
          placeholder="Paste playlist/video URL..."
          onKeyDown={e => e.key === 'Enter' && addCustomUrl()}
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-[11px] outline-none placeholder:text-slate-400 dark:text-white/80 border-0" />
        <button onClick={addCustomUrl}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-brand text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all">
          Load
        </button>
      </div>

      {/* Favorites List */}
      {favorites.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Favorites</h4>
          {favorites.map((fav, idx) => (
            <div key={idx}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors group">
              <div className="w-6 h-6 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center">
                {fav.type === 'spotify' ? <Music2 className="w-3 h-3 text-green-500" /> :
                 fav.type === 'youtube' ? <Youtube className="w-3 h-3 text-red-500" /> :
                 <Radio className="w-3 h-3 text-brand" />}
              </div>
              <span className="flex-1 text-[11px] font-bold truncate dark:text-white/80">{fav.name}</span>
              {fav.type === 'sound' ? (
                <button onClick={() => toggleTrack(fav.uri)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                  <Play className="w-3 h-3" />
                </button>
              ) : (
                <a href={fav.uri} target="_blank" rel="noopener noreferrer"
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button onClick={() => removeFavorite(idx)}
                className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Iframe Player (embedded when favorite selected) */}
      {favorites.length > 0 && ['spotify', 'youtube', 'apple-music'].includes(favorites[0].type) && (
        <div className="rounded-[20px] overflow-hidden bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/[0.05]">
          <iframe
            src={favorites[0].type === 'spotify' ? favorites[0].uri.replace('open.spotify.com/embed/playlist/', 'https://open.spotify.com/embed/playlist/') : favorites[0].uri}
            width="100%" height="160" frameBorder="0"
            allow="encrypted-media; autoplay; clipboard-write"
            className="w-full"
            title={favorites[0].name}
          />
        </div>
      )}
    </div>
  );

  // ── Playlists Tab ─────────────────────────────────────────────
  const renderPlaylistsTab = () => (
    <div className="space-y-3">
      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
        Curated playlists to pair with your soundscape.
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CURATED_PLAYLISTS.map(pl => (
          <a key={pl.uri} href={pl.uri} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-[20px] bg-slate-50 dark:bg-white/[0.03] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
              {pl.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold truncate dark:text-white/80">{pl.name}</div>
              <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{pl.service}</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
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
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 w-12">Vol</span>
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
