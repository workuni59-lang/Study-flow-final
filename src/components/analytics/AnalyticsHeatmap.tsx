import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Clock, Zap } from 'lucide-react';
import type { UserStats } from '../../lib/gamification';

interface Props { userStats: UserStats; }

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHourFromISO(iso: string) {
  return new Date(iso).getHours();
}

type Grid = Record<string, number>;

export default function AnalyticsHeatmap({ userStats }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    hour: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const weekGrid = useMemo(() => {
    const grid: { day: string; date: string; hours: number[] }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const key = date.toISOString().split('T')[0];
      const daySessions = userStats.sessionHistory.filter(s => s.date === key);
      const hours: number[] = [];
      for (let h = 0; h < 24; h++) {
        const sessionInHour = daySessions.filter(s => getHourFromISO(s.startTime) === h);
        const totalMinutes = Math.floor(sessionInHour.reduce((sum, s) => sum + s.duration, 0) / 60);
        hours.push(totalMinutes);
      }
      grid.push({ day: dayNames[date.getDay()], date: key, hours });
    }
    return grid;
  }, [userStats.sessionHistory]);

  const getIntensityStyle = (minutes: number) => {
    if (minutes === 0) return { backgroundColor: '#13132b' };
    if (minutes <= 20) return { backgroundColor: '#2d1f5e' };
    if (minutes <= 60) return { backgroundColor: '#4c2fa0' };
    if (minutes <= 120) return { backgroundColor: '#6d3fd4' };
    return {
      backgroundColor: '#a78bfa',
      boxShadow: '0 0 8px #a78bfa55'
    };
  };

  const totalByHour = useMemo(() => {
    const h: Grid = {};
    userStats.sessionHistory.forEach(s => {
      const hour = getHourFromISO(s.startTime);
      h[hour] = (h[hour] || 0) + 1;
    });
    return h;
  }, [userStats.sessionHistory]);

  const bestHour = useMemo(() => {
    let best = -1, bestVal = 0;
    (Object.entries(totalByHour) as [string, number][]).forEach(([h, v]) => {
      if (v > bestVal) { best = Number(h); bestVal = v; }
    });
    return best;
  }, [totalByHour]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">Focus Density</h3>
            </div>
            <p className="text-[10px] text-white/30">Focus minutes per hour over the last 7 days</p>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-2 px-2 pb-4">
          <div className="grid grid-cols-[2.5rem_repeat(24,_1fr)] gap-[3px] min-w-[600px]">
            <div />
            {HOURS.map(h => (
              <div key={h} className="text-[7px] text-white/20 text-center font-mono font-bold">
                {h % 4 === 0 ? `${h}` : ''}
              </div>
            ))}

            {weekGrid.map((d, di) => (
              <div key={d.date} className="contents group/row">
                <div className="text-[8px] font-black text-white/20 uppercase tracking-tighter h-6 flex items-center group-hover/row:text-white/50 transition-colors">
                  {d.day}
                </div>
                {d.hours.map((v, hi) => (
                  <div
                    key={hi}
                    style={{ ...getIntensityStyle(v), borderRadius: '3px' }}
                    className="w-full h-6 transition-opacity duration-200 hover:opacity-80 cursor-help"
                    onMouseEnter={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({ date: d.date, hour: hi, value: v, x: r.left + r.width / 2, y: r.top });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Less</span>
          <div className="flex gap-[3px]">
            <div className="w-3 h-3 rounded-[3px] bg-[#13132b]" />
            <div className="w-3 h-3 rounded-[3px] bg-[#2d1f5e]" />
            <div className="w-3 h-3 rounded-[3px] bg-[#4c2fa0]" />
            <div className="w-3 h-3 rounded-[3px] bg-[#6d3fd4]" />
            <div className="w-3 h-3 rounded-[3px] bg-[#a78bfa]" />
          </div>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">More</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-[#1a1a2e]/95 border border-white/[0.08] rounded-xl px-3 py-2.5 shadow-xl pointer-events-none z-50"
            style={{
              left: hoveredCell.x,
              top: hoveredCell.y - 8,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <p className="text-[11px] text-white/50 mb-1">
              {new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull; {hoveredCell.hour}:00
            </p>
            <p className="text-sm font-semibold text-white">{hoveredCell.value}m focused</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Peak Focus Hour</p>
            {bestHour === -1 ? (
              <span className="text-2xl font-semibold text-white/20 tracking-tight">No data yet</span>
            ) : (
              <>
                <p className="text-2xl font-semibold text-white tabular-nums">{bestHour}:00</p>
                <p className="text-xs text-violet-400/70">most productive hour</p>
              </>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Session Density</p>
            <p className="text-2xl font-semibold text-white tabular-nums">
              {Math.max(0, ...Object.values(totalByHour))}
            </p>
            <p className="text-xs text-white/30">max sessions in one hour</p>
          </div>
        </div>
      </div>
    </div>
  );
}
