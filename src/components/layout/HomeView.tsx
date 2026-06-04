import { useState, useEffect, useMemo, memo } from 'react';
import { Clock, Zap, Flame, PenSquare, Target, Music, ArrowUpRight } from 'lucide-react';
import { useStudy, useFocus } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { getDailyQuote } from '../../lib/quotes';
import { getGreeting } from '../../lib/greetings';
import ClockRenderer from '../clock/ClockRenderer';

const BADGE_TIER: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const HomeView = memo(({ onNotepadOpen, onQuestsOpen, onMusicOpen, onProgressionOpen, menuOpen }: {
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
  onMusicOpen?: () => void;
  onProgressionOpen?: () => void;
  menuOpen?: boolean;
}) => {
  const { user } = useAuth();
  const { focusSession } = useFocus();
  const { userStats, themeConfig, progression } = useStudy();
  const [time, setTime] = useState(new Date());
  const [quote] = useState(getDailyQuote());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Derived badge once
  const badgeInfo = useMemo(() => {
    const hb = PROGRESSION_BADGES.filter(b => progression.level >= b.levelRequired).pop();
    return {
      tier: (hb ? (BADGE_TIER[hb.id] ?? 'bronze') : 'bronze') as BadgeTier,
      level: progression.level,
    };
  }, [progression.level]);

  const statCards = useMemo(() => [
    { icon: Clock, value: formatTime(userStats.totalFocusSeconds), label: 'Focus', color: '#818cf8' },
    { icon: Flame, value: String(userStats.currentStreak ?? 0), label: 'Streak', color: '#f59e0b' },
    { icon: Zap, value: String(userStats.totalXP ?? 0), label: 'XP', color: '#a78bfa' },
  ], [userStats.totalFocusSeconds, userStats.currentStreak, userStats.totalXP]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 pb-28 lg:pb-12">
      {/* Badge — top-right */}
      <button
        onClick={onProgressionOpen}
        className="fixed top-20 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel-light text-white/80 hover:bg-white/[0.08] transition-all text-[11px] font-semibold"
      >
        <BadgeSvg tier={badgeInfo.tier} size={20} unlocked={true} />
        Lv.{badgeInfo.level}
        <ArrowUpRight className="w-3 h-3 text-white/30" />
      </button>

      {/* Central content — transparent floating panel, no backdrop blur */}
      <div className="flex flex-col items-center px-6 py-8 w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Greeting */}
        {themeConfig.showGreeting !== false && (
          <p className="text-sm font-medium text-white/60 mb-0.5">
            {getGreeting(user?.displayName?.split(' ')[0])}
          </p>
        )}

        {/* Clock */}
        {themeConfig.showClock !== false && (
          <div className="my-1" style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.3))' }}>
            <ClockRenderer time={time} focusState={focusSession} />
          </div>
        )}

        {/* Focus time label */}
        <p className="text-[11px] text-white/45 mb-3">
          {userStats.totalFocusSeconds > 0
            ? `${formatTime(userStats.totalFocusSeconds)} focused today`
            : 'Ready for a focused session?'}
        </p>

        {/* Stats row — ultra-light glass cards */}
        <div className="flex gap-2 w-full max-w-xs">
          {statCards.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex-1 py-2.5 px-1 text-center rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <Icon size={14} className="mx-auto mb-1" style={{ color }} />
              <p className="text-sm font-bold text-white/85 leading-tight timer-display">{value}</p>
              <p className="text-[7px] font-bold uppercase tracking-widest text-white/35 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Quote — fixed top-right, no overlap with badge (now top-left) */}
      {themeConfig.showQuote !== false && (
        <div className="fixed top-28 right-6 z-20 max-w-[280px]">
          <p className="font-serif text-[18px] font-bold italic leading-tight text-white/90 text-right" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7), 0 0 60px rgba(0,0,0,0.3)' }}>
            &ldquo;{quote.text}&rdquo;
          </p>
        </div>
      )}

      {/* Bottom-left icon cluster */}
      {!menuOpen && (
        <div className="fixed bottom-7 left-6 z-50 flex gap-3">
          {onNotepadOpen && (
            <button onClick={onNotepadOpen} className="btn-ghost !p-2.5 !rounded-full">
              <PenSquare size={16} />
            </button>
          )}
          {onQuestsOpen && (
            <button onClick={onQuestsOpen} className="btn-ghost !p-2.5 !rounded-full">
              <Target size={16} />
            </button>
          )}
          {onMusicOpen && (
            <button onClick={onMusicOpen} className="btn-ghost !p-2.5 !rounded-full">
              <Music size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
});