import { CheckSquare, Headphones, PenSquare, Zap } from 'lucide-react';
import { StudyTimer } from '../dashboard/StudyTimer';
import { DeadlinesSection } from '../dashboard/DeadlinesSection';

interface FocusViewProps {
  onTasksOpen: () => void;
  onMusicOpen?: () => void;
  onNotepadOpen?: () => void;
}

export const FocusView = ({ onTasksOpen, onMusicOpen, onNotepadOpen }: FocusViewProps) => (
  <div className="flex flex-col items-center px-4 pt-4 pb-28 lg:pb-8 text-center min-h-screen">
    <StudyTimer compact />

    {/* Panel triggers */}
    <div className="mt-6 flex gap-3">
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
      </div>

      {/* Deadlines */}
      <div className="mt-6 w-full max-w-sm">
        <DeadlinesSection />
      </div>

      {/* Brand watermark */}
      <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-15 pointer-events-none">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white">
          <Zap className="w-2.5 h-2.5 fill-current" />
        </div>
        <span className="text-[9px] font-bold dark:text-white tracking-tight">StudyFlow</span>
      </div>
    </div>
);
