import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, ChevronRight, Zap, ArrowUpRight, ArrowRight, Lock } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { RANK_TIERS, PROGRESSION_BADGES, getNewlyUnlockedBadges, totalXpForLevel, xpForLevel } from '../../lib/progression';
import { getIdentity } from '../../lib/progression/identities';
import { RankCard } from './RankCard';
import { BadgeSvg, formatXP, type BadgeTier } from './BadgeSvg';

const BADGE_TIER_MAP: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const TIER_GLOW: Record<string, string> = {
  bronze: '0 0 10px rgba(205,127,50,0.4)',
  silver: '0 0 10px rgba(100,160,220,0.4)',
  gold: '0 0 14px rgba(240,184,0,0.5)',
  platinum: '0 0 14px rgba(180,130,220,0.5)',
  diamond: '0 0 18px rgba(100,200,240,0.5)',
  legend: '0 0 22px rgba(255,107,53,0.6)',
};

const RARITY_TEXT: Record<string, string> = {
  Common: '#94a3b8',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#fbbf24',
};

export const ProgressionView = () => {
  const { progression, progressionBadges, gameXp } = useStudy();
  const { level, totalXp, currentXp, xpForNext, percentage, rank, nextRank } = progression;
  const identity = getIdentity(rank.id);

  const nextUnlockedBadge = PROGRESSION_BADGES.find(b => level < b.levelRequired);
  const prevBadges = PROGRESSION_BADGES.filter(b => level >= b.levelRequired);

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }} className="space-y-12 pb-16">
      {/* ── Header: Current Status ── */}
      <header className="space-y-6">
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '9999px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
            color: 'rgb(99,102,241)',
          }}
        >
          <Sparkles style={{ width: '12px', height: '12px' }} />
          Progression Journey
        </div>

        {/* Current Rank Hero — all stats inside */}
        <div
          style={{
            width: '100%', borderRadius: '32px', padding: '32px', color: '#fff',
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${identity.gradientFrom}, ${identity.gradientTo})`,
          }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0, fontSize: '120px', opacity: 0.1,
            userSelect: 'none', lineHeight: 1, pointerEvents: 'none',
          }}>
            {rank.icon}
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.7)' }}>
              Current Rank
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '30px' }}>{rank.icon}</span>
              <h1 style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.02em' }}>{rank.title}</h1>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', maxWidth: '448px' }}>
              {identity.description}
            </p>

            {/* Level / XP / To Next stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>Level</p>
                <p style={{ fontSize: '24px', fontWeight: 900 }}>{level}</p>
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>Total XP</p>
                <p style={{ fontSize: '24px', fontWeight: 900 }}>{formatXP(totalXp)}</p>
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>To Next</p>
                <p style={{ fontSize: '24px', fontWeight: 900 }}>{formatXP(xpForNext - currentXp)}</p>
              </div>
            </div>

            {/* XP progress bar */}
            <div style={{ marginTop: '16px', width: '100%', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))', borderRadius: '9999px' }}
              />
            </div>

            {/* Badges Earned + Rank Progress inside card */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>Badges Earned</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 900 }}>{prevBadges.length}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>/ {PROGRESSION_BADGES.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {PROGRESSION_BADGES.map((b, i) => {
                    const unlocked = level >= b.levelRequired;
                    return (
                      <div
                        key={b.id}
                        style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: unlocked
                            ? `linear-gradient(135deg, ${getIdentity(i + 1).gradientFrom}, ${getIdentity(i + 1).gradientTo})`
                            : 'rgba(255,255,255,0.2)',
                          border: unlocked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>Rank Progress</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '13px' }}>
                  <Zap style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ fontWeight: 700 }}>{formatXP(currentXp)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>/ {formatXP(xpForNext)} XP</span>
                </div>
              </div>
            </div>

            {/* Next rank indicator */}
            {nextRank && (
              <div style={{
                marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
                padding: '10px 16px', color: 'rgba(255,255,255,0.9)', fontSize: '12px',
              }}>
                <ArrowRight style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.6)' }} />
                <span style={{ fontWeight: 600 }}>Next: {nextRank.icon} {nextRank.title}</span>
                <ChevronRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontWeight: 700 }}>Level {nextRank.minLevel}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Full Rank Roadmap ── */}
      <section className="space-y-4">
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.85)' }}>The Journey</h3>
          <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', marginTop: '2px' }}>Every rank tells a story. Here is your complete path.</p>
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

      {/* ── Badge Collection Gallery — horizontal row ── */}
      <section className="space-y-6">
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.85)' }}>Badge Collection</h3>
          <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', marginTop: '2px' }}>Milestone badges marking your greatest achievements.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {PROGRESSION_BADGES.map(b => {
            const tier = BADGE_TIER_MAP[b.id];
            if (!tier) return null;
            const unlocked = level >= b.levelRequired;
            const rarity = b.rarity;
            return (
              <motion.div
                key={b.id}
                whileHover={{ y: -4 }}
                style={{
                  flex: '0 0 auto', width: '160px', borderRadius: '16px', padding: '20px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  position: 'relative',
                  border: unlocked
                    ? `1px solid ${rarity === 'Common' ? 'rgba(148,163,184,0.25)' : rarity === 'Rare' ? 'rgba(96,165,250,0.3)' : rarity === 'Epic' ? 'rgba(167,139,250,0.3)' : 'rgba(251,191,36,0.3)'}`
                    : '1px solid rgba(148,163,184,0.12)',
                  background: unlocked
                    ? 'rgba(30,41,59,0.5)'
                    : 'rgba(255,255,255,0.07)',
                }}
              >
                <div style={!unlocked ? { filter: 'opacity(0.75)', position: 'relative' } : {}}>
                  <BadgeSvg tier={tier} size={72} unlocked={unlocked} />
                  {!unlocked && (
                    <Lock style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', color: 'rgba(255,255,255,0.8)', zIndex: 10 }} />
                  )}
                </div>

                <p style={{
                  fontSize: '11px', fontWeight: 700, marginTop: '10px', lineHeight: 1.25,
                  color: unlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                }}>
                  {b.name}
                </p>

                <span style={{
                  fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px',
                  color: unlocked ? RARITY_TEXT[rarity] || 'rgba(148,163,184,0.6)' : 'rgba(255,255,255,0.5)',
                }}>
                  {b.rarity}
                </span>

                <span style={{
                  marginTop: '8px', padding: '2px 10px', borderRadius: '9999px',
                  background: unlocked ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.08)',
                  fontSize: '9px', fontWeight: 700,
                  color: unlocked ? 'rgb(16,185,129)' : 'rgba(255,255,255,0.5)',
                }}>
                  {unlocked ? 'Earned' : `Lv ${b.levelRequired}`}
                </span>

                {/* Glow for unlocked epic/legendary */}
                {unlocked && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '16px', pointerEvents: 'none',
                    boxShadow: rarity === 'Epic' || rarity === 'Legendary' ? TIER_GLOW[tier] : 'none',
                  }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Milestone Timeline — individual card layout ── */}
      <section className="space-y-6">
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.85)' }}>Milestone Timeline</h3>
          <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', marginTop: '2px' }}>Key progression milestones and what they unlock.</p>
        </div>

        <div className="space-y-3">
          {PROGRESSION_BADGES.map((b, i) => {
            const tier = BADGE_TIER_MAP[b.id];
            if (!tier) return null;
            const unlocked = level >= b.levelRequired;
            const isNext = !unlocked && (i === 0 || level >= (PROGRESSION_BADGES[i - 1]?.levelRequired ?? 0));
            const rankAtBadge = RANK_TIERS.find(r => b.levelRequired >= r.minLevel && b.levelRequired <= (r.maxLevel === Infinity ? Infinity : r.maxLevel));

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  borderRadius: '16px', padding: '20px',
                  border: unlocked
                    ? '1px solid rgba(16,185,129,0.2)'
                    : isNext
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(148,163,184,0.08)',
                  background: unlocked
                    ? 'rgba(30,41,59,0.5)'
                    : isNext
                      ? 'rgba(99,102,241,0.05)'
                      : 'rgba(30,41,59,0.3)',
                  opacity: !unlocked && !isNext ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    border: unlocked
                      ? '2px solid rgba(16,185,129,0.5)'
                      : isNext
                        ? '2px solid rgba(99,102,241,0.6)'
                        : '2px solid rgba(148,163,184,0.2)',
                    background: unlocked
                      ? 'rgba(16,185,129,0.08)'
                      : isNext
                        ? 'rgba(99,102,241,0.08)'
                        : 'rgba(148,163,184,0.05)',
                    boxShadow: isNext ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
                  }}>
                    <div style={{ opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(0.7)' }}>
                      <BadgeSvg tier={tier} size={26} unlocked={unlocked} />
                    </div>
                  </div>
                  {i < PROGRESSION_BADGES.length - 1 && (
                    <div style={{
                      width: '2px', height: '24px', marginTop: '8px',
                      background: unlocked ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.12)',
                      borderRadius: '1px',
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{
                      fontSize: '15px', fontWeight: 700,
                      color: unlocked ? 'rgba(255,255,255,0.95)' : isNext ? 'rgb(99,102,241)' : 'rgba(148,163,184,0.6)',
                    }}>
                      {b.name}
                    </h4>
                    {unlocked && (
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px',
                        background: 'rgba(16,185,129,0.12)', color: 'rgb(16,185,129)',
                        fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        Unlocked
                      </span>
                    )}
                    {isNext && (
                      <motion.span
                        animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0.3)', '0 0 14px rgba(99,102,241,0.6)', '0 0 0px rgba(99,102,241,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          padding: '2px 8px', borderRadius: '4px',
                          background: 'rgb(99,102,241)', color: '#fff',
                          fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}
                      >
                        Next
                      </motion.span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '12px', marginTop: '4px', lineHeight: 1.5,
                    color: unlocked ? 'rgba(203,213,225,0.7)' : 'rgba(148,163,184,0.5)',
                  }}>
                    {b.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: unlocked ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)',
                    }}>
                      Level {b.levelRequired}
                    </span>
                    {rankAtBadge && (
                      <>
                        <span style={{ fontSize: '8px', color: 'rgba(148,163,184,0.3)' }}>·</span>
                        <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(148,163,184,0.5)' }}>
                          {rankAtBadge.icon} {rankAtBadge.title}
                        </span>
                      </>
                    )}
                    {!unlocked && (
                      <>
                        <span style={{ fontSize: '8px', color: 'rgba(148,163,184,0.3)' }}>·</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgb(99,102,241)' }}>
                          {b.levelRequired - level} levels away
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── What You Unlock Next ── */}
      {nextUnlockedBadge && (
        <section className="space-y-4">
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.85)' }}>Next Reward</h3>
            <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', marginTop: '2px' }}>Keep studying to unlock your next milestone.</p>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '24px',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ opacity: 0.45, filter: 'grayscale(1)' }}>
                <BadgeSvg tier={BADGE_TIER_MAP[nextUnlockedBadge.id] || 'bronze'} size={88} unlocked={false} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '2px 8px', borderRadius: '9999px',
                  background: 'rgba(99,102,241,0.1)',
                  color: 'rgb(99,102,241)',
                  fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  <Target style={{ width: '10px', height: '10px' }} />
                  Next Milestone
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'rgba(255,255,255,0.95)' }}>{nextUnlockedBadge.name}</h4>
                <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.6)', marginTop: '4px' }}>{nextUnlockedBadge.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Level {nextUnlockedBadge.levelRequired}</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)' }}>required</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: 'rgb(99,102,241)' }}>
                    <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                    <span>{nextUnlockedBadge.levelRequired - level} levels to go</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', width: '100%', height: '8px', background: 'rgba(148,163,184,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (level / nextUnlockedBadge.levelRequired) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, rgb(99,102,241), rgb(139,92,246))', borderRadius: '9999px' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── XP Required Table ── */}
      <section className="space-y-4">
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.85)' }}>Level Requirements</h3>
          <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', marginTop: '2px' }}>XP needed for each level milestone.</p>
        </div>

        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(148,163,184,0.1)',
          background: 'rgba(30,41,59,0.4)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(148,163,184,0.5)' }}>
                  <th style={{ padding: '12px 16px' }}>Level</th>
                  <th style={{ padding: '12px 16px' }} className="hidden sm:table-cell">XP Required</th>
                  <th style={{ padding: '12px 16px' }} className="hidden md:table-cell">Total XP</th>
                  <th style={{ padding: '12px 16px' }}>Rank</th>
                </tr>
              </thead>
              <tbody>
                {[1, 5, 10, 15, 20, 30, 40, 50, 70, 100].map(l => {
                  const r = RANK_TIERS.find(rt => l >= rt.minLevel && l <= (rt.maxLevel === Infinity ? Infinity : rt.maxLevel));
                  const isRowActive = level === l;
                  return (
                    <tr
                      key={l}
                      style={{
                        fontSize: '12px',
                        borderTop: '1px solid rgba(148,163,184,0.06)',
                        background: isRowActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                        fontWeight: isRowActive ? 600 : 400,
                        color: level >= l ? 'rgba(255,255,255,0.8)' : 'rgba(148,163,184,0.4)',
                      }}
                    >
                      <td style={{ padding: '10px 16px' }}>Level {l}{l === 100 ? '+' : ''}</td>
                      <td style={{ padding: '10px 16px' }} className="hidden sm:table-cell">{formatXP(xpForLevel(l))}</td>
                      <td style={{ padding: '10px 16px' }} className="hidden md:table-cell">{formatXP(totalXpForLevel(l))}</td>
                      <td style={{ padding: '10px 16px' }}>{r ? `${r.icon} ${r.title}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div style={{ padding: '32px 0', display: 'flex', justifyContent: 'center', opacity: 0.2 }}>
        <div style={{ width: '128px', height: '4px', background: 'linear-gradient(90deg, transparent, rgb(99,102,241), transparent)', borderRadius: '9999px' }} />
      </div>
    </div>
  );
};
