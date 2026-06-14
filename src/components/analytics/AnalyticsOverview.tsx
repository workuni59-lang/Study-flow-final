import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCheck, Flame, Sparkles, TrendingUp, Crown, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserStats } from '../../lib/gamification';
import { useStudy } from '../../context/StudyContext';

interface Props { userStats: UserStats; }

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AnalyticsOverview({ userStats }: Props) {
  const { setShowPremiumModal } = useStudy();
  const isPremium = userStats.isPremium;
  const weekData = useMemo(() => {
    const days: { name: string; xp: number; focus: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ name: label, xp: userStats.dailyXPHistory[key] || 0, focus: 0 });
    }
    return days;
  }, [userStats.dailyXPHistory]);

  const todaySessions = useMemo(() =>
    userStats.sessionHistory.filter(s => s.date === new Date().toISOString().split('T')[0]),
    [userStats.sessionHistory]
  );

  const avgSession = useMemo(() => {
    const focus = userStats.sessionHistory.filter(s => s.mode === 'focus');
    if (!focus.length) return 0;
    return focus.reduce((sum, s) => sum + s.duration, 0) / focus.length;
  }, [userStats.sessionHistory]);

  const cards = [
    { icon: Clock, label: 'Total Focus', value: formatTime(userStats.totalFocusSeconds), sub: `${Math.floor(userStats.totalFocusSeconds / 60)} min`, gradient: 'from-brand to-violet-600' },
    { icon: CheckCheck, label: 'Tasks Done', value: String(userStats.totalTasksCompleted), sub: 'all time', gradient: 'from-emerald-500 to-teal-600' },
    { icon: Flame, label: 'Streak', value: `${userStats.currentStreak} days`, sub: `best: ${userStats.bestStreak}`, gradient: 'from-amber-500 to-orange-600' },
    { icon: Sparkles, label: 'Sessions', value: String(userStats.sessionHistory.length), sub: `${todaySessions.length} today`, gradient: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c, i) => (
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

      <div className="relative p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className={`${!isPremium ? 'pointer-events-none opacity-30 saturate-50' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-brand-light" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Weekly XP</span>
          </div>
          <div className="h-32" role="img" aria-label="Weekly XP chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#ffffff50' }} dy={4} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#ffffff30' }} dx={-2} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 11, color: '#fff' }}
                  formatter={(v: number) => [`${v} XP`, '']}
                />
                <Area type="monotone" dataKey="xp" stroke="#a5b4fc" strokeWidth={1.5} fill="url(#xpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-950/65 backdrop-blur-[2px]">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-white/70">Weekly XP Chart</p>
            <p className="text-[9px] text-white/30 text-center max-w-[180px]">Upgrade to Elite Scholar to track your weekly XP growth.</p>
            <button onClick={() => setShowPremiumModal(true)}
              className="mt-1 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border border-amber-500/20"
            >
              <Crown className="w-3 h-3 inline-block mr-1" />Unlock
            </button>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2">Session Average</p>
        <p className="text-xl font-bold text-white/90 tabular-nums">{Math.floor(avgSession / 60)}m <span className="text-sm text-white/40 font-normal">{Math.round(avgSession % 60)}s</span></p>
        <p className="text-[9px] text-white/30 mt-0.5">per focus session</p>
      </div>
    </div>
  );
}
