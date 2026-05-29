import { useState, useEffect } from 'react';
import { Clock, Zap, Flame, Sparkles, PenSquare } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { getDailyQuote } from '../../lib/quotes';
import { getGreeting } from '../../lib/greetings';
import ClockRenderer from '../clock/ClockRenderer';
import { DeadlinesSection } from '../dashboard/DeadlinesSection';

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const HomeView = ({ onNotepadOpen }: { onNotepadOpen?: () => void }) => {
  const { user } = useAuth();
  const { userStats, themeConfig, focusSession } = useStudy();
  const [time, setTime] = useState(new Date());
  const [quote] = useState(getDailyQuote());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
    }, []);

  return (
    <div className="relative flex flex-col items-center px-4 pt-12 pb-28 lg:pb-8 text-center min-h-screen overflow-hidden">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Clock (respects user's digital/analog variant preference) */}
      {themeConfig.showClock !== false && (
        <div className="mb-2">
          <ClockRenderer time={time} focusState={focusSession} />
        </div>
      )}

      {/* Greeting */}
      {themeConfig.showGreeting !== false && (
        <h2 className="text-lg md:text-xl font-display font-medium dark:text-white/70 mb-1">
          {getGreeting(user?.displayName?.split(' ')[0])}
        </h2>
      )}

      {/* Daily goal prompt */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
        {userStats.totalFocusSeconds > 0
          ? `${formatTime(userStats.totalFocusSeconds)} focused today`
          : 'Ready for a focused session?'}
      </p>

      {/* Quote */}
      {themeConfig.showQuote !== false && (
        <div className="max-w-md mb-8 w-full">
          <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-white/[0.06] shadow-sm">
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-brand/40" />
            <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-2.5">
              &mdash; {quote.author}
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-2.5">
        <StatCard icon={Clock} value={formatTime(userStats.totalFocusSeconds)} label="Focus" color="text-brand" />
        <StatCard icon={Flame} value={String(userStats.currentStreak)} label="Streak" color="text-amber-500" />
        <StatCard icon={Zap} value={String(userStats.totalXP)} label="XP" color="text-purple-500" />
      </div>

      {/* Deadlines */}
      <div className="mt-5">
        <DeadlinesSection />
      </div>

      {/* Notepad quick-access */}
      {onNotepadOpen && (
        <button onClick={onNotepadOpen}
          className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all active:scale-95"
        >
          <PenSquare className="w-3.5 h-3.5" />
          Quick Note
        </button>
      )}

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 dark:from-[#0a0c10]/40 to-transparent pointer-events-none" />

      {/* Brand watermark */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-20 pointer-events-none">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white">
          <Zap className="w-2.5 h-2.5 fill-current" />
        </div>
        <span className="text-[9px] font-bold dark:text-white tracking-tight">StudyFlow</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }: { icon: typeof Clock; value: string; label: string; color: string }) => (
  <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-3 text-center border border-white/20 dark:border-white/[0.04] shadow-sm overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 dark:to-white/[0.02]" />
    <div className="relative z-10">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <p className="text-base font-display font-semibold dark:text-white">{value}</p>
      <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  </div>
);
