import { useState, lazy, Suspense, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { TopBar, type Mode } from './TopBar';
import { BottomBar } from './BottomBar';
import { HomeView } from './HomeView';
import { FocusView } from './FocusView';
import { MenuDrawer, type Section } from './MenuDrawer';
import { SidePanel } from '../panels/SidePanel';
import { TasksPanel } from '../panels/TasksPanel';
import { AmbiencePanel, type CuratedPlaylist } from '../panels/AmbiencePanel';
import { NotepadPanel } from '../panels/NotepadPanel';
import { PremiumModal } from '../modals/PremiumModal';
import { AchievementNotification } from '../notifications/AchievementNotification';
import { Confetti } from '../notifications/Confetti';
import { LevelUpModal } from '../modals/LevelUpModal';
import { PanicModeUI } from '../dashboard/PanicModeUI';
import { storage } from '../../services/storage';

const AnalyticsDashboardLazy = lazy(() => import('../analytics/AnalyticsDashboard'));
const SubjectsViewLazy = lazy(() => import('../subjects/SubjectsView').then(m => ({ default: m.SubjectsView })));
const AchievementsViewLazy = lazy(() => import('../achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const SettingsViewLazy = lazy(() => import('../navigation/SettingsView').then(m => ({ default: m.SettingsView })));
const ProgressionViewLazy = lazy(() => import('../progression/ProgressionView').then(m => ({ default: m.ProgressionView })));
const QuestsViewLazy = lazy(() => import('../quests/QuestsView').then(m => ({ default: m.QuestsView })));

const MobileSkeleton = () => (
  <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0f0f1a', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const skeletonKeyframes = `@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`;

export const MobileLayout = () => {
  const { user } = useAuth();
  const { userStats, themeConfig, activeNotification, confettiActive, closeNotification } = useStudy();
  const [mode, setMode] = useState<Mode>('focus');
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'tasks' | 'ambience' | 'notepad' | null>(null);
  const [ambienceUrl, setAmbienceUrl] = useState<CuratedPlaylist | null>(null);
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

  // Prefetch commonly opened panels after idle
  useEffect(() => {
    const t = setTimeout(() => {
      import('../quests/QuestsView');
      import('../panels/NotepadPanel');
    }, 2000);
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
    <div className={`min-h-screen transition-colors duration-1000 ${baseBg[themeConfig.atmosphere] || baseBg.indigo}`} style={{ backgroundAttachment: 'scroll' }}>
      <style>{skeletonKeyframes}</style>
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
              <Suspense fallback={<MobileSkeleton />}>
                {section === 'analytics' && <AnalyticsDashboardLazy />}
                {section === 'subjects' && <SubjectsViewLazy />}
                {section === 'achievements' && <AchievementsViewLazy />}
                {section === 'settings' && <SettingsViewLazy />}
                {section === 'progression' && <ProgressionViewLazy />}
                {section === 'quests' && <QuestsViewLazy />}
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
          />

          {/* Main content */}
          <main>
            {mode === 'home' && <HomeView onNotepadOpen={() => setPanelOpen('notepad')} menuOpen={menuOpen} />}
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
        <AmbiencePanel ambienceUrl={ambienceUrl} onAmbienceUrlChange={setAmbienceUrl} />
      </SidePanel>

      {/* Persistent ambience iframe — rendered outside SidePanel so it survives panel close */}
      {ambienceUrl && (
        <div className="fixed bottom-20 right-4 z-50 w-72 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/80 backdrop-blur-lg">
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
