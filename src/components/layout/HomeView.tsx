import { useState, useEffect, useMemo, memo } from 'react';
import { Clock, Zap, Flame, PenSquare, Target, Music, ArrowUpRight, Sparkles } from 'lucide-react';
import { useStudy, useFocus } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { WALLPAPERS } from '../../lib/gamification';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { getDailyQuote } from '../../lib/quotes';
import { getGreeting } from '../../lib/greetings';
import ClockRenderer from '../clock/ClockRenderer';

const SUBJECT_ACCENTS: Record<string, { bg: string; icon: string; badge: string; dot: string }> = {
  indigo:  { bg: 'rgba(99,102,241,0.16)', icon: '#a5b4fc', badge: 'rgba(99,102,241,0.2)', dot: '#6366f1' },
  rose:    { bg: 'rgba(244,63,94,0.16)',  icon: '#fda4af', badge: 'rgba(244,63,94,0.2)', dot: '#f43f5e' },
  emerald: { bg: 'rgba(52,211,153,0.16)', icon: '#6ee7b7', badge: 'rgba(52,211,153,0.2)', dot: '#34d399' },
  amber:   { bg: 'rgba(245,158,11,0.16)', icon: '#fcd34d', badge: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
  violet:  { bg: 'rgba(139,92,246,0.16)', icon: '#c4b5fd', badge: 'rgba(139,92,246,0.2)', dot: '#8b5cf6' },
  cyan:    { bg: 'rgba(6,182,212,0.16)',  icon: '#67e8f9', badge: 'rgba(6,182,212,0.2)', dot: '#06b6d4' },
};

const BADGE_TIER: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const HomeView = memo(({ onNotepadOpen, onQuestsOpen, onMusicOpen, onProgressionOpen, onSubjectsOpen, menuOpen }: {
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
  onMusicOpen?: () => void;
  onProgressionOpen?: () => void;
  onSubjectsOpen?: (subjectId?: string) => void;
  menuOpen?: boolean;
}) => {
  const { user } = useAuth();
  const { focusSession } = useFocus();
  const { userStats, themeConfig, progression, subjects } = useStudy();
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

  // Subject Spotlight — the subject with the most unmastered (Red) topics.
  // Returns null when no subject has Red topics, so the widget stays hidden.
  const spotlight = useMemo(() => {
    const ranked = subjects
      .map(s => ({
        subject: s,
        redCount: s.topics?.filter(t => t.mastery === 'Red').length || 0,
      }))
      .filter(r => r.redCount > 0)
      .sort((a, b) => b.redCount - a.redCount || a.subject.name.localeCompare(b.subject.name));
    return ranked[0] ?? null;
  }, [subjects]);

  const isLightBg = useMemo(() => {
    const wp = WALLPAPERS.find(w => w.id === themeConfig.wallpaper);
    return wp?.brightness === 'light';
  }, [themeConfig.wallpaper]);

  const t = isLightBg ? 'text-black' : 'text-white';
  const panelBg = isLightBg ? 'bg-black/[0.05]' : 'bg-white/[0.03]';
  const panelBorder = isLightBg ? 'border-black/[0.05]' : 'border-white/[0.04]';
  const panelHover = isLightBg ? 'hover:bg-black/[0.07]' : 'hover:bg-white/[0.08]';
  const trackBg = isLightBg ? 'bg-black/10' : 'bg-white/10';

  const sa = spotlight ? (SUBJECT_ACCENTS[spotlight.subject.color || 'indigo'] ?? SUBJECT_ACCENTS.indigo) : null;
  const sp = spotlight && spotlight.subject.topics.length > 0
    ? Math.round((spotlight.subject.topics.filter(t => t.mastery === 'Green').length / spotlight.subject.topics.length) * 100)
    : 0;

  return (
      <div className="relative flex flex-col items-center min-h-screen px-4 md:px-6 pb-28 lg:pb-12">
      {/* Badge — top-right */}
      <button
        onClick={onProgressionOpen}
        className={`fixed top-20 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel-light ${t}/80 ${panelHover} transition-all text-[11px] font-semibold`}
      >
        <BadgeSvg tier={badgeInfo.tier} size={20} unlocked={true} />
        Lv.{badgeInfo.level}
        <ArrowUpRight className={`w-3 h-3 ${t}/30`} />
      </button>

      {/* Central content — transparent floating panel, no backdrop blur */}
      <div className="flex flex-col items-center px-6 pt-8 pb-0 w-full max-w-sm flex-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Greeting */}
        {themeConfig.showGreeting !== false && (
          <p className={`text-sm font-medium ${t}/60 mb-0.5`}>
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
        <p className={`text-[11px] ${t}/45 mb-3`}>
          {userStats.totalFocusSeconds > 0
            ? `${formatTime(userStats.totalFocusSeconds)} focused today`
            : 'Ready for a focused session?'}
        </p>

        {/* Subject Spotlight — weakest subject nudge */}
        {spotlight && sa && (
          <div className="w-full max-w-xs mb-3">
            <button
              onClick={() => onSubjectsOpen?.(spotlight.subject.id)}
              className={`w-full group flex items-center gap-3 px-3.5 py-3 rounded-2xl glass-panel-light text-left ${panelHover} transition-all`}
              aria-label={`Review ${spotlight.subject.name}: ${spotlight.redCount} topics need attention`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: sa.bg }}
              >
                <Sparkles className="w-4 h-4" style={{ color: sa.icon }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[7px] font-bold uppercase tracking-widest ${t}/40 mb-0.5`}>Subject Spotlight</p>
                <p className={`text-xs font-bold ${t}/85 truncate`}>{spotlight.subject.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex-1 h-1 rounded-full ${trackBg} overflow-hidden`}>
                    <div className="h-full rounded-full" style={{ width: `${sp}%`, backgroundColor: sa.dot }} />
                  </div>
                  <span className={`text-[9px] ${t}/50 font-medium tabular-nums whitespace-nowrap`}>
                    {spotlight.subject.topics.filter(t => t.mastery === 'Green').length}/{spotlight.subject.topics.length}
                  </span>
                </div>
                <p className={`text-[10px] ${t}/50 leading-tight mt-0.5`}>
                  {spotlight.redCount} topic{spotlight.redCount === 1 ? '' : 's'} to review
                </p>
              </div>
              <span className="shrink-0 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider group-hover:opacity-80 transition-opacity" style={{ backgroundColor: sa.badge, color: sa.icon }}>
                Review
              </span>
            </button>
          </div>
        )}

        {/* Stats row — ultra-light glass cards */}
        <div className="mt-auto flex gap-2 w-full max-w-xs">
          {statCards.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className={`flex-1 py-2.5 px-1 text-center rounded-xl ${panelBg} border ${panelBorder}`}>
              <Icon size={14} className="mx-auto mb-1" style={{ color }} />
              <p className={`text-sm font-bold ${t}/85 leading-tight timer-display`}>{value}</p>
              <p className={`text-[7px] font-bold uppercase tracking-widest ${t}/35 mt-0.5`}>{label}</p>
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