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
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    return parts.join(' ') || '0m';
  };

  return (
    <DashboardCard>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Task Completion</span>
            <span className="text-lg font-display font-semibold dark:text-white tabular-nums">{completionRate}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
            {completedTasks} of {totalTasks} tasks done
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100/50 dark:border-slate-800/30">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Streak</span>
            </div>
            <p className="text-lg font-display font-semibold dark:text-white">{streak} days</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-brand">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Focused</span>
            </div>
            <p className="text-lg font-display font-semibold dark:text-white tabular-nums">{formatFocusTime(totalFocusSeconds)}</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
