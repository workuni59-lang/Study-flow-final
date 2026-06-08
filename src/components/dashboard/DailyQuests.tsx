import React from 'react';
import { Target, Zap, Clock, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold dark:text-white/80 tracking-tight">Daily Quests</h3>
        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Refreshes daily</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quests.map((quest) => {
          const Icon = getIcon(quest.type);
          const percentage = (quest.progress / quest.requirement) * 100;

          return (
            <div 
              key={quest.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col shadow-lg ${
                quest.completed 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/40' 
                  : 'bg-white dark:bg-[#141622] border-slate-100 dark:border-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${quest.completed ? 'bg-emerald-500 text-white' : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}>
                  {quest.completed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[9px] font-semibold text-brand/70">+{quest.xpReward} XP</span>
              </div>

              <h4 className={`text-sm font-medium mb-0.5 ${quest.completed ? 'text-emerald-600 dark:text-emerald-400' : 'dark:text-white/80'}`}>
                {quest.title}
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-3 flex-1">
                {quest.description}
              </p>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-medium uppercase tracking-wider">
                  <span className={quest.completed ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'}>
                    {quest.completed ? 'Done' : 'Progress'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">{getProgressLabel(quest)}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className={`h-full rounded-full ${quest.completed ? 'bg-emerald-500' : 'bg-brand/60'}`}
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
