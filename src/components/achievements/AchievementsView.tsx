import React from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { GamificationOverview } from '../dashboard/GamificationOverview';
import { AchievementsGrid } from '../dashboard/AchievementsGrid';
import { StudyAnalytics } from '../dashboard/StudyAnalytics';
import { ActivityHeatmap } from './ActivityHeatmap';

export const AchievementsView = () => {
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
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Trophy className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <p className="text-xl font-display font-black dark:text-white leading-none">Elite Scholar</p>
           </div>
        </div>
      </header>

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
