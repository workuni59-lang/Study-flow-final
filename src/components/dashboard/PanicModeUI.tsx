import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, X, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const PanicModeUI = () => {
  const { panicModeActive, setPanicMode, tasks, toggleTask, exams, setSelectedExamForPath } = useStudy();
  
  // Local state to keep track of tasks specifically for this view
  const [highYieldTasks, setHighYieldTasks] = useState(() => 
    tasks.filter(t => t.priority === 'High Yield' && !t.completed)
  );

  useEffect(() => {
    setHighYieldTasks(tasks.filter(t => t.priority === 'High Yield' && !t.completed));
  }, [tasks]);

  const handleNextMilestone = () => {
    // 1. Find the closest exam
    if (exams.length > 0) {
      const closest = [...exams].sort((a, b) => a.daysLeft - b.daysLeft)[0];
      // 2. Open its Path to Mastery
      setSelectedExamForPath(closest);
      // 3. Exit Panic Mode overlay to show the Roadmap
      setPanicMode(false);
    } else {
      alert("No exams found to track milestones!");
    }
  };

  return (
    <AnimatePresence>
      {panicModeActive && (
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[600] bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden"
        >
          {/* Background Glitch Effect */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.2),transparent_70%)]" />
             <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          </div>

          <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
            <header className="text-center mb-12">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(225,29,72,0.4)]"
              >
                <AlertTriangle className="w-10 h-10" />
              </motion.div>
              <h1 className="text-5xl font-display font-black uppercase tracking-tighter mb-4 text-rose-500">Panic Mode Active</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">Exam is in less than 24 hours. Focus only on High Yield.</p>
            </header>

            <div className="w-full space-y-4 mb-12 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3 sticky top-0 bg-slate-950 py-2">
                <div className="h-px flex-1 bg-slate-800" />
                Critical Tasks Only
                <div className="h-px flex-1 bg-slate-800" />
              </h3>

              {highYieldTasks.length > 0 ? (
                highYieldTasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-slate-900 border border-rose-500/20 p-6 rounded-[24px] flex items-center justify-between group hover:border-rose-500/50 transition-all shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-lg leading-tight truncate">{task.title}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{task.category}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center group-hover:border-rose-500 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-6 h-6 text-slate-700 group-hover:text-rose-500" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-12 bg-slate-900/50 rounded-[32px] border border-dashed border-slate-800">
                  <p className="text-slate-500 font-bold italic">No critical tasks remaining. You're ready.</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setPanicMode(false)}
                className="flex-1 py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Exit Panic
              </button>
              <button 
                onClick={handleNextMilestone}
                className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(225,29,72,0.3)]"
              >
                Next Milestone <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cinematic Bottom Text */}
          <div className="absolute bottom-10 left-0 right-0 text-center opacity-20 flex items-center justify-center gap-8 px-6">
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audio: High Tension (Active)</span>
             <div className="w-1 h-1 rounded-full bg-white hidden md:block" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] hidden md:block">Visual: Slate Minimal (Forced)</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
