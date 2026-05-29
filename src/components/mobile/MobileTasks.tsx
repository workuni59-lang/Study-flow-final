import { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const MobileTasks = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useStudy();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTask(text);
    setInput('');
  };

  const today = tasks.filter(t => {
    if (!t.createdAt) return true;
    const d = new Date(t.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0c10]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-display font-semibold dark:text-white">Today's Tasks</h1>
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {today.filter(t => t.completed).length}/{today.length} done
        </p>
      </div>

      {/* Add task */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add a task..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm dark:text-white placeholder:text-slate-400 border-none outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button onClick={handleAdd}
            className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center active:scale-90 transition-transform shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {today.length === 0 ? (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-12">
            No tasks for today. Add one above!
          </p>
        ) : (
          <div className="space-y-1.5">
            {today.map(task => (
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
                  {task.completed && <Check className="w-3.5 h-3.5" />}
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'dark:text-white'}`}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 active:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
