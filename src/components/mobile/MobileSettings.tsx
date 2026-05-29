import { useState, useEffect } from 'react';
import { LogOut, Moon, Sun, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';

export const MobileSettings = () => {
  const { user, signOut } = useAuth();
  const { setShowPremiumModal } = useStudy();
  const [isDark, setIsDark] = useState(() => storage.getTheme() ?? false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    storage.saveTheme(isDark);
  }, [isDark]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0c10]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-display font-semibold dark:text-white">Settings</h1>
      </div>

      <div className="px-4 space-y-2 pb-24">
        {/* Profile card */}
        <div className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
            {user?.displayName?.charAt(0) || 'S'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold dark:text-white">{user?.displayName || 'Student'}</p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Dark mode */}
        <button onClick={() => setIsDark(d => !d)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
        >
          {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span className="flex-1 text-sm font-medium text-left dark:text-white">Dark Mode</span>
          <div className={`w-10 h-6 rounded-full transition-colors ${isDark ? 'bg-brand' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${isDark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
        </button>

        {/* Upgrade to Pro */}
        <button onClick={() => setShowPremiumModal(true)}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-200 dark:border-amber-500/20 active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Upgrade to Pro</p>
            <p className="text-[10px] font-medium text-amber-600/70 dark:text-amber-500/70">Unlock all features</p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </button>

        {/* Sign out */}
        <button onClick={() => signOut()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:bg-rose-500/10 transition-colors mt-4"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
