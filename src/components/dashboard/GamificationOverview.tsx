import React from 'react';
import { Flame, Shield, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';

export const GamificationOverview = () => {
  const { userStats, progression, buyShield } = useStudy();
  const { rank, nextRank, level, currentXp, xpForNext, percentage, totalXp } = progression;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Level & XP Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm col-span-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform text-8xl select-none">
          {rank.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 block">
                {rank.icon} {rank.title}
              </span>
              <h2 className="text-4xl font-display font-black dark:text-white leading-none">Level {level}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block mb-1">{currentXp} / {xpForNext} XP</span>
            </div>
          </div>

          <div className="w-full h-4 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-100 dark:border-slate-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {nextRank ? (
                <span>{xpForNext - currentXp} XP to {nextRank.icon} {nextRank.title}</span>
              ) : (
                <span>Max level reached</span>
              )}
            </p>
            <div className="flex items-center gap-2">
               <Zap className="w-3 h-3 text-amber-500 fill-current" />
               <span className="text-xs font-black dark:text-white">{totalXp} Total XP</span>
            </div>
          </div>

          {nextRank && (
            <div className="mt-4 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <span className="text-sm">{rank.icon}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-sm dark:text-white/60">{nextRank.icon} {nextRank.title}</span>
              <div className="flex-1" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Rank</span>
            </div>
          )}
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Streak</span>
          {userStats.hasShield ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
               <ShieldCheck className="w-3 h-3" />
               <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
            </div>
          ) : (
            <button 
              onClick={buyShield}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-transparent hover:border-indigo-100 transition-all group/btn"
              title="Buy Streak Shield for 1000 XP"
            >
               <Shield className="w-3 h-3" />
               <span className="text-[8px] font-black uppercase tracking-widest">Buy Shield</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1">
           <div className="relative">
             <Flame className={`w-16 h-16 ${userStats.currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-200'} transition-all`} />
             {userStats.currentStreak > 0 && (
               <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-orange-400 blur-2xl rounded-full -z-10"
               />
             )}
           </div>
           <span className="text-5xl font-display font-black dark:text-white mt-4">{userStats.currentStreak}</span>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Days Consistent</p>
        </div>
      </div>
    </div>
  );
};
