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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-base font-display font-semibold dark:text-white/90">Deadlines</h3>
        </div>
        <button 
          onClick={onAdd}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-brand"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
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
                className="relative pl-5 border-l-2 border-slate-100 dark:border-slate-800/40 last:pb-0 pb-4 group"
              >
                <div className="absolute -left-[8px] top-0 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-rose-400" />
                <div className="flex justify-between items-start mb-1 gap-3">
                  <h4 className="font-medium dark:text-white/90 text-sm leading-tight truncate">{exam.subject}</h4>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-rose-500">{exam.daysLeft}d</span>
                    <button 
                      onClick={() => onDelete(exam.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-medium tracking-wide text-slate-400">{exam.type}</span>
                  {progress !== null && (
                    <span className="text-[9px] font-medium tracking-wide text-emerald-500">· {progress}% mastered</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Clock className="w-3 h-3" />
                  {exam.date}
                </div>

                {exam.subjectId && (
                  <button 
                    onClick={() => onViewPath(exam)}
                    className="w-full mt-3 py-2 bg-brand/5 text-brand/70 rounded-xl text-[9px] font-medium tracking-wide hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-1.5 border border-brand/10"
                  >
                    <Map className="w-3 h-3" /> View Path
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {exams.length === 0 && (
          <div className="py-6 text-center border border-dashed border-slate-100 dark:border-slate-800/40 rounded-2xl">
            <p className="text-slate-400 text-xs font-medium">No deadlines yet</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={onAdd}
        className="w-full mt-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 rounded-xl text-[9px] font-medium tracking-wide hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Add Deadline
      </button>
    </DashboardCard>
  );
};
