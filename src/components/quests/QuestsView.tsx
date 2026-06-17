import React from 'react';
import { Target, Sparkles, CheckCircle2, Clock, Zap, Star, Swords } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { DailyQuests } from '../dashboard/DailyQuests';
import { SEED_QUESTS, type GameQuest } from '../../lib/gamification';

const TierBadge = ({ tier }: { tier: GameQuest['tier'] }) => {
  const styles = {
    daily: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
    weekly: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50',
    milestone: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[tier]}`}>
      {tier}
    </span>
  );
};

const QuestCard = ({ quest, progress }: { key?: string | number; quest: GameQuest; progress: number }) => {
  const percentage = Math.min(100, (progress / quest.goal) * 100);
  const completed = progress >= quest.goal;

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col shadow-sm ${
      completed
        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/40'
        : 'bg-white dark:bg-[#141622] border-slate-100 dark:border-slate-800/50'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          completed ? 'bg-emerald-500 text-white' : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
        }`}>
          {completed ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={quest.tier} />
          <span className="text-[9px] font-semibold text-brand/70">+{quest.reward.xp} XP</span>
        </div>
      </div>

      <h4 className={`text-sm font-medium mb-0.5 ${
        completed ? 'text-emerald-600 dark:text-emerald-400' : 'dark:text-white/80'
      }`}>
        {quest.title}
      </h4>
      <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-3 flex-1">
        {quest.description}
      </p>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[8px] font-medium uppercase tracking-wider">
          <span className={completed ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'}>
            {completed ? 'Done' : 'Progress'}
          </span>
          <span className="text-slate-600 dark:text-slate-400">{progress} / {quest.goal}</span>
        </div>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-brand/60'}`}
          />
        </div>
      </div>
    </div>
  );
};

const QuestSection = ({ tier, quests, progress }: { tier: GameQuest['tier']; quests: GameQuest[]; progress: Record<string, number> }) => {
  const tierQuests = quests.filter(q => q.tier === tier);
  if (tierQuests.length === 0) return null;

  const titles = { daily: 'Daily Challenges', weekly: 'Weekly Quests', milestone: 'Milestone Objectives' };
  const descs = {
    daily: 'Reset every day — quick wins to keep momentum.',
    weekly: 'Reset every Monday — deeper goals for the week.',
    milestone: 'One-time long-term goals that never reset.',
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-display font-semibold dark:text-white/80 tracking-tight">{titles[tier]}</h3>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-0.5">{descs[tier]}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tierQuests.map(q => (
          <QuestCard key={q.id} quest={q} progress={progress[q.id] || 0} />
        ))}
      </div>
    </section>
  );
};

export const QuestsView = () => {
  const { quests, gameQuestProgress, gameLevel, gameXp, gameGold } = useStudy();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 dark:border-indigo-800/50">
            <Swords className="w-3 h-3" />
            Quests & Objectives
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase mb-2">Quests</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Complete objectives to earn XP and rewards.</p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Level</p>
              <p className="text-2xl font-display font-black dark:text-white">{gameLevel}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Gold</p>
              <p className="text-2xl font-display font-black text-amber-500">{gameGold}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">XP</p>
              <p className="text-2xl font-display font-black text-purple-500">{gameXp}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Old daily quests */}
      <DailyQuests />

      {/* New tiered quests */}
      <div className="space-y-10">
        <QuestSection tier="daily" quests={SEED_QUESTS} progress={gameQuestProgress} />
        <QuestSection tier="weekly" quests={SEED_QUESTS} progress={gameQuestProgress} />
        <QuestSection tier="milestone" quests={SEED_QUESTS} progress={gameQuestProgress} />
      </div>

      <div className="py-12 flex justify-center opacity-20">
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
      </div>
    </div>
  );
};
