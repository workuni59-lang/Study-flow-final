import { useMemo } from 'react';
import type { UserStats, SessionRecord } from '../../lib/gamification';

interface Props { userStats: UserStats; }

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHourFromISO(iso: string) {
  return new Date(iso).getHours();
}

type Grid = Record<string, number>;

export default function AnalyticsHeatmap({ userStats }: Props) {
  const weekGrid = useMemo(() => {
    const grid: { day: string; hours: number[] }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const key = date.toISOString().split('T')[0];
      const daySessions = userStats.sessionHistory.filter(s => s.date === key);
      const hours: number[] = [];
      for (let h = 0; h < 24; h++) {
        hours.push(daySessions.filter(s => getHourFromISO(s.startTime) === h).length);
      }
      grid.push({ day: dayNames[date.getDay()], hours });
    }
    return grid;
  }, [userStats.sessionHistory]);

  const maxVal = Math.max(1, ...weekGrid.flatMap(d => d.hours));

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

  const bestHourLabel = bestHour === -1 ? '--' : `${bestHour}:00`;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-3">7-Day Hourly Activity</p>
        <div className="overflow-x-auto no-scrollbar">
          <div className="grid grid-cols-[3rem_repeat(24,_1fr)] gap-px min-w-[480px]">
            <div />
            {HOURS.map(h => (
              <div key={h} className="text-[6px] text-white/20 text-center font-mono">
                {h % 6 === 0 ? `${h}` : ''}
              </div>
            ))}
            {weekGrid.map(d => (
              <>
                <div key={d.day} className="text-[7px] text-white/30 font-medium leading-5">{d.day}</div>
                {d.hours.map((v, hi) => {
                  const intensity = v / maxVal;
                  const bg = v === 0 ? 'bg-white/[0.02]' : intensity > 0.66 ? 'bg-brand/60' : intensity > 0.33 ? 'bg-brand/30' : 'bg-brand/12';
                  return <div key={hi} className={`w-full aspect-square rounded-sm ${bg}`} title={`${d.day} ${hi}:00 — ${v} sessions`} aria-label={`${d.day} ${hi}:00 — ${v} sessions`} />;
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2">Peak Focus Hour</p>
        <p className="text-xl font-bold text-white/90 tabular-nums">{bestHourLabel}</p>
        <p className="text-[9px] text-white/30 mt-0.5">your most productive hour</p>
      </div>
    </div>
  );
}
