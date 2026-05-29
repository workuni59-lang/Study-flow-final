import { Timer, CheckSquare, Settings } from 'lucide-react';

type MobileTab = 'timer' | 'tasks' | 'settings';

interface MobileNavProps {
  active: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: { key: MobileTab; icon: typeof Timer; label: string }[] = [
  { key: 'timer', icon: Timer, label: 'Timer' },
  { key: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { key: 'settings', icon: Settings, label: 'Settings' },
];

export const MobileNav = ({ active, onTabChange }: MobileNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
    <div className="flex items-center justify-around h-14">
      {TABS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`flex flex-col items-center justify-center gap-0.5 w-20 py-1.5 rounded-lg transition-colors ${
            active === key
              ? 'text-brand'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
        </button>
      ))}
    </div>
  </nav>
);
