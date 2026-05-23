import React from 'react';
import { Target, Zap, Clock, CheckCircle2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { Quest } from '../../lib/gamification';

export const DailyQuests = () => {
  const { quests } = useStudy();

  const getIcon = (type: Quest['type']) => {
    switch (type) {
      case 'tasks': return Zap;
      case 'focus': return Clock;
      case 'mastery': return Target;
      default: return Star;
    }
  };

  const getProgressLabel = (quest: Quest) => {
    if (quest.type === 'focus') {
      return `${Math.floor(quest.progress / 60)} / ${Math.floor(quest.requirement / 60)}m`;
    }
    return `${quest.progress} / ${quest.requirement}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Daily Quests</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Refreshes Daily</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quests.map((quest) => {
          const Icon = getIcon(quest.type);
          const percentage = (quest.progress / quest.requirement) * 100;

          return (
            <div 
              key={quest.id}
              className={`p-6 rounded-[32px] border transition-all relative overflow-hidden flex flex-col ${
                quest.completed 
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quest.completed ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                  {quest.completed ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block">+{quest.xpReward} XP</span>
                </div>
              </div>

              <h4 className={`font-bold text-sm mb-1 ${quest.completed ? 'text-emerald-700 dark:text-emerald-400' : 'dark:text-white'}`}>
                {quest.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 flex-1">
                {quest.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                  <span className={quest.completed ? 'text-emerald-600' : 'text-slate-400'}>
                    {quest.completed ? 'Complete' : 'In Progress'}
                  </span>
                  <span className="dark:text-slate-400">{getProgressLabel(quest)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className={`h-full rounded-full ${quest.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
