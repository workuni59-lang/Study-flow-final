import { BarChart3, BookOpen, Award, Settings, Crown, LogOut, Sparkles, Zap, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
export type Section = 'dashboard' | 'subjects' | 'achievements' | 'analytics' | 'settings' | 'quests' | 'progression';

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

  const handleNav = (key: Section) => {
    onNavigate(key);
    onClose();
  };

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden">
            <div className="flex flex-col h-full">
              {/* Brand */}
              <div className="px-5 pt-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="StudyFlow" className="w-7 h-7 object-contain" />
                  <span className="text-sm font-bold dark:text-white tracking-tight">StudyFlow</span>
                </div>
              </div>

              {/* Header */}
              <div className="px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {user?.displayName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-white">{user?.displayName || 'Student'}</p>
                    <p className="text-[9px] font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {progression.rank.icon} Level {progression.level} &middot; {progression.rank.title}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowPremiumModal(true); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400"
                >
                  <Crown className="w-3.5 h-3.5" />
                  {userStats.isPremium ? 'Pro Member' : 'Upgrade to Pro'}
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
                {/* Progression Badge Widget */}
                <button onClick={() => handleNav('progression')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeSection === 'progression'
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
                          <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>
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
                </button>

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

              {/* Bottom */}
              <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
