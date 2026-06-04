import { memo } from 'react';
import { LayoutDashboard, Target, CheckSquare, BarChart3, PenSquare, Zap } from 'lucide-react';
import type { Mode } from './TopBar';

interface BottomBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onTasksOpen: () => void;
  onStatsOpen: () => void;
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
}

const TabButton = memo(({ active, onClick, icon: Icon, label }: { active?: boolean; onClick: () => void; icon: typeof LayoutDashboard; label: string }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
      active ? 'text-brand' : 'text-slate-400 dark:text-slate-500'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
));

export const BottomBar = memo(({ mode, onModeChange, onTasksOpen, onStatsOpen, onNotepadOpen, onQuestsOpen }: BottomBarProps) => (
  <nav className="bottom-bar lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
    <div className="flex items-center justify-around h-14 px-2">
      <TabButton active={mode === 'home'} onClick={() => onModeChange('home')} icon={LayoutDashboard} label="Home" />
      <TabButton active={mode === 'focus'} onClick={() => onModeChange('focus')} icon={Target} label="Focus" />
      <div className="flex items-center gap-1.5 px-3">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white shadow-sm">
          <Zap className="w-2.5 h-2.5 fill-current" />
        </div>
      </div>
      <TabButton onClick={onTasksOpen} icon={CheckSquare} label="Tasks" />
      {onQuestsOpen && <TabButton onClick={onQuestsOpen} icon={Target} label="Quests" />}
      {onNotepadOpen && <TabButton onClick={onNotepadOpen} icon={PenSquare} label="Notes" />}
      <TabButton onClick={onStatsOpen} icon={BarChart3} label="Stats" />
    </div>
  </nav>
));
