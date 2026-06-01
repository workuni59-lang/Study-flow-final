import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import type { RankTier } from '../../lib/progression';
import { getIdentity } from '../../lib/progression/identities';
import { totalXpForLevel } from '../../lib/progression';

interface RankCardProps {
  rank: RankTier;
  isCurrent: boolean;
  isUnlocked: boolean;
  userLevel: number;
}

export const RankCard = ({ rank, isCurrent, isUnlocked, userLevel }: RankCardProps) => {
  const identity = getIdentity(rank.id);
  const xpRequired = totalXpForLevel(rank.minLevel);
  const nextLevel = rank.maxLevel === Infinity ? null : rank.maxLevel + 1;

  const cardBorder = isCurrent
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(255,255,255,0.08)';

  const cardBg = isCurrent
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(255,255,255,0.05)';

  const cardShadow = 'none';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        border: cardBorder,
        borderLeft: isCurrent ? `3px solid ${identity.color}` : undefined,
        background: cardBg,
        boxShadow: cardShadow,
        transition: 'all 0.5s',
      }}
    >
      {/* Shimmer overlay for current card */}
      {isCurrent && (
        <motion.div
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
          initial={false}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: '-100% 0',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              transform: 'skewX(-20deg)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* Top gradient bar */}
      <div
        style={{
          height: '6px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: isUnlocked
            ? `linear-gradient(90deg, ${identity.gradientFrom}, ${identity.gradientTo})`
            : `${identity.gradientFrom}33`,
        }}
      >
        {isCurrent && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Rank icon circle */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
              border: isUnlocked ? `2px solid ${identity.color}` : '2px solid transparent',
              background: isUnlocked
                ? `linear-gradient(135deg, ${identity.gradientFrom}22, ${identity.gradientTo}22)`
                : 'rgba(0,0,0,0.03)',
              transform: isCurrent ? 'scale(1.1)' : 'none',
              boxShadow: isCurrent ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            {rank.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 1.25,
                color: isCurrent ? '#fff' : 'rgba(255,255,255,0.9)',
              }}>
                {rank.title}
              </h3>
              {isCurrent && (
                <motion.span
                  animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0.4)', '0 0 14px rgba(99,102,241,0.8)', '0 0 0px rgba(99,102,241,0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgb(99,102,241)',
                    color: '#fff',
                    fontSize: '8px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Current
                </motion.span>
              )}
              {isUnlocked && !isCurrent && <CheckCircle2 style={{ width: '14px', height: '14px', color: 'rgb(16,185,129)' }} />}
              {!isUnlocked && <Lock style={{ width: '12px', height: '12px', color: 'rgba(148,163,184,0.5)' }} />}
            </div>

            <p style={{
              fontSize: '11px',
              marginTop: '4px',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.55)',
            }}>
              {identity.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: isCurrent ? 'rgb(99,102,241)' : 'rgba(255,255,255,0.4)',
              }}>
                Lv {rank.minLevel}{rank.maxLevel === Infinity ? '+' : ` — ${rank.maxLevel}`}
              </span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>·</span>
              <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                {xpRequired.toLocaleString()} XP
              </span>
              {isCurrent && nextLevel !== null && (
                <>
                  <span style={{ fontSize: '8px', color: 'rgba(148,163,184,0.5)' }}>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 600, color: 'rgb(99,102,241)' }}>
                    <ArrowRight style={{ width: '12px', height: '12px' }} />
                    Next Lv {nextLevel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* XP progress bar for unlocked ranks */}
          {isUnlocked && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(148,163,184,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: isCurrent
                    ? `${Math.min(100, ((userLevel - rank.minLevel) / Math.max(1, rank.maxLevel - rank.minLevel)) * 100)}%`
                    : '100%',
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: isCurrent
                    ? 'linear-gradient(90deg, rgb(99,102,241), rgb(139,92,246))'
                    : `linear-gradient(90deg, ${identity.gradientFrom}, ${identity.gradientTo})`,
                  borderRadius: '0 2px 2px 0',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
