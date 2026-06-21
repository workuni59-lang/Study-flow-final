import { useState, lazy, Suspense, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Palette, Check, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { TopBar, type Mode } from './TopBar';
import { useNavigationContext, type Panel } from '../../hooks/useNavigationContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { ROUTES } from '../../lib/routes';
import { BottomBar } from './BottomBar';
const FocusEnvironmentLazy = lazy(() => import('./FocusEnvironment').then(m => ({ default: m.FocusEnvironment })));
const HomeViewLazy = lazy(() => import('./HomeView').then(m => ({ default: m.HomeView })));
import { MenuDrawer, type Section } from './MenuDrawer';
import { FloatingPanel } from '../panels/FloatingPanel';
import { AmbiencePanel, type CuratedPlaylist } from '../panels/AmbiencePanel';
import { NotesPanel } from '../panels/NotesPanel';
import { MOOD_GRADIENTS } from '../../lib/wallpapers';
import { WALLPAPERS } from '../../lib/gamification';
import { DashboardSkeleton, ContentSkeleton } from '../ui/skeleton';

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

const AnalyticsDashboardLazy = lazy(() => import('../analytics/AnalyticsDashboard'));
const SubjectsViewLazy = lazy(() => import('../subjects/SubjectsView').then(m => ({ default: m.SubjectsView })));
const AchievementsViewLazy = lazy(() => import('../achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const SettingsViewLazy = lazy(() => import('../navigation/SettingsView').then(m => ({ default: m.SettingsView })));
const ProgressionViewLazy = lazy(() => import('../progression/ProgressionView').then(m => ({ default: m.ProgressionView })));
const QuestsViewLazy = lazy(() => import('../quests/QuestsView').then(m => ({ default: m.QuestsView })));
const LeaderboardViewLazy = lazy(() => import('../leaderboard/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const ProfileViewLazy = lazy(() => import('../profile/ProfileView').then(m => ({ default: m.ProfileView })));
const PomodoroLandingLazy = lazy(() => import('../pomodoro/PomodoroLanding').then(m => ({ default: m.PomodoroLanding })));

const MobileSkeleton = () => <DashboardSkeleton />;

const skeletonKeyframes = `@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`;

const MOBILE_PHOTO_WALLPAPERS = [
  'misty-forest',
  'ocean',
  'mountain-lake',
  'coastal-sunrise',
  'golden-sunset',
  'library',
  'cafe',
  'white-minimal',
  'gradient-dusk',
  'lavender-fields',
  'city-sunset',
  'space-station',
];

interface MobileLayoutProps {
  onOpenAuth?: () => void;
}

export const MobileLayout = ({ onOpenAuth }: MobileLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userStats, gameLevel, levelUpEvent, dismissLevelUp, themeConfig, setThemeConfig, activeNotification, confettiActive, closeNotification, setShowPremiumModal } = useStudy();
  const { mode, section, activePanel, profileId: profileUserId, ambienceTab } = useNavigationContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [ambienceUrl, setAmbienceUrl] = useState<CuratedPlaylist | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [themeTab, setThemeTab] = useState<'moods' | 'photos'>('moods');
  const [spotlightSubjectId, setSpotlightSubjectId] = useState<string | null>(null);

  const showMoodPicker = activePanel === 'themes';

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

  const setShowMoodPicker = (val: boolean) => {
    if (val) navigate(mode === 'focus' ? ROUTES.FOCUS_THEMES : ROUTES.THEMES);
    else navigate(mode === 'focus' ? ROUTES.FOCUS : ROUTES.HOME);
  };

  useEffect(() => {
    if (levelUpEvent) {
      setShowLevelUp(true);
    }
  }, [levelUpEvent]);
  const isFullView = section !== 'dashboard';

  const moodWallpapers = useMemo(() =>
    WALLPAPERS.filter(w => w.category === 'Moods'),
  []);

  const mobilePhotoWallpapers = useMemo(() =>
    MOBILE_PHOTO_WALLPAPERS
      .map(id => WALLPAPERS.find(w => w.id === id))
      .filter((wallpaper): wallpaper is (typeof WALLPAPERS)[number] => Boolean(wallpaper)),
  []);

  const handleMoodSelect = (id: string, isPremium: boolean) => {
    if (isPremium && !userStats.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setThemeConfig(prev => ({ ...prev, wallpaper: id }));
    setShowMoodPicker(false);
  };

  const baseBg: Record<string, string> = {
    indigo: 'bg-[#f8fafc] dark:bg-indigo-950',
    rose: 'bg-[#fff5f5] dark:bg-rose-950',
    emerald: 'bg-[#f2fcf5] dark:bg-emerald-950',
    violet: 'bg-[#f8f5ff] dark:bg-violet-950',
    amber: 'bg-[#fffbf2] dark:bg-amber-950',
    cyan: 'bg-[#f2fbff] dark:bg-cyan-950',
    pink: 'bg-[#fff2f9] dark:bg-pink-950',
    slate: 'bg-[#f8fafc] dark:bg-slate-950',
    neon: 'bg-[#0f0a1a] dark:bg-[#050010]',
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 noise-overlay ${section === 'dashboard' ? '' : (baseBg[themeConfig.atmosphere] || baseBg.indigo)} relative overflow-hidden`} style={{ backgroundAttachment: 'scroll' }}>
      <CustomCursor />
      <ScrollProgress />
      <style>{skeletonKeyframes}</style>
      
      {/* Background Engine - Static Only on Mobile */}
      <WallpaperEngine visible={section === 'dashboard'} staticOnly={true} />

      {/* Main content area */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {section === 'pomodoro' ? (
            <motion.main key="pomodoro" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="p-3 md:p-4 pb-28">
              <Suspense fallback={<MobileSkeleton />}>
                <PomodoroLandingLazy />
              </Suspense>
            </motion.main>
          ) : isFullView ? (
            <motion.div key={'full-' + section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="min-h-screen">
              <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#0a0c10]/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 pt-safe">
                <div className="flex items-center gap-3 h-14 px-4">
                  <button onClick={() => setSection('dashboard')} aria-label="Go back"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-sm font-semibold dark:text-white capitalize">{section}</span>
                </div>
              </header>
              <main className="p-3 md:p-4 pb-28">
                <Suspense fallback={<MobileSkeleton />}>
                  {section === 'analytics' && <AnalyticsDashboardLazy />}
                  {section === 'subjects' && <SubjectsViewLazy key={spotlightSubjectId ?? 'default'} initialSubjectId={spotlightSubjectId ?? undefined} />}
                  {section === 'achievements' && <AchievementsViewLazy />}
                  {section === 'settings' && <SettingsViewLazy />}
                  {section === 'progression' && <ProgressionViewLazy />}
                  {section === 'quests' && <QuestsViewLazy />}
                  {section === 'leaderboard' && <LeaderboardViewLazy onViewProfile={handleViewProfile} />}
                  {section === 'profile' && profileUserId && (
                    <Suspense fallback={<MobileSkeleton />}>
                      <ProfileViewLazy userId={profileUserId} onEditProfile={handleEditProfile} />
                    </Suspense>
                  )}
                </Suspense>
              </main>
            </motion.div>
          ) : (
          <motion.div key={'dash-' + mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {/* Floating toolbar */}
            <TopBar
              mode={mode}
              onModeChange={setMode}
              onMenuOpen={handleMenuOpen}
              onOpenAuth={onOpenAuth}
              onLeaderboardOpen={handleLeaderboardOpen}
              onProfileOpen={user ? handleProfileOpen : undefined}
            />

            {/* Main content */}
            <main>
              {mode === 'home' && (
                <Suspense fallback={<MobileSkeleton />}>
                  <HomeViewLazy onNotepadOpen={handleNotepadOpen} onSubjectsOpen={handleSubjectsOpen} menuOpen={menuOpen} />
                </Suspense>
              )}
              {mode === 'focus' && (
                <Suspense fallback={<MobileSkeleton />}>
                  <FocusEnvironmentLazy 
                    onTasksOpen={handleTasksOpen}
                    onMusicOpen={handleMusicOpen}
                    onNotepadOpen={handleNotepadOpen}
                  />
                </Suspense>
              )}
            </main>

          </motion.div>
        )}
        </AnimatePresence>

        {/* Bottom bar — rendered outside AnimatePresence so fixed positioning isn't broken by motion.div transforms */}
        <BottomBar
          mode={mode}
          onModeChange={setMode}
          onTasksOpen={handleTasksOpen}
          onStatsOpen={handleStatsOpen}
          onNotepadOpen={handleNotepadOpen}
          onMenuOpen={handleMenuOpen}
        />
      </div>

      {/* Mood picker bottom sheet */}
      <AnimatePresence>
        {showMoodPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setShowMoodPicker(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowMoodPicker(false);
                }
              }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#0f0f1f] border-t border-white/[0.06] pb-8"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-semibold text-white/90">Theme</span>
                <button onClick={() => setShowMoodPicker(false)} aria-label="Close"
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.12] transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-5 mb-4 border-b border-white/[0.05]">
                <button onClick={() => setThemeTab('moods')}
                  className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-colors relative ${themeTab === 'moods' ? 'text-indigo-400' : 'text-white/60'}`}>
                  Moods
                  {themeTab === 'moods' && <motion.div layoutId="activeThemeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
                </button>
                <button onClick={() => setThemeTab('photos')}
                  className={`pb-2 px-1 ml-6 text-xs font-bold uppercase tracking-widest transition-colors relative ${themeTab === 'photos' ? 'text-indigo-400' : 'text-white/60'}`}>
                  Photos
                  {themeTab === 'photos' && <motion.div layoutId="activeThemeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
                </button>
              </div>

              {/* Wallpaper grid */}
              <div className="max-h-[50vh] overflow-y-auto no-scrollbar pb-8 px-5">
                {themeTab === 'moods' ? (
                  <div className="grid grid-cols-5 gap-3">
                    {moodWallpapers.map(w => {
                      const selected = themeConfig.wallpaper === w.id;
                      return (
                        <button key={w.id} onClick={() => handleMoodSelect(w.id, w.isPremium)}
                          className={`relative w-full aspect-square rounded-2xl transition-all active:scale-90 ${
                            selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f1f]' : 'ring-1 ring-white/[0.06] hover:ring-white/25'
                          }`}
                          style={{ background: MOOD_GRADIENTS[w.id] }}
                          title={w.name}>
                          {selected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                          {!userStats.isPremium && w.isPremium && (
                            <div className="absolute top-0.5 right-0.5">
                              <Crown className="w-3 h-3 text-amber-400 drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {mobilePhotoWallpapers.map(w => {
                      const selected = themeConfig.wallpaper === w.id;
                      return (
                        <button key={w.id} onClick={() => handleMoodSelect(w.id, w.isPremium)}
                          className={`relative w-full aspect-[4/3] rounded-2xl transition-all active:scale-90 ${
                            selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f1f]' : 'ring-1 ring-white/[0.06] hover:ring-white/25'
                          }`}
                          style={{ backgroundImage: `url(${w.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          title={w.name}>
                          {selected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                          {!userStats.isPremium && w.isPremium && (
                            <div className="absolute top-0.5 right-0.5">
                              <Crown className="w-3 h-3 text-amber-400 drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      <FloatingPanel open={activePanel === 'ambience'} onClose={handleClosePanel} title="Ambience" width={420} draggable={false}>
        <AmbiencePanel ambienceUrl={ambienceUrl} onAmbienceUrlChange={setAmbienceUrl} />
      </FloatingPanel>

      {/* Persistent ambience iframe — rendered outside SidePanel so it survives panel close */}
      {ambienceUrl && (
        <div className="fixed bottom-20 right-4 z-50 w-72 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/80 backdrop-blur-lg">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] border-b border-white/[0.06]">
            <span className="text-sm">{ambienceUrl.emoji}</span>
            <span className="flex-1 text-[10px] font-bold truncate text-white/80">{ambienceUrl.name}</span>
            <span className="text-[7px] font-bold uppercase tracking-wider text-white/70">{ambienceUrl.service}</span>
            <button onClick={() => setAmbienceUrl(null)} aria-label="Close ambience"
              className="p-0.5 rounded hover:bg-white/10 text-white/70 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          <iframe
            src={ambienceUrl.embedUrl}
            width="100%"
            height={ambienceUrl.service?.toLowerCase() === 'youtube' ? '232' : '152'}
            frameBorder="0"
            allow="encrypted-media; autoplay; clipboard-write; fullscreen; picture-in-picture; web-share"
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
