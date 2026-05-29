import React from 'react';
import { LayoutDashboard, BookOpen, Settings, Zap, Trophy, Crown, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';

interface NavRailProps {
  activeView: 'dashboard' | 'subjects' | 'achievements' | 'analytics' | 'settings';
  onViewChange: (view: 'dashboard' | 'subjects' | 'achievements' | 'analytics' | 'settings') => void;
}

export const NavRail = ({ activeView, onViewChange }: NavRailProps) => {
  const { userStats } = useStudy();
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'achievements', label: 'Progress', icon: Trophy },
  ] as const;

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-r border-slate-100/50 dark:border-slate-800/30 flex-col items-center py-8 z-50">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20 mb-10 relative group cursor-pointer" onClick={() => onViewChange('dashboard')}>
          <Zap className="w-5 h-5 fill-current" />
          {userStats.isPremium && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg"
            >
              <Crown className="w-2.5 h-2.5 text-white" />
            </motion.div>
          )}
        </div>

        <nav className="flex flex-col gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`p-3 rounded-xl transition-all relative group ${
                activeView === item.id 
                  ? 'bg-brand/10 text-brand' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[9px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                {item.label}
              </span>
              {activeView === item.id && (
                <motion.div 
                  layoutId="activeRail"
                  className="absolute -left-3 top-1 bottom-1 w-1 bg-brand rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => onViewChange('settings')}
            className={`p-3 rounded-xl transition-all relative group ${
              activeView === 'settings' 
                ? 'bg-brand/10 text-brand' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[9px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
              Settings
            </span>
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-t border-slate-100/50 dark:border-slate-800/30 px-4 py-3 flex justify-around items-center z-50">
        {[...navItems, { id: 'settings', label: 'Settings', icon: Settings }].map((item: any) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeView === item.id 
                ? 'text-brand' 
                : 'text-slate-400'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform ${activeView === item.id ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
