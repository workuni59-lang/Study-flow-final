import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Subject } from '../../context/StudyContext';

interface Props {
  subjects: Subject[];
}

function countGreen(subject: Subject): number {
  return subject.topics?.filter(t => t.mastery === 'Green').length || 0;
}

const COLORS = ['#6366f1', '#22d3ee', '#4ade80', '#fbbf24', '#f97316', '#fb7185', '#a78bfa', '#34d399', '#f472b6', '#06b6d4'];

export default function AnalyticsSubjects({ subjects }: Props) {
  const data = useMemo(() => {
    const hasMastery = subjects.some(s => (s.topics?.length || 0) > 0);
    if (!hasMastery) return [];
    return subjects
      .filter(s => (s.topics?.length || 0) > 0)
      .map(s => ({
        name: s.name,
        value: Math.max(1, countGreen(s)),
        total: s.topics?.length || 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [subjects]);

  const totalGreen = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-3">Subject Mastery</p>
        {data.length === 0 ? (
          <p className="text-[10px] text-white/30 py-6 text-center">Add topics to subjects to see mastery breakdown</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={40} dataKey="value" stroke="none">
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.8} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {data.slice(0, 5).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[9px] text-white/60 flex-1 truncate">{d.name}</span>
                  <span className="text-[9px] text-white/40 tabular-nums">{d.value}/{d.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider mb-1">Subjects</p>
          <p className="text-xl font-bold text-white/90 tabular-nums">{subjects.length}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider mb-1">Mastered</p>
          <p className="text-xl font-bold text-white/90 tabular-nums">{totalGreen}</p>
        </div>
      </div>
    </div>
  );
}
