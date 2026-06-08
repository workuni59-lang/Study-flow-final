import { useState, lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { TopBar, type Mode } from './TopBar';
import { BottomBar } from './BottomBar';
import { HomeView } from './HomeView';
import { FocusEnvironment } from './FocusEnvironment';
import { MenuDrawer, type Section } from './MenuDrawer';
import { DesktopSidebar } from './DesktopSidebar';
import { SidePanel } from '../panels/SidePanel';
import { AmbiencePanel, type CuratedPlaylist } from '../panels/AmbiencePanel';
import { NotesPanel } from '../panels/NotesPanel';

const TasksPanelLazy = lazy(() => import('../panels/TasksPanel').then(m => ({ default: m.TasksPanel })));
const NotepadPanelLazy = lazy(() => import('../panels/NotepadPanel').then(m => ({ default: m.NotepadPanel })));
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
import { ENABLE_PETS } from '../../config/features';

const AnalyticsDashboardLazy = lazy(() => import('../analytics/AnalyticsDashboard'));
const SubjectsViewLazy = lazy(() => import('../subjects/SubjectsView').then(m => ({ default: m.SubjectsView })));
const AchievementsViewLazy = lazy(() => import('../achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const SettingsViewLazy = lazy(() => import('../navigation/SettingsView').then(m => ({ default: m.SettingsView })));
const QuestsViewLazy = lazy(() => import('../quests/QuestsView').then(m => ({ default: m.QuestsView })));
const ProgressionViewLazy = lazy(() => import('../progression/ProgressionView').then(m => ({ default: m.ProgressionView })));

const SimpleSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
  </div>
);

interface MainLayoutProps {
  onOpenAuth?: () => void;
}

export const MainLayout = ({ onOpenAuth }: MainLayoutProps) => {
  const { user } = useAuth();
  const { userStats, gameLevel, levelUpEvent, dismissLevelUp, activeNotification, confettiActive, closeNotification } = useStudy();
  const [mode, setMode] = useState<Mode>('focus');
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'tasks' | 'ambience' | 'notepad' | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [ambienceUrl, setAmbienceUrl] = useState<CuratedPlaylist | null>(null);
  const [showPetPanel, setShowPetPanel] = useState(false);
  const [feedTrigger, setFeedTrigger] = useState(0);
  const [petVisible, setPetVisible] = useState(() => storage.getPetVisible() ?? true);
  const [petSize, setPetSize] = useState(() => storage.getPetSize() ?? 140);

  useEffect(() => {
    if (levelUpEvent) {
      setShowLevelUp(true);
    }
  }, [levelUpEvent]);

  // Preload analytics chunk after paint
  useEffect(() => {
    const t = setTimeout(() => import('../analytics/AnalyticsDashboard'), 2000);
    return () => clearTimeout(t);
  }, []);

  const isFullView = section !== 'dashboard';
  const skipWallpaper = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4;

  return (
    <div className="min-h-screen relative transition-colors duration-1000" style={{ backgroundColor: section === 'dashboard' ? 'transparent' : '#0f0f1a' }}>
      {!skipWallpaper && <WallpaperEngine visible={section === 'dashboard'} />}

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
                {section === 'progression' && <ProgressionViewLazy />}
                {section === 'analytics' && <AnalyticsDashboardLazy />}
                {section === 'quests' && <QuestsViewLazy />}
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
            onOpenAuth={onOpenAuth}
          />

          {/* Main content */}
          <main className="main-layout-content">
            {mode === 'home' && <HomeView onNotepadOpen={() => setIsNotesOpen(true)} onQuestsOpen={() => setSection('quests')} onMusicOpen={() => setPanelOpen('ambience')} onProgressionOpen={() => setSection('progression')} menuOpen={menuOpen} />}
            {mode === 'focus' && (
              <FocusEnvironment
                onTasksOpen={() => setPanelOpen('tasks')}
                onMusicOpen={() => setPanelOpen('ambience')}
                onNotepadOpen={() => setIsNotesOpen(true)}
                onQuestsOpen={() => setSection('quests')}
              />
            )}
          </main>

          {/* Bottom bar (mobile only, hidden in full-view) */}
          <BottomBar
            mode={mode}
            onModeChange={setMode}
            onTasksOpen={() => setPanelOpen('tasks')}
            onStatsOpen={() => setSection('analytics')}
            onNotepadOpen={() => setIsNotesOpen(true)}
            onQuestsOpen={() => setSection('quests')}
          />

          {/* Pet */}
          {ENABLE_PETS && petVisible && (
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
        <Suspense fallback={null}><TasksPanelLazy /></Suspense>
      </SidePanel>

      <SidePanel open={panelOpen === 'ambience'} onClose={() => setPanelOpen(null)} title="Ambience">
        <AmbiencePanel ambienceUrl={ambienceUrl} onAmbienceUrlChange={setAmbienceUrl} />
      </SidePanel>

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

      <SidePanel open={panelOpen === 'notepad'} onClose={() => setPanelOpen(null)} title="Notepad">
        <Suspense fallback={null}><NotepadPanelLazy /></Suspense>
      </SidePanel>

      {/* Pet panel */}
      {ENABLE_PETS && showPetPanel && (
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
      <LevelUpModal level={levelUpEvent ?? gameLevel} isOpen={showLevelUp} onClose={() => { setShowLevelUp(false); dismissLevelUp(); }} />
      <PremiumModal />
      <PanicModeUI />

      <NotesPanel isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
    </div>
  );
};
