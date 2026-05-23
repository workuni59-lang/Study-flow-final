import React from 'react';
import { Target, Flame, Clock } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

interface ProgressTrackerProps {
  tasks: { completed: boolean }[];
  streak: number;
  totalFocusSeconds: number;
}

export const ProgressTracker = ({ tasks, streak, totalFocusSeconds }: ProgressTrackerProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatFocusTime = (totalSeconds: number) => {
    const secsTotal = totalSeconds || 0;
    const h = Math.floor(secsTotal / 3600);
    const m = Math.floor((secsTotal % 3600) / 60);
    const s = secsTotal % 60;

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);

    return parts.join(' ');
  };

  return (
    <DashboardCard className="!p-6 md:!p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Today's Momentum</h3>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="editorial-label !text-[10px]">Task Completion</span>
          <span className="text-lg font-black dark:text-white tabular-nums">{completionRate}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
          {completedTasks} of {totalTasks} goals reached
        </p>
      </div>

      {/* Mini Metrics Row */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs font-black uppercase tracking-widest">Streak</span>
          </div>
          <p className="text-xl font-display font-black dark:text-white">{streak} Days</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-indigo-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Focused</span>
          </div>
          <p className="text-xl font-display font-black dark:text-white tabular-nums">{formatFocusTime(totalFocusSeconds)}</p>
        </div>
      </div>
    </DashboardCard>
  );
};
