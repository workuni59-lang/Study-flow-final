import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BookOpen, Award, LinkIcon } from 'lucide-react';
import type { Subject } from '../../context/StudyContext';

interface Props {
  subjects: Subject[];
}

function countGreen(subject: Subject): number {
  return subject.topics?.filter(t => t.mastery === 'Green').length || 0;
}

export default function AnalyticsSubjects({ subjects }: Props) {
  const [activeSubject, setActiveSubject] = useState<any | null>(null);

  const data = useMemo(() => {
    const hasData = subjects.some(s => (s.topics?.length || 0) > 0);
    if (!hasData) return [];

    return subjects
      .filter(s => (s.topics?.length || 0) > 0)
      .map(s => ({
        name: s.name,
        value: Math.max(1, countGreen(s)),
        total: s.topics?.length || 0,
        color: s.color || '#6366f1',
        focusTime: '0h'
      }))
      .sort((a, b) => b.value - a.value);
  }, [subjects]);

  const totalMastered = data.reduce((s, d) => s + d.value, 0);
  const totalTopics = data.reduce((s, d) => s + d.total, 0);
  const totalPercentage = totalTopics > 0 ? Math.round((totalMastered / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">Subject Mastery</h3>
        </div>

        {data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white/20"/>
            </div>
            <p className="text-sm text-white/20">Link tasks to subjects to track completion</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="relative w-[240px] h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart onMouseLeave={() => setActiveSubject(null)}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    dataKey="value"
                    strokeWidth={0}
                    animationDuration={1000}
                  >
                    {data.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        onMouseEnter={() => setActiveSubject(entry)}
                        className="cursor-default outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSubject?.name ?? 'default'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <p className="text-xs text-white/30 text-center mb-0.5">
                      {activeSubject ? 'Mastered' : 'Total'}
                    </p>
                    <p className="text-3xl font-semibold text-white text-center tracking-tight">
                      {activeSubject ? activeSubject.value : totalMastered}
                    </p>
                    <p className="text-[11px] text-white/30 text-center mt-0.5">
                      {activeSubject ? activeSubject.name : 'Topics'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[240px] space-y-1">
              {data.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}88` }}/>
                  <span className="text-sm text-white/70 truncate">{s.name}</span>
                  <span className="ml-auto text-xs text-white/30 font-medium">{Math.round((s.value / s.total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Subjects', value: subjects.length, icon: BookOpen, accent: '#a78bfa' },
          { label: 'Mastered', value: `${totalPercentage}%`, icon: Award, accent: '#4ade80' }
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 + (i * 0.07) }}
            className="group relative p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-colors duration-200 overflow-hidden text-center flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${s.accent}20` }}>
              <s.icon className="w-5 h-5" style={{ color: s.accent }} />
            </div>
            <p className="text-3xl font-semibold text-white">{s.value}</p>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
