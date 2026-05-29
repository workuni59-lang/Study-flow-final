import { Clock, Zap, Flame } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { MobileTimer } from './MobileTimer';

const formatFocusTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const MobileDashboard = () => {
  const { user } = useAuth();
  const { userStats } = useStudy();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0c10]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold dark:text-white">
            {user?.displayName?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Level {userStats.level} · {userStats.title}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {user?.displayName?.charAt(0) || 'S'}
        </div>
      </div>

      {/* Timer */}
      <MobileTimer />

      {/* Stats row */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
          <Clock className="w-4 h-4 text-brand mx-auto mb-1" />
          <p className="text-lg font-display font-semibold dark:text-white">{formatFocusTime(userStats.totalFocusSeconds)}</p>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Focus</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-display font-semibold dark:text-white">{userStats.currentStreak}</p>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Day Streak</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
          <Zap className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-display font-semibold dark:text-white">{userStats.totalXP}</p>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total XP</p>
        </div>
      </div>
    </div>
  );
};
