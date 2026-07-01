import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, CheckSquare, BarChart3, PenSquare, Zap, Menu } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import type { Mode } from './TopBar';

interface BottomBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onTasksOpen: () => void;
  onStatsOpen: () => void;
  onMenuOpen: () => void;
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
}

const NavTabButton = memo(({ to, icon: Icon, label, end = false, tourTarget }: { to: string; icon: any; label: string; end?: boolean; tourTarget?: string }) => (
  <NavLink to={to} end={end} data-tour-target={tourTarget}
    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
      isActive ? 'text-brand' : 'text-slate-500 dark:text-slate-300'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </NavLink>
));

const ActionTabButton = memo(({ onClick, icon: Icon, label, tourTarget }: { onClick: () => void; icon: any; label: string; tourTarget?: string }) => (
  <button onClick={onClick} data-tour-target={tourTarget}
    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors text-slate-500 dark:text-slate-300"
  >
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
));

export const BottomBar = memo(({ mode, onModeChange, onTasksOpen, onStatsOpen, onMenuOpen, onNotepadOpen, onQuestsOpen }: BottomBarProps) => (
  <nav className="bottom-bar lg:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-around h-14 px-1">
      <NavTabButton to={ROUTES.HOME} end icon={LayoutDashboard} label="Home" />
      <NavTabButton to={ROUTES.FOCUS} icon={Target} label="Focus" tourTarget="focus" />
      
      <ActionTabButton onClick={onTasksOpen} icon={CheckSquare} label="Tasks" />
      <ActionTabButton onClick={onStatsOpen} icon={BarChart3} label="Stats" tourTarget="leaderboard" />
      <ActionTabButton onClick={onMenuOpen} icon={Menu} label="Menu" />
    </div>
    {/* Safe-area spacer — prevents nav content from sitting behind system UI */}
    <div className="w-full" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
  </nav>
));
