import { NavLink, Link } from 'react-router-dom';
import { BarChart3, BookOpen, Award, Settings, Crown, LogOut, Sparkles, Zap, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { ROUTES } from '../../lib/routes';
export type Section = 'dashboard' | 'subjects' | 'achievements' | 'analytics' | 'settings' | 'quests' | 'progression' | 'leaderboard' | 'profile' | 'pomodoro';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
  activeSection: Section;
  onNavigate: (s: Section) => void;
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

import { motion, AnimatePresence } from 'motion/react';
import { NavLink, Link } from 'react-router-dom';
import { BarChart3, BookOpen, Award, Settings, Crown, LogOut, Sparkles, Zap, Target, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { ROUTES } from '../../lib/routes';
export type Section = 'dashboard' | 'subjects' | 'achievements' | 'analytics' | 'settings' | 'quests' | 'progression' | 'leaderboard' | 'profile' | 'pomodoro';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
  activeSection: Section;
  onNavigate: (s: Section) => void;
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

export const MenuDrawer = ({ open, onClose, activeSection, onNavigate }: MenuDrawerProps) => {
  const { user, signOut } = useAuth();
  const { userStats, progression, setShowPremiumModal } = useStudy();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100 || info.velocity.x < -500) {
                onClose();
              }
            }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full pt-safe">
              {/* Header with Close */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <Link to={ROUTES.HOME} className="flex items-center gap-2.5" onClick={onClose}>
                  <img src="/logo.png" alt="StudyFlow" className="w-7 h-7 object-contain" />
                  <span className="text-sm font-bold dark:text-white tracking-tight">StudyFlow</span>
                </Link>
                <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
                <Link to={ROUTES.PROFILE(user?.uid || 'me')} className="flex items-center gap-3 mb-4" onClick={onClose}>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {user?.displayName?.charAt(0) || 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold dark:text-white truncate">{user?.displayName || 'Student'}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {progression.rank.icon} Lv. {progression.level} &middot; {progression.rank.title}
                    </p>
                  </div>
                </Link>
                <button onClick={() => { setShowPremiumModal(true); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-200/50 dark:border-amber-500/20 text-[11px] font-bold text-amber-700 dark:text-amber-400"
                >
                  <Crown className="w-3.5 h-3.5" />
                  {userStats.isPremium ? 'Pro Member' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
                <NavLink to={ROUTES.PROGRESSION} onClick={onClose}
                  className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {(() => {
                    const hb = PROGRESSION_BADGES.filter(b => progression.level >= b.levelRequired).pop();
                    const t = hb ? (BADGE_TIER[hb.id] ?? 'bronze') : 'bronze';
                    return (
                      <div className="flex items-center gap-3 w-full">
                        <BadgeSvg tier={t} size={32} unlocked={true} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold leading-tight truncate">
                            {progression.rank.icon} {progression.rank.title}
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progression.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </NavLink>

                {MENU_ITEMS.map(({ key, icon: Icon, label }) => (
                  <NavLink key={key} to={ROUTES[key.toUpperCase() as keyof typeof ROUTES] as string} onClick={onClose}
                    className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand/10 text-brand'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {label}
                  </NavLink>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
