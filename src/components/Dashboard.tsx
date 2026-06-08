import React, { useState } from 'react';
import { 
  LogOut, CheckSquare, Target, CalendarDays, PawPrint, X, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { TodayTasks } from './dashboard/TodayTasks';
import { UpcomingExams } from './dashboard/UpcomingExams';
import { StudyTimer } from './dashboard/StudyTimer';
import { ProgressTracker } from './dashboard/ProgressTracker';
import { AddTaskModal } from './dashboard/AddTaskModal';
import { AddExamModal } from './dashboard/AddExamModal';
import { DailyReflection } from './dashboard/DailyReflection';
import { PathToMastery } from './subjects/PathToMastery';
import { DailyQuests } from './dashboard/DailyQuests';
import { ZenHero } from './dashboard/ZenHero';
import { DevMenu } from './dashboard/DevMenu';
import PetEngine from './dashboard/PetEngine';
import PetPanel from './dashboard/PetPanel';
import RewardAnimationLayer from './ui/RewardAnimationLayer';
import { storage } from '../services/storage';
import { ENABLE_PETS } from '../config/features';

type OverlayType = 'tasks' | 'quests' | 'exams' | null;

const OVERLAY_CONFIG: { key: OverlayType; icon: typeof CheckSquare; label: string; iconColor: string }[] = [
  { key: 'tasks', icon: CheckSquare, label: 'Tasks', iconColor: 'from-brand to-violet-600' },
  { key: 'quests', icon: Target, label: 'Quests', iconColor: 'from-emerald-500 to-teal-600' },
  { key: 'exams', icon: CalendarDays, label: 'Exams', iconColor: 'from-rose-500 to-pink-600' },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { 
    subjects, tasks, addTask, toggleTask, deleteTask, setTasks, 
    userStats, exams, addExam, deleteExam, selectedExamForPath, setSelectedExamForPath,
    petState
  } = useStudy();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPetPanel, setShowPetPanel] = useState(false);
  const [feedTrigger, setFeedTrigger] = useState(0);
  const [petVisible, setPetVisible] = useState(() => storage.getPetVisible() ?? true);
  const [petSize, setPetSize] = useState(() => storage.getPetSize() ?? 180);

  const handleCompleteDay = () => {
    setIsReflecting(false);
  };

  const formatFocusTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const renderOverlay = () => {
    if (!activeOverlay) return null;
    
    return (
      <motion.div
        key={activeOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setActiveOverlay(null)} />
        
        {/* Panel */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`absolute bottom-0 left-0 right-0 lg:left-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-y-auto transition-all ${
            isFullScreen
              ? 'inset-0 lg:inset-0 rounded-none max-h-[100vh]'
              : 'max-h-[80vh] rounded-t-3xl'
          }`}
        >
          {/* Handle */}
          <div className={`sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 ${isFullScreen ? 'rounded-none' : 'rounded-t-3xl'}`}>
            <div className="flex items-center justify-between px-6 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${OVERLAY_CONFIG.find(c => c.key === activeOverlay)?.iconColor} flex items-center justify-center`}>
                  {React.createElement(OVERLAY_CONFIG.find(c => c.key === activeOverlay)?.icon || CheckSquare, { className: 'w-4 h-4 text-white' })}
                </div>
                <h2 className="text-sm font-display font-semibold dark:text-white/90">{OVERLAY_CONFIG.find(c => c.key === activeOverlay)?.label}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsFullScreen(v => !v)} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all">
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => { setActiveOverlay(null); setIsFullScreen(false); }} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mx-6 h-px bg-white/[0.06]" />
          </div>

          {/* Content */}
          <div className="p-6">
            {activeOverlay === 'tasks' && (
              <div className="space-y-4">
                <TodayTasks 
                  tasks={tasks} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask} 
                  onAddTask={() => setIsAddingTask(true)} 
                  onReorder={setTasks}
                />
                <ProgressTracker 
                  tasks={tasks} 
                  streak={userStats.currentStreak} 
                  totalFocusSeconds={userStats.totalFocusSeconds} 
                />
              </div>
            )}
            {activeOverlay === 'quests' && <DailyQuests />}
            {activeOverlay === 'exams' && (
              <UpcomingExams 
                exams={exams} 
                onDelete={deleteExam} 
                onAdd={() => setIsAddingExam(true)} 
                onViewPath={(exam) => { setActiveOverlay(null); setSelectedExamForPath(exam); }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Minimal Profile Bar - top right */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-30">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/[0.06] shadow-lg">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium dark:text-white/90 leading-tight">{user?.displayName}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 dark:text-slate-500">Scholar</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand/20">
            {user?.displayName?.charAt(0) || 'S'}
          </div>
          <button onClick={() => signOut()} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ZenHero - full viewport hero */}
      <div className="min-h-screen flex items-center justify-center">
        <ZenHero timerSlot={
          <StudyTimer compact />
        } />
      </div>

      {/* Pet Engine - draggable interactive companion */}
      {ENABLE_PETS && petVisible && <PetEngine onOpenPanel={() => setShowPetPanel(true)} feedTrigger={feedTrigger} overlayOpen={activeOverlay !== null} petSize={petSize} />}

      {/* Bottom Action Toolbar - centered dock */}
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-xl lg:rounded-2xl border border-white/20 dark:border-white/[0.06] shadow-2xl shadow-black/10">
          {OVERLAY_CONFIG.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveOverlay(item.key === activeOverlay ? null : item.key); setIsFullScreen(false); }}
                className={`flex flex-col items-center gap-0.5 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg lg:rounded-xl transition-all ${
                  activeOverlay === item.key
                    ? 'bg-brand text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                <span className="text-[6px] lg:text-[7px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
          {ENABLE_PETS && (
            <>
              <div className="w-px h-5 lg:h-6 bg-white/[0.06]" />
              <button
                onClick={() => setShowPetPanel(true)}
                className={`relative flex flex-col items-center gap-0.5 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg lg:rounded-xl transition-all ${
                  showPetPanel
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.08]'
                }`}
              >
                <PawPrint className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                <span className="text-[6px] lg:text-[7px] font-bold uppercase tracking-wider">Pet</span>
                {/* Hunger indicator dot */}
                <span className={`absolute -top-0.5 -right-0.5 w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full border border-slate-900 transition-colors ${
                  petState.health === 'dormant' ? 'bg-slate-500' :
                  petState.health === 'weak' ? 'bg-rose-400' :
                  petState.hunger > 50 ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overlay panels */}
      <AnimatePresence mode="wait">
        {renderOverlay()}
      </AnimatePresence>

      {/* Pet panel */}
      <AnimatePresence>
        {ENABLE_PETS && showPetPanel && <PetPanel onClose={() => setShowPetPanel(false)} onFeed={() => setFeedTrigger(c => c + 1)} petVisible={petVisible} petSize={petSize} onToggleVisible={(v) => { setPetVisible(v); storage.savePetVisible(v); }} onChangeSize={(s) => { setPetSize(s); storage.savePetSize(s); }} />}
      </AnimatePresence>

      {/* Modals */}
      <AddTaskModal 
        isOpen={isAddingTask} 
        onClose={() => setIsAddingTask(false)} 
        onAdd={addTask} 
      />
      <AddExamModal 
        isOpen={isAddingExam} 
        onClose={() => setIsAddingExam(false)} 
        onAdd={addExam} 
      />
      <DailyReflection 
        isOpen={isReflecting}
        onClose={() => setIsReflecting(false)}
        onCompleteDay={handleCompleteDay}
        stats={{
          completedTasks: tasks.filter(t => t.completed).length,
          totalTasks: tasks.length,
          focusTime: formatFocusTime(userStats.totalFocusSeconds)
        }}
        unfinishedTasks={tasks.filter(t => !t.completed)}
      />

      {selectedExamForPath && (
        <PathToMastery 
          isOpen={!!selectedExamForPath}
          onClose={() => { setSelectedExamForPath(null); }}
          subject={subjects.find(s => s.id === selectedExamForPath.subjectId)!}
          examTitle={selectedExamForPath.subject}
          daysLeft={selectedExamForPath.daysLeft}
        />
      )}

      {ENABLE_PETS && <RewardAnimationLayer />}
      <DevMenu />
    </div>
  );
};

export default Dashboard;
