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

const NavTabButton = memo(({ to, icon: Icon, label, end = false }: { to: string; icon: any; label: string; end?: boolean }) => (
  <NavLink to={to} end={end}
    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
      isActive ? 'text-brand' : 'text-slate-600 dark:text-slate-400'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </NavLink>
));

const ActionTabButton = memo(({ onClick, icon: Icon, label }: { onClick: () => void; icon: any; label: string }) => (
  <button onClick={onClick}
    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
  >
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
));

export const BottomBar = memo(({ mode, onModeChange, onTasksOpen, onStatsOpen, onMenuOpen, onNotepadOpen, onQuestsOpen }: BottomBarProps) => (
  <nav className="bottom-bar lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
    <div className="flex items-center justify-around h-14 px-1">
      <NavTabButton to={ROUTES.HOME} end icon={LayoutDashboard} label="Home" />
      <NavTabButton to={ROUTES.FOCUS} icon={Target} label="Focus" />
      
      <ActionTabButton onClick={onTasksOpen} icon={CheckSquare} label="Tasks" />
      <ActionTabButton onClick={onStatsOpen} icon={BarChart3} label="Stats" />
      <ActionTabButton onClick={onMenuOpen} icon={Menu} label="Menu" />
    </div>
  </nav>
));
