import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Timer, RotateCcw } from 'lucide-react';
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
      <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-center">
        <Timer className="w-6 h-6 text-white/20 mx-auto mb-2" />
        <p className="text-[10px] text-white/30">No sessions yet. Start a focus timer to track your progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recent.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
            {s.mode === 'focus' ? <Timer className="w-3 h-3 text-brand-light" /> : <RotateCcw className="w-3 h-3 text-emerald-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-white/80 capitalize">{s.mode}</span>
              <span className="text-[8px] text-white/25">{formatDate(s.startTime)}</span>
            </div>
            <p className="text-[8px] text-white/30 truncate">{formatTime(s.startTime)} – {formatTime(s.endTime)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] font-bold text-white/80 tabular-nums">{formatDuration(s.duration)}</p>
            <p className="text-[7px] text-brand-light/60 tabular-nums">+{s.xpEarned} XP</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
