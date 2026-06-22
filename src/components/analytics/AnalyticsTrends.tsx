import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Timer, Calendar, TrendingUp, Target, Activity, Zap, CheckCircle2, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
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
    const activeThreshold = 10;
    const activeDays = Object.values(userStats.dailyXPHistory).filter(xp => xp >= activeThreshold).length;
    const rate = Math.round((activeDays / days) * 100);
    return { rate, label: `${activeDays}/${days} days` };
  }, [userStats.dailyXPHistory]);

  const streakData = useMemo(() => {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const data: { label: string; status: 'active' | 'inactive' | 'today' | 'future'; xp: number }[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const isToday = key === today;
      const xp = userStats.dailyXPHistory[key] || 0;
      const isFuture = d > new Date();

      let status: 'active' | 'inactive' | 'today' | 'future' = 'inactive';
      if (isFuture) status = 'future';
      else if (isToday) status = 'today';
      else if (xp >= 10) status = 'active';

      data.push({ label: dayNames[d.getDay()], status, xp });
    }
    return data;
  }, [userStats.dailyXPHistory]);

  const insights = [
    {
      icon: Calendar,
      label: 'Peak Performance',
      value: bestDay.label,
      unit: '',
      sub: `${bestDay.xp} XP Earned`,
      accent: '#f59732',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#f5973218_0%,_transparent_70%)]',
      delta: 12
    },
    {
      icon: TrendingUp,
      label: 'Consistency Rate',
      value: String(consistency.rate),
      unit: '%',
      sub: consistency.label,
      accent: '#10b981',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#10b98118_0%,_transparent_70%)]',
      delta: 5
    },
    {
      icon: Timer,
      label: 'Avg Focus Block',
      value: (() => {
        const s = userStats.sessionHistory.filter(s => s.mode === 'focus');
        if (!s.length) return '0';
        const avg = s.reduce((sum, r) => sum + r.duration, 0) / s.length;
        return String(Math.floor(avg / 60));
      })(),
      unit: 'm',
      sub: 'per session',
      accent: '#7c3aed',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#7c3aed18_0%,_transparent_70%)]',
      delta: -2
    },
    {
      icon: Target,
      label: 'Personal Best',
      value: String(userStats.bestStreak),
      unit: 'd',
      sub: 'All-time streak',
      accent: '#ec4899',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#ec489918_0%,_transparent_70%)]',
      delta: 0
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {insights.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
            className="group relative p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-colors duration-200 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${c.accent}20` }}>
                <c.icon className="w-5 h-5" style={{ color: c.accent }} />
              </div>
              
              <div className="flex items-baseline">
                <p className="font-bold tracking-tight text-4xl text-white truncate">{c.value}</p>
                {c.unit && <span className="text-2xl font-normal text-white/40 ml-1">{c.unit}</span>}
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{c.label}</p>
              <p className="text-xs text-white/30 mt-1">{c.sub}</p>
              
              {c.delta !== 0 && (
                <span className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 mt-2 ${
                  c.delta > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                }`}>
                  {c.delta > 0 ? <ArrowUpIcon className="w-2.5 h-2.5"/> : <ArrowDownIcon className="w-2.5 h-2.5"/>}
                  {Math.abs(c.delta)}% vs last week
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
        className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">14-Day Streak</h3>
        </div>

        <div className="flex justify-between items-center">
          {streakData.map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`transition-all duration-300 ${
                  d.status === 'today'
                    ? "w-9 h-9 rounded-full bg-violet-400 ring-2 ring-violet-300/50 ring-offset-2 ring-offset-[#0D0D15] shadow-[0_0_18px_#a78bfa88] flex items-center justify-center"
                    : d.status === 'active'
                      ? "w-9 h-9 rounded-full bg-violet-600/70 shadow-[0_0_10px_#7c3aed55] flex items-center justify-center"
                      : d.status === 'future'
                        ? "w-9 h-9 rounded-full border border-dashed border-white/[0.08] bg-transparent"
                        : "w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06]"
                }`}
              >
                {d.status === 'active' && <CheckCircle2 className="w-4 h-4 text-white" />}
                {d.status === 'today' && <Zap className="w-4 h-4 text-white" />}
              </motion.div>
              <span className="text-[10px] text-white/25 mt-1.5 text-center block font-bold">{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Efficiency', value: 'High', color: 'text-yellow-400' },
          { icon: CheckCircle2, label: 'Completion', value: 'On Track', color: 'text-emerald-400' },
          { icon: Target, label: 'Focus Goal', value: '80%', color: 'text-indigo-400' }
        ].map((s, i) => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col items-center text-center">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xs font-black text-white/70">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
