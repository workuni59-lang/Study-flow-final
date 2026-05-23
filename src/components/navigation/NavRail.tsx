import React from 'react';
import { LayoutDashboard, BookOpen, Settings, Zap, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface NavRailProps {
  activeView: 'dashboard' | 'subjects' | 'achievements';
  onViewChange: (view: 'dashboard' | 'subjects' | 'achievements') => void;
}

export const NavRail = ({ activeView, onViewChange }: NavRailProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'achievements', label: 'Trophy Room', icon: Trophy },
  ] as const;

  return (
    <>
      {/* Desktop Sidebar (Rail) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col items-center py-10 z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 mb-12">
          <Zap className="w-7 h-7 fill-current" />
        </div>

        <nav className="flex flex-col gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`p-4 rounded-2xl transition-all relative group ${
                activeView === item.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}
              </span>
              {activeView === item.id && (
                <motion.div 
                  layoutId="activeRail"
                  className="absolute -left-4 top-2 bottom-2 w-1.5 bg-indigo-600 rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button className="p-4 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-around items-center z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeView === item.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-400'
            }`}
          >
            <item.icon className={`w-6 h-6 transition-transform ${activeView === item.id ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
