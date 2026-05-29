import { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { StudyProvider } from '../../context/StudyContext';
import AuthModal from '../auth/AuthModal';
import { PremiumModal } from '../modals/PremiumModal';
import { MobileNav } from './MobileNav';
import { MobileDashboard } from './MobileDashboard';
import { MobileTasks } from './MobileTasks';
import { MobileSettings } from './MobileSettings';

type MobileTab = 'timer' | 'tasks' | 'settings';

const MobileAppShell = () => {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<MobileTab>('timer');
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white dark:bg-[#0a0c10]">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-white dark:bg-[#0a0c10] px-6 text-center">
        <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-display font-bold dark:text-white mb-2">StudyFlow</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          Focus timer & study dashboard — optimized for mobile.
        </p>
        <button onClick={() => setAuthOpen(true)}
          className="bg-brand text-white px-10 py-3.5 rounded-2xl text-base font-semibold shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="relative">
      {tab === 'timer' && <MobileDashboard />}
      {tab === 'tasks' && <MobileTasks />}
      {tab === 'settings' && <MobileSettings />}
      <MobileNav active={tab} onTabChange={setTab} />
      <PremiumModal />
    </div>
  );
};

export const MobileApp = () => (
  <AuthProvider>
    <StudyProvider>
      <MobileAppShell />
    </StudyProvider>
  </AuthProvider>
);
