import React from 'react';
import { CheckCircle2, Circle, Plus, Trash2, RefreshCw, AlertCircle, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useStudy, Task } from '../../context/StudyContext';

interface TodayTasksProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
  onReorder: (tasks: Task[]) => void;
}

import { DashboardCard } from './DashboardCard';

export const TodayTasks = ({ tasks, onToggle, onDelete, onAddTask, onReorder }: TodayTasksProps) => {
  const { recalibrateTasks } = useStudy();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today);
  const todaysTasks = tasks.filter(t => {
    if (t.completed) return true;
    if (!t.dueDate) return true;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() <= today.getTime();
  });

  // Since we want to reorder all tasks but only display today's, 
  // we'll handle the logic carefully to preserve non-today tasks order.
  const handleReorder = (reorderedSubset: Task[]) => {
    const nonTodaysTasks = tasks.filter(t => !todaysTasks.find(tt => tt.id === t.id));
    onReorder([...reorderedSubset, ...nonTodaysTasks]);
  };

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight dark:text-white">Today's Focus</h2>
          <p className="text-slate-500 font-medium text-sm md:text-base">Step by step toward mastery.</p>
        </div>
        <div className="flex gap-2">
          {overdueTasks.length > 0 && (
            <button 
              onClick={recalibrateTasks}
              className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-amber-100 dark:border-amber-800 hover:bg-amber-600 hover:text-white transition-all group"
              title="Reschedule overdue tasks"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Recalibrate
            </button>
          )}
          <button 
            onClick={onAddTask}
            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-colors shadow-lg shadow-indigo-600/20 flex-shrink-0"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
            You have {overdueTasks.length} overdue tasks. Hit Recalibrate to distribute them into your current schedule.
          </p>
        </div>
      )}

      <Reorder.Group axis="y" values={todaysTasks} onReorder={handleReorder} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {todaysTasks.map((task) => (
            <Reorder.Item 
              key={task.id}
              value={task}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 md:p-5 rounded-2xl border transition-all flex items-center gap-4 group cursor-grab active:cursor-grabbing ${
                task.completed 
                  ? 'bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 opacity-60' 
                  : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-indigo-200 shadow-sm'
              }`}
            >
              <div className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0">
                 <GripVertical className="w-5 h-5" />
              </div>

              <button 
                onClick={() => onToggle(task.id)}
                className="flex-shrink-0 focus:outline-none"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                )}
              </button>
              
              <div 
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-bold text-base md:text-lg truncate dark:text-white ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.priority && !task.completed && (
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border flex-shrink-0 ${
                      task.priority === 'High Yield' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:border-emerald-900/20 dark:border-emerald-800'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {task.category}
                </span>
              </div>

              <button 
                onClick={() => onDelete(task.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>

        {todaysTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl"
          >
            <p className="text-slate-400 font-medium px-4">All clear for today! Add a new task to begin.</p>
          </motion.div>
        )}
      </Reorder.Group>
    </DashboardCard>
  );
};
