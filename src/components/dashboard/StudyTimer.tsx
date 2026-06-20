import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Zap, Maximize2, X,
  Palette, Crown, Timer, Rocket, Check, Upload, Settings2,
  Clock, Flag, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardCard } from './DashboardCard';
import { storage } from '../../services/storage';
import { useStudy, useFocus } from '../../context/StudyContext';
import { useNavigationContext, type ThemeTab, type TimerModeId } from '../../hooks/useNavigationContext';
import { ROUTES } from '../../lib/routes';
import { ATMOSPHERES, WALLPAPERS, THEME_PRESETS } from '../../lib/gamification';
import { MOOD_GRADIENTS, MOOD_ANIMATED } from '../../lib/wallpapers';
import { playAlertSound } from '../../lib/alertSounds';

const formatTimeBase = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

type TimerMode = 'focus' | 'shortBreak' | 'longBreak' | 'taskETA' | 'stopwatch';

const formatElapsed = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
interface Preset { id: string; name: string; icon: any; focus: number; short: number; long: number; }

const BUILT_IN_PRESETS: Preset[] = [
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

const TimerProgress = React.memo(({ progress, completed, tallyEmojis, sessionsCompleted, floating }: {
  progress: number; completed: number; tallyEmojis: string[]; sessionsCompleted: number; floating?: boolean;
}) => (
  <>
    <div className={`mx-auto h-[2px] bg-white/5 rounded-full overflow-hidden mt-4 ${floating ? 'max-w-[140px]' : 'max-w-[160px]'}`}>
      <div className="h-full bg-gradient-to-r from-brand/50 to-brand-light/70 rounded-full transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }} />
    </div>
    <div className="flex items-center justify-center gap-2 mt-3">
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
    </div>
  </>
));

interface StudyTimerProps { onTick?: () => void; compact?: boolean; variant?: 'card' | 'floating'; }

export const StudyTimer = ({ onTick, compact, variant = 'card' }: StudyTimerProps) => {
  const navigate = useNavigate();
  const { 
    themeConfig, setThemeConfig, completeFocusSession, logSession, 
    userStats, gameLevel, triggerConfetti, setShowPremiumModal,
    tasks, selectedTaskId, setSelectedTaskId
  } = useStudy();
  const { setFocusSession } = useFocus();
  const { mode: navMode, activePanel, timerId: navTimerId, themeTab: navThemeTab } = useNavigationContext();
  
  const [activePreset, setActivePreset] = useState<Preset>(BUILT_IN_PRESETS[0]);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(BUILT_IN_PRESETS[0].focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [direction, setDirection] = useState<'countdown' | 'countup'>('countdown');
  const [isZenMode, setIsZenMode] = useState(false);
    
  // Theme Picker State
  const [pickerTab, setPickerTab] = useState<ThemeTab>('atm');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customImgError, setCustomImgError] = useState(false);
  const [tallyStyle, setTallyStyle] = useState('dots');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);

  // Custom timer durations (premium)
  const [customDurations, setCustomDurations] = useState(() => storage.loadCustomDurations());
  // Adaptive flow log
  const [avgFlowDuration, setAvgFlowDuration] = useState(0);
  const [showFlowExtend, setShowFlowExtend] = useState(false);
  const flowExtendResolve = useRef<((extend: boolean) => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Compute all presets including custom (premium-gated)
  const getAllPresets = useCallback((): Preset[] => {
    if (!userStats.isPremium) return BUILT_IN_PRESETS;
    return [
      ...BUILT_IN_PRESETS,
      {
        id: 'custom',
        name: 'Custom',
        icon: Settings2,
        focus: customDurations.focus,
        short: customDurations.short,
        long: customDurations.long,
      },
    ];
  }, [userStats.isPremium, customDurations]);

  // Load flow log and compute average duration for adaptive flow starting point
  useEffect(() => {
    const log = storage.loadFlowLog();
    if (log.length > 0) {
      const recent = log.slice(-5);
      const avg = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
      setAvgFlowDuration(Math.min(120, Math.max(15, avg)));
    }
  }, []);

  // Adaptive flow: use tracked average duration instead of fixed preset value
  const effectiveFocusMinutes = useMemo(() => {
    if (activePreset.id === 'flow' && avgFlowDuration > 0) return avgFlowDuration;
    return activePreset.focus;
  }, [activePreset.id, activePreset.focus, avgFlowDuration]);

  // Track current session total (for progress bar accuracy during flow extends)
  const [sessionTotalSeconds, setSessionTotalSeconds] = useState(() => effectiveFocusMinutes * 60);

  // Picker visibility derived from URL
  const showThemePicker = activePanel === 'themes';
  const showPresetPicker = navTimerId === null && !showThemePicker && !isActive && activePanel === null && (window.location.pathname.includes('/presets') || false); // Helper for mobile later
  
  // Custom picker visibility logic for StudyTimer (it used to be internal state)
  // We'll use local state for "internal" preset picker triggers if no specific route is hit
  const [internalPresetPicker, setInternalPresetPicker] = useState(false);
  const isPresetPickerVisible = internalPresetPicker;

  const handleSetPickerTab = (tab: ThemeTab) => {
    navigate(ROUTES.FOCUS_THEMES_TAB(tab));
  };
  const activePickerTab = navThemeTab || pickerTab;

  const setShowThemePicker = (val: boolean) => {
    if (val) navigate(ROUTES.FOCUS_THEMES);
    else navigate(navMode === 'focus' ? ROUTES.FOCUS : ROUTES.HOME);
  };

  const setShowPresetPicker = (val: boolean) => {
    setInternalPresetPicker(val);
  };

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
    ? sessionTotalSeconds
    : mode === 'shortBreak' 
    ? activePreset.short * 60 
    : mode === 'longBreak'
    ? activePreset.long * 60
    : mode === 'taskETA'
    ? taskTime * 60
    : 1;

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const sessionElapsed = useRef(0);
  const totalFocusRef = useRef(0);
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
  const cumulatedRef = useRef(0);
  const runStartRef = useRef(0);
  const autoStartRef = useRef(themeConfig.autoStartNext);
  autoStartRef.current = themeConfig.autoStartNext;
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
  const isCountingUp = direction === 'countup' || mode === 'stopwatch';
  const completeFocusSessionRef = useRef(completeFocusSession);
  completeFocusSessionRef.current = completeFocusSession;
  const triggerConfettiRef = useRef(triggerConfetti);
  triggerConfettiRef.current = triggerConfetti;
  const logFocusSessionRef = useRef(logFocusSession);
  logFocusSessionRef.current = logFocusSession;
  const isCountingUpRef = useRef(isCountingUp);
  isCountingUpRef.current = isCountingUp;
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

  // Initialize — restore full timer state for section-navigation survival
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sf_timer_state');
      if (raw) {
        const state = JSON.parse(raw);
        if (state.mode === 'shortBreak' || state.mode === 'longBreak' || state.mode === 'taskETA' || state.mode === 'stopwatch' || state.mode === 'focus') {
          setMode(state.mode);
        }
        if (state.direction === 'countdown' || state.direction === 'countup') setDirection(state.direction);
        if (typeof state.sessionsCompleted === 'number') setSessionsCompleted(state.sessionsCompleted);
        if (typeof state.elapsedTime === 'number') setElapsedTime(state.elapsedTime);
      }
    } catch {}
    // timeLeft always comes from the per-second save (updated every 5s during ticking)
    const saved = storage.getTimerState();
    if (saved !== null) setTimeLeft(saved);
  }, []);

  // Persist full timer state on infrequent changes (mode, direction, cycles)
  useEffect(() => {
    try {
      localStorage.setItem('sf_timer_state', JSON.stringify({
        mode, timeLeft, direction, sessionsCompleted, elapsedTime,
      }));
      // Sync the per-second timeLeft store so init picks up the right value
      storage.saveTimerState(timeLeft);
    } catch {}
  }, [mode, direction, sessionsCompleted, elapsedTime]);

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
    if (!isActive) return;
    if (!isCountingUp && timeLeft <= 0) return;

    if (isCountingUp) {
      runStartRef.current = Date.now();
      cumulatedRef.current = elapsedTime;
    } else {
      timerBaseRef.current = { startTimeLeft: timeLeft, startTimestamp: Date.now() };
    }
    localSaveCounterRef.current = 0;

    const interval = window.setInterval(() => {
      if (isCountingUp) {
        const elapsed = cumulatedRef.current + Math.floor((Date.now() - runStartRef.current) / 1000);
        setElapsedTime(elapsed);
        if (modeRef.current === 'focus') {
          sessionElapsed.current += 1;
          totalFocusRef.current += 1;
          if (sessionElapsed.current >= 60) {
            completeFocusSessionRef.current(60);
            sessionElapsed.current = 0;
          }
        }
      } else {
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
          totalFocusRef.current += 1;
          if (sessionElapsed.current >= 60) {
            completeFocusSessionRef.current(60);
            sessionElapsed.current = 0;
          }
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
    const countingUp = isCountingUpRef.current;
    setFocusSession({ mode: countingUp ? mode : isActive ? mode : 'idle', timeLeft: countingUp ? elapsedTime : timeLeft, totalTime, isActive, sessionsCompleted });
    if (!countingUp && timeLeft <= 0 && isActive) {
      handleTimerCompleteRef.current?.();
    }
  }, [timeLeft, isActive, mode, totalTime, sessionsCompleted, activePreset.id, elapsedTime]);

  const handleTimerCompleteRef = useRef<() => void>();
  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    releaseWakeLock();
    if (mode === 'focus' || mode === 'taskETA') { logFocusSessionRef.current(totalFocusRef.current); }
    const completedSeconds = totalFocusRef.current;
    totalFocusRef.current = 0;
    triggerConfettiRef.current();
    const alertId = (() => { try { return JSON.parse(localStorage.getItem('study_flow_alert_sound') || '"sparkle"'); } catch { return 'sparkle'; } })();
    const alertVol = (() => { try { return JSON.parse(localStorage.getItem('study_flow_alert_volume') || '0.75'); } catch { return 0.75; } })();
    playAlertSound(alertId, alertVol);

    // Adaptive Flow: show extend prompt instead of auto-switching to break
    if (mode === 'focus' && activePreset.id === 'flow' && completedSeconds > 0) {
      const completedMinutes = Math.round(completedSeconds / 60);
      storage.saveFlowLogEntry(completedMinutes);
      const log = storage.loadFlowLog();
      const recent = log.slice(-5);
      const avg = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
      setAvgFlowDuration(Math.min(120, Math.max(15, avg)));
      setShowFlowExtend(true);
      return;
    }

    setDirection('countdown');
    if (mode === 'focus' || mode === 'taskETA') {
      setSessionsCompleted(prev => {
        const newTotal = prev + 1;
        const d = newTotal % 4 === 0 ? activePreset.long : activePreset.short;
        setMode(newTotal % 4 === 0 ? 'longBreak' : 'shortBreak');
        setTimeLeft(d * 60);
        return newTotal;
      });
    } else {
      setMode('focus');
      setTimeLeft(effectiveFocusMinutes * 60);
      setSessionTotalSeconds(effectiveFocusMinutes * 60);
    }
    if (autoStartRef.current) setIsActive(true);
  }, [mode, activePreset]);

  const handleFlowExtend = useCallback(() => {
    setShowFlowExtend(false);
    sessionElapsed.current = 0;
    setTimeLeft(15 * 60);
    setSessionTotalSeconds(15 * 60);
    setDirection('countdown');
    setIsActive(true);
  }, []);

  const handleFlowEnd = useCallback(() => {
    setShowFlowExtend(false);
    sessionElapsed.current = 0;
    setDirection('countdown');
    setSessionsCompleted(prev => {
      const newTotal = prev + 1;
      const d = newTotal % 4 === 0 ? activePreset.long : activePreset.short;
      setMode(newTotal % 4 === 0 ? 'longBreak' : 'shortBreak');
      setTimeLeft(d * 60);
      return newTotal;
    });
    if (autoStartRef.current) setIsActive(true);
  }, [activePreset]);

  handleTimerCompleteRef.current = handleTimerComplete;

  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    
    if (nextState) {
      requestWakeLock();
      if (isCountingUp) {
        runStartRef.current = Date.now();
        cumulatedRef.current = elapsedTime;
      } else {
        timerBaseRef.current = { startTimeLeft: timeLeft, startTimestamp: Date.now() };
      }
    } else {
      releaseWakeLock();
      if (isCountingUp) {
        cumulatedRef.current += Math.floor((Date.now() - runStartRef.current) / 1000);
        runStartRef.current = 0;
      }
    }

    if (!nextState && !isCountingUp && (mode === 'focus' || mode === 'taskETA')) {
      if (sessionElapsed.current > 0) {
        completeFocusSessionRef.current(sessionElapsed.current);
        sessionElapsed.current = 0;
      }
    }
  };

  const handleCustomizationClick = (type: 'atm' | 'wall', id: any, isPremium: boolean, levelReq: number) => {
    if (isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; }
    if (gameLevel < levelReq) return;
    if (type === 'atm') setThemeConfig({ ...themeConfig, atmosphere: id });
    else setThemeConfig({ ...themeConfig, wallpaper: id });
  };

  const resetCountUp = () => {
    if (mode === 'focus' && sessionElapsed.current > 0) {
      completeFocusSessionRef.current(sessionElapsed.current);
      sessionElapsed.current = 0;
    }
    if (mode === 'focus' && totalFocusRef.current > 0) {
      logFocusSessionRef.current(totalFocusRef.current);
      totalFocusRef.current = 0;
    }
    if (sessionStartTime.current !== null) {
      sessionStartTime.current = null;
    }
    setIsActive(false);
    cumulatedRef.current = 0;
    runStartRef.current = 0;
    setElapsedTime(0);
    setLaps([]);
    localStorage.removeItem('sf_timer_state');
  };

  const recordLap = () => {
    const current = cumulatedRef.current + (runStartRef.current > 0 ? Math.floor((Date.now() - runStartRef.current) / 1000) : 0);
    setElapsedTime(current);
    setLaps(prev => [current, ...prev]);
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

  const TimerModePills = ({ glassVariant }: { glassVariant?: boolean }) => (
    glassVariant ? (
      <div className="flex justify-center gap-1.5">
        {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
          <button key={m} onClick={() => {
            setIsActive(false); setDirection('countdown'); setMode(m);
            const d = m === 'focus' ? effectiveFocusMinutes : m === 'shortBreak' ? activePreset.short : activePreset.long; setTimeLeft(d * 60); setSessionTotalSeconds(d * 60);
          }}
            className={`px-4 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all border ${
              mode === m
                ? 'bg-white/15 border-white/20 text-white shadow-sm'
                : 'bg-black/15 backdrop-blur-sm border-white/10 text-white/50 hover:text-white/80 hover:bg-black/25'
            }`}>
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Long Break'}
          </button>
        ))}
      </div>
    ) : (
      <div className="flex gap-1.5 bg-black/10 backdrop-blur-sm border border-white/[0.06] p-1 rounded-xl overflow-x-auto no-scrollbar">
        {(['focus', 'shortBreak', 'longBreak', 'taskETA'] as const).map(m => (
          <button key={m} onClick={() => {
            setIsActive(false); setDirection('countdown'); setMode(m);
            const d = m === 'taskETA' ? (tasks.find(t => t.id === selectedTaskId)?.estimatedMinutes ?? 25) : m === 'focus' ? effectiveFocusMinutes : m === 'shortBreak' ? activePreset.short : activePreset.long;
            setTimeLeft(d * 60); setSessionTotalSeconds(d * 60);
          }}
            className={`shrink-0 px-4 py-2 rounded-[10px] text-[9px] font-semibold uppercase tracking-wider transition-all border ${
              mode === m
                ? 'bg-white/15 border-white/10 text-white shadow-sm'
                : 'bg-black/15 backdrop-blur-sm border-white/[0.06] text-white/50 hover:text-white/80 hover:bg-black/25'
            }`}>
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : m === 'longBreak' ? 'Long Break' : 'Task ETA'}
          </button>
        ))}
      </div>
    )
  );

  const TimerDisplay = ({ size = 'md', floating }: { size?: 'md' | 'lg'; floating?: boolean }) => {
    const displayValue = isCountingUp ? formatElapsed(elapsedTime) : formatTimeBase(timeLeft);
    const showDirToggle = mode !== 'stopwatch' && mode !== 'taskETA';
    const fs = floating ? 'clamp(5rem, 18vw, 12rem)' : size === 'lg' ? 'clamp(5rem, 18vw, 12rem)' : 'calc(4.5rem * var(--scale-factor, 1))';
    const ts = floating ? '0 4px 40px rgba(0,0,0,0.3)' : 'none';
    const toggleSize = floating ? 'w-9 h-9' : 'w-7 h-7';

    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="timer-display text-white/90 select-none" style={{ fontSize: fs, textShadow: ts }}>
            {displayValue}
          </div>
          {showDirToggle && (
            <button onClick={(e) => { e.stopPropagation(); setDirection(d => d === 'countdown' ? 'countup' : 'countdown'); }}
              title={direction === 'countdown' ? 'Switch to count-up' : 'Switch to countdown'}
              className={`${toggleSize} rounded-full bg-black/25 backdrop-blur-sm border border-white/15 text-white/50 hover:text-white hover:bg-black/40 transition-all shrink-0 flex items-center justify-center`}
              style={{ fontSize: floating ? 'calc(1rem * var(--scale-factor, 1))' : '0.75rem' }}>
              <ArrowUpDown className={floating ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </button>
          )}
        </div>
        {!isCountingUp && <TimerProgress progress={progress} completed={completed} tallyEmojis={tallyEmojis} sessionsCompleted={sessionsCompleted} floating={floating} />}
      </div>
    );
  };

  const TimerButtons = ({ glassVariant }: { glassVariant?: boolean }) => {
    return (
    <div className={glassVariant ? 'flex justify-center' : ''}>
      <div className="flex gap-2.5">
        {mode === 'stopwatch' && (
          <button onClick={recordLap} disabled={!isActive}
            className={`${glassVariant ? 'px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10' : 'px-4 py-3 bg-white/[0.06] hover:bg-white/[0.10] rounded-2xl'} transition-colors ${!isActive ? 'opacity-30 cursor-not-allowed' : ''}`}
            aria-label="Record lap">
            <Flag className={`w-4 h-4 ${glassVariant ? 'text-white/60' : 'text-white/50'}`} />
          </button>
        )}
        <button onClick={toggleTimer} className={`flex items-center justify-center gap-2.5 font-semibold text-xs uppercase tracking-wider transition-all ${
          glassVariant
            ? isActive
              ? 'px-6 py-3 rounded-full bg-amber-500/80 text-white shadow-lg backdrop-blur-md'
              : 'px-6 py-3 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-md border border-white/10'
            : `flex-1 py-3 rounded-2xl ${isActive ? 'bg-amber-500/90 text-white shadow-lg shadow-amber-500/20' : 'bg-white/90 text-slate-900 hover:bg-white/70 shadow-lg'}`
        }`}>
          {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { if (isCountingUp) resetCountUp(); else { setIsActive(false); const d = mode === 'focus' ? effectiveFocusMinutes : mode === 'shortBreak' ? activePreset.short : mode === 'longBreak' ? activePreset.long : taskTime; setTimeLeft(d * 60); setSessionTotalSeconds(d * 60); localStorage.removeItem('sf_timer_state'); } }} aria-label={isCountingUp ? 'Stop and reset' : 'Reset timer'}
          className={`transition-colors ${
            glassVariant
              ? 'px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10'
              : 'px-4 py-3 bg-white/[0.06] hover:bg-white/[0.10] rounded-2xl'
          }`}>
          <RotateCcw className={`w-4 h-4 ${glassVariant ? 'text-white/60' : 'text-white/50'}`} />
        </button>
        {glassVariant && (
          <>
            <button onClick={() => { setShowPresetPicker(!isPresetPickerVisible); setShowThemePicker(false); }} aria-label="Timer presets"
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors">
              <Timer className="w-4 h-4 text-white/80" />
            </button>
            <button onClick={() => setShowThemePicker(!showThemePicker)} aria-label="Theme and atmosphere"
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors">
              <Palette className="w-4 h-4 text-white/80" />
            </button>
          </>
        )}
      </div>
    </div>
  );};

  const renderTimerControls = () => <TimerButtons />;

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

  const renderPresetsTab = () => (
    <motion.div key="presets" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="pt-1 space-y-2">
      {THEME_PRESETS.map(preset => {
        const isActive = themeConfig.atmosphere === preset.atmosphere && themeConfig.wallpaper === preset.wallpaper;
        return (
          <button key={preset.id} onClick={() => setThemeConfig({ ...themeConfig, atmosphere: preset.atmosphere, wallpaper: preset.wallpaper, brightness: preset.brightness, saturation: preset.saturation })}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${isActive ? 'bg-brand/20 text-white ring-1 ring-brand/30' : 'bg-black/15 backdrop-blur-sm border border-white/10 text-white/50 hover:bg-black/25 hover:text-white/80'}`}>
            <span className="text-lg">{preset.icon}</span>
            <div className="flex-1 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider">{preset.name}</div>
              <div className="text-[8px] text-white/40 mt-0.5">{preset.description}</div>
            </div>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand" />}
          </button>
        );
      })}
    </motion.div>
  );

  const renderWallpaperTab = () => (
    <motion.div key="wallpaper" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="pt-1 space-y-4">
      <div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2">Mood Gradients</div>
        <div className="grid grid-cols-5 gap-2">
          {WALLPAPERS.filter(w => w.category === 'Moods').map(w => {
            const selected = themeConfig.wallpaper === w.id;
            return (
              <button key={w.id} onClick={() => { if(w.isPremium && !userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: w.id}); }}
                className={`relative aspect-square rounded-xl transition-all active:scale-90 ${selected ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0f0f1f]' : 'ring-1 ring-white/[0.06] hover:ring-white/25'}`}
                style={{ background: MOOD_GRADIENTS[w.id] }} title={w.name}>
                {selected && <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl"><Check className="w-4 h-4 text-white drop-shadow-md" /></div>}
                {!userStats.isPremium && w.isPremium && <Crown className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-amber-400 drop-shadow-md" />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2">Animated</div>
        <div className="flex gap-2 flex-wrap">
          {WALLPAPERS.filter(w => w.type === 'animated' && w.category === 'Abstract').map(w => {
            const selected = themeConfig.wallpaper === w.id;
            return (
              <button key={w.id} onClick={() => { if(w.isPremium && !userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: w.id}); }}
                className={`px-3 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all ${selected ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-black/15 border border-white/10 text-white/50 hover:bg-black/25 hover:text-white/80'}`}>
                {w.name}
              </button>
            );
          })}
        </div>
      </div>
      {(() => {
        const photoCats = [...new Set(WALLPAPERS.filter(w => w.type === 'image' && w.category && !['Abstract', 'Moods', 'Special'].includes(w.category!)).map(w => w.category!))];
        return photoCats.map(cat => {
          const catWalls = WALLPAPERS.filter(w => w.category === cat && w.type === 'image');
          return (
            <div key={cat}>
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2">{cat}</div>
              <div className="grid grid-cols-3 gap-2">
                {catWalls.map(w => (
                  <button key={w.id} onClick={() => { if(w.isPremium && !userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: w.id}); }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden transition-all active:scale-90 ${themeConfig.wallpaper === w.id ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0f0f1f]' : 'ring-1 ring-white/[0.06] hover:ring-white/25'}`}
                    style={{ backgroundImage: `url(${w.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} title={w.name}>
                    {themeConfig.wallpaper === w.id && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Check className="w-4 h-4 text-white drop-shadow-md" /></div>}
                    {!userStats.isPremium && w.isPremium && <Crown className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-amber-400 drop-shadow-md" />}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                      <span className="text-[7px] font-bold text-white/90 block truncate">{w.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        });
      })()}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2">Custom</div>
        <button onClick={() => { if(!userStats.isPremium) setShowPremiumModal(true); else setThemeConfig({...themeConfig, wallpaper: 'custom'}); }}
          className={`w-full aspect-[4/1] rounded-xl relative overflow-hidden transition-all ${themeConfig.wallpaper === 'custom' ? 'ring-2 ring-brand' : 'ring-1 ring-white/[0.06] hover:ring-white/25'}`}>
          {themeConfig.customWallpaperUrl && !customImgError ? (
            <img src={themeConfig.customWallpaperUrl} alt="Custom" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={() => setCustomImgError(true)} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/[0.03] border-2 border-dashed border-white/10">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Upload Image</span>
            </div>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="w-full mt-1.5 flex items-center justify-center gap-2 bg-black/15 backdrop-blur-sm border border-dashed border-white/20 hover:border-white/30 rounded-xl p-2.5 text-[8px] font-semibold hover:bg-black/25 transition-all text-white/50 hover:text-white/80 uppercase tracking-wider">
          <Upload className="w-3 h-3" /> Browse Files
        </button>
      </div>
    </motion.div>
  );

  const renderThemePicker = () => (
    <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex gap-1.5 p-1 bg-black/15 backdrop-blur-lg border border-white/10 rounded-xl">
        <button onClick={() => handleSetPickerTab('presets')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activePickerTab === 'presets' ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>Presets</button>
        <button onClick={() => handleSetPickerTab('wallpaper')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activePickerTab === 'wallpaper' ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>Wallpaper</button>
        <button onClick={() => handleSetPickerTab('atm')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activePickerTab === 'atm' ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>Atmosphere</button>
      </div>
      <div className="max-h-[45vh] overflow-y-auto no-scrollbar mt-3">
        {activePickerTab === 'presets' && renderPresetsTab()}
        {activePickerTab === 'wallpaper' && renderWallpaperTab()}
        {activePickerTab === 'atm' && renderAtmosphereTab()}
      </div>
      <button onClick={() => setShowThemePicker(false)} className="w-full mt-3 py-2.5 bg-black/25 backdrop-blur-sm border border-white/10 rounded-xl text-[9px] font-semibold uppercase tracking-wider text-white/70 hover:bg-black/35 transition-colors">Done</button>
    </motion.div>
  );

  const renderPresetPicker = () => (
    <motion.div key="presets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
      {getAllPresets().map(p => (
        <button key={p.id} onClick={() => { 
          setActivePreset(p);
          setDirection('countdown');
          setMode('focus');
          const presetFocusMins = p.id === 'flow' && avgFlowDuration > 0 ? avgFlowDuration : p.focus;
          setTimeLeft(presetFocusMins * 60);
          setSessionTotalSeconds(presetFocusMins * 60);
          setIsActive(false);
          navigate(ROUTES.FOCUS);
          setShowPresetPicker(false); 
        }}
          className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${activePreset.id === p.id && mode === 'focus' ? 'bg-brand/20 text-white' : 'bg-black/15 backdrop-blur-sm border border-white/10 text-white/50 hover:bg-black/25 hover:text-white/80'}`}>
          <div className="flex items-center gap-2.5"><p.icon className="w-3.5 h-3.5" /><span className="text-[9px] font-semibold uppercase tracking-wider">{p.name}</span></div>
          <span className="text-[9px] font-medium text-white/30">{p.focus}m / {p.short}m</span>
        </button>
      ))}
      <div className="h-px bg-white/5" />
      <button onClick={() => { 
        setDirection('countdown');
        setMode('stopwatch');
        setElapsedTime(0);
        setLaps([]);
        setIsActive(false);
        navigate(ROUTES.FOCUS_STOPWATCH);
        setShowPresetPicker(false); 
      }}
        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${mode === 'stopwatch' ? 'bg-brand/20 text-white' : 'bg-black/15 backdrop-blur-sm border border-white/10 text-white/50 hover:bg-black/25 hover:text-white/80'}`}>
        <div className="flex items-center gap-2.5"><Flag className="w-3.5 h-3.5" /><span className="text-[9px] font-semibold uppercase tracking-wider">Stopwatch</span></div>
      </button>
      {activePreset.id === 'custom' && userStats.isPremium && (
        <div className="pt-3 space-y-3 border-t border-white/5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/40">
              <span>Focus Duration</span>
              <span>{customDurations.focus} min</span>
            </div>
            <input type="range" min={5} max={180} step={5} value={customDurations.focus}
              onChange={e => {
                const val = Number(e.target.value);
                const next = { ...customDurations, focus: val };
                setCustomDurations(next);
                storage.saveCustomDurations(next);
                if (activePreset.id === 'custom') {
                  setActivePreset({ id: 'custom', name: 'Custom', icon: Settings2, focus: val, short: customDurations.short, long: customDurations.long });
                }
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/40">
              <span>Short Break</span>
              <span>{customDurations.short} min</span>
            </div>
            <input type="range" min={1} max={30} step={1} value={customDurations.short}
              onChange={e => {
                const val = Number(e.target.value);
                const next = { ...customDurations, short: val };
                setCustomDurations(next);
                storage.saveCustomDurations(next);
                if (activePreset.id === 'custom') {
                  setActivePreset({ id: 'custom', name: 'Custom', icon: Settings2, focus: customDurations.focus, short: val, long: customDurations.long });
                }
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-white/40">
              <span>Long Break</span>
              <span>{customDurations.long} min</span>
            </div>
            <input type="range" min={5} max={60} step={5} value={customDurations.long}
              onChange={e => {
                const val = Number(e.target.value);
                const next = { ...customDurations, long: val };
                setCustomDurations(next);
                storage.saveCustomDurations(next);
                if (activePreset.id === 'custom') {
                  setActivePreset({ id: 'custom', name: 'Custom', icon: Settings2, focus: customDurations.focus, short: customDurations.short, long: val });
                }
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-lg" />
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderTimerFace = () => (
    <div className="flex flex-col items-center">
      <TimerDisplay floating />
    </div>
  );

  const renderControls = () => <TimerButtons glassVariant />;

  /* ── Floating variant: no card, no container, rendered directly on environment ── */
  if (variant === 'floating') {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        {showFlowExtend ? (
          <motion.div key="flow-extend" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 py-8 px-6 rounded-2xl bg-black/30 backdrop-blur-lg border border-white/10">
            <Zap className="w-8 h-8 text-amber-400" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">Flow session complete!</p>
              <p className="text-[10px] text-white/50 mt-1">You were in the zone. Keep going?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleFlowEnd}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider transition-all">
                End session
              </button>
              <button onClick={handleFlowExtend}
                className="px-5 py-2.5 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg transition-all">
                +15 more min
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {renderTimerFace()}

            <TimerModePills />

            {mode === 'taskETA' && (
              <div className="w-full max-w-[200px] px-1">
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-[10px] font-bold text-white focus:outline-none appearance-none cursor-pointer text-center"
                >
                  <option value="" className="bg-[#0a0c10]">Select a task...</option>
                  {tasks.filter(t => !t.completed).map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0a0c10]">
                      {t.title} ({t.estimatedMinutes || 25}m)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'stopwatch' && laps.length > 0 && (
              <div className="w-full max-w-[200px] max-h-[160px] overflow-y-auto no-scrollbar space-y-1">
                {laps.map((lap, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/15 backdrop-blur-sm border border-white/5">
                    <span className="text-[8px] font-semibold text-white/40 uppercase">Lap {laps.length - i}</span>
                    <span className="text-[9px] font-mono text-white/70">{formatElapsed(lap)}</span>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {showThemePicker ? (
                <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xs">
                  {renderThemePicker()}
                </motion.div>
              ) : isPresetPickerVisible ? (
                <motion.div key="presets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xs">
                  {renderPresetPicker()}
                </motion.div>
              ) : (
                <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <button onClick={() => { setShowPresetPicker(true); setShowThemePicker(false); }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-sm border border-white/10 hover:bg-black/25 transition-colors text-[9px] font-semibold uppercase tracking-wider text-white/60">
                      {mode === 'stopwatch' ? <Flag className="w-3 h-3 text-brand-light" /> : <activePreset.icon className="w-3 h-3 text-brand-light" />}
                      {mode === 'stopwatch' ? 'Stopwatch' : activePreset.name}
                    </button>
                  {renderControls()}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {!isZenMode && (
      <DashboardCard className={`text-white relative border-none shadow-none bg-transparent ${compact ? 'p-0' : ''}`}>
        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${currentAtmosphere.color.replace('bg-', 'from-')}/10 to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none`} />
        
        <div className="relative z-10 space-y-3">
          {/* Compact: timer + theme */}
          {compact ? (
            <>
              <div className="flex items-center justify-between px-4 pt-4">
                <button onClick={() => { setShowPresetPicker(!showPresetPicker); setShowThemePicker(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-colors">
                  {mode === 'stopwatch' ? <Flag className="w-3 h-3 text-brand-light" /> : <activePreset.icon className="w-3 h-3 text-brand-light" />}
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70">{mode === 'stopwatch' ? 'Stopwatch' : activePreset.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-xl transition-all ${showThemePicker ? 'bg-brand text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-black/10 backdrop-blur-sm border border-white/10'}`}>
                    <Palette className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsZenMode(true)} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-xl transition-all">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <TimerModePills />

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

              <TimerDisplay />

              {/* Laps for stopwatch */}
              {mode === 'stopwatch' && laps.length > 0 && (
                <div className="px-1 max-h-[120px] overflow-y-auto no-scrollbar space-y-1">
                  {laps.map((lap, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/15 backdrop-blur-sm border border-white/5">
                      <span className="text-[8px] font-semibold text-white/40 uppercase">Lap {laps.length - i}</span>
                      <span className="text-[9px] font-mono text-white/70">{formatElapsed(lap)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {showThemePicker ? renderThemePicker() : isPresetPickerVisible ? renderPresetPicker() : (
                  <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {renderTimerControls()}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Full mode */
            <>
              <div className="flex items-center justify-between">
                <button onClick={() => { setShowPresetPicker(!isPresetPickerVisible); setShowThemePicker(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-colors">
                  {mode === 'stopwatch' ? <Flag className="w-3 h-3 text-brand-light" /> : <activePreset.icon className="w-3 h-3 text-brand-light" />}
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70">{mode === 'stopwatch' ? 'Stopwatch' : activePreset.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-xl transition-all ${showThemePicker ? 'bg-brand text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-black/10 backdrop-blur-sm border border-white/10'}`}>
                    <Palette className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsZenMode(true)} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-xl transition-all">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <TimerModePills />

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

              <TimerDisplay />

              {/* Laps for stopwatch */}
              {mode === 'stopwatch' && laps.length > 0 && (
                <div className="px-1 max-h-[120px] overflow-y-auto no-scrollbar space-y-1">
                  {laps.map((lap, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/15 backdrop-blur-sm border border-white/5">
                      <span className="text-[8px] font-semibold text-white/40 uppercase">Lap {laps.length - i}</span>
                      <span className="text-[9px] font-mono text-white/70">{formatElapsed(lap)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {showThemePicker ? renderThemePicker() : isPresetPickerVisible ? renderPresetPicker() : (
                  <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {renderTimerControls()}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </DashboardCard>
      )}
      
      {/* ZEN MODE */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <button onClick={() => setIsZenMode(false)} className="absolute top-10 right-10 p-3 bg-black/25 backdrop-blur-sm border border-white/15 text-white/60 hover:text-white rounded-xl z-50"><X className="w-6 h-6" /></button>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-10 w-full flex flex-col items-center"
            >
              {/* Mode tabs — ghost style */}
              <div className="flex justify-center gap-6 mb-6">
                {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setIsActive(false);
                      setDirection('countdown');
                      setMode(m);
                      const d = m === 'focus' ? effectiveFocusMinutes : m === 'shortBreak' ? activePreset.short : activePreset.long;
                      setTimeLeft(d * 60);
                    }}
                    className={`text-[10px] font-semibold uppercase tracking-widest pb-1 transition-all border-b ${
                      mode === m
                        ? 'text-white/95 border-white/60'
                        : 'text-white/30 border-transparent hover:text-white/55'
                    }`}
                  >
                    {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Long Break'}
                  </button>
                ))}
              </div>

              {/* Timer digits — text-shadow sole legibility */}
              <div
                className="font-display font-bold tabular-nums text-white select-none leading-none mb-3"
                style={{
                  fontSize: 'clamp(80px, 18vw, 140px)',
                  letterSpacing: '-0.04em',
                  textShadow: '0 0 60px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)',
                  color: isCountingUp ? 'rgba(200,200,255,0.95)' : mode !== 'focus' ? 'rgba(160,240,200,0.95)' : '#ffffff',
                  transition: 'color 0.4s ease',
                }}
              >
                {isCountingUp ? formatElapsed(elapsedTime) : formatTimeBase(timeLeft)}
              </div>

              {/* Progress bar — hairline */}
              {!isCountingUp && (
                <div className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto mb-5">
                  <div
                    className="h-full bg-white/50 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}

              {/* Laps for stopwatch */}
              {mode === 'stopwatch' && laps.length > 0 && (
                <div className="w-full max-w-[200px] max-h-[120px] overflow-y-auto no-scrollbar space-y-1 mb-4">
                  {laps.map((lap, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5">
                      <span className="text-[8px] font-semibold text-white/40 uppercase">Lap {laps.length - i}</span>
                      <span className="text-[9px] font-mono text-white/70">{formatElapsed(lap)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tallies */}
              {!isCountingUp && (
                <div className="flex justify-center mb-6">
                  {renderTallies()}
                </div>
              )}

              {/* Controls — ghost buttons */}
              {isPresetPickerVisible ? (
                <div className="w-full max-w-[220px]">
                  {renderPresetPicker()}
                  <button onClick={() => setShowPresetPicker(false)} className="w-full mt-2 py-2 text-[9px] font-semibold uppercase tracking-wider text-white/50 hover:text-white/80 transition-colors">Close</button>
                </div>
              ) : (
              <div className="flex items-center justify-center gap-4">
                {mode === 'stopwatch' && (
                  <button
                    onClick={recordLap}
                    disabled={!isActive}
                    className={`w-12 h-12 rounded-full border border-white/15 bg-black/20 backdrop-blur-sm ${isActive ? 'text-white/70 hover:text-white/90 hover:border-white/30 hover:bg-black/30' : 'text-white/20 opacity-40 cursor-not-allowed'} transition-all flex items-center justify-center`}
                    aria-label="Record lap"
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => { if (isCountingUp) resetCountUp(); else { setIsActive(false); setTimeLeft(effectiveFocusMinutes * 60); setSessionTotalSeconds(effectiveFocusMinutes * 60); } }}
                    className="w-12 h-12 rounded-full border border-white/15 bg-black/20 backdrop-blur-sm text-white/50 hover:text-white/90 hover:border-white/30 hover:bg-black/30 transition-all flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={toggleTimer}
                  className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                      : 'border-white/25 bg-white/[0.07] text-white hover:bg-white/[0.14] hover:border-white/40'
                  }`}
                >
                  {isActive
                    ? <Pause className="w-8 h-8 fill-current" />
                    : <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  }
                </button>

                <button
                  onClick={() => setShowPresetPicker(true)}
                    className="w-12 h-12 rounded-full border border-white/15 bg-black/20 backdrop-blur-sm text-white/50 hover:text-white/90 hover:border-white/30 hover:bg-black/30 transition-all flex items-center justify-center"
                  >
                    <Settings2 className="w-5 h-5" />
                </button>
              </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
