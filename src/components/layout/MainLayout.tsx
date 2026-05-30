import { useState, lazy, Suspense } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { TopBar, type Mode } from './TopBar';
import { BottomBar } from './BottomBar';
import { HomeView } from './HomeView';
import { FocusView } from './FocusView';
import { MenuDrawer, type Section } from './MenuDrawer';
import { DesktopSidebar } from './DesktopSidebar';
import { SidePanel } from '../panels/SidePanel';
import { TasksPanel } from '../panels/TasksPanel';
import { AmbiencePanel } from '../panels/AmbiencePanel';
import { NotepadPanel } from '../panels/NotepadPanel';
import { PremiumModal } from '../modals/PremiumModal';
import { AchievementNotification } from '../notifications/AchievementNotification';
import { Confetti } from '../notifications/Confetti';
import { LevelUpModal } from '../modals/LevelUpModal';
import { PanicModeUI } from '../dashboard/PanicModeUI';
import { WallpaperEngine } from '../navigation/WallpaperEngine';
import PetEngine from '../dashboard/PetEngine';
import PetPanel from '../dashboard/PetPanel';
import { storage } from '../../services/storage';
import { useEffect } from 'react';

const AnalyticsDashboardLazy = lazy(() => import('../analytics/AnalyticsDashboard'));
const SubjectsViewLazy = lazy(() => import('../subjects/SubjectsView').then(m => ({ default: m.SubjectsView })));
const AchievementsViewLazy = lazy(() => import('../achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const SettingsViewLazy = lazy(() => import('../navigation/SettingsView').then(m => ({ default: m.SettingsView })));

const SimpleSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
  </div>
);

export const MainLayout = () => {
  const { user } = useAuth();
  const { userStats, activeNotification, confettiActive, closeNotification } = useStudy();
  const [mode, setMode] = useState<Mode>('focus');
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'tasks' | 'ambience' | 'notepad' | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(userStats.level);
  const [showPetPanel, setShowPetPanel] = useState(false);
  const [feedTrigger, setFeedTrigger] = useState(0);
  const [petVisible, setPetVisible] = useState(() => storage.getPetVisible() ?? true);
  const [petSize, setPetSize] = useState(() => storage.getPetSize() ?? 140);

  useEffect(() => {
    if (userStats.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(userStats.level);
    }
  }, [userStats.level, prevLevel]);

  // Preload analytics chunk after paint
  useEffect(() => {
    const t = setTimeout(() => import('../analytics/AnalyticsDashboard'), 2000);
    return () => clearTimeout(t);
  }, []);

  const isFullView = section !== 'dashboard';

  return (
    <div className="min-h-screen relative transition-colors duration-1000">
      <WallpaperEngine />

      {/* Desktop sidebar (slide-in overlay on lg+) */}
      <DesktopSidebar
        mode={mode}
        onModeChange={setMode}
        activeSection={section}
        onNavigate={setSection}
        onPetPanelOpen={() => setShowPetPanel(true)}
        petVisible={petVisible}
        onTogglePet={(v) => { setPetVisible(v); storage.savePetVisible(v); }}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Main content area (no sidebar offset) */}
      <div>

        {/* Full-view pages (analytics, subjects, achievements, settings) */}
        {isFullView ? (
          <div className="min-h-screen">
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
            <main className="main-layout-content p-4 md:p-8 pb-24 lg:pb-8">
              <Suspense fallback={<SimpleSpinner />}>
                {section === 'analytics' && <AnalyticsDashboardLazy />}
                {section === 'subjects' && <SubjectsViewLazy />}
                {section === 'achievements' && <AchievementsViewLazy />}
                {section === 'settings' && <SettingsViewLazy />}
              </Suspense>
            </main>
          </div>
        ) : (
        <>
          {/* Top bar with mode toggle */}
          <TopBar
            mode={mode}
            onModeChange={setMode}
            onMenuOpen={() => setMenuOpen(v => !v)}
            onSettingsOpen={() => setSection('settings')}
          />

          {/* Main content */}
          <main className="main-layout-content">
            {mode === 'home' && <HomeView onNotepadOpen={() => setPanelOpen('notepad')} />}
            {mode === 'focus' && (
              <FocusView
                onTasksOpen={() => setPanelOpen('tasks')}
                onMusicOpen={() => setPanelOpen('ambience')}
                onNotepadOpen={() => setPanelOpen('notepad')}
              />
            )}
          </main>

          {/* Bottom bar (mobile only, hidden in full-view) */}
          <BottomBar
            mode={mode}
            onModeChange={setMode}
            onTasksOpen={() => setPanelOpen('tasks')}
            onStatsOpen={() => setSection('analytics')}
            onNotepadOpen={() => setPanelOpen('notepad')}
          />

          {/* Pet */}
          {petVisible && (
            <PetEngine
              onOpenPanel={() => setShowPetPanel(true)}
              feedTrigger={feedTrigger}
              overlayOpen={panelOpen !== null}
              petSize={petSize}
            />
          )}
        </>
      )}
      </div>

      {/* Menu drawer (slide-in from left) */}
      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSection={section}
        onNavigate={setSection}
      />

      {/* Side panels */}
      <SidePanel open={panelOpen === 'tasks'} onClose={() => setPanelOpen(null)} title="Tasks">
        <TasksPanel />
      </SidePanel>

      <SidePanel open={panelOpen === 'ambience'} onClose={() => setPanelOpen(null)} title="Ambience">
        <AmbiencePanel />
      </SidePanel>

      <SidePanel open={panelOpen === 'notepad'} onClose={() => setPanelOpen(null)} title="Notepad">
        <NotepadPanel />
      </SidePanel>

      {/* Pet panel */}
      {showPetPanel && (
        <PetPanel
          onClose={() => setShowPetPanel(false)}
          onFeed={() => setFeedTrigger(c => c + 1)}
          petVisible={petVisible}
          petSize={petSize}
          onToggleVisible={(v) => { setPetVisible(v); storage.savePetVisible(v); }}
          onChangeSize={(s) => { setPetSize(s); storage.savePetSize(s); }}
        />
      )}

      {/* Overlays & modals */}
      <AchievementNotification achievement={activeNotification} onClose={closeNotification} />
      <Confetti active={confettiActive} />
      <LevelUpModal level={userStats.level} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
      <PremiumModal />
      <PanicModeUI />
    </div>
  );
};
