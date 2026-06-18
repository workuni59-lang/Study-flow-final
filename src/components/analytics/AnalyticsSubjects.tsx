import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Subject, Task } from '../../context/StudyContext';

interface Props {
  subjects: Subject[];
  tasks?: Task[];
}

function countGreen(subject: Subject): number {
  return subject.topics?.filter(t => t.mastery === 'Green').length || 0;
}

const COLORS = ['#6366f1', '#22d3ee', '#4ade80', '#fbbf24', '#f97316', '#fb7185', '#a78bfa', '#34d399', '#f472b6', '#06b6d4'];

export default function AnalyticsSubjects({ subjects, tasks = [] }: Props) {
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

  // Per-subject task completion (total vs completed).
  const taskStats = useMemo(() => {
    return subjects
      .map((s, i) => {
        const subjectTasks = tasks.filter(t => t.subjectId === s.id);
        const total = subjectTasks.length;
        const completed = subjectTasks.filter(t => t.completed).length;
        return {
          id: s.id,
          name: s.name,
          color: COLORS[i % COLORS.length],
          total,
          completed,
          pct: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      })
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [subjects, tasks]);

  const totalGreen = data.reduce((s, d) => s + d.value, 0);
  const totalTasks = taskStats.reduce((s, d) => s + d.total, 0);
  const totalCompleted = taskStats.reduce((s, d) => s + d.completed, 0);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-3">Subject Mastery</p>
        {data.length === 0 ? (
          <p className="text-[10px] text-white/30 py-6 text-center">Add topics to subjects to see mastery breakdown</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0" role="img" aria-label="Subject distribution chart">
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

      {/* Per-subject task completion */}
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Task Completion</p>
          {totalTasks > 0 && (
            <span className="text-[9px] text-white/40 tabular-nums">{totalCompleted}/{totalTasks} done</span>
          )}
        </div>
        {taskStats.length === 0 ? (
          <p className="text-[10px] text-white/30 py-6 text-center">Link tasks to subjects to track completion</p>
        ) : (
          <div className="space-y-2.5">
            {taskStats.map(s => (
              <div key={s.id}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[9px] text-white/60 flex-1 truncate">{s.name}</span>
                  <span className="text-[9px] text-white/40 tabular-nums">{s.completed}/{s.total}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
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
