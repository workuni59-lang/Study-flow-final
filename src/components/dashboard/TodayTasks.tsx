import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Calendar, 
  GripVertical,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { useStudy, Task } from '../../context/StudyContext';
import { DashboardCard } from './DashboardCard';

interface TodayTasksProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
  onReorder: (tasks: Task[]) => void;
}

export const TodayTasks = ({ tasks, onToggle, onDelete, onAddTask, onReorder }: TodayTasksProps) => {
  const { recalibrateTasks } = useStudy();
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTasks = tasks.filter(t => {
    if (!t.dueDate) return true;
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  });

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    // Simulate engine calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    recalibrateTasks();
    setIsRecalibrating(false);
  };

  // Handle reordering for today's subset
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
              onClick={handleRecalibrate}
              disabled={isRecalibrating}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all group ${
                isRecalibrating 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-100 dark:border-indigo-800' 
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRecalibrating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isRecalibrating ? 'Recalibrating...' : 'Recalibrate'}
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

      <AnimatePresence mode="wait">
        {isRecalibrating ? (
          <motion.div 
            key="recalibrating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-20 flex flex-col items-center justify-center text-center"
          >
             <div className="relative mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-dashed border-indigo-600/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
             </div>
             <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tighter mb-2">Optimizing Flow</h3>
             <p className="text-slate-500 text-sm font-medium max-w-xs">Distributing {overdueTasks.length} overdue tasks across your next available sessions...</p>
          </motion.div>
        ) : (
          <div key="list">
            {overdueTasks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  You have <span className="underline">{overdueTasks.length} tasks</span> from previous days.
                </p>
              </motion.div>
            )}

            {todaysTasks.length > 0 ? (
              <Reorder.Group axis="y" values={todaysTasks} onReorder={handleReorder} className="space-y-3">
                {todaysTasks.map((task) => (
                  <Reorder.Item
                    key={task.id}
                    value={task}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group bg-white dark:bg-slate-900/50 border border-slate-50 dark:border-slate-800 rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all ${task.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-700 hover:text-indigo-400 transition-colors">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <button 
                      onClick={() => onToggle(task.id)}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm md:text-base dark:text-white transition-all line-clamp-1 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{task.category}</span>
                        {task.priority && (
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            task.priority === 'High Yield' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 
                            task.priority === 'Deep Review' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                            'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => onDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="font-bold dark:text-white text-lg">Clear skies today.</h3>
                <p className="text-slate-500 text-sm max-w-[200px] mt-1">Add a task to start your flow or enjoy a well-earned break.</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </DashboardCard>
  );
};
