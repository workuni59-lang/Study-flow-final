import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCheck, Flame, Sparkles, TrendingUp, Crown, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { UserStats } from '../../lib/gamification';
import { useStudy } from '../../context/StudyContext';

interface Props { userStats: UserStats; }

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

export default function AnalyticsOverview({ userStats }: Props) {
  const { setShowPremiumModal } = useStudy();
  const isPremium = userStats.isPremium;

  const weekData = useMemo(() => {
    const days: { name: string; xp: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        name: label,
        xp: userStats.dailyXPHistory[key] || 0,
        date: key
      });
    }
    return days;
  }, [userStats.dailyXPHistory]);

  const isAllZero = weekData.every(d => d.xp === 0);

  const cards = [
    {
      icon: Clock,
      label: 'Total Focus',
      value: formatTime(userStats.totalFocusSeconds).h > 0
        ? formatTime(userStats.totalFocusSeconds).h
        : formatTime(userStats.totalFocusSeconds).m,
      unit: formatTime(userStats.totalFocusSeconds).h > 0 ? 'h' : 'm',
      sub: `${Math.floor(userStats.totalFocusSeconds / 60)} min focused`,
      accent: '#7c3aed',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#7c3aed18_0%,_transparent_70%)]'
    },
    {
      icon: CheckCheck,
      label: 'Tasks Done',
      value: String(userStats.totalTasksCompleted),
      unit: '',
      sub: 'all time',
      accent: '#10b981',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#10b98118_0%,_transparent_70%)]'
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: String(userStats.currentStreak),
      unit: 'days',
      sub: `best: ${userStats.bestStreak}`,
      accent: '#f59732',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#f5973218_0%,_transparent_70%)]'
    },
    {
      icon: Sparkles,
      label: 'Total XP',
      value: userStats.xp.toLocaleString(),
      unit: '',
      sub: '0 today',
      accent: '#ec4899',
      tint: 'bg-[radial-gradient(ellipse_at_top_left,_#ec489918_0%,_transparent_70%)]'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {cards.map((c, i) => (
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
                <span className="font-bold tracking-tight text-4xl text-white">{c.value}</span>
                {c.unit && <span className="text-2xl font-normal text-white/40 ml-1">{c.unit}</span>}
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{c.label}</p>
              <p className="text-xs text-white/30 mt-1">{c.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
        className="relative p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">Weekly Activity</h3>
          </div>
        </div>

        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData} margin={{ left: 16, right: 16, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.12}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#ffffff20', fontWeight: 500 }}
                dy={10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1a2e]/95 border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
                        <p className="text-sm font-semibold text-white">{payload[0].value} XP</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#xpFill)"
                dot={false}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>

          {isAllZero && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"/>
              <span className="text-xs text-white/20 tracking-widest uppercase">No sessions yet</span>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"/>
            </div>
          )}
        </div>

        {!isPremium && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/60">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Elite Analytics</h4>
            <p className="text-[10px] text-white/50 text-center max-w-[220px] leading-relaxed mb-6">
              Get deep insights into your study patterns and unlock detailed progress charts.
            </p>
            <button
              onClick={() => setShowPremiumModal(true)}
              className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <Crown className="w-3.5 h-3.5 inline-block mr-2" />
              Upgrade Now
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
