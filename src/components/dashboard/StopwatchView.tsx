import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';

const formatElapsed = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const StopwatchView = () => {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const cumulatedRef = useRef(0);
  const runStartRef = useRef(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = performance.now();
    const total = cumulatedRef.current + (now - runStartRef.current) / 1000;
    setElapsed(total);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    runStartRef.current = performance.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    cumulatedRef.current += (performance.now() - runStartRef.current) / 1000;
    setRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    cumulatedRef.current = 0;
    runStartRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };

  const recordLap = () => {
    const current = cumulatedRef.current + (runStartRef.current > 0 ? (performance.now() - runStartRef.current) / 1000 : 0);
    setElapsed(current);
    setLaps(prev => [Math.round(current), ...prev]);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const displayTime = formatElapsed(Math.round(elapsed));
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);
  const centiseconds = Math.floor((elapsed - Math.floor(elapsed)) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-24 lg:pb-12">
      <div className="flex flex-col items-center gap-10 animate-fade-in-up">
        {/* Back link */}
        <button
          onClick={() => navigate(ROUTES.FOCUS)}
          className="text-white/30 hover:text-white/60 text-xs tracking-wider uppercase transition-colors"
        >
          &larr; Focus
        </button>

        {/* Time display */}
        <div className="flex flex-col items-center">
          <div className="font-mono text-[4rem] md:text-[6rem] lg:text-[7rem] font-bold leading-none tracking-tight text-white/90 tabular-nums select-none drop-shadow-sm">
            {displayTime.split(':').map((part, i) => (
              <span key={i} className="inline-block min-w-[1.2em] text-center">{part}</span>
            ))}
            <span className="text-[1.5rem] md:text-[2.5rem] text-white/40 align-baseline ml-1">
              {centiseconds.toString().padStart(2, '0')}
            </span>
          </div>
          <p className="text-white/25 text-[10px] uppercase tracking-widest mt-3 font-medium">
            {running ? 'Running' : elapsed > 0 ? 'Paused' : 'Ready'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          {elapsed > 0 && !running && (
            <button
              onClick={reset}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
              aria-label="Reset"
            >
              <RotateCcw size={20} />
            </button>
          )}

          <button
            onClick={running ? stop : start}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
            aria-label={running ? 'Pause' : 'Start'}
          >
            {running ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          {running && (
            <button
              onClick={recordLap}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
              aria-label="Lap"
            >
              <Flag size={18} />
            </button>
          )}
        </div>

        {/* Laps */}
        {laps.length > 0 && (
          <div className="w-full max-w-xs mt-2">
            <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/20 font-semibold px-1 mb-2">
              <span>Lap</span>
              <span>Time</span>
            </div>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {laps.map((lap, i) => {
                const best = Math.min(...laps);
                return (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg ${
                      lap === best && i === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.03] text-white/60'
                    }`}
                  >
                    <span className="text-xs font-medium">Lap {laps.length - i}</span>
                    <span className="text-sm font-mono tabular-nums">{formatElapsed(lap)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
