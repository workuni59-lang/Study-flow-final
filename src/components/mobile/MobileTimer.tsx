import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Zap, Rocket } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
interface Preset { id: string; name: string; focus: number; short: number; long: number; }

const PRESETS: Preset[] = [
  { id: 'pomodoro', name: 'Classic', focus: 25, short: 5, long: 15 },
  { id: 'deep', name: 'Deep', focus: 50, short: 10, long: 25 },
];

const MODE_ICONS: Record<TimerMode, typeof TimerIcon> = {
  focus: Rocket, shortBreak: TimerIcon, longBreak: Zap,
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const MobileTimer = () => {
  const { completeFocusSession, logSession, setFocusSession } = useStudy();
  const [presetIdx, setPresetIdx] = useState(0);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].focus * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = PRESETS[presetIdx];

  const switchMode = useCallback((m: TimerMode) => {
    setIsActive(false);
    setMode(m);
    const duration = m === 'focus' ? preset.focus : m === 'shortBreak' ? preset.short : preset.long;
    setTimeLeft(duration * 60);
  }, [preset]);

  useEffect(() => {
    const duration = mode === 'focus' ? preset.focus : mode === 'shortBreak' ? preset.short : preset.long;
    setTimeLeft(duration * 60);
    setIsActive(false);
  }, [presetIdx]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          if (mode === 'focus') {
            completeFocusSession();
            logSession(mode === 'focus' ? 'focus' : 'break', preset.focus * 60);
            setFocusSession({ isActive: false, mode: 'idle', elapsed: 0 });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, mode, preset, completeFocusSession, logSession, setFocusSession]);

  const Icon = MODE_ICONS[mode];
  const progress = mode === 'focus'
    ? 1 - timeLeft / (preset.focus * 60)
    : mode === 'shortBreak'
      ? 1 - timeLeft / (preset.short * 60)
      : 1 - timeLeft / (preset.long * 60);

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-4">
      {/* Preset toggle */}
      <button
        onClick={() => setPresetIdx(i => (i + 1) % PRESETS.length)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4"
      >
        <Icon className="w-3.5 h-3.5" />
        {preset.name}
      </button>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg mb-5 w-full max-w-xs">
        {(['focus', 'shortBreak', 'longBreak'] as const).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              mode === m
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Long'}
          </button>
        ))}
      </div>

      {/* Time display */}
      <div className="relative mb-5">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4"
            className="text-slate-200 dark:text-slate-800" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
            strokeLinecap="round"
            className="text-brand transition-[stroke-dashoffset] duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-display font-light tracking-tighter tabular-nums text-slate-900 dark:text-white">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
            {mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Break' : 'Long Break'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button onClick={() => { setIsActive(false); switchMode(mode); }}
          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 transition-transform"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={() => setIsActive(a => !a)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform ${
            isActive
              ? 'bg-amber-500 text-white'
              : 'bg-brand text-white'
          }`}
        >
          {isActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
        </button>
        <div className="w-12 h-12" />
      </div>
    </div>
  );
};
