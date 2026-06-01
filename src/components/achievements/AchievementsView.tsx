import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { GamificationOverview } from '../dashboard/GamificationOverview';
import { AchievementsGrid } from '../dashboard/AchievementsGrid';
import { StudyAnalytics } from '../dashboard/StudyAnalytics';
import { ActivityHeatmap } from './ActivityHeatmap';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';

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
  const { progression, progressionBadges } = useStudy();
  const { rank } = progression;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-100 dark:border-amber-800/50">
            <Sparkles className="w-3 h-3" />
            Hall of Mastery
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase mb-2">My Progression</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Every session counts toward excellence.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 text-2xl">
              {rank.icon}
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <p className="text-xl font-display font-black dark:text-white leading-none">{rank.title}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Level {progression.level}</p>
           </div>
        </div>
      </header>

      {/* Progression Badges */}
      {progressionBadges.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-display font-semibold dark:text-white/80 tracking-tight">Progression Badges</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Milestone badges earned by reaching level thresholds.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
           <GamificationOverview />
        </div>
        <div className="lg:col-span-1">
           <StudyAnalytics />
        </div>
      </div>

      <ActivityHeatmap />
      
      <AchievementsGrid />
      
      {/* Visual Decorative Element */}
      <div className="py-12 flex justify-center opacity-20">
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
      </div>
    </div>
  );
};
