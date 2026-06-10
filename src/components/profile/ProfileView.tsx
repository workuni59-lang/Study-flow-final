import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Loader2, User, Crown, Clock, CheckSquare, Flame, Award, Lock,
  Medal, Calendar, BarChart3, Copy, Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPublicProfile, type ProfileWithStats } from '../../lib/profile';
import { formatFocusTime } from '../../lib/leaderboard';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { getIdentity } from '../../lib/progression/identities';
import { getRankForLevel } from '../../lib/progression';
import { supabase } from '../../lib/supabase';

interface ProfileViewProps {
  userId: string;
  onEditProfile?: () => void;
}

interface LbEntry {
  daily_focus_seconds: number;
  weekly_focus_seconds: number;
  monthly_focus_seconds: number;
  all_time_focus_seconds: number;
}

const RARITY_BORDER: Record<string, string> = {
  Common: 'border-slate-500/30',
  Rare: 'border-blue-500/40',
  Epic: 'border-purple-500/40',
  Legendary: 'border-amber-500/40',
};

const RARITY_GLOW: Record<string, string> = {
  Common: 'shadow-[0_0_12px_rgba(148,163,184,0.15)]',
  Rare: 'shadow-[0_0_16px_rgba(96,165,250,0.2)]',
  Epic: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
  Legendary: 'shadow-[0_0_24px_rgba(251,191,36,0.3)]',
};

const BADGE_TIER_MAP: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold',
  platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 14 } },
};

const avatarVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12, delay: 0.05 } },
};

/* ─── Year grid heatmap ─── */

interface HeatmapProps {
  data: Record<string, number>;
}

function ProfileHeatmap({ data }: HeatmapProps) {
  const weeks = 52;
  const cell = 12;
  const gap = 2;
  const step = cell + gap;
  const days = weeks * 7;

  // Build 364-day array, most recent on the right
  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const map: { date: Date; count: number; key: string }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.push({ date: d, count: data[key] ?? 0, key });
    }
    return map;
  }, [data, days]);

  const maxCount = useMemo(() => Math.max(...cells.map(c => c.count), 1), [cells]);

  const intensity = (count: number): string => {
    if (count === 0) return 'fill-transparent stroke-white/[0.06]';
    const ratio = count / maxCount;
    if (ratio > 0.66) return 'fill-brand/85';
    if (ratio > 0.33) return 'fill-brand/55';
    return 'fill-brand/30';
  };

  const monthLabels = useMemo(() => {
    const labels: { x: number; label: string }[] = [];
    const today = new Date();
    for (let w = 0; w < weeks; w++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (weeks - 1 - w) * 7);
      const m = d.getMonth();
      if (w === 0 || d.getMonth() !== new Date(today.getTime() - (weeks - w) * 7 * 86400000).getMonth()) {
        labels.push({ x: w * step, label: d.toLocaleDateString('en-US', { month: 'short' }) });
      }
    }
    return labels;
  }, [weeks, step]);

  const dayLabels = useMemo(() => {
    const days = ['Mon', '', 'Wed', '', 'Fri'];
    return days.map((d, i) => ({ y: i * step + cell / 2 + 2, label: d }));
  }, [step, cell]);

  if (Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-[10px] text-slate-600">No activity data yet</p>
      </div>
    );
  }

  const w = weeks * step + 4;
  const h = 7 * step + 20;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {/* Month labels */}
      {monthLabels.map(({ x, label }) => (
        <text key={label} x={x + 2} y={10} className="fill-slate-400 text-[7px] font-medium" dominantBaseline="hanging">
          {label}
        </text>
      ))}
      {/* Day labels */}
      {dayLabels.map(({ y, label }) => (
        label ? (
          <text key={label} x={0} y={y + 1} className="fill-slate-600 text-[7px] font-medium" textAnchor="end">
            {label}
          </text>
        ) : null
      ))}
      {cells.map((c, i) => {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const isZero = c.count === 0;
        return (
          <motion.rect
            key={c.key}
            x={col * step + 22}
            y={row * step + 12}
            width={cell}
            height={cell}
            rx={2}
            className={`${intensity(c.count)} transition-colors duration-200`}
            strokeWidth={isZero ? 1 : 0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.02 * i, duration: 0.3 }}
          >
            <title>{c.key}: {c.count} sessions</title>
          </motion.rect>
        );
      })}

      {/* Gradient legend */}
      <g transform={`translate(${w - 60}, ${h - 10})`}>
        <text x={0} y={0} className="fill-slate-400 text-[7px] font-medium" dominantBaseline="hanging">Less</text>
        <rect x={22} y={-1} width={cell} height={cell} rx={2} className="fill-transparent stroke-white/[0.06]" strokeWidth={1} />
        <rect x={22 + step} y={-1} width={cell} height={cell} rx={2} className="fill-brand/30" />
        <rect x={22 + step * 2} y={-1} width={cell} height={cell} rx={2} className="fill-brand/55" />
        <rect x={22 + step * 3} y={-1} width={cell} height={cell} rx={2} className="fill-brand/85" />
        <text x={22 + step * 4 + 4} y={0} className="fill-slate-400 text-[7px] font-medium" dominantBaseline="hanging">More</text>
      </g>
    </svg>
  );
}

/* ─── Main component ─── */

export const ProfileView = ({ userId, onEditProfile }: ProfileViewProps) => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<ProfileWithStats | null>(null);
  const [lbEntry, setLbEntry] = useState<LbEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwnProfile = authUser?.uid === userId;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getPublicProfile(userId),
      supabase?.from('leaderboard_entries').select('daily_focus_seconds, weekly_focus_seconds, monthly_focus_seconds, all_time_focus_seconds').eq('user_id', userId).single(),
    ]).then(([profile, lb]) => {
      if (cancelled) return;
      if (!profile) {
        setError('User not found');
      } else {
        setData(profile);
        setLbEntry((lb?.data as LbEntry) ?? null);
      }
    }).catch((err) => {
      if (!cancelled) setError(err?.message || 'Failed to load profile');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [userId]);

  const rankIdentity = useMemo(() => {
    if (!data) return getIdentity(1);
    return getIdentity(getRankForLevel(data.stats.game_level).id);
  }, [data]);

  const dailyActivity = data?.dailyActivity ?? {};

  const handleCopyLink = () => {
    const url = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-brand/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-sm font-semibold text-slate-400">{error || 'User not found'}</p>
      </motion.div>
    );
  }

  const { profile, stats, leaderboardRank } = data;
  const initial = (profile.display_name ?? 'A').charAt(0).toUpperCase();
  const earnedBadgeIds = new Set(stats.badges_earned);

  const xpForLevel = (level: number) => 100 * level * (1 + level * 0.1);
  const level = stats.game_level;
  const totalXpForCurrent = xpForLevel(level);
  const xpInCurrent = stats.game_xp;
  const xpProgress = totalXpForCurrent > 0 ? xpInCurrent / totalXpForCurrent : 0;

  const periodFocus = (period: 'daily' | 'weekly' | 'monthly' | 'allTime'): string => {
    const key = period === 'daily' ? 'daily_focus_seconds'
      : period === 'weekly' ? 'weekly_focus_seconds'
      : period === 'monthly' ? 'monthly_focus_seconds'
      : 'all_time_focus_seconds';
    return lbEntry ? formatFocusTime((lbEntry as any)[key] ?? 0) : '—';
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: `radial-gradient(circle, ${rankIdentity.color}, transparent)` }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.04] blur-3xl"
          style={{ background: `radial-gradient(circle, ${rankIdentity.color}, transparent)` }}
        />
      </div>

      <motion.div
        className="relative space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* === Hero Header === */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{
            background: `linear-gradient(135deg, ${rankIdentity.gradientFrom}, ${rankIdentity.gradientTo})`,
          }}
        >
          {/* Dark overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative p-6 md:p-8">
            <div className="flex items-start gap-5">
              <motion.div
                variants={avatarVariants}
                className="relative shrink-0"
              >
                <div
                  className={`w-[72px] h-[72px] rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold transition-shadow duration-300 ${
                    profile.is_premium
                      ? 'shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                      : ''
                  }`}
                  style={{
                    boxShadow: profile.is_premium
                      ? `0 0 0 3px ${rankIdentity.color}, 0 0 20px rgba(251,191,36,0.35)`
                      : `0 0 0 3px ${rankIdentity.color}`,
                  }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : initial}
                </div>
                {/* Rank icon badge */}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-white/20 shadow-sm"
                  style={{ background: rankIdentity.color }}
                >
                  {getRankForLevel(level).icon}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-white truncate drop-shadow-sm">
                    {profile.display_name ?? 'Anonymous'}
                  </h1>
                  {profile.is_premium && (
                    <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[9px] font-bold text-white/90 uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm">
                      <Crown className="w-2.5 h-2.5" /> Pro
                    </span>
                  )}
                  {/* Copy profile link */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCopyLink}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/12 text-[9px] font-semibold text-white/60 hover:text-white transition-all uppercase tracking-wider backdrop-blur-sm flex items-center gap-1"
                  >
                    {copied ? (
                      <><Check className="w-2.5 h-2.5" /> Copied</>
                    ) : (
                      <><Copy className="w-2.5 h-2.5" /> Share</>
                    )}
                  </motion.button>
                  {isOwnProfile && onEditProfile && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={onEditProfile}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/12 text-[9px] font-semibold text-white/70 hover:text-white transition-all uppercase tracking-wider backdrop-blur-sm"
                    >
                      Edit Profile
                    </motion.button>
                  )}
                </div>

                {/* Rank pill */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="px-3 py-1 rounded-full backdrop-blur-sm text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"
                    style={{ background: rankIdentity.color + '44' }}
                  >
                    {getRankForLevel(level).icon} {getRankForLevel(level).title}
                  </span>
                  <span className="text-[10px] text-white/50">Level {level}</span>
                </div>

                <p className="text-[10px] text-white/40 mt-1">Member since {formatDate(profile.created_at)}</p>

                {profile.bio && (
                  <p className="text-sm text-white/70 mt-3 leading-relaxed max-w-prose italic drop-shadow-sm">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}
              </motion.div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-5">
              <div className="relative h-[8px] bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.55))',
                    boxShadow: '0 0 8px rgba(255,255,255,0.15)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(xpProgress * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-y-0 w-[40%] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                  }}
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] font-semibold text-white/60">
                  {xpInCurrent.toLocaleString()} XP
                </span>
                <span className="text-[8px] font-medium text-white/40">
                  {(totalXpForCurrent - xpInCurrent).toLocaleString()} to next level
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* === Stats Grid (6 colored tiles) === */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          <StatCard
            icon={Flame}
            iconBg="#f97316"
            label="Current Streak"
            num={`${stats.current_streak}`}
            unit="days"
          />
          <StatCard
            icon={Flame}
            iconBg="#ea580c"
            label="Best Streak"
            num={`${stats.longest_streak}`}
            unit="days"
          />
          <StatCard
            icon={Clock}
            iconBg="#22c55e"
            label="Total Hours"
            num={`${Math.floor(stats.total_focus_seconds / 3600)}`}
            unit="hours"
          />
          <StatCard
            icon={CheckSquare}
            iconBg="#a855f7"
            label="Sessions"
            num={`${stats.total_sessions}`}
            unit="completed"
          />
          <StatCard
            icon={Calendar}
            iconBg="#06b6d4"
            label="This Week"
            num={lbEntry ? `${Math.floor(lbEntry.weekly_focus_seconds / 3600)}` : '—'}
            unit="hours"
          />
          <StatCard
            icon={BarChart3}
            iconBg="#14b8a6"
            label="Daily Avg"
            num={formatDailyAverageStr(stats.total_focus_seconds, profile.created_at)}
            unit="per day"
          />
        </motion.div>

        {/* === Activity Heatmap === */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Calendar className="w-3 h-3 text-slate-500" />
            Activity
          </h3>
          <div className="overflow-x-auto pb-1">
            <ProfileHeatmap data={dailyActivity} />
          </div>
        </motion.div>

        {/* === Leaderboard Ranks === */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Medal className="w-3 h-3 text-slate-500" />
            Leaderboard Rank
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RankItem period="Daily" rank={leaderboardRank.daily} focus={periodFocus('daily')} />
            <RankItem period="Weekly" rank={leaderboardRank.weekly} focus={periodFocus('weekly')} />
            <RankItem period="Monthly" rank={leaderboardRank.monthly} focus={periodFocus('monthly')} />
            <RankItem period="All Time" rank={leaderboardRank.allTime} focus={periodFocus('allTime')} />
          </div>
        </motion.div>

        {/* === Badges === */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Award className="w-3 h-3 text-slate-500" />
            Achievement Badges
          </h3>
          {stats.badges_earned.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center py-6"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500">No badges yet</p>
              <p className="text-[10px] text-slate-600 mt-1">Complete achievements to earn badges</p>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-wrap gap-3"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
              initial="hidden"
              animate="visible"
            >
              {PROGRESSION_BADGES.map((badge) => {
                const unlocked = earnedBadgeIds.has(badge.id);
                const tier = BADGE_TIER_MAP[badge.id] ?? 'bronze';
                const rarityKey = badge.rarity as string;
                return (
                  <motion.div
                    key={badge.id}
                    variants={{
                      hidden: { opacity: 0, y: 12, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 12 } },
                    }}
                    whileHover={unlocked ? { y: -4, scale: 1.04 } : undefined}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300 ${
                      unlocked
                        ? `${RARITY_BORDER[rarityKey] || 'border-white/[0.08]'} ${RARITY_GLOW[rarityKey] || ''} bg-white/[0.02]`
                        : 'border-white/[0.04] opacity-40'
                    }`}
                  >
                    <div className="relative">
                      <BadgeSvg tier={tier} size={52} unlocked={unlocked} animate={unlocked} />
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-500 drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[8px] font-semibold text-center leading-tight max-w-[64px] truncate ${
                      unlocked ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {badge.name}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ─── Helpers ─── */

function formatDailyAverageStr(totalSeconds: number, memberSince: string): string {
  if (totalSeconds <= 0) return '0';
  try {
    const start = new Date(memberSince);
    const now = new Date();
    const days = Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000));
    const avgSeconds = totalSeconds / days;
    if (avgSeconds >= 3600) return `${Math.round(avgSeconds / 3600)}`;
    if (avgSeconds >= 60) return `${Math.round(avgSeconds / 60)}`;
    return `${Math.round(avgSeconds)}`;
  } catch {
    return `${Math.round(totalSeconds / 3600)}`;
  }
}

/* ─── Sub-components ─── */

function StatCard({
  icon: Icon,
  iconBg,
  label,
  num,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  num: string;
  unit: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-xl border border-white/[0.06] p-4 text-center transition-shadow duration-300 relative overflow-hidden"
      style={{ background: `${iconBg}10` }}
    >
      {/* Icon watermark top-right */}
      <div className="absolute top-2 right-2 opacity-25">
        <Icon className="w-5 h-5" style={{ color: iconBg }} />
      </div>
      <div className="flex flex-col justify-center min-h-[4rem]">
        <p className="text-lg font-bold text-white">
          {num}
          <span className="text-[9px] font-medium text-slate-500 ml-1">{unit}</span>
        </p>
        <p className="text-[8px] font-medium uppercase tracking-wider text-slate-600 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function RankItem({ period, rank, focus }: { period: string; rank: number; focus: string }) {
  const emoji = rank > 0 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank <= 10 ? '⭐' : '') : '';
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 text-center transition-colors duration-200"
    >
      <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
        {rank > 0 ? `#${rank}` : '—'}
        {emoji && <span className="text-sm">{emoji}</span>}
      </p>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mt-1">{period}</p>
      <p className="text-[9px] text-slate-600 mt-0.5">{focus}</p>
    </motion.div>
  );
}
