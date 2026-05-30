import { useState, useMemo } from 'react';
import { Volume2, Youtube, Music2, Headphones, Crown, Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { AUDIO_ASSETS, CATEGORIES, SoundAsset } from '../../lib/audioRegistry';

export const AmbiencePanel = () => {
  const { userStats, setShowPremiumModal, activeTracks, masterVolume, toggleTrack, setTrackVolume, stopAllTracks, setMasterVolume } = useStudy();
  const [activeCategory, setCategory] = useState('All');

  const activeTrackList = useMemo(() => Object.keys(activeTracks), [activeTracks]);

  const filteredAssets = useMemo(() => {
    if (activeCategory === 'All') return AUDIO_ASSETS;
    return AUDIO_ASSETS.filter(a => a.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6 pb-4">
      {/* Mixer / Active tracks section (Flocus style) */}
      {activeTrackList.length > 0 && (
        <div className="space-y-4 p-5 rounded-[24px] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Live Mixer</h3>
            </div>
            <button 
              onClick={stopAllTracks} 
              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-95"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-4">
            {activeTrackList.map(id => {
              const asset = AUDIO_ASSETS.find(a => a.id === id);
              const trackState = activeTracks[id];
              if (!asset || !trackState) return null;

              return (
                <div key={id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/[0.05] flex items-center justify-center relative">
                        <asset.icon className={`w-3.5 h-3.5 ${trackState.isError ? 'text-rose-500' : 'text-brand'}`} />
                        {trackState.isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 rounded-lg">
                            <Loader2 className="w-3 h-3 animate-spin text-brand" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold dark:text-white flex items-center gap-1.5">
                        {asset.name}
                        {trackState.isError && <AlertCircle className="w-2.5 h-2.5 text-rose-500" />}
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleTrack(id)} 
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    disabled={trackState.isLoading || trackState.isError}
                    value={trackState.volume} 
                    onChange={(e) => setTrackVolume(id, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-brand cursor-pointer disabled:opacity-30" 
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-100 dark:bg-white/[0.03] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Main Track Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {filteredAssets.map(asset => {
          const trackState = activeTracks[asset.id];
          const isActive = !!trackState;
          const isLoading = trackState?.isLoading;
          const isError = trackState?.isError;

          return (
            <button key={asset.id} onClick={() => {
              if (asset.isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; }
              toggleTrack(asset.id);
            }}
              className={`flex flex-col items-center gap-2 p-4 rounded-[20px] transition-all relative group ${
                isActive
                  ? 'bg-brand/10 text-brand ring-2 ring-brand/20 shadow-md'
                  : 'bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative ${
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
              <span className="text-[10px] font-bold tracking-tight text-center line-clamp-1">{asset.name}</span>
              {asset.isPremium && !userStats.isPremium && (
                <div className="absolute top-2 right-2">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Master Controls */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">System Volume</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">{Math.round(masterVolume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={masterVolume} onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-brand cursor-pointer" />
        </div>

        {/* YouTube Stream Link (Optional/Collapsible) */}
        <details className="group">
          <summary className="flex items-center gap-2 py-3 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors list-none">
            <Youtube className="w-3.5 h-3.5" />
            External Lofi Stream
          </summary>
          <div className="mt-2 rounded-[20px] overflow-hidden bg-black/10 dark:bg-white/5 border border-slate-200 dark:border-white/[0.05] shadow-inner">
            <iframe width="100%" height="160" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&controls=0" title="Lofi" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full opacity-80"></iframe>
          </div>
        </details>
      </div>
    </div>
  );
};
