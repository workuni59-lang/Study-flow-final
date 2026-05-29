import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Zap, Maximize2, X,
  Palette, Crown, Layout,
  Settings2, Timer, BedDouble, Rocket, Image as ImageIcon, Search, Check, Link,
  Info, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardCard } from './DashboardCard';
import { storage } from '../../services/storage';
import { useStudy } from '../../context/StudyContext';
import { ATMOSPHERES, WALLPAPERS, Wallpaper } from '../../lib/gamification';

// Extract unique categories from wallpapers
const IMAGE_CATEGORIES = [...new Set(WALLPAPERS.filter(w => w.type === 'image' && w.category).map(w => w.category!))];

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
interface Preset { id: string; name: string; icon: any; focus: number; short: number; long: number; }

const PRESETS: Preset[] = [
  { id: 'pomodoro', name: 'Classic Pomodoro', icon: Timer, focus: 25, short: 5, long: 15 },
  { id: 'deep', name: 'Deep Work', icon: Rocket, focus: 50, short: 10, long: 25 },
  { id: 'flow', name: 'Elite Flow', icon: Zap, focus: 90, short: 15, long: 30 },
];

const TALLY_SETS: Record<string, string[]> = {
  dots: ['○', '◔', '◐', '●'],
  hearts: ['♡', '🩷', '💗', '❤️'],
  stars: ['☆', '⭐', '🌟', '✨'],
  flames: ['🔥', '🔥', '🔥', '🔥'],
  snow: ['❄', '❄', '❄', '❄'],
};

interface StudyTimerProps { onTick?: () => void; compact?: boolean; }

export const StudyTimer = ({ onTick, compact }: StudyTimerProps) => {
  const { themeConfig, setThemeConfig, completeFocusSession, logSession, userStats, triggerConfetti, setFocusSession, setShowPremiumModal } = useStudy();
  
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
    
  // Theme Picker State
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'atm' | 'wall'>('atm');
  const [wallpaperCategory, setWallpaperCategory] = useState<string>('All');
  const [wallpaperType, setWallpaperType] = useState<string>('All');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customUrl, setCustomUrl] = useState(themeConfig.customWallpaperUrl || '');
  const [urlApplied, setUrlApplied] = useState(false);
  const [tallyStyle, setTallyStyle] = useState('dots');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!userStats.isPremium) { setShowPremiumModal(true); return; }
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomUrl(dataUrl);
      setThemeConfig({ ...themeConfig, wallpaper: 'custom', customWallpaperUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalTime = mode === 'focus' ? activePreset.focus * 60 : mode === 'shortBreak' ? activePreset.short * 60 : activePreset.long * 60;
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const sessionElapsed = useRef(0);
  const sessionStartTime = useRef<string | null>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {}
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Release wake lock on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive]);

  // Initialize
  useEffect(() => {
    const saved = storage.getTimerState();
    if (saved !== null) setTimeLeft(saved);
  }, []);

  // Track session start for analytics
  useEffect(() => {
    if (isActive && mode === 'focus' && !sessionStartTime.current) {
      sessionStartTime.current = new Date().toISOString();
    } else if (!isActive) {
      sessionStartTime.current = null;
    }
  }, [isActive, mode]);

  // Master Timer Sync
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
    }
    
    // Sync focus session state to context for clock integration
    setFocusSession({ mode: isActive ? mode : 'idle', timeLeft, totalTime, isActive, sessionsCompleted });
    
    if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessionsCompleted, activePreset.id]);

  const logFocusSession = (duration: number) => {
    if (!sessionStartTime.current || duration <= 0) return;
    logSession({
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      startTime: sessionStartTime.current,
      endTime: new Date().toISOString(),
      duration,
      mode: 'focus',
      xpEarned: Math.floor(duration / 60) * 10,
    });
    sessionStartTime.current = null;
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    releaseWakeLock();
    if (mode === 'focus') logFocusSession(activePreset.focus * 60);
    triggerConfetti();
    const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    alertAudio.volume = 0.3;
    alertAudio.play().catch(() => {});

    if (mode === 'focus') {
      const newTotal = sessionsCompleted + 1;
      setSessionsCompleted(newTotal);
      const d = newTotal % 4 === 0 ? activePreset.long : activePreset.short;
      setMode(newTotal % 4 === 0 ? 'longBreak' : 'shortBreak');
      setTimeLeft(d * 60);
    } else {
      setMode('focus');
      setTimeLeft(activePreset.focus * 60);
    }
  };

  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    
    if (nextState) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    if (!nextState && mode === 'focus') {
      if (sessionElapsed.current > 0) {
        completeFocusSession(sessionElapsed.current);
        sessionElapsed.current = 0;
      }
      const elapsed = (activePreset.focus * 60) - timeLeft;
      logFocusSession(elapsed);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCustomizationClick = (type: 'atm' | 'wall', id: any, isPremium: boolean, levelReq: number) => {
    if (isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; }
    if (userStats.level < levelReq) return;
    if (type === 'atm') setThemeConfig({ ...themeConfig, atmosphere: id });
    else setThemeConfig({ ...themeConfig, wallpaper: id });
  };

  const applyCustomUrl = () => {
    if (!userStats.isPremium) { setShowPremiumModal(true); return; }
    if (customUrl.trim()) {
      setThemeConfig({ ...themeConfig, wallpaper: 'custom', customWallpaperUrl: customUrl.trim() });
      setUrlApplied(true);
      setTimeout(() => setUrlApplied(false), 2000);
    }
  };

  const currentAtmosphere = ATMOSPHERES.find(a => a.id === themeConfig.atmosphere) || ATMOSPHERES[0];

  const tallyEmojis = TALLY_SETS[tallyStyle] || TALLY_SETS.dots;
  const completed = sessionsCompleted % 4;
  const renderTallies = () => (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(4)].map((_, i) => (
          <span key={i} className={`w-5 h-5 flex items-center justify-center text-[11px] transition-all ${i < completed ? 'opacity-100 scale-110' : 'opacity-20 scale-90'}`}>
            {tallyEmojis[i]}
          </span>
        ))}
      </div>
      <span className="text-[8px] font-medium uppercase tracking-wider text-white/30">Cycle {Math.floor(sessionsCompleted / 4) + 1}</span>
    </div>
  );

  const zenBg: Record<string, string> = {
    indigo: 'bg-[#0a0c1a]',
    rose: 'bg-[#1a0f0f]',
    emerald: 'bg-[#0a1a0f]',
    violet: 'bg-[#0f0a1a]',
    amber: 'bg-[#1a140a]',
    cyan: 'bg-[#0a141a]',
    pink: 'bg-[#1a0a14]',
    slate: 'bg-[#0a0c10]',
    neon: 'bg-[#050010]',
  };

  const renderTimerControls = () => (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <button onClick={toggleTimer} className={`flex-1 py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${isActive ? 'bg-amber-500/90 text-white shadow-xl shadow-amber-500/20' : 'bg-white text-slate-900 hover:bg-white/90 shadow-xl'}`}>
          {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setIsActive(false); setTimeLeft(activePreset.focus * 60); }} className="px-4 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-2xl transition-colors"><RotateCcw className="w-4 h-4 text-white/50" /></button>
      </div>
    </div>
  );

  const renderAtmosphereTab = () => (
    <motion.div key="atm" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="pt-1">
      <div className="flex gap-2 flex-wrap justify-center">
        {ATMOSPHERES.map(atm => (
          <button key={atm.id} onClick={() => { if(atm.isPremium && !userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, atmosphere: atm.id}); }}
            className={`w-7 h-7 rounded-full ${atm.color} border-2 transition-all relative flex items-center justify-center ${themeConfig.atmosphere === atm.id ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-80'}`}>
            {atm.isPremium && !userStats.isPremium ? <Crown className="w-2.5 h-2.5 text-white" /> : null}
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderGalleryTab = () => (
    <motion.div key="wall" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="space-y-3 pt-1">
      {/* Type filter pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Animated', 'Image'].map(t => (
          <button key={t} onClick={() => setWallpaperType(t)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${wallpaperType === t ? 'bg-brand text-white' : 'bg-white/[0.04] text-white/40 hover:text-white/60'}`}>{t}</button>
        ))}
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setWallpaperCategory('All')}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${wallpaperCategory === 'All' ? 'bg-brand text-white' : 'bg-white/[0.04] text-white/40 hover:text-white/60'}`}>All</button>
        {IMAGE_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setWallpaperCategory(cat)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${wallpaperCategory === cat ? 'bg-brand text-white' : 'bg-white/[0.04] text-white/40 hover:text-white/60'}`}>{cat}</button>
        ))}
      </div>

      {/* Wallpaper grid */}
      <div className="grid grid-cols-2 gap-2">
        {WALLPAPERS.filter(w => {
          if (wallpaperType !== 'All' && w.type !== wallpaperType.toLowerCase()) return false;
          if (wallpaperCategory !== 'All' && w.category !== wallpaperCategory) return false;
          return true;
        }).map(w => (
          <button key={w.id} onClick={() => { if(w.isPremium && !userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: w.id}); }}
            className={`aspect-[4/3] rounded-xl relative overflow-hidden transition-all group ${themeConfig.wallpaper === w.id ? 'ring-2 ring-brand' : 'hover:ring-1 ring-white/20'}`}>
            <img src={w.url} alt={w.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2">
              <span className="text-[9px] font-bold text-white leading-tight block truncate">{w.name}</span>
            </div>
            {themeConfig.wallpaper === w.id && <div className="absolute top-2 right-2 bg-brand rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
            {!userStats.isPremium && w.isPremium && <div className="absolute top-2 left-2"><Crown className="w-3 h-3 text-white" /></div>}
          </button>
        ))}
      </div>

      {/* Custom URL + Upload */}
      <div className="space-y-2 pt-1">
        <div className="flex gap-2">
          <input type="text" placeholder="Paste image URL..." value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/5 rounded-xl p-2.5 text-[8px] font-medium focus:ring-1 ring-brand transition-all text-white/70 placeholder-white/20" />
          <button onClick={applyCustomUrl} className={`p-2.5 rounded-xl transition-colors ${urlApplied ? 'bg-emerald-500' : 'bg-brand hover:bg-brand-dark'}`} title="Apply URL">
            {urlApplied ? <Check className="w-3 h-3 text-white" /> : <Link className="w-3 h-3 text-white" />}
          </button>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-white/[0.04] border border-white/5 rounded-xl p-2.5 text-[8px] font-medium hover:bg-white/[0.08] transition-all text-white/50 hover:text-white/70">
            <Upload className="w-3 h-3" /> Upload from device
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderThemePicker = () => (
    <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex gap-3 p-1 bg-white/[0.04] rounded-xl">
        <button onClick={() => setPickerTab('atm')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider transition-all ${pickerTab === 'atm' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Atmosphere</button>
        <button onClick={() => setPickerTab('wall')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider transition-all ${pickerTab === 'wall' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Gallery</button>
      </div>
      <div className="max-h-[45vh] overflow-y-auto no-scrollbar mt-3">
        <AnimatePresence mode="wait">
          {pickerTab === 'atm' ? renderAtmosphereTab() : renderGalleryTab()}
        </AnimatePresence>
      </div>
      <button onClick={() => { setShowThemePicker(false); setShowExpanded(false); }} className="w-full mt-3 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl text-[9px] font-semibold uppercase tracking-wider text-white/60 transition-colors">Done</button>
    </motion.div>
  );

  const renderPresetPicker = () => (
    <motion.div key="presets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
      {PRESETS.map(p => (
        <button key={p.id} onClick={() => { setActivePreset(p); setIsActive(false); setMode('focus'); setTimeLeft(p.focus * 60); setShowPresetPicker(false); }}
          className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${activePreset.id === p.id ? 'bg-brand/20 text-white' : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'}`}>
          <div className="flex items-center gap-2.5"><p.icon className="w-3.5 h-3.5" /><span className="text-[9px] font-semibold uppercase tracking-wider">{p.name}</span></div>
          <span className="text-[9px] font-medium text-white/30">{p.focus}m / {p.short}m</span>
        </button>
      ))}
    </motion.div>
  );

  return (
    <>
      <DashboardCard className={`bg-gradient-to-br from-slate-900 to-slate-950 dark:from-[#0c0e14] dark:to-[#080a10] text-white relative border-none shadow-2xl shadow-black/20 ${compact ? 'p-0' : ''}`}>
        <div className={`absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br ${currentAtmosphere.color.replace('bg-', 'from-')}/15 to-transparent rounded-full blur-[100px] opacity-40`} />
        
        <div className="relative z-10 space-y-3">
          {/* Compact: timer + theme */}
          {compact ? (
            <>
              <div className="flex items-center justify-between px-4 pt-4">
                <button onClick={() => { setShowPresetPicker(!showPresetPicker); setShowThemePicker(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-colors">
                  <activePreset.icon className="w-3 h-3 text-brand-light" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/60">{activePreset.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-xl transition-all ${showThemePicker ? 'bg-brand/20 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                    <Palette className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsZenMode(true)} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-xl transition-all">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="mt-3 space-y-2">
                  <AnimatePresence mode="wait">
                    {showThemePicker ? (
                      <motion.div key="compact-theme" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {renderThemePicker()}
                      </motion.div>
                    ) : showPresetPicker ? renderPresetPicker() : (
                      <motion.div key="compact-controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Mode tabs above timer */}
                        <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-xl mb-4">
                          {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
                            <button key={m} onClick={() => { setIsActive(false); setMode(m); const d = m === 'focus' ? activePreset.focus : m === 'shortBreak' ? activePreset.short : activePreset.long; setTimeLeft(d * 60); }} 
                              className={`flex-1 py-2 rounded-[10px] text-[9px] font-semibold uppercase tracking-wider transition-all ${mode === m ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}>
                              {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Long Break'}
                            </button>
                          ))}
                        </div>
                          <div className="text-center mb-4">
                          <motion.div key={mode} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-display font-light tracking-tighter tabular-nums text-white/90 select-none"
                            style={{ fontSize: 'calc(3rem * var(--scale-factor, 1))' }}>
                            {formatTime(timeLeft)}
                          </motion.div>
                          {/* Progress bar */}
                          <div className="w-full max-w-[200px] mx-auto h-[3px] bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-gradient-to-r from-brand/60 to-brand-light rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {renderTallies()}
                          </div>
                        </div>
                        {renderTimerControls()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          ) : (
            /* Full mode */
            <>
              <div className="flex items-center justify-between">
                <button onClick={() => setShowPresetPicker(!showPresetPicker)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-colors">
                  <activePreset.icon className="w-3 h-3 text-brand-light" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/60">{activePreset.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-xl transition-all ${showThemePicker ? 'bg-brand text-white shadow-lg' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                    <Palette className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsZenMode(true)} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-xl transition-all">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-xl">
                {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
                  <button key={m} onClick={() => { setIsActive(false); setMode(m); const d = m === 'focus' ? activePreset.focus : m === 'shortBreak' ? activePreset.short : activePreset.long; setTimeLeft(d * 60); }} 
                    className={`flex-1 py-2 rounded-[10px] text-[9px] font-semibold uppercase tracking-wider transition-all ${mode === m ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}>
                    {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Long Break'}
                  </button>
                ))}
              </div>

              <div className="py-6 text-center">
                <motion.div key={mode} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl md:text-7xl font-display font-light tracking-tighter tabular-nums text-white/90 select-none"
                  style={{ fontSize: 'calc(3.75rem * var(--scale-factor, 1))' }}>
                  {formatTime(timeLeft)}
                </motion.div>
                {/* Progress bar */}
                <div className="w-full max-w-[200px] mx-auto h-[3px] bg-white/5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-brand/60 to-brand-light rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {renderTallies()}
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {showThemePicker ? renderThemePicker() : showPresetPicker ? renderPresetPicker() : (
                  <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {renderTimerControls()}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </DashboardCard>
      
      {/* ZEN MODE */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-colors duration-700 ${zenBg[themeConfig.atmosphere] || 'bg-[#0a0c10]'}`}
          >
            <button onClick={() => setIsZenMode(false)} className="absolute top-10 right-10 p-3 bg-white/5 text-white/40 hover:text-white rounded-xl z-50"><X className="w-6 h-6" /></button>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full flex flex-col items-center">
              <div className="mb-6 flex flex-col items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${mode === 'focus' ? 'bg-brand/10 border-brand/20 text-brand-light' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {mode === 'focus' ? 'Deep Focus' : mode === 'shortBreak' ? 'Recharge' : 'Restoration'}
                </span>
              </div>
              <div className="text-[15vw] md:text-[12vw] font-display font-thin tracking-tighter text-white tabular-nums leading-[1] select-none opacity-90 mb-10">{formatTime(timeLeft)}</div>
              <div className="flex justify-center items-center gap-8">
                <button onClick={() => { setIsActive(false); setTimeLeft(activePreset.focus * 60); }} className="p-5 bg-white/5 rounded-full text-white/40 hover:text-white"><RotateCcw className="w-6 h-6" /></button>
                <button onClick={toggleTimer} className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-amber-500 text-white' : 'bg-white text-slate-950 scale-105'}`}>
                  {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
                </button>
                <button onClick={() => setShowPresetPicker(true)} className="p-5 bg-white/5 rounded-full text-white/40"><Settings2 className="w-6 h-6" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
