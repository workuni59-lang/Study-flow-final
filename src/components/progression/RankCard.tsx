import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import type { RankTier } from '../../lib/progression';
import { getIdentity } from '../../lib/progression/identities';
import { totalXpForLevel } from '../../lib/progression';
import { formatXP } from './BadgeSvg';

interface RankCardProps {
  key?: string | number;
  rank: RankTier;
  isCurrent: boolean;
  isUnlocked: boolean;
  userLevel: number;
}

export const RankCard = ({ rank, isCurrent, isUnlocked, userLevel }: RankCardProps) => {
  const [isMobile] = useState(() => window.innerWidth < 768);
  const identity = getIdentity(rank.id);
  const xpRequired = totalXpForLevel(rank.minLevel);
  const nextLevel = rank.maxLevel === Infinity ? null : rank.maxLevel + 1;
  const progress = isCurrent
    ? Math.min(100, ((userLevel - rank.minLevel) / Math.max(1, rank.maxLevel - rank.minLevel)) * 100)
    : isUnlocked ? 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isMobile ? {} : { scale: 1.005 }}
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-500
        ${isCurrent
          ? 'bg-white/[0.08] border-white/10'
          : isUnlocked
            ? 'bg-white/[0.04] border-white/[0.06]'
            : 'bg-white/[0.02] border-white/[0.04]'
        }
      `}
      style={isCurrent ? {
        borderLeft: `3px solid ${identity.color}`,
        boxShadow: `0 0 24px ${identity.color}15`,
      } : {}}
    >
      {/* Shimmer overlay for current card — hidden on mobile */}
      <div className="hidden md:block">
        {isCurrent && (
          <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" initial={false}>
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                transform: 'skewX(-20deg)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </div>

      {/* Top gradient bar */}
      <div className="relative w-full h-[5px] overflow-hidden transition-all duration-500"
        style={{
          background: isUnlocked
            ? `linear-gradient(90deg, ${identity.gradientFrom}, ${identity.gradientTo})`
            : `${identity.gradientFrom}22`,
        }}
      >
        {isCurrent && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          {/* Rank icon */}
          <div
            className={`
              w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0 border-2 transition-all duration-500
              ${isUnlocked
                ? ''
                : 'border-transparent bg-black/5'
              }
              ${isCurrent ? 'scale-105 md:scale-110' : ''}
            `}
            style={{
              borderColor: isUnlocked ? identity.color : 'transparent',
              background: isUnlocked
                ? `linear-gradient(135deg, ${identity.gradientFrom}22, ${identity.gradientTo}22)`
                : 'rgba(0,0,0,0.03)',
              boxShadow: isCurrent ? `0 4px 16px ${identity.color}30` : 'none',
            }}
          >
            {rank.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm md:text-base font-bold leading-tight ${isCurrent ? 'text-white' : 'text-white/85'}`}>
                {rank.title}
              </h3>
              {isCurrent && (
                <motion.span
                  animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0.4)', '0 0 14px rgba(99,102,241,0.8)', '0 0 0px rgba(99,102,241,0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[8px] font-black uppercase tracking-wider"
                >
                  Current
                </motion.span>
              )}
              {isUnlocked && !isCurrent && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {!isUnlocked && (
                <Lock className="w-3 h-3 text-slate-500" />
              )}
            </div>

            {/* Subtitle */}
            {isUnlocked && (
              <p className="text-[10px] font-medium text-white/70 mt-0.5">{identity.subtitle}</p>
            )}

            <p className={`text-[11px] mt-1 leading-relaxed ${isCurrent ? 'text-white/65' : 'text-white/70'}`}>
              {identity.description}
            </p>

            <div className="flex items-center gap-3 mt-2.5">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                isCurrent ? 'text-indigo-400' : 'text-white/70'
              }`}>
                Lv {rank.minLevel}{rank.maxLevel === Infinity ? '+' : ` — ${rank.maxLevel}`}
              </span>
              <span className="text-[7px] text-white/50">·</span>
              <span className="text-[9px] font-medium text-white/70">
                {formatXP(xpRequired)} XP
              </span>
              {isCurrent && nextLevel !== null && (
                <>
                  <span className="text-[7px] text-slate-500">·</span>
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-indigo-400">
                    <ArrowRight className="w-3 h-3" />
                    Next Lv {nextLevel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* XP progress bar - only for unlocked */}
        {isUnlocked && (
          <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full relative"
              style={{
                background: isCurrent
                  ? 'linear-gradient(90deg, rgb(99,102,241), rgb(139,92,246))'
                  : `linear-gradient(90deg, ${identity.gradientFrom}, ${identity.gradientTo})`,
                boxShadow: isCurrent ? '0 0 8px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {isCurrent && (
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                  animate={{ boxShadow: ['0 0 4px rgba(255,255,255,0.4)', '0 0 8px rgba(255,255,255,0.8)', '0 0 4px rgba(255,255,255,0.4)'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
