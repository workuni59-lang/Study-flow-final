import { useState } from 'react';
import { AlertTriangle, Plus, Trash2, Calendar } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { AddExamModal } from './AddExamModal';

export const DeadlinesSection = () => {
  const { exams, addExam, deleteExam } = useStudy();
  const [showModal, setShowModal] = useState(false);

  const sorted = [...exams].sort((a, b) => a.daysLeft - b.daysLeft);

  const content = (
    <>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Deadlines</span>
        </div>
        <button onClick={() => setShowModal(true)}
          className="p-1 text-red-400 hover:text-red-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        {sorted.length === 0 ? (
          <button onClick={() => setShowModal(true)}
            className="w-full py-4 text-center border border-dashed border-red-200 dark:border-red-500/20 rounded-xl text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
          >
            Add a deadline
          </button>
        ) : (
          sorted.map(exam => (
            <div key={exam.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
                exam.daysLeft <= 3
                  ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25'
                  : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/15'
              }`}
            >
              <Calendar className={`w-3 h-3 shrink-0 ${exam.daysLeft <= 3 ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${exam.daysLeft <= 3 ? 'text-red-800 dark:text-red-200' : 'text-slate-700 dark:text-slate-300'}`}>
                  {exam.subject}
                </p>
                <p className={`text-[8px] font-medium ${exam.daysLeft <= 3 ? 'text-red-500/70' : 'text-slate-600 dark:text-slate-400'}`}>
                  {exam.type} &middot; {exam.date}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  exam.daysLeft <= 3
                    ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                    : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                }`}>
                  {exam.daysLeft}d
                </span>
                <button onClick={() => deleteExam(exam.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: inline */}
      <div className="lg:hidden w-full max-w-sm">
        {content}
      </div>
      {/* Desktop: fixed right panel */}
      <div className="hidden lg:block fixed top-24 right-6 z-20 w-72 max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar bg-white/60 dark:bg-[#0a0c10]/60 backdrop-blur-2xl rounded-2xl p-4 border border-red-200/50 dark:border-red-500/15 shadow-lg shadow-red-500/5">
        {content}
      </div>
      <AddExamModal isOpen={showModal} onClose={() => setShowModal(false)} onAdd={addExam} />
    </>
  );
};
