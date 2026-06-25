import React, { useMemo } from 'react';
import { Sparkles, CheckCircle2, Medal, Target, Zap, Trophy, Flame, Waves, CheckCircle, Lock, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { AchievementsGrid } from '../dashboard/AchievementsGrid';
import { ActivityHeatmap } from './ActivityHeatmap';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { ACHIEVEMENTS } from '../../lib/gamification';

const ICON_MAP: Record<string, any> = {
  CheckCircle, Zap, Waves, Flame, Trophy
};

const BADGE_TIER_MAP: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  Rare: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
  Epic: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50',
  Legendary: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
};

export const AchievementsView = () => {
  const { unlockedBadges, userStats, subjects, progression, progressionBadges } = useStudy();
  const { rank } = progression;

  const earnedCount = unlockedBadges.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPct = Math.round((earnedCount / totalCount) * 100);
  const legendaryCount = useMemo(() => {
    let count = 0;
    unlockedBadges.forEach(b => {
      const ach = ACHIEVEMENTS.find(a => a.id === b.achievementId);
      if (ach?.rarity === 'Legendary') count++;
    });
    return count;
  }, [unlockedBadges]);

  const greenTopics = useMemo(() =>
    subjects.reduce((acc, s) => acc + s.topics.filter(t => t.mastery === 'Green').length, 0),
  [subjects]);

  const nextAchievement = useMemo(() => {
    let best: (typeof ACHIEVEMENTS[0]) | null = null;
    let bestPct = 0;
    ACHIEVEMENTS.forEach(a => {
      if (unlockedBadges.some(b => b.achievementId === a.id)) return;
      let current: number;
      switch (a.type) {
        case 'tasks': current = userStats.totalTasksCompleted; break;
        case 'focus': current = userStats.totalFocusSeconds; break;
        case 'streak': current = userStats.currentStreak; break;
        case 'mastery': current = greenTopics; break;
        default: current = 0;
      }
      const pct = Math.min((current / a.requirement) * 100, 100);
      if (pct > bestPct) { bestPct = pct; best = a; }
    });
    if (!best) return null;
    let cur: number;
    switch (best.type) {
      case 'tasks': cur = userStats.totalTasksCompleted; break;
      case 'focus': cur = userStats.totalFocusSeconds; break;
      case 'streak': cur = userStats.currentStreak; break;
      case 'mastery': cur = greenTopics; break;
      default: cur = 0;
    }
    return { achievement: best, current: cur, percentage: bestPct };
  }, [unlockedBadges, userStats, greenTopics]);

  const Icon = useMemo(() => nextAchievement ? (ICON_MAP[nextAchievement.achievement.icon] || Trophy) : Trophy, [nextAchievement]);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* CHANGE 1 — Hall of Mastery Header */}
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-violet-400/70 mb-2 font-black">
            Hall of Mastery
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase">
            Achievement Collection
          </h1>
          <p className="text-white/40 text-sm mt-1 font-medium">
            Every milestone earned becomes part of your legacy.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-violet-400">
            {earnedCount}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-black">
            Badges Earned
          </div>
        </div>
      </header>

      {/* CHANGE 6 — Collection Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Achievements Earned</p>
          <p className="text-lg font-black text-white">{earnedCount} / {totalCount}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Completion</p>
          <p className="text-lg font-black text-white">{completionPct}%</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Next Unlock</p>
          <p className="text-lg font-black text-white truncate">{nextAchievement ? nextAchievement.achievement.title : 'All Done!'}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Legendary</p>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <p className="text-lg font-black text-white">{legendaryCount}</p>
          </div>
        </div>
      </div>

      {/* CHANGE 10 — Empty State Motivation */}
      {earnedCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 mb-4">
            <Medal className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Your journey begins.</h3>
          <p className="text-sm text-white/40 max-w-md mx-auto font-medium">
            Complete your first study session to unlock your first achievement.
          </p>
        </motion.div>
      )}

      {/* CHANGE 2 — Featured Next Achievement Spotlight */}
      {nextAchievement && earnedCount < totalCount && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 0 rgba(139,92,246,0)', '0 0 30px rgba(139,92,246,0.12)', '0 0 0 rgba(139,92,246,0)'] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl pointer-events-none"
          />
          <div className="relative z-10">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400/60 mb-3">Next Achievement</div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white">{nextAchievement.achievement.title}</h3>
                <p className="text-xs text-white/50 font-medium">{nextAchievement.achievement.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    nextAchievement.achievement.rarity === 'Common' ? 'bg-white/[0.05] text-white/40'
                    : nextAchievement.achievement.rarity === 'Rare' ? 'bg-blue-500/15 text-blue-400'
                    : nextAchievement.achievement.rarity === 'Epic' ? 'bg-violet-500/15 text-violet-400'
                    : 'bg-amber-400/15 text-amber-400'
                  }`}>{nextAchievement.achievement.rarity}</span>
                  <span className="flex items-center gap-1 text-[9px] text-white/40 font-semibold">
                    <Zap className="w-3 h-3" /> Unlocks +XP
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-violet-400">{Math.round(nextAchievement.percentage)}%</div>
                <div className="text-[9px] text-white/40 font-semibold">Complete</div>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextAchievement.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf680]"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Progression Badges */}
      {progressionBadges.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-display font-semibold text-white/80 tracking-tight">Progression Badges</h3>
            <p className="text-[10px] text-white/40 mt-0.5 font-medium">Milestone badges earned by reaching level thresholds.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {progressionBadges.map(badge => {
              const tier = BADGE_TIER_MAP[badge.id];
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${RARITY_COLORS[badge.rarity] || RARITY_COLORS.Common}`}
                >
                  {tier ? <BadgeSvg tier={tier} size={40} /> : <span className="text-lg">{badge.icon}</span>}
                  <div>
                    <p className="text-xs font-bold">{badge.name}</p>
                    <p className="text-[8px] font-semibold uppercase tracking-wider opacity-70">{badge.rarity}</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <AchievementsGrid />

      {/* Extra: Activity Heatmap moved BELOW achievements */}
      <ActivityHeatmap />

      {/* Visual Decorative Element */}
      <div className="py-12 flex justify-center opacity-20">
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
      </div>
    </div>
  );
};
