import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, ChevronRight, Zap, ArrowUpRight, Lock, Star } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { RANK_TIERS, PROGRESSION_BADGES, totalXpForLevel, xpForLevel } from '../../lib/progression';
import { getIdentity } from '../../lib/progression/identities';
import { RankCard } from './RankCard';
import { BadgeSvg, formatXP, type BadgeTier } from './BadgeSvg';

const BADGE_TIER_MAP: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const RARITY_COLORS: Record<string, string> = {
  Common: 'text-slate-600 dark:text-slate-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-amber-400',
};

const STAGGER = 0.03;

export const ProgressionView = () => {
  const [isMobile] = useState(() => window.innerWidth < 768);
  const { progression, progressionBadges, gameXp } = useStudy();
  const { level, totalXp, currentXp, xpForNext, percentage, rank, nextRank } = progression;
  const identity = getIdentity(rank.id);

  const nextUnlockedBadge = PROGRESSION_BADGES.find(b => level < b.levelRequired);
  const prevBadges = PROGRESSION_BADGES.filter(b => level >= b.levelRequired);
  const milestones = PROGRESSION_BADGES;

  const P = (p: { d?: number; h?: any }) => p;

  return (
    <div className="max-w-[1024px] mx-auto space-y-8 md:space-y-12 pb-16">
      {/* ── Header: Current Status ── */}
      <header className="space-y-4 md:space-y-6">
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: -8 }}
          animate={isMobile ? {} : { opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            <Sparkles className="w-3 h-3" />
            Progression Journey
          </div>
        </motion.div>

        {/* Current Rank Hero */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl md:rounded-[32px] p-5 md:p-10 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${identity.gradientFrom}, ${identity.gradientTo})`,
          }}
        >
          {/* Animated background pattern — hidden on mobile */}
          <div className="absolute inset-0 opacity-[0.06]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
            <div className="hidden md:block absolute -top-1/2 -right-1/2 w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Giant icon watermark */}
          <div className="absolute top-0 right-0 p-5 md:p-8 text-[60px] md:text-[120px] opacity-[0.08] select-none leading-none pointer-events-none">
            {rank.icon}
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
              Current Rank
            </span>

            <div className="flex items-center gap-3 mt-2 mb-1">
              <motion.span
                initial={isMobile ? false : { scale: 0, rotate: -20 }}
                animate={isMobile ? {} : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="text-2xl md:text-3xl"
              >
                {rank.icon}
              </motion.span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{rank.title}</h1>
            </div>

            <p className="text-sm text-white/70 max-w-md mt-1 leading-relaxed">
              {identity.description}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
              <div className="bg-white/[0.12] md:bg-white/10 md:backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/50">Level</p>
                <p className="text-xl md:text-2xl font-black mt-0.5">{level}</p>
              </div>
              <div className="bg-white/[0.12] md:bg-white/10 md:backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/50">Total XP</p>
                <p className="text-xl md:text-2xl font-black mt-0.5">{formatXP(totalXp)}</p>
              </div>
              <div className="bg-white/[0.12] md:bg-white/10 md:backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/50">To Next</p>
                <p className="text-xl md:text-2xl font-black mt-0.5">{formatXP(xpForNext - currentXp)}</p>
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-4 md:mt-5 w-full h-3 bg-white/15 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: isMobile ? 0 : 0.3 }}
                className="h-full bg-white rounded-full relative"
                style={{
                  boxShadow: '0 0 12px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              />
            </div>

            {/* Badges earned + Rank progress */}
            <div className="flex gap-4 md:gap-6 mt-4 md:mt-5 flex-wrap">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/50">Badges</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg md:text-xl font-black">{prevBadges.length}</span>
                  <span className="text-xs text-white/40">/ {milestones.length}</span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {milestones.map((b, i) => {
                    const unlocked = level >= b.levelRequired;
                    const id = getIdentity(i + 1);
                    return (
                      <div
                        key={b.id}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          unlocked
                            ? ''
                            : 'bg-white/15 border border-white/10'
                        }`}
                        style={unlocked ? {
                          background: `linear-gradient(135deg, ${id.gradientFrom}, ${id.gradientTo})`,
                        } : {}}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/50">Progress</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                  <Zap className="w-3.5 h-3.5 text-white/60" />
                  <span className="font-bold">{formatXP(currentXp)}</span>
                  <span className="text-white/40">/ {formatXP(xpForNext)} XP</span>
                </div>
              </div>
            </div>

            {/* Next rank indicator */}
            {nextRank && (
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 8 }}
                animate={isMobile ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0 : 0.5 }}
                className="mt-4 md:mt-5 flex items-center gap-2 bg-white/10 md:backdrop-blur-sm rounded-xl px-4 py-2.5 text-sm border border-white/10"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-white/50" />
                <span className="font-semibold text-white/80">Next: {nextRank.icon} {nextRank.title}</span>
                <ChevronRight className="w-3 h-3 text-white/30" />
                <span className="font-bold text-white/90">Level {nextRank.minLevel}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </header>

      {/* ── Full Rank Roadmap ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white/85">The Journey</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Every rank tells a story. Here is your complete path.</p>
        </div>

        <div className="space-y-2">
          {RANK_TIERS.map(r => (
            <RankCard
              key={r.id}
              rank={r}
              isCurrent={r.id === rank.id}
              isUnlocked={level >= r.minLevel}
              userLevel={level}
            />
          ))}
        </div>
      </section>

      {/* ── Badge Collection Gallery ── */}
      <section className="space-y-4 md:space-y-6">
        <motion.div
          initial={isMobile ? false : { opacity: 0 }}
          animate={isMobile ? {} : { opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold tracking-tight text-white/85">Badge Collection</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Milestone badges marking your greatest achievements.</p>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
          {milestones.map((b, idx) => {
            const tier = BADGE_TIER_MAP[b.id];
            if (!tier) return null;
            const unlocked = level >= b.levelRequired;
            const rarity = b.rarity;

            return (
              <motion.div
                key={b.id}
                initial={isMobile ? false : { opacity: 0, y: 16 }}
                animate={isMobile ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0 : 0.35 + idx * STAGGER, duration: 0.4 }}
                whileHover={isMobile ? {} : { y: -6, scale: 1.02 }}
                aria-label={`${b.name}${unlocked ? '' : ' (locked)'} — ${b.rarity} badge`}
                className="flex-shrink-0 w-[130px] md:w-[160px] snap-start rounded-2xl p-4 md:p-5 flex flex-col items-center text-center relative border transition-all duration-300"
                style={{
                  borderColor: unlocked
                    ? rarity === 'Common' ? 'rgba(148,163,184,0.25)' :
                      rarity === 'Rare' ? 'rgba(96,165,250,0.3)' :
                      rarity === 'Epic' ? 'rgba(167,139,250,0.3)' :
                      'rgba(251,191,36,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  background: unlocked
                    ? 'linear-gradient(180deg, rgba(30,41,59,0.6), rgba(30,41,59,0.3))'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                }}
              >
                <div className={!unlocked ? 'opacity-75 relative' : ''}>
                  <BadgeSvg tier={tier} size={isMobile ? 56 : 72} unlocked={unlocked} animate={!isMobile && unlocked && (rarity === 'Legendary' || rarity === 'Epic')} />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-full">
                      <Lock className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                </div>

                <p className={`text-[11px] font-bold mt-2.5 leading-tight ${unlocked ? 'text-white/90' : 'text-white/50'}`}>
                  {b.name}
                </p>

                <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 ${
                  unlocked ? RARITY_COLORS[rarity] || 'text-slate-500' : 'text-white/40'
                }`}>
                  {b.rarity}
                </span>

                <span className={`mt-2 px-3 py-1 rounded-full text-[9px] font-bold ${
                  unlocked
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/5 text-white/50'
                }`}>
                  {unlocked ? 'Earned' : `Lv ${b.levelRequired}`}
                </span>

                {/* Glow for unlocked high-rarity badges */}
                {unlocked && (rarity === 'Epic' || rarity === 'Legendary') && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      boxShadow: rarity === 'Legendary'
                        ? 'inset 0 0 30px rgba(255,107,53,0.15), 0 0 20px rgba(255,107,53,0.1)'
                        : 'inset 0 0 30px rgba(167,139,250,0.12), 0 0 20px rgba(167,139,250,0.08)',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Milestone Timeline ── */}
      <section className="space-y-4 md:space-y-6">
        <motion.div
          initial={isMobile ? false : { opacity: 0 }}
          animate={isMobile ? {} : { opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold tracking-tight text-white/85">Milestone Timeline</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Key progression milestones and what they unlock.</p>
        </motion.div>

        <div className="space-y-3">
          {milestones.map((b, i) => {
            const tier = BADGE_TIER_MAP[b.id];
            if (!tier) return null;
            const unlocked = level >= b.levelRequired;
            const isNext = !unlocked && (i === 0 || level >= (milestones[i - 1]?.levelRequired ?? 0));
            const rankAtBadge = RANK_TIERS.find(r => b.levelRequired >= r.minLevel && b.levelRequired <= (r.maxLevel === Infinity ? Infinity : r.maxLevel));

            const Tag = isMobile ? 'div' : motion.div;

            return (
              <Tag
                key={b.id}
                {...(!isMobile ? {
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.45 + i * 0.05 },
                } : {})}
                className={`
                  flex items-start gap-4 rounded-2xl p-5 border transition-all duration-300
                  ${unlocked
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : isNext
                      ? 'border-indigo-500/30 bg-indigo-500/5'
                      : 'border-white/5 bg-white/[0.02]'
                  }
                `}
              >
                {/* Icon column with connector */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                    ${unlocked
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : isNext
                        ? 'border-indigo-500/60 bg-indigo-500/10'
                        : 'border-white/20 bg-white/5'
                    }
                  `}
                    style={isNext ? { boxShadow: '0 0 16px rgba(99,102,241,0.2)' } : {}}
                  >
                    <div className={`${unlocked ? '' : 'opacity-50 grayscale'} transition-all`}>
                      <BadgeSvg tier={tier} size={24} unlocked={unlocked} />
                    </div>
                  </div>
                  {i < milestones.length - 1 && (
                    <div className={`w-0.5 h-6 mt-2 rounded-full ${
                      unlocked ? 'bg-emerald-500/20' : 'bg-white/10'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm font-bold ${
                      unlocked ? 'text-white/95' : isNext ? 'text-indigo-400' : 'text-slate-500'
                    }`}>
                      {b.name}
                    </h4>
                    {unlocked && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
                        Unlocked
                      </span>
                    )}
                    {isNext && (
                      <motion.span
                        animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0.3)', '0 0 14px rgba(99,102,241,0.6)', '0 0 0px rgba(99,102,241,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-bold uppercase tracking-wider"
                      >
                        Next
                      </motion.span>
                    )}
                  </div>

                  <p className={`text-xs mt-1.5 leading-relaxed ${
                    unlocked ? 'text-slate-600 dark:text-slate-400' : 'text-slate-600'
                  }`}>
                    {b.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      unlocked ? 'text-slate-500' : 'text-slate-600'
                    }`}>
                      Level {b.levelRequired}
                    </span>
                    {rankAtBadge && (
                      <>
                        <span className="text-[8px] text-slate-600">·</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {rankAtBadge.icon} {rankAtBadge.title}
                        </span>
                      </>
                    )}
                    {!unlocked && (
                      <>
                        <span className="text-[8px] text-slate-600">·</span>
                        <span className="text-[10px] font-semibold text-indigo-400">
                          {b.levelRequired - level} levels away
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Tag>
            );
          })}
        </div>
      </section>

      {/* ── Next Reward ── */}
      {nextUnlockedBadge && (
        <section className="space-y-4">
          <motion.div
            initial={isMobile ? false : { opacity: 0 }}
            animate={isMobile ? {} : { opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold tracking-tight text-white/85">Next Reward</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Keep studying to unlock your next milestone.</p>
          </motion.div>

          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 16 }}
            animate={isMobile ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            whileHover={isMobile ? {} : { scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-indigo-500/5 border border-indigo-500/15"
          >
            {/* Decorative glow — hidden on mobile */}
            <div className="hidden md:block absolute -top-20 -right-20 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4 md:gap-6 flex-wrap">
              <div className="opacity-50 grayscale relative">
                <BadgeSvg tier={BADGE_TIER_MAP[nextUnlockedBadge.id] || 'bronze'} size={isMobile ? 64 : 88} unlocked={false} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="w-6 h-6 text-indigo-300/60" />
                </div>
              </div>

              <div className="flex-1 min-w-[180px] md:min-w-[200px]">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-wider mb-2">
                  <Target className="w-2.5 h-2.5" />
                  Next Milestone
                </div>
                <h4 className="text-base md:text-lg font-black text-white/95">{nextUnlockedBadge.name}</h4>
                <p className="text-sm text-slate-500 mt-1">{nextUnlockedBadge.description}</p>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-bold text-white/90">Level {nextUnlockedBadge.levelRequired}</span>
                    <span className="text-slate-500">required</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{nextUnlockedBadge.levelRequired - level} levels to go</span>
                  </div>
                </div>

                <div className="mt-3 w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (level / nextUnlockedBadge.levelRequired) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: isMobile ? 0 : 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, rgb(99,102,241), rgb(139,92,246))',
                      boxShadow: '0 0 8px rgba(99,102,241,0.3)',
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Level Requirements ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white/85">Level Requirements</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">XP needed for each level milestone.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  <th className="p-3 pl-5">Level</th>
                  <th className="p-3 hidden sm:table-cell">XP Required</th>
                  <th className="p-3 hidden md:table-cell">Total XP</th>
                  <th className="p-3 pr-5">Rank</th>
                </tr>
              </thead>
              <tbody>
                {[1, 5, 10, 15, 20, 30, 40, 50, 70, 100].map(l => {
                  const r = RANK_TIERS.find(rt => l >= rt.minLevel && l <= (rt.maxLevel === Infinity ? Infinity : rt.maxLevel));
                  const isRowActive = level === l;
                  const isRowPassed = level > l;
                  return (
                    <tr
                      key={l}
                      className={`text-xs border-t border-white/5 transition-colors ${
                        isRowActive
                          ? 'bg-indigo-500/10 font-semibold'
                          : isRowPassed
                            ? 'text-white/80'
                            : 'text-slate-500'
                      }`}
                    >
                      <td className="p-3 pl-5 font-bold">
                        Level {l}{l === 100 ? '+' : ''}
                        {isRowActive && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[7px] font-black uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </td>
                      <td className="p-3 hidden sm:table-cell font-mono text-slate-600 dark:text-slate-400">
                        {formatXP(xpForLevel(l))}
                      </td>
                      <td className="p-3 hidden md:table-cell font-mono text-slate-600 dark:text-slate-400">
                        {formatXP(totalXpForLevel(l))}
                      </td>
                      <td className="p-3 pr-5">
                        {r ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px] font-medium">
                            {r.icon} {r.title}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex justify-center py-8">
        <div className="w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>
    </div>
  );
};
