import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Zap,
  Plus,
  ArrowRight,
  Crown
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
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
import { storage } from '../services/storage';

const Dashboard = () => {
  const { 
    user, logout, subjects, tasks, addTask, toggleTask, deleteTask, setTasks, 
    userStats, exams, addExam, deleteExam, selectedExamForPath, setSelectedExamForPath 
  } = useStudy();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);

  const handleTimerTick = () => {
  };

  const handleCompleteDay = () => {
    setIsReflecting(false);
  };

  const formatFocusTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-6 md:p-12 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Floating Profile & Logout (Compact) */}
        <div className="flex justify-end mb-8">
           <div className="flex items-center gap-4 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-2 pl-4 rounded-2xl border border-white/10 shadow-xl">
              <div className="flex flex-col items-end">
                <span className="font-bold dark:text-white text-xs">{user?.displayName}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Elite Scholar</span>
              </div>
              <img src={user?.photoURL || ''} className="w-10 h-10 rounded-xl border border-white/10" />
              <button onClick={logout} className="p-2 rounded-xl bg-white/5 hover:text-rose-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Zen Hero Section */}
        <ZenHero />

        <div className="mb-20">
          <DailyQuests />
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Timer & Deadlines (Right Column) */}
          <aside className="lg:col-span-4 lg:order-2 flex flex-col gap-8">
            <StudyTimer onTick={handleTimerTick} />
            <UpcomingExams 
              exams={exams} 
              onDelete={deleteExam} 
              onAdd={() => setIsAddingExam(true)} 
              onViewPath={(exam) => setSelectedExamForPath(exam)}
            />
          </aside>

          {/* Tasks & Progress (Left Column) */}
          <section className="lg:col-span-8 lg:order-1 flex flex-col gap-8">
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
          </section>
        </main>

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
            onClose={() => setSelectedExamForPath(null)}
            subject={subjects.find(s => s.id === selectedExamForPath.subjectId)!}
            examTitle={selectedExamForPath.subject}
            daysLeft={selectedExamForPath.daysLeft}
          />
        )}

        <DevMenu />
      </div>
    </div>
  );
};

export default Dashboard;
