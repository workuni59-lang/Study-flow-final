import React from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';

export const StudyAnalytics = () => {
  const { userStats } = useStudy();

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const xpData = last7Days.map(date => ({
    date,
    xp: userStats.dailyXPHistory[date] || 0,
    label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  const maxXP = Math.max(...xpData.map(d => d.xp), 500); // Baseline max for scaling

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <BarChart3 className="w-4 h-4 text-indigo-600" />
             <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Activity</h3>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">XP gained last 7 days</p>
        </div>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
           <TrendingUp className="w-3 h-3 text-indigo-600" />
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
             {xpData.reduce((acc, curr) => acc + curr.xp, 0)} XP Total
           </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-48 pt-4">
        {xpData.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-3 h-full group/bar">
            <div className="relative flex-1 w-full flex items-end justify-center px-1 md:px-2">
               {/* XP Value Tooltip on hover */}
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                 {day.xp} XP
               </div>
               
               <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(day.xp / maxXP) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                className={`w-full max-w-[32px] rounded-t-xl transition-colors ${day.xp > 0 ? 'bg-indigo-600 group-hover/bar:bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.3)]' : 'bg-slate-50 dark:bg-slate-800'}`}
               />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Background Decoration */}
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
