import { CheckSquare, Headphones, PenSquare, Zap, Target } from 'lucide-react';
import { StudyTimer } from '../dashboard/StudyTimer';
import { DeadlinesSection } from '../dashboard/DeadlinesSection';

interface FocusViewProps {
  onTasksOpen: () => void;
  onMusicOpen?: () => void;
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
}

export const FocusView = ({ onTasksOpen, onMusicOpen, onNotepadOpen, onQuestsOpen }: FocusViewProps) => (
  <div className="flex flex-col items-center px-4 pt-4 pb-28 lg:pb-8 text-center min-h-screen">
    <StudyTimer compact />

    {/* Panel triggers */}
    <div className="dashboard-stats mt-6 flex gap-3">
      <button onClick={onTasksOpen}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium active:scale-95 transition-transform"
      >
        <CheckSquare className="w-4 h-4" />
        Tasks
      </button>
      <button onClick={onMusicOpen}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium active:scale-95 transition-transform"
      >
        <Headphones className="w-4 h-4" />
        Ambience
      </button>
      {onNotepadOpen && (
        <button onClick={onNotepadOpen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium active:scale-95 transition-transform"
        >
          <PenSquare className="w-4 h-4" />
          Notes
        </button>
      )}
      {onQuestsOpen && (
        <button onClick={onQuestsOpen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium active:scale-95 transition-transform"
        >
          <Target className="w-4 h-4" />
          Quests
        </button>
      )}
      </div>

      {/* Deadlines */}
      <div className="dashboard-stats mt-6 w-full max-w-sm">
        <DeadlinesSection />
      </div>

      {/* Brand watermark */}
      <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-15 pointer-events-none">
        <img src="/logo.png" alt="" className="w-4 h-4 object-contain grayscale" />
        <span className="text-[9px] font-bold dark:text-white tracking-tight">StudyFlow</span>
      </div>
    </div>
);
