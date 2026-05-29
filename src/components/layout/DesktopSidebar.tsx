import { BarChart3, BookOpen, Award, Settings, Crown, Moon, Sun, LogOut, Sparkles, LayoutDashboard, Target, Cat, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';
import { useState } from 'react';
import type { Mode } from './TopBar';
import type { Section } from './MenuDrawer';

interface DesktopSidebarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  activeSection: Section;
  onNavigate: (s: Section) => void;
  onPetPanelOpen?: () => void;
  petVisible?: boolean;
  onTogglePet?: (v: boolean) => void;
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS: { key: Section; icon: typeof BarChart3; label: string }[] = [
  { key: 'analytics', icon: BarChart3, label: 'Analytics' },
  { key: 'subjects', icon: BookOpen, label: 'Subjects' },
  { key: 'achievements', icon: Award, label: 'Achievements' },
  { key: 'settings', icon: Settings, label: 'Settings' },
];

export const DesktopSidebar = ({ mode, onModeChange, activeSection, onNavigate, onPetPanelOpen, petVisible, onTogglePet, open, onClose }: DesktopSidebarProps) => {
  const { user, signOut } = useAuth();
  const { userStats, setShowPremiumModal } = useStudy();
  const [isDark, setIsDark] = useState(() => storage.getTheme() ?? false);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    storage.saveTheme(next);
  };

  const handleNav = (key: Section) => {
    onNavigate(key);
    onClose();
  };

  return (
    <div className="hidden lg:block">
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#0a0c10] shadow-2xl z-50 transform transition-transform duration-300 ease-out border-r border-slate-100 dark:border-slate-800">
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="text-sm font-bold dark:text-white tracking-tight">StudyFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.displayName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold dark:text-white truncate">{user?.displayName || 'Student'}</p>
              <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Level {userStats.level} &middot; {userStats.title}
              </p>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">Mode</p>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            {(['home', 'focus'] as const).map(m => (
              <button key={m} onClick={() => onModeChange(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {m === 'home' ? <LayoutDashboard className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div className="px-3 pt-2 pb-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">Insights</p>
          <div className="space-y-0.5">
            {MENU_ITEMS.map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => handleNav(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === key
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pet */}
        <div className="px-3 pb-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">Companion</p>
          <div className="flex gap-1.5">
            <button onClick={onPetPanelOpen}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Cat className="w-3.5 h-3.5" />
              Pet Panel
            </button>
            <button onClick={() => onTogglePet?.(!petVisible)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={petVisible ? 'Hide pet' : 'Show pet'}
            >
              {petVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Upgrade */}
        <div className="px-3 pb-2">
          <button onClick={() => setShowPremiumModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:from-amber-500/20 hover:to-rose-500/20"
          >
            <Crown className="w-3.5 h-3.5" />
            {userStats.isPremium ? 'Pro Member' : 'Upgrade to Pro'}
            <Sparkles className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button onClick={toggleDark}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
        </>
      )}
    </div>
  );
};
