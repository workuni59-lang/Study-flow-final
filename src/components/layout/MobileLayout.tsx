import { useState, lazy, Suspense } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { TopBar, type Mode } from './TopBar';
import { BottomBar } from './BottomBar';
import { HomeView } from './HomeView';
import { FocusView } from './FocusView';
import { MenuDrawer, type Section } from './MenuDrawer';
import { SidePanel } from '../panels/SidePanel';
import { TasksPanel } from '../panels/TasksPanel';
import { AmbiencePanel } from '../panels/AmbiencePanel';
import { NotepadPanel } from '../panels/NotepadPanel';
import { PremiumModal } from '../modals/PremiumModal';
import { AchievementNotification } from '../notifications/AchievementNotification';
import { Confetti } from '../notifications/Confetti';
import { LevelUpModal } from '../modals/LevelUpModal';
import { PanicModeUI } from '../dashboard/PanicModeUI';
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

export const MobileLayout = () => {
  const { user } = useAuth();
  const { userStats, themeConfig, activeNotification, confettiActive, closeNotification } = useStudy();
  const [mode, setMode] = useState<Mode>('focus');
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'tasks' | 'ambience' | 'notepad' | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(userStats.level);

  useEffect(() => {
    if (userStats.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(userStats.level);
    }
  }, [userStats.level, prevLevel]);

  useEffect(() => {
    const t = setTimeout(() => import('../analytics/AnalyticsDashboard'), 2000);
    return () => clearTimeout(t);
  }, []);

  const isFullView = section !== 'dashboard';

  const baseBg: Record<string, string> = {
    indigo: 'bg-[#f8fafc] dark:bg-slate-950',
    rose: 'bg-[#fff5f5] dark:bg-[#1a0f0f]',
    emerald: 'bg-[#f2fcf5] dark:bg-[#0f1a13]',
    violet: 'bg-[#f8f5ff] dark:bg-[#130f1a]',
    amber: 'bg-[#fffbf2] dark:bg-[#1a160f]',
    cyan: 'bg-[#f2fbff] dark:bg-[#0f181a]',
    pink: 'bg-[#fff2f9] dark:bg-[#1a0f16]',
    slate: 'bg-[#f8fafc] dark:bg-slate-950',
    neon: 'bg-[#0f0a1a] dark:bg-[#050010]',
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${baseBg[themeConfig.atmosphere] || baseBg.indigo}`}>
      {/* Main content area */}
      <div>

        {/* Full-view pages (analytics, subjects, achievements, settings) */}
        {isFullView ? (
          <div className="min-h-screen">
            <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#0a0c10]/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 h-14 px-4">
                <button onClick={() => setSection('dashboard')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-semibold dark:text-white capitalize">{section}</span>
              </div>
            </header>
            <main className="p-4 pb-28">
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
          {/* Floating toolbar */}
          <TopBar
            mode={mode}
            onModeChange={setMode}
            onMenuOpen={() => setMenuOpen(v => !v)}
            onSettingsOpen={() => setSection('settings')}
          />

          {/* Main content */}
          <main>
            {mode === 'home' && <HomeView onNotepadOpen={() => setPanelOpen('notepad')} />}
            {mode === 'focus' && (
              <FocusView
                onTasksOpen={() => setPanelOpen('tasks')}
                onMusicOpen={() => setPanelOpen('ambience')}
                onNotepadOpen={() => setPanelOpen('notepad')}
              />
            )}
          </main>

          {/* Bottom bar */}
          <BottomBar
            mode={mode}
            onModeChange={setMode}
            onTasksOpen={() => setPanelOpen('tasks')}
            onStatsOpen={() => setSection('analytics')}
            onNotepadOpen={() => setPanelOpen('notepad')}
          />
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

      {/* Overlays & modals */}
      <AchievementNotification achievement={activeNotification} onClose={closeNotification} />
      <Confetti active={confettiActive} />
      <LevelUpModal level={userStats.level} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
      <PremiumModal />
      <PanicModeUI />
    </div>
  );
};
