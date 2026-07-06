import { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Zap, Flame, PenSquare, Target, Music, ArrowUpRight, Sparkles, Timer } from 'lucide-react';
import { useStudy, useFocus } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { WALLPAPERS } from '../../lib/gamification';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { getDailyQuote } from '../../lib/quotes';
import { getGreeting } from '../../lib/greetings';
import ClockRenderer from '../clock/ClockRenderer';
import { DemoSignUpNudge } from '../notifications/DemoSignUpNudge';

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

export const HomeView = memo(({ onNotepadOpen, onQuestsOpen, onMusicOpen, onProgressionOpen, onSubjectsOpen, onOpenAuth, menuOpen }: {
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
  onMusicOpen?: () => void;
  onProgressionOpen?: () => void;
  onSubjectsOpen?: (subjectId?: string) => void;
  onOpenAuth?: () => void;
  menuOpen?: boolean;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { focusSession } = useFocus();
  const { userStats, themeConfig, progression, subjects, todayFocusSeconds, dailyGoal } = useStudy();
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
  const sa = spotlight ? (SUBJECT_ACCENTS[spotlight.subject.color || 'indigo'] ?? SUBJECT_ACCENTS.indigo) : null;

  return (
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-6 pb-28 lg:pb-12 overflow-hidden">
      {/* Darken overlay for text readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0" />

      {/* Badge — top-left */}
      <button
        onClick={onProgressionOpen}
        className={`fixed top-20 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${t}/80 ${panelHover} transition-all text-[11px] font-semibold`}
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 }}
      >
        <BadgeSvg tier={badgeInfo.tier} size={20} unlocked={true} />
        Lv.{badgeInfo.level}
        <ArrowUpRight className={`w-3 h-3 ${t}/30`} />
      </button>

      {/* Central content */}
      <div data-tour-target="dashboard" className="relative z-10 flex flex-col items-center w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Greeting / Clock — grouped for tour (quote moved to sidebar on desktop) */}
        <div id="tour-clock-area" className="flex flex-col items-center w-full">
          {themeConfig.showGreeting !== false && (
            <p className="text-white/60 text-sm tracking-wide mb-2">
              {getGreeting(user?.displayName?.split(' ')[0])}
            </p>
          )}
          {themeConfig.showClock !== false && (
            <div className="mb-3">
              <ClockRenderer time={time} focusState={focusSession} />
            </div>
          )}
        </div>

        {/* Quote — on mobile (stacked), hidden on desktop */}
        {themeConfig.showQuote !== false && (
          <p className="font-quote text-white/80 text-lg text-center max-w-[480px] mb-6 leading-relaxed lg:hidden">
            &ldquo;{quote.text}&rdquo;
          </p>
        )}

        {/* Focus time label + inline spotlight */}
        <p className={`text-[11px] ${t}/45 mb-4 flex items-center justify-center gap-1.5 flex-wrap`}>
          <span>
            {userStats.totalFocusSeconds > 0
              ? `${formatTime(userStats.totalFocusSeconds)} focused today`
              : 'Ready for a focused session?'}
          </span>
          {spotlight && sa && (
            <>
              <span className={`${t}/20`}>·</span>
              <button
                onClick={() => onSubjectsOpen?.(spotlight.subject.id)}
                className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                aria-label={`Review ${spotlight.subject.name}: ${spotlight.redCount} topics need attention`}
              >
                <Sparkles className="w-3 h-3" style={{ color: sa.icon }} />
                <span className="font-medium">{spotlight.subject.name}</span>
                <span className={`${t}/50`}>({spotlight.redCount})</span>
                <span className="underline underline-offset-2 ml-0.5">Review</span>
              </button>
            </>
          )}
        </p>

        {/* Daily goal progress ring */}
        <motion.div
          id="tour-daily-goal"
          className="mb-5 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" className="drop-shadow-sm">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <motion.circle
              cx="32" cy="32" r="28" fill="none"
              stroke="#10b981" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 28 * (1 - Math.min(todayFocusSeconds / dailyGoal, 1)),
              }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              transform="rotate(-90 32 32)"
            />
            <text x="32" y="38" textAnchor="middle" className="fill-white text-[13px] font-bold" dominantBaseline="middle">
              {Math.min(Math.round((todayFocusSeconds / dailyGoal) * 100), 100)}%
            </text>
          </svg>
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${t}/40 mt-1`}>
            {formatTime(dailyGoal)} goal
          </span>
        </motion.div>

        {/* Stats row — ultra-light glass cards */}
        <div id="tour-stats-bar" className="flex gap-2 w-full max-w-xs">
          {statCards.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className={`flex-1 py-2.5 px-1 text-center rounded-xl ${panelBg} border ${panelBorder}`}>
              <Icon size={14} className="mx-auto mb-1" style={{ color }} />
              <p className={`text-sm font-bold ${t}/85 leading-tight timer-display`}>{value}</p>
              <p className={`text-[7px] font-bold uppercase tracking-widest ${t}/35 mt-0.5`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Sign-in prompt for demo users */}
        <DemoSignUpNudge onOpenAuth={onOpenAuth} />
      </div>

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
            <button id="tour-customize-btn" data-tour-target="customize" onClick={onMusicOpen} className="btn-ghost !p-2.5 !rounded-full">
              <Music size={16} />
            </button>
          )}
        </div>
      )}
      {/* Quote — right sidebar on desktop, stacked on mobile */}
      {themeConfig.showQuote !== false && (
        <>
          <div className="hidden lg:fixed lg:right-10 lg:top-28 lg:z-20 lg:block lg:max-w-[260px]">
            <p className="font-quote text-white/75 text-xl leading-snug font-medium">
              &ldquo;{quote.text}&rdquo;
            </p>
          </div>
          <p className="font-quote text-white/80 text-lg text-center max-w-[480px] mb-6 leading-relaxed lg:hidden">
            &ldquo;{quote.text}&rdquo;
          </p>
        </>
      )}
    </div>
  );
});