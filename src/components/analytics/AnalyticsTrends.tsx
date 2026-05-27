import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Timer, Calendar, TrendingUp, Target } from 'lucide-react';
import type { UserStats } from '../../lib/gamification';

interface Props { userStats: UserStats; }

export default function AnalyticsTrends({ userStats }: Props) {
  const bestDay = useMemo(() => {
    let maxXP = 0, bestDate = '';
    for (const [date, xp] of Object.entries(userStats.dailyXPHistory)) {
      if (xp > maxXP) { maxXP = xp; bestDate = date; }
    }
    if (!bestDate) return { label: '--', xp: 0 };
    const d = new Date(bestDate + 'T00:00:00');
    return { label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), xp: maxXP };
  }, [userStats.dailyXPHistory]);

  const consistency = useMemo(() => {
    const days = Object.keys(userStats.dailyXPHistory).length;
    if (days === 0) return { rate: 0, label: 'No data' };
    const activeThreshold = 7;
    const activeDays = Object.values(userStats.dailyXPHistory).filter(xp => xp >= activeThreshold).length;
    const rate = Math.round((activeDays / days) * 100);
    return { rate, label: `${activeDays}/${days} days` };
  }, [userStats.dailyXPHistory]);

  const streakData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: { label: string; active: boolean; xp: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      data.push({ label: dayNames[d.getDay()], active: (userStats.dailyXPHistory[key] || 0) >= 10, xp: userStats.dailyXPHistory[key] || 0 });
    }
    return data;
  }, [userStats.dailyXPHistory]);

  const insights = [
    { icon: Calendar, label: 'Best Day', value: bestDay.label, sub: `${bestDay.xp} XP`, gradient: 'from-amber-500 to-orange-600' },
    { icon: TrendingUp, label: 'Consistency', value: `${consistency.rate}%`, sub: consistency.label, gradient: 'from-emerald-500 to-teal-600' },
    { icon: Timer, label: 'Avg Session', value: (() => {
      const s = userStats.sessionHistory.filter(s => s.mode === 'focus');
      if (!s.length) return '0m';
      const avg = s.reduce((sum, r) => sum + r.duration, 0) / s.length;
      return `${Math.floor(avg / 60)}m`;
    })(), sub: 'per focus block', gradient: 'from-brand to-violet-600' },
    { icon: Target, label: 'Best Streak', value: `${userStats.bestStreak}d`, sub: 'all time record', gradient: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5">
        {insights.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                <c.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider">{c.label}</span>
            </div>
            <p className="text-lg font-bold text-white/90 tabular-nums">{c.value}</p>
            <p className="text-[9px] text-white/30 mt-0.5">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-3">14-Day Activity Streak</p>
        <div className="flex gap-1.5 justify-center">
          {streakData.map((d, i) => {
            const isToday = i === streakData.length - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 rounded-md transition-all ${d.active ? 'bg-brand shadow-sm shadow-brand/30' : 'bg-white/[0.04]'} ${isToday ? 'ring-1 ring-white/20' : ''}`}
                  title={`${d.label}: ${d.xp} XP`} />
                <span className="text-[6px] text-white/25 font-mono">{d.label[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
