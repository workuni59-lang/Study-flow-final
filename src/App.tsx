import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { StudyProvider, FocusProvider, useStudy } from './context/StudyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import PrivacyPage from './components/legal/PrivacyPage';
import TermsPage from './components/legal/TermsPage';
import { supabase } from './lib/supabase';
import { useReduceMotion } from './hooks/useReduceMotion';
import { MetaUpdater } from './components/navigation/MetaUpdater';

const MainLayout = lazy(() => import('./components/layout/MainLayout').then(m => ({ default: m.MainLayout })));
const MobileLayout = lazy(() => import('./components/layout/MobileLayout').then(m => ({ default: m.MobileLayout })));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));

const MobileSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0c10]">
    <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
  </div>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

const AppContent = () => {
  const { user, profile, loading: authLoading, activateDemo } = useAuth();
  const { syncPremiumStatus } = useStudy();
  const isMobile = useIsMobile();
  const reduceMotion = useReduceMotion();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const handleOpenAuth = () => setAuthModalOpen(true);
  const handleStartDemo = () => activateDemo();

  // Always apply dark mode (theming handled by atmospheres + wallpapers)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Sync premium status from profile
  useEffect(() => {
    if (!profile) return;
    syncPremiumStatus(profile.is_premium);
  }, [profile, syncPremiumStatus]);

  // Periodic premium refresh (every 5 min + on visibility change)
  useEffect(() => {
    if (!user || user.uid === 'demo-user-001') return;

    const refresh = async () => {
      const { data } = await supabase!
        .from('profiles')
        .select('is_premium, premium_until')
        .eq('id', user.uid)
        .single();
      if (data) {
        // Check if premium_until has passed
        const until = data.premium_until ? new Date(data.premium_until).getTime() : 0;
        const isStillPremium = data.is_premium && (until === 0 || until > Date.now());
        syncPremiumStatus(isStillPremium);
      }
    };

    const interval = setInterval(refresh, 5 * 60 * 1000);
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user, syncPremiumStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      window.location.reload();
    }
  }, []);

  if (authLoading) return <MobileSpinner />;

  if (!user) {
    return (
      <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
        <Suspense fallback={<MobileSpinner />}>
          <LandingPage onOpenAuth={handleOpenAuth} onStartDemo={handleStartDemo} />
        </Suspense>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      <MetaUpdater />
      <Suspense fallback={<MobileSpinner />}>
        {isMobile ? <MobileLayout onOpenAuth={handleOpenAuth} /> : <MainLayout onOpenAuth={handleOpenAuth} />}
      </Suspense>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </MotionConfig>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <FocusProvider>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/profile/:id" element={<AppContent />} />
            <Route path="/analytics" element={<AppContent />} />
            <Route path="/progress" element={<AppContent />} />
            <Route path="/quests" element={<AppContent />} />
            <Route path="/subjects" element={<AppContent />} />
            <Route path="/achievements" element={<AppContent />} />
            <Route path="/leaderboard" element={<AppContent />} />
            <Route path="/settings" element={<AppContent />} />
            <Route path="/themes" element={<AppContent />} />
            <Route path="/pomodoro" element={<AppContent />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </FocusProvider>
      </StudyProvider>
    </AuthProvider>
  );
}
