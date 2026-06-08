import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Target, CheckCircle2, Circle } from 'lucide-react';
import { Subject, Topic, MasteryLevel } from '../../context/StudyContext';

interface PathToMasteryProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  examTitle: string;
  daysLeft: number;
}

export const PathToMastery = ({ isOpen, onClose, subject, examTitle, daysLeft }: PathToMasteryProps) => {
  const masteryColors = {
    Red: 'bg-rose-500 border-rose-200 dark:border-rose-900',
    Amber: 'bg-amber-500 border-amber-200 dark:border-amber-900',
    Green: 'bg-emerald-500 border-emerald-200 dark:border-emerald-900'
  };

  const calculateProgress = () => {
    if (subject.topics.length === 0) return 0;
    const greenCount = subject.topics.filter(t => t.mastery === 'Green').length;
    const amberCount = subject.topics.filter(t => t.mastery === 'Amber').length;
    return Math.round(((greenCount + amberCount * 0.5) / subject.topics.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Area */}
            <div className="p-6 md:p-10 bg-indigo-600 text-white relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Trophy className="w-24 h-24 rotate-12" />
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-3 block">Path to Mastery</span>
                <h2 className="text-2xl md:text-4xl font-display font-black tracking-tighter mb-4 leading-none">
                  {examTitle}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                    <Target className="w-3.5 h-3.5 text-indigo-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{progress}% Mastery</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest">{daysLeft} Days to go</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              <div className="relative pl-12">
                {/* Vertical Line */}
                <div className="absolute left-[21px] top-2 bottom-2 w-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                
                <div className="space-y-12">
                  {subject.topics.map((topic, index) => (
                    <motion.div 
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Node */}
                      <div className={`absolute -left-[53px] top-0 w-11 h-11 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-lg ${masteryColors[topic.mastery]}`}>
                        {topic.mastery === 'Green' ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-black text-xs">{index + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="text-xl font-display font-black dark:text-white tracking-tight mb-1">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            topic.mastery === 'Green' ? 'text-emerald-500' :
                            topic.mastery === 'Amber' ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {topic.mastery === 'Green' ? 'Mastered' :
                             topic.mastery === 'Amber' ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Goal Node */}
                  <div className="relative">
                    <div className="absolute -left-[53px] top-0 w-11 h-11 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-lg">
                      <Trophy className="w-6 h-6 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-black dark:text-white tracking-tight mb-1 uppercase">
                        Exam Day
                      </h4>
                      <p className="text-xs font-bold text-slate-500">The culmination of your flow.</p>
                    </div>
                  </div>
                </div>
              </div>

              {subject.topics.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Add topics to this subject to see your path to mastery.</p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50">
               <div className="flex items-center justify-between gap-6">
                 <div>
                   <p className="text-xs font-bold text-slate-500 mb-1">Current Focus</p>
                   <p className="text-sm font-black dark:text-white truncate max-w-[200px]">
                     {subject.topics.find(t => t.mastery !== 'Green')?.title || 'Everything Mastered! 🎉'}
                   </p>
                 </div>
                 <button 
                  onClick={onClose}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/10"
                 >
                   Keep Flowing
                 </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
