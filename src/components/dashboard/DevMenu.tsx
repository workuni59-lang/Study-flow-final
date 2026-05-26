import React, { useState } from 'react';
import { Settings, Zap, Sparkles, RefreshCcw, ShieldCheck, Crown, CheckCircle2, Plus, AlertTriangle, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';

export const DevMenu = () => {
  const { 
    addXP, triggerConfetti, resetStreak, togglePremium, userStats, 
    tasks, toggleTask, addTask, panicModeActive, setPanicMode, setTasks 
  } = useStudy();
  const [isOpen, setIsOpen] = useState(false);

  const completeBatchTasks = () => {
    const incomplete = tasks.filter(t => !t.completed);
    if (incomplete.length < 5) {
      const needed = 5 - incomplete.length;
      for (let i = 0; i < needed; i++) {
        addTask(`Dev Mock Task ${tasks.length + i + 1}`, 'General', 'High Yield');
      }
      alert(`Generated ${needed} new tasks. Click again to complete the full batch!`);
      return;
    }
    const batch = incomplete.slice(0, 5);
    batch.forEach(task => {
      toggleTask(task.id);
    });
    triggerConfetti();
  };

  const simulateLevelUp = () => {
    const xpNeeded = 1000 * Math.pow(1.2, userStats.level - 1);
    addXP(Math.ceil(xpNeeded));
    triggerConfetti();
  };

  const simulateNextDay = () => {
    // 1. Move lastActiveDate back by 1 day in storage so the app thinks today is a new day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // We modify the stats in storage and then reload to trigger the Context initialization logic
    const stats = storage.getUserStats();
    if (stats) {
      stats.lastActiveDate = yesterdayStr;
      storage.saveUserStats(stats);
    }

    // 2. Make some tasks overdue
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 1);
    const overdueDateStr = overdueDate.toISOString().split('T')[0];

    const updatedTasks = tasks.map((t, i) => {
      if (i < 3 && !t.completed) {
        return { ...t, dueDate: overdueDateStr };
      }
      return t;
    });
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);

    alert("Time Warp: System thinks yesterday was your last active day. Reloading to process streaks and daily quests...");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[300]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-indigo-600/20"
      >
        <Settings className={`w-6 h-6 ${isOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-64 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
              <Zap className="w-3 h-3 fill-current" /> Dev Sandbox
            </h3>

            <div className="space-y-3">
              <button 
                onClick={() => setPanicMode(!panicModeActive)}
                className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  panicModeActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> {panicModeActive ? 'Disable Panic' : 'Trigger Panic'}
              </button>

              <button 
                onClick={simulateNextDay}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                <FastForward className="w-3 h-3" /> Simulate Next Day
              </button>

              <button 
                onClick={completeBatchTasks}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3 h-3" /> Complete 5 Tasks
              </button>

              <button 
                onClick={simulateLevelUp}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" /> Level Up
              </button>

              <button 
                onClick={() => { addXP(100); }}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3 h-3" /> +100 XP
              </button>

              <button 
                onClick={resetStreak}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-3 h-3" /> Reset Streak
              </button>

              <button 
                onClick={togglePremium}
                className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  userStats.isPremium 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                <Crown className="w-3 h-3" /> {userStats.isPremium ? 'PRO Active' : 'Toggle PRO'}
              </button>
            </div>

            <p className="mt-6 text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Use these tools to simulate progression and visual effects.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
