import { useState, lazy, Suspense, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { TopBar, type Mode } from './TopBar';
import { useNavigationContext, type Panel } from '../../hooks/useNavigationContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { ROUTES } from '../../lib/routes';
import { BottomBar } from './BottomBar';
const FocusEnvironmentLazy = lazy(() => import('./FocusEnvironment').then(m => ({ default: m.FocusEnvironment })));
const HomeViewLazy = lazy(() => import('./HomeView').then(m => ({ default: m.HomeView })));
import { MenuDrawer, type Section } from './MenuDrawer';
import { DesktopSidebar } from './DesktopSidebar';
import { FloatingPanel } from '../panels/FloatingPanel';
import { AmbiencePanel, type CuratedPlaylist } from '../panels/AmbiencePanel';
import { NotesPanel } from '../panels/NotesPanel';

import { TasksPanel } from '../panels/TasksPanel';
import { PremiumModal } from '../modals/PremiumModal';
import { DemoSignUpNudge } from '../notifications/DemoSignUpNudge';
import { AchievementNotification } from '../notifications/AchievementNotification';
import { Confetti } from '../notifications/Confetti';
import { LevelUpModal } from '../modals/LevelUpModal';
import { PanicModeUI } from '../dashboard/PanicModeUI';
import { WallpaperEngine } from '../navigation/WallpaperEngine';
import { CustomCursor } from './CustomCursor';
import { ScrollProgress } from './ScrollProgress';
import { storage } from '../../services/storage';
import { DashboardSkeleton, ContentSkeleton } from '../ui/skeleton';

const AnalyticsDashboardLazy = lazy(() => import('../analytics/AnalyticsDashboard'));
const SubjectsViewLazy = lazy(() => import('../subjects/SubjectsView').then(m => ({ default: m.SubjectsView })));
const AchievementsViewLazy = lazy(() => import('../achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const SettingsViewLazy = lazy(() => import('../navigation/SettingsView').then(m => ({ default: m.SettingsView })));
const QuestsViewLazy = lazy(() => import('../quests/QuestsView').then(m => ({ default: m.QuestsView })));
const ProgressionViewLazy = lazy(() => import('../progression/ProgressionView').then(m => ({ default: m.ProgressionView })));
const LeaderboardViewLazy = lazy(() => import('../leaderboard/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const ProfileViewLazy = lazy(() => import('../profile/ProfileView').then(m => ({ default: m.ProfileView })));
const PomodoroLandingLazy = lazy(() => import('../pomodoro/PomodoroLanding').then(m => ({ default: m.PomodoroLanding })));

const SimpleSpinner = () => <DashboardSkeleton />;

interface MainLayoutProps {
  onOpenAuth?: () => void;
}

export const MainLayout = ({ onOpenAuth }: MainLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userStats, gameLevel, levelUpEvent, dismissLevelUp, activeNotification, confettiActive, closeNotification } = useStudy();
  const { mode, section, activePanel, profileId: profileUserId, ambienceTab } = useNavigationContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [ambienceUrl, setAmbienceUrl] = useState<CuratedPlaylist | null>(null);
  const [spotlightSubjectId, setSpotlightSubjectId] = useState<string | null>(null);

  const setMode = (m: Mode) => {
    navigate(m === 'focus' ? ROUTES.FOCUS : ROUTES.HOME);
  };

  const setSection = (s: Section) => {
    if (s === 'dashboard') {
      setMode(mode);
      return;
    }
    const routeKey = s.toUpperCase() as keyof typeof ROUTES;
    const path = s === 'profile' ? ROUTES.PROFILE(user?.uid || 'me') : ROUTES[routeKey];
    if (typeof path === 'string') navigate(path);
  };

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const handleViewProfile = (userId: string) => {
    navigate(ROUTES.PROFILE(userId));
  };

  const handleEditProfile = () => {
    navigate(ROUTES.SETTINGS);
  };

  // Stable callbacks for memo'd children
  const handleMenuOpen = useCallback(() => setMenuOpen(v => !v), []);
  const handleLeaderboardOpen = useCallback(() => setSection('leaderboard'), []);
  const handleProfileOpen = useCallback(() => handleViewProfile(user?.uid || 'me'), [user?.uid]);
  const handleTasksOpen = useCallback(() => {
    navigate(modeRef.current === 'focus' ? ROUTES.FOCUS_TASKS : ROUTES.TASKS);
  }, [navigate]);
  const handleMusicOpen = useCallback(() => {
    navigate(modeRef.current === 'focus' ? ROUTES.FOCUS_AMBIENCE : ROUTES.AMBIENCE);
  }, [navigate]);
  const handleNotepadOpen = useCallback(() => {
    navigate(modeRef.current === 'focus' ? ROUTES.FOCUS_NOTEPAD : ROUTES.NOTEPAD);
  }, [navigate]);
  const handleStatsOpen = useCallback(() => navigate(ROUTES.ANALYTICS), []);
  const handleQuestsOpen = useCallback(() => setSection('quests'), []);
  const handleSubjectsOpen = useCallback((subjectId?: string) => {
    if (subjectId) setSpotlightSubjectId(subjectId);
    setSection('subjects');
  }, []);
  const handleClosePanel = useCallback(() => {
    navigate(modeRef.current === 'focus' ? ROUTES.FOCUS : ROUTES.HOME);
  }, [navigate]);

  useKeyboardShortcuts({
    onTasksOpen: handleTasksOpen,
    onMusicOpen: handleMusicOpen,
    onNotepadOpen: handleNotepadOpen,
    onClosePanel: handleClosePanel,
  });

  useEffect(() => {
    if (levelUpEvent) {
      setShowLevelUp(true);
    }
  }, [levelUpEvent]);

  const isFullView = section !== 'dashboard';
  const skipWallpaper = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4;

  return (
    <div className="min-h-screen relative transition-colors duration-1000 noise-overlay" style={{ backgroundColor: section === 'dashboard' ? 'transparent' : '#0f0f1a' }}>
      <CustomCursor />
      <ScrollProgress />
      {!skipWallpaper && <WallpaperEngine visible={section === 'dashboard'} />}

      {/* Desktop sidebar (slide-in overlay on lg+) */}
      <DesktopSidebar
        mode={mode}
        onModeChange={setMode}
        activeSection={section}
        onNavigate={setSection}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Main content area (no sidebar offset) */}
      <div>
        <AnimatePresence mode="wait">
          {section === 'pomodoro' ? (
            <motion.main key="pomodoro" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="main-layout-content">
              <Suspense fallback={<SimpleSpinner />}>
                <PomodoroLandingLazy />
              </Suspense>
            </motion.main>
          ) : isFullView ? (
            <motion.div key={'full-' + section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="min-h-screen">
              <header className="top-bar sticky top-0 z-30 bg-white/70 dark:bg-[#0a0c10]/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 h-14 px-4">
                  <button onClick={() => setSection('dashboard')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-sm font-semibold dark:text-white capitalize">{section}</span>
                </div>
              </header>
              <main className="main-layout-content p-4 md:p-8 xl:p-10 pb-24 lg:pb-8">
                <Suspense fallback={<SimpleSpinner />}>
                  {section === 'progression' && <ProgressionViewLazy />}
                  {section === 'analytics' && <AnalyticsDashboardLazy />}
                  {section === 'quests' && <QuestsViewLazy />}
                  {section === 'subjects' && <SubjectsViewLazy key={spotlightSubjectId ?? 'default'} initialSubjectId={spotlightSubjectId ?? undefined} />}
                  {section === 'achievements' && <AchievementsViewLazy />}
                  {section === 'settings' && <SettingsViewLazy />}
                  {section === 'leaderboard' && <LeaderboardViewLazy onViewProfile={handleViewProfile} />}
                  {section === 'profile' && profileUserId && (
                    <Suspense fallback={<SimpleSpinner />}>
                      <ProfileViewLazy userId={profileUserId} onEditProfile={handleEditProfile} />
                    </Suspense>
                  )}
                </Suspense>
              </main>
            </motion.div>
          ) : (
          <motion.div key={'dash-' + mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {/* Top bar with mode toggle */}
            <TopBar
              mode={mode}
              onModeChange={setMode}
              onMenuOpen={handleMenuOpen}
              onOpenAuth={onOpenAuth}
              onLeaderboardOpen={handleLeaderboardOpen}
              onProfileOpen={user ? handleProfileOpen : undefined}
            />
    
            {/* Main content */}
            <main className="main-layout-content">
              {mode === 'home' && (
                <Suspense fallback={<SimpleSpinner />}>
                  <HomeViewLazy onNotepadOpen={handleNotepadOpen} onQuestsOpen={handleQuestsOpen} onMusicOpen={handleMusicOpen} onProgressionOpen={() => setSection('progression')} onSubjectsOpen={handleSubjectsOpen} menuOpen={menuOpen} />
                </Suspense>
              )}
              {mode === 'focus' && (
                <Suspense fallback={<SimpleSpinner />}>
                  <FocusEnvironmentLazy 
                    onTasksOpen={handleTasksOpen}
                    onMusicOpen={handleMusicOpen}
                    onNotepadOpen={handleNotepadOpen}
                  />
                </Suspense>
              )}
            </main>

          {/* Bottom bar (mobile only, hidden in full-view) */}
          <BottomBar
            mode={mode}
            onModeChange={setMode}
            onTasksOpen={handleTasksOpen}
            onStatsOpen={handleStatsOpen}
            onNotepadOpen={handleNotepadOpen}
            onQuestsOpen={handleQuestsOpen}
            onMenuOpen={handleMenuOpen}
          />
        </motion.div>
      )}
      </AnimatePresence>
      </div>

      {/* Menu drawer (slide-in from left) */}
      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSection={section}
        onNavigate={setSection}
      />

      {/* Side panels */}
      <FloatingPanel open={activePanel === 'tasks'} onClose={handleClosePanel} title="Tasks" width={380}>
        <TasksPanel />
      </FloatingPanel>

      <FloatingPanel open={activePanel === 'ambience'} onClose={handleClosePanel} title="Ambience" width={420}>
        <AmbiencePanel ambienceUrl={ambienceUrl} onAmbienceUrlChange={setAmbienceUrl} />
      </FloatingPanel>
      {/* Persistent ambience iframe — rendered outside SidePanel so it survives panel close */}
      {ambienceUrl && (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/80 backdrop-blur-lg">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] border-b border-white/[0.06]">
            <span className="text-sm">{ambienceUrl.emoji}</span>
            <span className="flex-1 text-[10px] font-bold truncate text-white/80">{ambienceUrl.name}</span>
            <span className="text-[7px] font-bold uppercase tracking-wider text-white/40">{ambienceUrl.service}</span>
            <button onClick={() => setAmbienceUrl(null)}
              className="p-0.5 rounded hover:bg-white/10 text-white/40 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          <iframe
            src={ambienceUrl.embedUrl}
            width="100%"
            height={ambienceUrl.service?.toLowerCase() === 'youtube' ? '232' : '152'}
            frameBorder="0"
            allow="encrypted-media; autoplay; clipboard-write; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full"
            title={ambienceUrl.name}
          />
        </div>
      )}

      {/* Overlays & modals */}
      <AchievementNotification achievement={activeNotification} onClose={closeNotification} />
      <Confetti active={confettiActive} />
      <LevelUpModal level={levelUpEvent ?? gameLevel} isOpen={showLevelUp} onClose={() => { setShowLevelUp(false); dismissLevelUp(); }} />
      <PremiumModal onOpenAuth={onOpenAuth} />
      <DemoSignUpNudge onOpenAuth={onOpenAuth} />
      <PanicModeUI />

      <NotesPanel isOpen={activePanel === 'notepad'} onClose={handleClosePanel} />
    </div>
  );
};
