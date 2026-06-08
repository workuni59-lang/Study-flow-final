import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Brain, Info, Lock, Crown } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { DashboardCard } from '../dashboard/DashboardCard';

export const ActivityHeatmap = () => {
  const { userStats, setShowPremiumModal } = useStudy();

  // Generate data for the last 12 months (approx 52 weeks)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (52 * 7)); // 1 year ago

    // Fill with real data or empty
    for (let i = 0; i <= 52 * 7; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const intensity = userStats.dailyXPHistory[dateStr] || 0;
      data.push({ date: dateStr, intensity });
    }
    return data;
  }, [userStats.dailyXPHistory]);

  const weeklyXp = useMemo(() => {
    const today = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      total += userStats.dailyXPHistory[dateStr] || 0;
    }
    return total;
  }, [userStats.dailyXPHistory]);

  const getColor = (xp: number) => {
    if (xp === 0) return 'bg-slate-100 dark:bg-slate-800/50';
    if (xp < 200) return 'bg-indigo-200 dark:bg-indigo-900/30';
    if (xp < 500) return 'bg-indigo-400 dark:bg-indigo-700/50';
    if (xp < 1000) return 'bg-indigo-600 dark:bg-indigo-500';
    return 'bg-indigo-800 dark:bg-indigo-400'; // High intensity
  };

  const isLocked = !userStats.isPremium;

  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">The Brain Scan</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yearly Momentum Analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-[8px] font-black uppercase text-slate-400">Consistency:</span>
              <span className="text-[10px] font-bold dark:text-white">94%</span>
           </div>
        </div>
      </div>

      <div className={`transition-all duration-700 ${isLocked ? 'blur-md grayscale pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-1">
          {/* Heatmap Grid */}
          <div className="flex flex-wrap gap-[3px]">
             {heatmapData.map((d, i) => (
               <div 
                 key={i}
                 className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-help ${getColor(d.intensity)}`}
                 title={`${d.date}: ${d.intensity} XP`}
               />
             ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 opacity-50">
             <span className="text-[8px] font-black uppercase text-slate-500">Less Focus</span>
             <div className="w-2 h-2 rounded-[1px] bg-slate-100 dark:bg-slate-800" />
             <div className="w-2 h-2 rounded-[1px] bg-indigo-200 dark:bg-indigo-900/30" />
             <div className="w-2 h-2 rounded-[1px] bg-indigo-600 dark:bg-indigo-500" />
             <div className="w-2 h-2 rounded-[1px] bg-indigo-800 dark:bg-indigo-400" />
             <span className="text-[8px] font-black uppercase text-slate-500">Peak Flow</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Weekly Velocity</p>
              <p className="text-sm font-bold dark:text-white">{weeklyXp.toLocaleString()} XP</p>
           </div>
           <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Peak Hour</p>
              <p className="text-sm font-bold dark:text-white">10:00 PM</p>
           </div>
           <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Flow Streak</p>
              <p className="text-sm font-bold dark:text-white">12 Days</p>
           </div>
           <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Grade Outlook</p>
              <p className="text-sm font-bold text-emerald-500">Distinction</p>
           </div>
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 dark:bg-slate-950/10 backdrop-blur-[2px] p-6 text-center">
           <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl mb-4 border border-slate-100 dark:border-slate-800">
              <Crown className="w-6 h-6 text-amber-500 fill-current" />
           </div>
           <h4 className="text-lg font-display font-black dark:text-white uppercase tracking-tight mb-2">Deep Insights Locked</h4>
           <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mb-6 font-medium">Upgrade to Elite Scholar to unlock your yearly momentum scan and focus heatmaps.</p>
           <button onClick={() => setShowPremiumModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20">
              View Plans
           </button>
        </div>
      )}
    </DashboardCard>
  );
};
