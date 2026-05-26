import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowRight, CheckCircle2, Clock, X } from 'lucide-react';

interface DailyReflectionProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteDay: () => void;
  stats: {
    completedTasks: number;
    totalTasks: number;
    focusTime: string;
  };
  unfinishedTasks: { title: string; category: string }[];
}

export const DailyReflection = ({ 
  isOpen, 
  onClose, 
  onCompleteDay, 
  stats, 
  unfinishedTasks 
}: DailyReflectionProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="relative bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-16 max-w-2xl w-full shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <span className="editorial-label !text-indigo-600 mb-4 block">Session Complete</span>
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white leading-none">
                  Great work, <br />
                  <span className="text-indigo-600">Today.</span>
                </h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-emerald-500 mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Achieved</span>
                </div>
                <p className="text-3xl font-display font-black dark:text-white leading-tight">
                  {stats.completedTasks} <span className="text-lg text-slate-400">/ {stats.totalTasks}</span>
                </p>
                <p className="text-xs text-slate-500 font-bold mt-1">Tasks finished</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-indigo-500 mb-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Focused</span>
                </div>
                <p className="text-3xl font-display font-black dark:text-white leading-tight">
                  {stats.focusTime}
                </p>
                <p className="text-xs text-slate-500 font-bold mt-1">Deep work time</p>
              </div>
            </div>

            {unfinishedTasks.length > 0 && (
              <div className="mb-12 relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Rolling over to next session</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {unfinishedTasks.map((task, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="font-bold text-sm dark:text-white truncate pr-4">{task.title}</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">{task.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 relative z-10">
              <button 
                onClick={onCompleteDay}
                className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-6 rounded-[24px] font-black text-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group"
              >
                Close the Day <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onClose}
                className="w-full text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors py-2"
              >
                Continue Studying
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
