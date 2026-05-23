import React from 'react';
import { Calendar, Clock, Plus, Trash2, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Exam {
  id: string;
  subject: string;
  type: string;
  date: string;
  daysLeft: number;
  subjectId?: string; // Link to Subject
}

interface UpcomingExamsProps {
  exams: Exam[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onViewPath: (exam: Exam) => void;
}

import { DashboardCard } from './DashboardCard';
import { useStudy } from '../../context/StudyContext';

export const UpcomingExams = ({ exams, onDelete, onAdd, onViewPath }: UpcomingExamsProps) => {
  const { subjects } = useStudy();

  const getProgress = (subjectId?: string) => {
    if (!subjectId) return null;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject || subject.topics.length === 0) return null;
    const greenCount = subject.topics.filter(t => t.mastery === 'Green').length;
    const amberCount = subject.topics.filter(t => t.mastery === 'Amber').length;
    return Math.round(((greenCount + amberCount * 0.5) / subject.topics.length) * 100);
  };

  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-display font-black dark:text-white">Deadlines</h3>
        </div>
        <button 
          onClick={onAdd}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-indigo-600 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {exams.map((exam) => {
            const progress = getProgress(exam.subjectId);
            return (
              <motion.div 
                layout
                key={exam.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 last:pb-0 pb-6 group"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-rose-500" />
                <div className="flex justify-between items-start mb-1 gap-4">
                  <h4 className="font-bold dark:text-white text-base md:text-lg leading-tight truncate">{exam.subject}</h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-rose-500 uppercase tracking-tighter">{exam.daysLeft}d</span>
                    <button 
                      onClick={() => onDelete(exam.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <p className="editorial-label !text-[10px] uppercase tracking-widest">{exam.type}</p>
                  {progress !== null && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
                       <span className="text-[8px] font-black">{progress}% Mastery</span>
                    </div>
                  )}
                </div>

                {progress !== null && (
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {exam.date} • 09:00 AM
                </div>

                {exam.subjectId && (
                  <button 
                    onClick={() => onViewPath(exam)}
                    className="w-full mt-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-800/50"
                  >
                    <Map className="w-3 h-3" /> View Path to Mastery
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {exams.length === 0 && (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium">No deadlines. Time to relax!</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={onAdd}
        className="w-full mt-8 py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Deadline
      </button>
    </DashboardCard>
  );
};
