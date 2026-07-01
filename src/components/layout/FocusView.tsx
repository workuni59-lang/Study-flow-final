import { useMemo, memo } from 'react';
import { CheckSquare, Headphones, PenSquare, Target } from 'lucide-react';
import { StudyTimer } from '../dashboard/StudyTimer';
import { StopwatchView } from '../dashboard/StopwatchView';
import { useNavigationContext } from '../../hooks/useNavigationContext';

interface FocusViewProps {
  onTasksOpen: () => void;
  onMusicOpen?: () => void;
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
}

const panelButtons = [
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'ambience', icon: Headphones, label: 'Ambience' },
  { id: 'notes', icon: PenSquare, label: 'Notes' },
  { id: 'quests', icon: Target, label: 'Quests' },
] as const;

export const FocusView = memo(({ onTasksOpen, onMusicOpen, onNotepadOpen, onQuestsOpen }: FocusViewProps) => {
  const { timerId } = useNavigationContext();
  const handlers = useMemo(() => ({
    tasks: onTasksOpen,
    ambience: onMusicOpen,
    notes: onNotepadOpen,
    quests: onQuestsOpen,
  }), [onTasksOpen, onMusicOpen, onNotepadOpen, onQuestsOpen]);

  if (timerId === 'stopwatch') {
    return <StopwatchView />;
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 pb-24 lg:pb-12 text-center min-h-screen">
      {/* Timer — the primary focal point, full width */}
      <div className="w-full max-w-lg mx-auto animate-fade-in-up">
        <StudyTimer compact />
      </div>

      {/* Minimal panel triggers — hidden during active focus via clear mode */}
      <div className="dashboard-stats mt-8 flex flex-wrap justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {panelButtons.map(({ id, icon: Icon, label }) => {
          const handler = handlers[id as keyof typeof handlers];
          if (!handler) return null;
          return (
            <button
              key={id}
              onClick={handler}
              className="btn-ghost text-[11px]"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
