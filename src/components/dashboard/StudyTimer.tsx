import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Zap, Music, Maximize2, X, Volume2, 
  CloudRain, Coffee, Waves, Palette, VolumeX, Lock, Crown, Layout, Sparkles,
  Settings2, Timer, BedDouble, Rocket, Image as ImageIcon, Search, Check, Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardCard } from './DashboardCard';
import { storage } from '../../services/storage';
import { useStudy } from '../../context/StudyContext';
import { ATMOSPHERES, WALLPAPERS, Wallpaper } from '../../lib/gamification';
import { PremiumModal } from '../modals/PremiumModal';

const AMBIENCE_TRACKS = [
  { id: 'lofi', name: 'Focus Lofi', icon: Coffee, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Files/main/lofi.mp3' },
  { id: 'rain', name: 'Rainy Window', icon: CloudRain, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Files/main/rain.mp3' },
  { id: 'white-noise', name: 'Deep Focus', icon: Waves, url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Files/main/white-noise.mp3' },
];

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface Preset { id: string; name: string; icon: any; focus: number; short: number; long: number; }

const PRESETS: Preset[] = [
  { id: 'pomodoro', name: 'Classic Pomodoro', icon: Timer, focus: 25, short: 5, long: 15 },
  { id: 'deep', name: 'Deep Work', icon: Rocket, focus: 50, short: 10, long: 25 },
  { id: 'flow', name: 'Elite Flow', icon: Zap, focus: 90, short: 15, long: 30 },
];

export const StudyTimer = ({ onTick }: { onTick?: () => void }) => {
  const { themeConfig, setThemeConfig, completeFocusSession, userStats, triggerConfetti } = useStudy();
  
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'atm' | 'wall'>('atm');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customUrl, setCustomUrl] = useState(themeConfig.customWallpaperUrl || '');

  const sessionElapsed = useRef(0);

  useEffect(() => {
    const saved = storage.getTimerState();
    if (saved !== null) setTimeLeft(saved);
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        const nextTime = timeLeft - 1;
        setTimeLeft(nextTime);
        storage.saveTimerState(nextTime);
        if (mode === 'focus') {
          sessionElapsed.current += 1;
          if (sessionElapsed.current >= 60) {
            completeFocusSession(60);
            sessionElapsed.current = 0;
          }
        }
        if (onTick) onTick();
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const handleTimerComplete = () => {
    setIsActive(false);
    triggerConfetti();
    const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    alertAudio.volume = 0.3;
    alertAudio.play().catch(() => {});

    if (mode === 'focus') {
      const newTotal = sessionsCompleted + 1;
      setSessionsCompleted(newTotal);
      if (newTotal % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(activePreset.long * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(activePreset.short * 60);
      }
    } else {
      setMode('focus');
      setTimeLeft(activePreset.focus * 60);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    const duration = newMode === 'focus' ? activePreset.focus : 
                     newMode === 'shortBreak' ? activePreset.short : activePreset.long;
    setTimeLeft(duration * 60);
    storage.saveTimerState(duration * 60);
  };

  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    const ambienceAudio = activeAmbience ? document.getElementById(`audio-${activeAmbience}`) as HTMLAudioElement : null;
    if (nextState && ambienceAudio) ambienceAudio.play().catch(() => {});
    else if (!nextState && ambienceAudio) ambienceAudio.pause();
    if (!nextState && mode === 'focus' && sessionElapsed.current > 0) {
      completeFocusSession(sessionElapsed.current);
      sessionElapsed.current = 0;
    }
  };

  const resetTimer = () => {
    if (mode === 'focus' && sessionElapsed.current > 0) {
      completeFocusSession(sessionElapsed.current);
      sessionElapsed.current = 0;
    }
    setIsActive(false);
    const duration = mode === 'focus' ? activePreset.focus : 
                     mode === 'shortBreak' ? activePreset.short : activePreset.long;
    setTimeLeft(duration * 60);
    storage.saveTimerState(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomizationClick = (type: 'atm' | 'wall', id: any, isPremium: boolean, levelReq: number) => {
    if (isPremium && !userStats.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    if (userStats.level < levelReq) return;
    if (type === 'atm') setThemeConfig({ ...themeConfig, atmosphere: id });
    else setThemeConfig({ ...themeConfig, wallpaper: id });
  };

  const applyCustomUrl = () => {
    if (!userStats.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    if (customUrl.trim()) {
      setThemeConfig({ ...themeConfig, wallpaper: 'custom', customWallpaperUrl: customUrl.trim() });
    }
  };

  const currentAtmosphere = ATMOSPHERES.find(a => a.id === themeConfig.atmosphere) || ATMOSPHERES[0];

  return (
    <>
      <div className="hidden">
        {AMBIENCE_TRACKS.map(track => (
          <audio key={track.id} id={`audio-${track.id}`} src={track.url} loop preload="auto" />
        ))}
      </div>

      <DashboardCard className="bg-slate-900 dark:bg-indigo-900/10 text-white relative overflow-hidden group border-none shadow-indigo-500/5 h-full flex flex-col justify-between p-0">
        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${currentAtmosphere.color.replace('bg-', 'from-')}/20 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />
        
        <div className="relative z-10 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setShowPresetPicker(!showPresetPicker)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <activePreset.icon className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">{activePreset.name}</span>
             </button>
             <div className="flex gap-1">
                <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-xl transition-all ${showThemePicker ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  <Palette className="w-4 h-4" />
                </button>
                <button onClick={() => setIsZenMode(true)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <Maximize2 className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl">
            {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Long Break'}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-4">
            <motion.div key={mode} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-display font-black tracking-tighter tabular-nums mb-2">
              {formatTime(timeLeft)}
            </motion.div>
            <div className="flex items-center gap-2">
               <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i < (sessionsCompleted % 4) ? 'bg-indigo-500' : 'bg-white/10'}`} />
                  ))}
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Cycle {Math.floor(sessionsCompleted / 4) + 1}</span>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {showThemePicker ? (
              <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 py-4 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                  <div className="flex gap-4 p-1 bg-white/5 rounded-xl sticky top-0 bg-slate-900/90 z-20">
                    <button onClick={() => setPickerTab('atm')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${pickerTab === 'atm' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>Atmosphere</button>
                    <button onClick={() => setPickerTab('wall')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${pickerTab === 'wall' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>Gallery</button>
                  </div>
                  
                  {pickerTab === 'atm' ? (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {ATMOSPHERES.map(atm => (
                        <button key={atm.id} onClick={() => handleCustomizationClick('atm', atm.id, atm.isPremium, atm.levelRequired)}
                          className={`w-8 h-8 rounded-full ${atm.color} border-2 transition-all relative flex items-center justify-center ${themeConfig.atmosphere === atm.id ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                          {atm.isPremium && !userStats.isPremium ? <Crown className="w-3 h-3" /> : userStats.level < atm.levelRequired ? <Lock className="w-3 h-3" /> : null}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Animated/Abstract Section */}
                      <div className="grid grid-cols-2 gap-2">
                        {WALLPAPERS.filter(w => w.type === 'animated').map(wall => (
                          <button key={wall.id} onClick={() => handleCustomizationClick('wall', wall.id, wall.isPremium, 1)}
                            className={`p-2 rounded-xl bg-white/5 border transition-all text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${themeConfig.wallpaper === wall.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-transparent text-slate-500'}`}
                          >
                            {wall.isPremium && <Crown className="w-2 h-2" />} {wall.name}
                          </button>
                        ))}
                      </div>

                      {/* Image Gallery */}
                      <div className="space-y-3">
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block ml-1">Immersive Vibes</span>
                         <div className="grid grid-cols-3 gap-2">
                           {WALLPAPERS.filter(w => w.type === 'image').map(wall => (
                             <button key={wall.id} onClick={() => handleCustomizationClick('wall', wall.id, wall.isPremium, 1)}
                               className={`aspect-square rounded-lg relative overflow-hidden transition-all group ${themeConfig.wallpaper === wall.id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 scale-95' : 'opacity-60 hover:opacity-100'}`}
                             >
                               <img src={wall.url} className="absolute inset-0 w-full h-full object-cover" />
                               {themeConfig.wallpaper === wall.id && <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center"><Check className="w-4 h-4" /></div>}
                               {!userStats.isPremium && wall.isPremium && <div className="absolute top-1 right-1"><Crown className="w-2 h-2 text-white" /></div>}
                             </button>
                           ))}
                         </div>
                      </div>

                      {/* Custom URL Input */}
                      <div className="space-y-2">
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block ml-1">Custom Link</span>
                         <div className="flex gap-2">
                            <input type="text" placeholder="Image URL..." value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
                              className="flex-1 bg-white/5 border-none rounded-lg p-2 text-[8px] font-bold focus:ring-1 ring-indigo-500 transition-all text-white"
                            />
                            <button onClick={applyCustomUrl} className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                               <Link className="w-3 h-3" />
                            </button>
                         </div>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setShowThemePicker(false)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Done</button>
              </motion.div>
            ) : showPresetPicker ? (
              <motion.div key="presets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 py-4">
                 {PRESETS.map(p => (
                   <button key={p.id} onClick={() => { setActivePreset(p); setIsActive(false); setMode('focus'); setTimeLeft(p.focus * 60); setShowPresetPicker(false); }}
                     className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${activePreset.id === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                   >
                     <div className="flex items-center gap-3">
                        <p.icon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{p.name}</span>
                     </div>
                     <span className="text-[10px] font-bold opacity-60">{p.focus}m / {p.short}m</span>
                   </button>
                 ))}
              </motion.div>
            ) : (
              <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mt-4">
                <button onClick={toggleTimer} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'}`}>
                  {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5"><RotateCcw className="w-5 h-5" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showThemePicker && !showPresetPicker && (
            <div className="mt-8 pt-6 border-t border-white/5">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Music className="w-3 h-3" /> Ambience</span>
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 h-1 bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer" />
               </div>
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {AMBIENCE_TRACKS.map(track => (
                    <button key={track.id} onClick={() => {
                      AMBIENCE_TRACKS.forEach(t => { const el = document.getElementById(`audio-${t.id}`) as HTMLAudioElement; if (el) { el.pause(); el.currentTime = 0; } });
                      if (activeAmbience === track.id) setActiveAmbience(null);
                      else { setActiveAmbience(track.id); const target = document.getElementById(`audio-${track.id}`) as HTMLAudioElement; if (target) { target.volume = volume; target.play().catch(() => {}); } }
                    }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[8px] font-bold transition-all whitespace-nowrap ${activeAmbience === track.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <track.icon className="w-3 h-3" /> {track.name}
                    </button>
                  ))}
               </div>
            </div>
          )}
        </div>
      </DashboardCard>

      <AnimatePresence>
        {isZenMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-all duration-1000 ${mode === 'focus' ? 'bg-[#0a0c10]' : 'bg-[#0a0f10]'}`}
          >
            <button onClick={() => setIsZenMode(false)} className="absolute top-10 right-10 p-4 bg-white/5 text-slate-500 hover:text-white z-50"><X className="w-8 h-8" /></button>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full flex flex-col items-center">
              <div className="mb-8 flex flex-col items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${mode === 'focus' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {mode === 'focus' ? 'Deep Focus' : mode === 'shortBreak' ? 'Recharge' : 'Restoration'}
                </span>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[1em]">{isActive ? 'Active' : 'Paused'}</p>
              </div>
              <div className="text-[12vw] font-display font-thin tracking-tighter text-white tabular-nums leading-[1] select-none opacity-90 mb-12">{formatTime(timeLeft)}</div>
              <div className="flex justify-center items-center gap-12">
                <button onClick={resetTimer} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-white"><RotateCcw className="w-8 h-8" /></button>
                <button onClick={toggleTimer} className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-amber-500 text-white' : 'bg-white text-slate-950 scale-105'}`}>
                  {isActive ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current translate-x-1.5" />}
                </button>
                <button onClick={() => setShowPresetPicker(true)} className="p-6 bg-white/5 rounded-full text-slate-500"><Settings2 className="w-8 h-8" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </>
  );
};
