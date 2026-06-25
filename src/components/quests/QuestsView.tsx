import React from 'react';
import { Target, Sparkles, CheckCircle2, Clock, Zap, Star, Swords, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { SEED_QUESTS, type GameQuest } from '../../lib/gamification';

const TIER_CONFIG = {
  daily: {
    card: 'bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-300',
    progressFill: 'bg-violet-400 shadow-[0_0_6px_#a78bfa88] rounded-full',
    xpBadge: 'text-xs font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/20 rounded-full px-2.5 py-0.5',
    tierLabel: 'text-[10px] font-bold tracking-widest text-violet-300/70 uppercase',
    iconWrap: 'w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center',
    iconColor: 'text-violet-400',
  },
  weekly: {
    card: 'bg-[#0f0a2a]/80 border border-violet-500/20 rounded-2xl hover:border-violet-500/40 hover:shadow-[0_0_20px_#7c3aed18] transition-all duration-300',
    progressFill: 'bg-violet-500 shadow-[0_0_8px_#7c3aed99] rounded-full',
    xpBadge: 'text-xs font-semibold text-violet-200 bg-violet-500/20 border-violet-400/30 rounded-full px-2.5 py-0.5',
    tierLabel: 'text-[10px] font-bold tracking-widest text-violet-200/80 uppercase',
    iconWrap: 'w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center shadow-[0_0_10px_#7c3aed22]',
    iconColor: 'text-violet-300',
  },
  milestone: {
    card: 'bg-[#130d2a]/90 border border-amber-400/25 rounded-2xl relative overflow-hidden hover:border-amber-400/50 hover:shadow-[0_0_28px_#f59e0b20] transition-all duration-300',
    progressFill: 'bg-amber-400 shadow-[0_0_10px_#f59e0baa] rounded-full',
    xpBadge: 'text-xs font-semibold text-amber-300 bg-amber-400/15 border border-amber-400/25 rounded-full px-2.5 py-0.5',
    tierLabel: 'text-[10px] font-bold tracking-widest text-amber-300/80 uppercase',
    iconWrap: 'w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shadow-[0_0_12px_#f59e0b22]',
    iconColor: 'text-amber-400',
  },
};

const QuestCard = ({ quest, progress, index }: { quest: GameQuest; progress: number; index: number }) => {
  const percentage = Math.min(100, (progress / quest.goal) * 100);
  const completed = progress >= quest.goal;
  const cfg = TIER_CONFIG[quest.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      className={`relative group ${cfg.card} ${completed ? 'opacity-60 border-white/[0.04]' : ''}`}
    >
      {quest.tier === 'milestone' && (
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,#f59e0b06_50%,transparent_60%)] pointer-events-none" />
      )}

      {completed ? (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
          <Check className="w-3 h-3 text-emerald-400" />
        </div>
      ) : (
        <span className={`absolute top-3 right-3 group-hover:scale-105 transition-transform duration-200 ${cfg.xpBadge}`}>
          +{quest.reward.xp} XP
        </span>
      )}

      <div className="p-4 flex flex-col">
        <span className={cfg.tierLabel}>{quest.tier}</span>

        <h4 className={`text-sm font-medium mt-2 mb-0.5 ${completed ? 'line-through text-white/40' : 'text-white/90'}`}>
          {quest.title}
        </h4>
        <p className="text-[10px] text-white/40 leading-relaxed mb-3 flex-1">
          {quest.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-medium uppercase tracking-wider">
            <span className={completed ? 'text-emerald-400' : 'text-white/40'}>
              {completed ? 'Done' : 'Progress'}
            </span>
            <span className="text-xs text-white/30 font-mono">{progress} / {quest.goal}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className={`h-full ${cfg.progressFill}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuestSection = ({ tier, quests, progress }: { tier: GameQuest['tier']; quests: GameQuest[]; progress: Record<string, number> }) => {
  const tierQuests = quests.filter(q => q.tier === tier);
  if (tierQuests.length === 0) return null;

  const titles = { daily: 'Daily Quests', weekly: 'Weekly Quests', milestone: 'Milestone Quests' };
  const descs = {
    daily: 'Reset every day — quick wins to keep momentum.',
    weekly: 'Reset every Monday — deeper goals for the week.',
    milestone: 'One-time long-term goals that never reset.',
  };
  const refreshLabels = { daily: 'Resets daily', weekly: 'Resets Monday', milestone: 'Never resets' };

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-white/80 tracking-wide uppercase">{titles[tier]}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
          <span className="text-[10px] text-white/25 tracking-widest uppercase">{refreshLabels[tier]}</span>
        </div>
        <p className="text-xs text-white/30 mb-5 -mt-2">{descs[tier]}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tierQuests.map((q, i) => (
          <QuestCard key={q.id} quest={q} progress={progress[q.id] || 0} index={i} />
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

        <div className="flex items-center gap-2">
          {[
            { label: 'LEVEL', value: gameLevel, color: 'text-white' },
            { label: 'GOLD', value: gameGold, color: 'text-amber-400' },
            { label: 'XP', value: gameXp, color: 'text-violet-400' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] min-w-[48px]">
              <span className={`text-base font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-white/30 tracking-widest uppercase mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

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
