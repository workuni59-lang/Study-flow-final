import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { StudyProvider, FocusProvider, useStudy } from './context/StudyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PetProvider } from './context/PetContext';
import { PetManager } from './components/pet/PetManager';
import AuthModal from './components/auth/AuthModal';
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

  // Local-only Premium Toggle (for development)
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const params = new URLSearchParams(window.location.search);
    const forcePremium = params.get('premium') === 'true';

    if (isLocal && forcePremium) {
      console.log('💎 Local Premium Mode Enabled');
      syncPremiumStatus(true);
    } else if (profile) {
      syncPremiumStatus(profile.is_premium);
    }
  }, [profile, syncPremiumStatus]);

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
      {!isMobile && <PetManager />}
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
          <PetProvider>
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
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </PetProvider>
        </FocusProvider>
      </StudyProvider>
    </AuthProvider>
  );
}
