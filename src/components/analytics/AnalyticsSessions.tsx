import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Timer, RotateCcw, Calendar, Clock, ChevronRight, Sparkles, History } from 'lucide-react';
import type { UserStats } from '../../lib/gamification';

interface Props { userStats: UserStats; }

export default function AnalyticsSessions({ userStats }: Props) {
  const recent = useMemo(() =>
    [...userStats.sessionHistory]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 20),
    [userStats.sessionHistory]
  );

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/[0.02] border border-white/[0.05] rounded-[32px]">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-white/10" />
        </div>
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">No Sessions Yet</h3>
        <p className="text-[10px] text-white/30 max-w-[200px] leading-relaxed">
          Start your first focus session to see your activity history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-light" />
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">Recent Activity</h3>
        </div>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Showing last 20</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {recent.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${s.mode === 'focus' ? 'bg-brand' : 'bg-emerald-500'} opacity-50`} />

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              s.mode === 'focus' ? 'bg-brand/10 text-brand' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {s.mode === 'focus' ? <Timer className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  s.mode === 'focus' ? 'text-white' : 'text-emerald-400'
                }`}>
                  {s.mode === 'focus' ? 'Focus Session' : 'Break Time'}
                </span>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-bold text-white/30">{formatDate(s.startTime)}</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-medium text-white/20">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(s.startTime)} &ndash; {formatTime(s.endTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDuration(s.duration)}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-brand-light" />
                <span className="text-sm font-black text-white tabular-nums">+{s.xpEarned}</span>
              </div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">XP Gained</p>
            </div>

            <ChevronRight className="w-4 h-4 text-white/5 group-hover:text-white/20 transition-colors" />
          </motion.div>
        ))}
      </div>

      {recent.length >= 20 && (
        <div className="pt-4 text-center">
          <button className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[9px] font-black text-white/40 uppercase tracking-[0.2em] hover:bg-white/[0.06] hover:text-white/60 transition-all">
            Load More History
          </button>
        </div>
      )}
    </div>
  );
}
