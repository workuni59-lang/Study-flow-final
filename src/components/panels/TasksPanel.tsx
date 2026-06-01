import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';

const DURATIONS = [15, 25, 50, 90];

export const TasksPanel = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useStudy();
  const [input, setInput] = useState('');
  const [duration, setDuration] = useState<number>(25);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTask(text, 'General Study', 'High Yield', undefined, duration);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm dark:text-white placeholder:text-slate-400 border-none outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button onClick={handleAdd}
          className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

      <div className="flex gap-1.5">
        {DURATIONS.map(mins => (
          <button
            key={mins}
            type="button"
            onClick={() => setDuration(mins)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              duration === mins
                ? 'bg-brand/10 text-brand border-brand/30'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            {mins}m
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No tasks yet.</p>
        ) : (
          tasks.slice().reverse().map(task => (
            <div key={task.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                task.completed
                  ? 'bg-slate-50 dark:bg-slate-900/50'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'
              }`}
            >
              <button onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  task.completed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                {task.completed && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
              </button>
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'dark:text-white'}`}>
                {task.title}
              </span>
              <button onClick={() => deleteTask(task.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
