import { useState, lazy, Suspense, useEffect, useMemo } from 'react';
import { X, Palette, Check, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { TopBar, type Mode } from './TopBar';
import { BottomBar } from './BottomBar';
import { HomeView } from './HomeView';
const FocusEnvironmentLazy = lazy(() => import('./FocusEnvironment').then(m => ({ default: m.FocusEnvironment })));
import { MenuDrawer, type Section } from './MenuDrawer';
import { SidePanel } from '../panels/SidePanel';
import { AmbiencePanel, type CuratedPlaylist } from '../panels/AmbiencePanel';
import { NotesPanel } from '../panels/NotesPanel';
import { MOOD_GRADIENTS } from '../../lib/wallpapers';
import { WALLPAPERS } from '../../lib/gamification';

const TasksPanelLazy = lazy(() => import('../panels/TasksPanel').then(m => ({ default: m.TasksPanel })));
const NotepadPanelLazy = lazy(() => import('../panels/NotepadPanel').then(m => ({ default: m.NotepadPanel })));
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
const LeaderboardViewLazy = lazy(() => import('../leaderboard/LeaderboardView').then(m => ({ default: m.LeaderboardView })));

const MobileSkeleton = () => (
  <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0f0f1a', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const skeletonKeyframes = `@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`;

interface MobileLayoutProps {
  onOpenAuth?: () => void;
}

export const MobileLayout = ({ onOpenAuth }: MobileLayoutProps) => {
  const { userStats, gameLevel, levelUpEvent, dismissLevelUp, themeConfig, setThemeConfig, activeNotification, confettiActive, closeNotification, setShowPremiumModal } = useStudy();
  const [mode, setMode] = useState<Mode>('focus');
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'tasks' | 'ambience' | 'notepad' | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [ambienceUrl, setAmbienceUrl] = useState<CuratedPlaylist | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  useEffect(() => {
    if (levelUpEvent) {
      setShowLevelUp(true);
    }
  }, [levelUpEvent]);
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

  const isMood = themeConfig.wallpaper in MOOD_GRADIENTS;
  const moodGradient = isMood ? MOOD_GRADIENTS[themeConfig.wallpaper] : undefined;

  const moodWallpapers = useMemo(() =>
    WALLPAPERS.filter(w => w.category === 'Moods'),
  []);

  const handleMoodSelect = (id: string, isPremium: boolean) => {
    if (isPremium && !userStats.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setThemeConfig({ ...themeConfig, wallpaper: id });
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
    <div className={`min-h-screen transition-colors duration-1000 ${baseBg[themeConfig.atmosphere] || baseBg.indigo}`} style={{ backgroundAttachment: 'scroll', backgroundImage: moodGradient }}>
      <style>{skeletonKeyframes}</style>
      {/* Main content area */}
      <div>

        {/* Full-view pages (analytics, subjects, achievements, settings) */}
        {isFullView ? (
          <div className="min-h-screen">
            <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#0a0c10]/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800">
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
                {section === 'subjects' && <SubjectsViewLazy />}
                {section === 'achievements' && <AchievementsViewLazy />}
                {section === 'settings' && <SettingsViewLazy />}
                {section === 'progression' && <ProgressionViewLazy />}
                {section === 'quests' && <QuestsViewLazy />}
                {section === 'leaderboard' && <LeaderboardViewLazy />}
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
            onOpenAuth={onOpenAuth}
            onLeaderboardOpen={() => setSection('leaderboard')}
          />

          {/* Main content */}
          <main>
            {mode === 'home' && <HomeView onNotepadOpen={() => setIsNotesOpen(true)} menuOpen={menuOpen} />}
            {mode === 'focus' && (
              <Suspense fallback={null}>
                <FocusEnvironmentLazy
                  onTasksOpen={() => setPanelOpen('tasks')}
                  onMusicOpen={() => setPanelOpen('ambience')}
                  onNotepadOpen={() => setIsNotesOpen(true)}
                />
              </Suspense>
            )}
          </main>

          {/* Bottom bar */}
          <BottomBar
            mode={mode}
            onModeChange={setMode}
            onTasksOpen={() => setPanelOpen('tasks')}
            onStatsOpen={() => setSection('analytics')}
            onNotepadOpen={() => setIsNotesOpen(true)}
          />
        </>
      )}
      </div>

      {/* Floating mood button — only on dashboard */}
      {!isFullView && (
        <button onClick={() => setShowMoodPicker(v => !v)} aria-label="Change background"
          className="fixed bottom-24 right-4 z-40 w-11 h-11 rounded-full bg-black/40 backdrop-blur-lg border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/55 transition-all shadow-lg active:scale-95">
          <Palette className="w-5 h-5" />
        </button>
      )}

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
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#0f0f1f] border-t border-white/[0.06] pb-8"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-semibold text-white/90">Mood</span>
                <button onClick={() => setShowMoodPicker(false)} aria-label="Close"
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.12] transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mood grid */}
              <div className="grid grid-cols-5 gap-3 px-5 max-h-[50vh] overflow-y-auto no-scrollbar">
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
      <SidePanel open={panelOpen === 'tasks'} onClose={() => setPanelOpen(null)} title="Tasks">
        <Suspense fallback={null}><TasksPanelLazy /></Suspense>
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
            <button onClick={() => setAmbienceUrl(null)} aria-label="Close ambience"
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
