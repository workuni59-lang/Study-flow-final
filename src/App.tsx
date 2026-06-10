import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { StudyProvider, FocusProvider, useStudy } from './context/StudyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import { useReduceMotion } from './hooks/useReduceMotion';
import { MetaUpdater } from './components/navigation/MetaUpdater';

const MainLayout = lazy(() => import('./components/layout/MainLayout').then(m => ({ default: m.MainLayout })));
const MobileLayout = lazy(() => import('./components/layout/MobileLayout').then(m => ({ default: m.MobileLayout })));

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
  const { user, profile, loading: authLoading } = useAuth();
  const { syncPremiumStatus } = useStudy();
  const isMobile = useIsMobile();
  const reduceMotion = useReduceMotion();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const handleOpenAuth = () => setAuthModalOpen(true);

  // Always apply dark mode (theming handled by atmospheres + wallpapers)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (profile) {
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
            <Route path="/profile/:id" element={<AppContent />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </FocusProvider>
      </StudyProvider>
    </AuthProvider>
  );
}
