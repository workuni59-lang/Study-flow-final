import { Link, NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, Award, Settings, Crown, LogOut, Sparkles, LayoutDashboard, Target, Cat, Eye, EyeOff, Zap, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { BadgeSvg, formatXP, type BadgeTier } from '../progression/BadgeSvg';
import { ROUTES } from '../../lib/routes';
import type { Mode } from './TopBar';
import type { Section } from './MenuDrawer';
import { ENABLE_PETS } from '../../config/features';

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

const BADGE_TIER: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const MENU_ITEMS: { key: Section; icon: typeof BarChart3; label: string }[] = [
  { key: 'analytics', icon: BarChart3, label: 'Analytics' },
  { key: 'quests', icon: Target, label: 'Quests' },
  { key: 'subjects', icon: BookOpen, label: 'Subjects' },
  { key: 'achievements', icon: Award, label: 'Achievements' },
  { key: 'settings', icon: Settings, label: 'Settings' },
];

export const DesktopSidebar = ({ mode, onModeChange, activeSection, onNavigate, onPetPanelOpen, petVisible, onTogglePet, open, onClose }: DesktopSidebarProps) => {
  const { user, signOut } = useAuth();
  const { userStats, progression, setShowPremiumModal } = useStudy();

  const handleNav = (key: Section) => {
    onNavigate(key);
    onClose();
  };

  return (
    <div className="hidden lg:block">
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <aside className="sidebar fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#0a0c10] shadow-2xl z-50 transform transition-transform duration-300 ease-out border-r border-slate-100 dark:border-slate-800">
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 mb-4" onClick={onClose}>
            <img src="/logo.png" alt="StudyFlow" className="w-8 h-8 object-contain" />
            <span className="text-sm font-bold dark:text-white tracking-tight">StudyFlow</span>
          </Link>
          <Link to={ROUTES.PROFILE(user?.uid || 'me')} className="flex items-center gap-3 cursor-pointer" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.displayName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold dark:text-white truncate">{user?.displayName || 'Student'}</p>
              <p className="text-[9px] font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {progression.rank.icon} Level {progression.level} &middot; {progression.rank.title}
              </p>
            </div>
          </Link>
        </div>

        {/* Mode toggle */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-2 px-1">Mode</p>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            {(['home', 'focus'] as const).map(m => (
              <Link key={m} to={m === 'focus' ? ROUTES.FOCUS : ROUTES.HOME} onClick={onClose}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 dark:text-slate-500'
                }`}
              >
                {m === 'home' ? <LayoutDashboard className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                {m}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div className="px-3 pt-2 pb-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-2 px-1">Insights</p>
          <div className="space-y-0.5">
            {/* Progression Badge Widget */}
            <NavLink to={ROUTES.PROGRESSION} onClick={onClose}
              className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {(() => {
                const hb = PROGRESSION_BADGES.filter(b => progression.level >= b.levelRequired).pop();
                const t = hb ? (BADGE_TIER[hb.id] ?? 'bronze') : 'bronze';
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <BadgeSvg tier={t} size={28} unlocked={true} />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2, color: activeSection === 'progression' ? 'rgb(99,102,241)' : undefined }}>
                        {progression.rank.icon} {progression.rank.title}
                      </div>
                      <div style={{ fontSize: '9px', color: 'rgba(148,163,184,0.6)', marginTop: '1px' }}>
                        Lv. {progression.level}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '36px', height: '4px', background: 'rgba(148,163,184,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, rgb(99,102,241), rgb(139,92,246))', borderRadius: '2px', transform: `scaleX(${progression.percentage / 100})`, transformOrigin: 'left' }} />
                      </div>
                      <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(148,163,184,0.4)' }}>{progression.percentage}%</span>
                    </div>
                  </div>
                );
              })()}
            </NavLink>

            {MENU_ITEMS.map(({ key, icon: Icon, label }) => (
              <NavLink key={key} to={ROUTES[key.toUpperCase() as keyof typeof ROUTES] as string} onClick={onClose}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Pet */}
        {ENABLE_PETS && (
          <div className="px-3 pb-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-2 px-1">Companion</p>
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
        )}

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
