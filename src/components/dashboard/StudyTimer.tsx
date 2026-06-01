import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Zap, Maximize2, X,
  Palette, Crown, Timer, Rocket, Check, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardCard } from './DashboardCard';
import { storage } from '../../services/storage';
import { useStudy, useFocus } from '../../context/StudyContext';
import { ATMOSPHERES, WALLPAPERS } from '../../lib/gamification';
import { playAlertSound } from '../../lib/alertSounds';

// Extract unique categories from wallpapers
const IMAGE_CATEGORIES = [...new Set(WALLPAPERS.filter(w => w.type === 'image' && w.category).map(w => w.category!))];

type TimerMode = 'focus' | 'shortBreak' | 'longBreak' | 'taskETA';
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
  const { 
    themeConfig, setThemeConfig, completeFocusSession, logSession, 
    userStats, triggerConfetti, setShowPremiumModal,
    tasks, selectedTaskId, setSelectedTaskId
  } = useStudy();
  const { setFocusSession } = useFocus();
  
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
  const [wallpaperBrightness, setWallpaperBrightness] = useState<string>('All');
  const [wallpaperEnvironment, setWallpaperEnvironment] = useState<string>('All');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [timerBgColor, setTimerBgColor] = useState(() => localStorage.getItem('sf_timer_bg_color') || '');
  const [showTimerColorPicker, setShowTimerColorPicker] = useState(false);
  const [customImgError, setCustomImgError] = useState(false);
  const [tallyStyle, setTallyStyle] = useState('dots');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!userStats.isPremium) { setShowPremiumModal(true); return; }
    if (!file.type.startsWith('image/')) return;
    setCustomImgError(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setThemeConfig({ ...themeConfig, wallpaper: 'custom', customWallpaperUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const taskTime = selectedTask?.estimatedMinutes ?? 25;
  const totalTime = mode === 'focus' 
    ? activePreset.focus * 60 
    : mode === 'shortBreak' 
    ? activePreset.short * 60 
    : mode === 'longBreak'
    ? activePreset.long * 60
    : taskTime * 60;

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const sessionElapsed = useRef(0);
  const sessionStartTime = useRef<string | null>(null);
  const wakeLockRef = useRef<any>(null);
  const timerBaseRef = useRef<{ startTimeLeft: number; startTimestamp: number } | null>(null);
  const localSaveCounterRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const lastRenderRef = useRef(0);
  const isMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handler = () => { isMobileRef.current = window.innerWidth < 768; };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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

  // Master Timer Sync (drift-corrected via Date.now() base ref)
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    timerBaseRef.current = { startTimeLeft: timeLeft, startTimestamp: Date.now() };
    localSaveCounterRef.current = 0;

    const interval = window.setInterval(() => {
      if (!timerBaseRef.current) return;
      const { startTimeLeft, startTimestamp } = timerBaseRef.current;
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      const nextTime = Math.max(0, startTimeLeft - elapsed);
      setTimeLeft(nextTime);

      localSaveCounterRef.current++;
      if (nextTime <= 0 || localSaveCounterRef.current % 5 === 1) {
        storage.saveTimerState(nextTime);
      }

      if (modeRef.current === 'focus') {
        sessionElapsed.current += 1;
        if (sessionElapsed.current >= 60) {
          completeFocusSession(60);
          sessionElapsed.current = 0;
        }
      }
      if (onTickRef.current) onTickRef.current();
    }, 1000);

    return () => { clearInterval(interval); };
  }, [isActive]);

  // Sync focus session and handle completion (separate from timer interval to avoid re-creation)
  useEffect(() => {
    if (isMobileRef.current && isActive && timeLeft > 0) {
      if (Date.now() - lastRenderRef.current < 950) return;
      lastRenderRef.current = Date.now();
    }
    setFocusSession({ mode: isActive ? mode : 'idle', timeLeft, totalTime, isActive, sessionsCompleted });
    if (timeLeft <= 0 && isActive) {
      handleTimerComplete();
    }
  }, [timeLeft, isActive, mode, totalTime, sessionsCompleted, activePreset.id]);

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
    if (mode === 'focus' || mode === 'taskETA') logFocusSession(totalTime);
    triggerConfetti();
    const alertId = (() => { try { return JSON.parse(localStorage.getItem('study_flow_alert_sound') || '"sparkle"'); } catch { return 'sparkle'; } })();
    const alertVol = (() => { try { return JSON.parse(localStorage.getItem('study_flow_alert_volume') || '0.75'); } catch { return 0.75; } })();
    playAlertSound(alertId, alertVol);

    if (mode === 'focus' || mode === 'taskETA') {
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

    if (!nextState && (mode === 'focus' || mode === 'taskETA')) {
      if (sessionElapsed.current > 0) {
        completeFocusSession(sessionElapsed.current);
        sessionElapsed.current = 0;
      }
      const elapsed = totalTime - timeLeft;
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
    indigo: '#0a0c1a',
    rose: '#1a0f0f',
    emerald: '#0a1a0f',
    violet: '#0f0a1a',
    amber: '#1a140a',
    cyan: '#0a141a',
    pink: '#1a0a14',
    slate: '#0a0c10',
    neon: '#050010',
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

      {/* Brightness filter pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Light', 'Dark', 'Vibrant'].map(b => (
          <button key={b} onClick={() => setWallpaperBrightness(b)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${wallpaperBrightness === b ? 'bg-brand text-white' : 'bg-white/[0.04] text-white/40 hover:text-white/60'}`}>{b}</button>
        ))}
      </div>

      {/* Environment filter pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Nature', 'Urban', 'Abstract', 'Interior', 'Scenic'].map(e => (
          <button key={e} onClick={() => setWallpaperEnvironment(e)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${wallpaperEnvironment === e ? 'bg-brand text-white' : 'bg-white/[0.04] text-white/40 hover:text-white/60'}`}>{e}</button>
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

      {/* Animated wallpapers — simple name tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {WALLPAPERS.filter(w => !w.url).filter(w => {
          if (wallpaperType !== 'All' && w.type !== wallpaperType.toLowerCase()) return false;
          if (wallpaperCategory !== 'All' && w.category !== wallpaperCategory) return false;
          if (wallpaperBrightness !== 'All' && w.brightness !== wallpaperBrightness.toLowerCase()) return false;
          if (wallpaperEnvironment !== 'All' && w.environment !== wallpaperEnvironment.toLowerCase()) return false;
          return true;
        }).map(w => (
          <button key={w.id} onClick={() => { if(w.isPremium && !userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: w.id}); }}
            className={`px-2.5 py-1 rounded-lg text-[8px] font-bold tracking-wider transition-all ${
              themeConfig.wallpaper === w.id
                ? 'bg-brand text-white'
                : 'bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08]'
            }`}
          >
            {w.name}
            {!userStats.isPremium && w.isPremium && <Crown className="w-2.5 h-2.5 inline ml-1 -mt-0.5" />}
          </button>
        ))}
      </div>

      {/* Image wallpaper grid */}
      <div className="grid grid-cols-2 gap-2">
        {WALLPAPERS.filter(w => w.url).filter(w => {
          if (wallpaperType !== 'All' && w.type !== wallpaperType.toLowerCase()) return false;
          if (wallpaperCategory !== 'All' && w.category !== wallpaperCategory) return false;
          if (wallpaperBrightness !== 'All' && w.brightness !== wallpaperBrightness.toLowerCase()) return false;
          if (wallpaperEnvironment !== 'All' && w.environment !== wallpaperEnvironment.toLowerCase()) return false;
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

        {/* Custom wallpaper tile */}
        <button onClick={() => { if(!userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: 'custom'}); }}
          className={`aspect-[4/3] rounded-xl relative overflow-hidden transition-all group ${themeConfig.wallpaper === 'custom' ? 'ring-2 ring-brand' : 'hover:ring-1 ring-white/20'}`}>
          {themeConfig.customWallpaperUrl && !customImgError ? (
            <img src={themeConfig.customWallpaperUrl} alt="Custom" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={() => setCustomImgError(true)} />
          ) : themeConfig.customWallpaperUrl && customImgError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/[0.03] p-2">
              <span className="text-[6px] font-mono text-white/30 break-all text-center leading-tight">{themeConfig.customWallpaperUrl}</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/[0.03] border-2 border-dashed border-white/10">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Custom</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2">
            <span className="text-[9px] font-bold text-white leading-tight block truncate">Custom</span>
          </div>
          {themeConfig.wallpaper === 'custom' && <div className="absolute top-2 right-2 bg-brand rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
        </button>
      </div>

      {/* Custom background upload */}
      <div className="pt-1">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-white/[0.04] border-2 border-dashed border-white/10 rounded-xl p-3 text-[9px] font-semibold hover:bg-white/[0.08] hover:border-white/20 transition-all text-white/50 hover:text-white/70 uppercase tracking-wider">
          <Upload className="w-3 h-3" /> Upload Image
        </button>
      </div>
    </motion.div>
  );

  const renderThemePicker = () => (
    <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex gap-3 p-1 bg-white/[0.04] rounded-xl">
        <button onClick={() => setPickerTab('atm')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider transition-all ${pickerTab === 'atm' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Atmosphere</button>
        {!isMobile && <button onClick={() => setPickerTab('wall')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider transition-all ${pickerTab === 'wall' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Gallery</button>}
      </div>
      <div className="max-h-[45vh] overflow-y-auto no-scrollbar mt-3">
        {pickerTab === 'atm' ? renderAtmosphereTab() : !isMobile && renderGalleryTab()}
      </div>
      <button onClick={() => setShowThemePicker(false)} className="w-full mt-3 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl text-[9px] font-semibold uppercase tracking-wider text-white/60 transition-colors">Done</button>
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
                        <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-xl mb-4 overflow-x-auto no-scrollbar">
                          {(['focus', 'shortBreak', 'longBreak', 'taskETA'] as const).map(m => (
                            <button key={m} onClick={() => { 
                              setIsActive(false); 
                              setMode(m); 
                              const d = m === 'taskETA' ? (tasks.find(t => t.id === selectedTaskId)?.estimatedMinutes ?? 25) : m === 'focus' ? activePreset.focus : m === 'shortBreak' ? activePreset.short : activePreset.long; 
                              setTimeLeft(d * 60); 
                            }} 
                              className={`shrink-0 px-3 py-2 rounded-[10px] text-[9px] font-semibold uppercase tracking-wider transition-all ${mode === m ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}>
                              {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : m === 'longBreak' ? 'Long Break' : 'Task ETA'}
                            </button>
                          ))}
                        </div>

                        {/* Task Selector for Task ETA Mode */}
                        {mode === 'taskETA' && (
                          <div className="mb-4">
                            <select 
                              value={selectedTaskId || ''} 
                              onChange={(e) => {
                                const id = e.target.value;
                                setSelectedTaskId(id);
                                const task = tasks.find(t => t.id === id);
                                if (task) {
                                  setTimeLeft((task.estimatedMinutes || 25) * 60);
                                  setIsActive(false);
                                }
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[10px] font-bold text-white focus:outline-none appearance-none cursor-pointer"
                            >
                              <option value="" className="bg-slate-900">Select a task...</option>
                              {tasks.filter(t => !t.completed).map(t => (
                                <option key={t.id} value={t.id} className="bg-slate-900">
                                  {t.title} ({t.estimatedMinutes || 25}m)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <motion.div key={mode} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-display font-light tracking-tighter tabular-nums text-white/90 select-none"
                            style={{ fontSize: 'calc(3rem * var(--scale-factor, 1))' }}>
                            {formatTime(timeLeft)}
                          </motion.div>
                          {/* Progress bar */}
                          <div className="w-full max-w-[200px] mx-auto h-[3px] bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-gradient-to-r from-brand/60 to-brand-light rounded-full transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }} />
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

              <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-xl overflow-x-auto no-scrollbar">
                {(['focus', 'shortBreak', 'longBreak', 'taskETA'] as const).map(m => (
                  <button key={m} onClick={() => { 
                    setIsActive(false); 
                    setMode(m); 
                    const d = m === 'taskETA' ? (tasks.find(t => t.id === selectedTaskId)?.estimatedMinutes ?? 25) : m === 'focus' ? activePreset.focus : m === 'shortBreak' ? activePreset.short : activePreset.long; 
                    setTimeLeft(d * 60); 
                  }} 
                    className={`shrink-0 px-4 py-2 rounded-[10px] text-[9px] font-semibold uppercase tracking-wider transition-all ${mode === m ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}>
                    {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : m === 'longBreak' ? 'Long Break' : 'Task ETA'}
                  </button>
                ))}
              </div>

              {/* Task Selector for Task ETA Mode */}
              {mode === 'taskETA' && (
                <div className="mt-4 px-1">
                  <select 
                    value={selectedTaskId || ''} 
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedTaskId(id);
                      const task = tasks.find(t => t.id === id);
                      if (task) {
                        setTimeLeft((task.estimatedMinutes || 25) * 60);
                        setIsActive(false);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[10px] font-bold text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">Select a task...</option>
                    {tasks.filter(t => !t.completed).map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-900">
                        {t.title} ({t.estimatedMinutes || 25}m)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="py-6 text-center">
                <motion.div key={mode} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl md:text-7xl font-display font-light tracking-tighter tabular-nums text-white/90 select-none"
                  style={{ fontSize: 'calc(3.75rem * var(--scale-factor, 1))' }}>
                  {formatTime(timeLeft)}
                </motion.div>
                {/* Progress bar */}
                <div className="w-full max-w-[200px] mx-auto h-[3px] bg-white/5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-brand/60 to-brand-light rounded-full transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }} />
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-colors duration-700"
            style={{ backgroundColor: timerBgColor || zenBg[themeConfig.atmosphere] || '#0a0c10' }}
          >
            <button onClick={() => setIsZenMode(false)} className="absolute top-10 right-10 p-3 bg-white/5 text-white/40 hover:text-white rounded-xl z-50"><X className="w-6 h-6" /></button>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full flex flex-col items-center">
              <div className="mb-6 flex flex-col items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                  mode === 'focus' || mode === 'taskETA' ? 'bg-brand/10 border-brand/20 text-brand-light' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {mode === 'focus' ? 'Deep Focus' : mode === 'taskETA' ? 'Task Session' : mode === 'shortBreak' ? 'Recharge' : 'Restoration'}
                </span>
                {mode === 'taskETA' && selectedTask && (
                  <span className="text-white/60 text-sm font-medium tracking-wide italic">"{selectedTask.title}"</span>
                )}
              </div>
              <div className="text-[15vw] md:text-[12vw] font-display font-thin tracking-tighter text-white tabular-nums leading-[1] select-none opacity-90 mb-10">{formatTime(timeLeft)}</div>
              <div className="flex justify-center items-center gap-8">
                <button onClick={() => { setIsActive(false); setTimeLeft(activePreset.focus * 60); }} className="p-5 bg-white/5 rounded-full text-white/40 hover:text-white"><RotateCcw className="w-6 h-6" /></button>
                <button onClick={toggleTimer} className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-amber-500 text-white' : 'bg-white text-slate-950 scale-105'}`}>
                  {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
                </button>
                <button onClick={() => setShowTimerColorPicker(v => !v)} className="p-5 bg-white/5 rounded-full text-white/40 relative"><Palette className="w-6 h-6" /></button>
                {showTimerColorPicker && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 p-4 rounded-2xl bg-[#141622] border border-slate-800/50 shadow-2xl z-50" style={{ width: '220px' }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-3 text-center">Background Color</p>
                    <div className="grid grid-cols-5 gap-2">
                      {([

                        ['indigo', '#0a0c1a'],
                        ['slate', '#0a0c10'],
                        ['emerald', '#0a1a0f'],
                        ['rose', '#1a0f0f'],
                        ['amber', '#1a140a'],
                        ['violet', '#0f0a1a'],
                        ['cyan', '#0a141a'],
                        ['pink', '#1a0a14'],
                        ['neon', '#050010'],

                      ] as const).map(([name, hex]) => (
                        <button key={name}
                          onClick={() => {
                            setTimerBgColor(hex);
                            localStorage.setItem('sf_timer_bg_color', hex);
                            setShowTimerColorPicker(false);
                          }}
                          className="w-8 h-8 rounded-xl border border-white/10 hover:scale-110 transition-transform"
                          style={{ backgroundColor: hex }}
                          title={name}
                        />
                      ))}
                      <button
                        onClick={() => {
                          setTimerBgColor('');
                          localStorage.removeItem('sf_timer_bg_color');
                          setShowTimerColorPicker(false);
                        }}
                        className="col-span-5 mt-1 py-1.5 rounded-xl bg-white/5 text-[8px] font-bold text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors"
                      >
                        Reset to default
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
