import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';
import { Reorder } from 'motion/react';
import { CheckSquare, GripVertical, Trash2 } from 'lucide-react';

const DURATION_OPTIONS = [
  { value: 5, label: '5m' },
  { value: 10, label: '10m' },
  { value: 15, label: '15m' },
  { value: 25, label: '25m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
];

export const TasksPanel = () => {
  const { tasks, addTask, toggleTask, deleteTask, setTasks, updateTask } = useStudy();
  const [adding, setAdding] = useState(false);

  const handleAddClick = () => {
    addTask('', 'General Study', 'High Yield', undefined, 25);
    setAdding(true);
  };

  const handleBlur = (id: string, value: string) => {
    if (!value.trim()) {
      deleteTask(id);
    } else {
      updateTask(id, { title: value });
    }
    setAdding(false);
  };

  return (
    <div className="flex flex-col">
      <style>{`
        .tasks-list::-webkit-scrollbar { width: 4px; }
        .tasks-list::-webkit-scrollbar-track { border-radius: 10px; }
        .tasks-list::-webkit-scrollbar-thumb { border-radius: 10px; background: hsla(0,0%,100%,0.55); }
        .tasks-list::-webkit-scrollbar-thumb:hover { background: hsla(0,0%,100%,0.3); }
      `}</style>

      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
          <CheckSquare className="w-4 h-4 text-[#7432FF]" />
        </div>
        <h3 className="text-base font-bold text-white/90">Tasks</h3>
      </div>

      {tasks.length > 0 && (
        <div className="tasks-list overflow-y-auto px-3 py-3 space-y-1.5" style={{ maxHeight: 'calc(70vh - 160px)' }}>
          <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-1.5">
            {tasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                className="flex items-center gap-2 px-3 py-2 rounded-[11px] bg-white/[0.04] border border-transparent transition-colors duration-150 data-[focus-within]:border-white"
                style={{ boxShadow: '0 4px 6px -1px rgba(0,29,41,0.06), 0 2px 4px -2px rgba(0,29,41,0.06)' }}
              >
                <div className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white/70 transition-colors shrink-0 flex items-center justify-center w-10 h-10 -ml-1">
                  <span className="text-sm leading-none" style={{ color: '#4b5563' }}>⠿</span>
                </div>
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    task.completed ? 'bg-[#7432FF]' : 'bg-transparent border border-white/20 hover:border-[#7432FF]'
                  }`}
                  aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {task.completed ? (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <div className="w-5 h-5" />
                  )}
                </button>
                <input
                  defaultValue={task.title}
                  onFocus={(e) => e.currentTarget.parentElement?.setAttribute('data-focus-within', '')}
                  onBlur={(e) => {
                    e.currentTarget.parentElement?.removeAttribute('data-focus-within');
                    handleBlur(task.id, e.currentTarget.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  placeholder="Type your priority"
                  maxLength={25}
                  className={`flex-1 text-sm font-medium bg-transparent border-none outline-none text-white placeholder-white/50 px-1 py-3 ${
                    task.completed ? 'opacity-50 line-through' : ''
                  }`}
                />
                <select
                  value={task.estimatedMinutes ?? 25}
                  onChange={(e) => updateTask(task.id, { estimatedMinutes: Number(e.target.value) })}
                  className="appearance-none bg-white/[0.08] rounded-full text-white/70 text-xs px-3 py-2 border-none outline-none focus:outline focus:outline-1 focus:outline-[#7432FF] cursor-pointer"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1a2e] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors shrink-0 -mr-1"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {tasks.length === 0 && !adding && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-white/60 font-medium">No tasks yet.</p>
        </div>
      )}

      <div className="mt-auto px-3 pb-3">
        <button
          onClick={handleAddClick}
          className="w-full py-2.5 rounded-[11px] text-sm font-medium text-white/70 hover:text-white/90 hover:bg-white/[0.04] transition-colors border border-dashed border-white/[0.08]"
        >
          + Add Task
        </button>
      </div>
    </div>
  );
};
