import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Zap,
  Plus,
  ArrowRight
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
import { DevMenu } from './dashboard/DevMenu';
import { storage } from '../services/storage';
import { getDailyQuote } from '../lib/quotes';

const Dashboard = () => {
  const { 
    user, logout, subjects, tasks, addTask, toggleTask, deleteTask, setTasks, 
    userStats, exams, addExam, deleteExam, selectedExamForPath, setSelectedExamForPath 
  } = useStudy();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [quote] = useState(getDailyQuote());

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
    <div className="p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 md:mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
           <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase mb-6">
                Welcome back, <span className="text-indigo-600">{user?.displayName?.split(' ')[0]}</span>
              </h1>
              
              <div className="flex gap-4 items-start bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shrink-0">
                    <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium italic text-sm md:text-base leading-relaxed">"{quote.text}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">— {quote.author}</p>
                </div>
              </div>
           </div>

           <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-slate-900/50 p-3 rounded-[24px] border border-slate-100 dark:border-slate-800">
              <div className="hidden md:flex flex-col items-end px-2">
                <span className="font-bold dark:text-white text-sm">{user?.displayName}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user?.email}</span>
              </div>
              <img src={user?.photoURL || ''} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm" />
              <button onClick={logout} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:text-rose-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
           </div>
        </header>

        <div className="mb-12">
          <DailyQuests />
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Desktop Right Column (4/12) - Timer & Deadlines */}
          <aside className="lg:col-span-4 lg:order-2 flex flex-col gap-8">
            <StudyTimer onTick={handleTimerTick} />
            <UpcomingExams 
              exams={exams} 
              onDelete={deleteExam} 
              onAdd={() => setIsAddingExam(true)} 
              onViewPath={(exam) => setSelectedExamForPath(exam)}
            />
          </aside>

          {/* Desktop Left Column (8/12) - Tasks & Progress */}
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
