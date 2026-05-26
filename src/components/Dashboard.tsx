import React, { useState } from 'react';
import { 
  LogOut, 
  Plus
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

const Dashboard = () => {
  const { 
    user, logout, subjects, tasks, addTask, toggleTask, deleteTask, setTasks, 
    userStats, exams, addExam, deleteExam, selectedExamForPath, setSelectedExamForPath 
  } = useStudy();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);

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
    <div className="min-h-screen p-4 sm:p-6 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Minimal Profile Bar */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/20">
            <div className="text-right">
              <p className="text-sm font-medium dark:text-white/90 leading-tight">{user?.displayName}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Scholar</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand/20">
              {user?.displayName?.charAt(0) || 'S'}
            </div>
            <button onClick={logout} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Hero Section */}
        <ZenHero />

        {/* Daily Quests */}
        <div className="mb-12">
          <DailyQuests />
        </div>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left: Tasks & Progress */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold dark:text-white/90 tracking-tight">Today's Focus</h2>
              <button 
                onClick={() => setIsAddingTask(true)}
                className="p-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
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

          {/* Right: Timer & Deadlines */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            <StudyTimer />
            <UpcomingExams 
              exams={exams} 
              onDelete={deleteExam} 
              onAdd={() => setIsAddingExam(true)} 
              onViewPath={(exam) => setSelectedExamForPath(exam)}
            />
          </aside>
        </main>

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
