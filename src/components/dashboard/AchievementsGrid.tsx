import React from 'react';
import { Trophy, CheckCircle, Zap, Waves, Flame, Lock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { ACHIEVEMENTS, Rarity } from '../../lib/gamification';

const ICON_MAP: Record<string, any> = {
  CheckCircle,
  Zap,
  Waves,
  Flame,
  Trophy
};

const RARITY_STYLES: Record<Rarity, string> = {
  Common: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Rare: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  Epic: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
  Legendary: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
};

const RARITY_BORDERS: Record<Rarity, string> = {
  Common: 'border-slate-100 dark:border-slate-800',
  Rare: 'border-indigo-100 dark:border-indigo-900/30',
  Epic: 'border-violet-100 dark:border-violet-900/30',
  Legendary: 'border-amber-200 dark:border-amber-900/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
};

export const AchievementsGrid = () => {
  const { unlockedBadges } = useStudy();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight dark:text-white uppercase mb-2">Achievements</h2>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">The Hall of Mastery</p>
        </div>
        <div className="text-right">
           <span className="text-4xl font-display font-black text-indigo-600">{unlockedBadges.length}</span>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Badges Earned</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedBadges.some(b => b.achievementId === achievement.id);
          const Icon = ICON_MAP[achievement.icon] || Trophy;

          return (
            <motion.div
              key={achievement.id}
              whileHover={isUnlocked ? { y: -5, scale: 1.02 } : {}}
              className={`p-6 rounded-[32px] border transition-all relative overflow-hidden ${
                isUnlocked 
                  ? `bg-white dark:bg-slate-900 ${RARITY_BORDERS[achievement.rarity]}` 
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              {isUnlocked && (
                 <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                 />
              )}

              <div className="flex gap-4 items-center mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isUnlocked ? RARITY_STYLES[achievement.rarity] : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>
                  {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold dark:text-white leading-tight">{achievement.title}</h4>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isUnlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {achievement.rarity}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10">
                {achievement.description}
              </p>

              {isUnlocked && (
                <div className="absolute top-4 right-4 text-amber-500/20">
                   <Sparkles className="w-8 h-8" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
