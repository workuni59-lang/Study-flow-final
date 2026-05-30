import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, category: string, priority: string, dueDate?: string, estimatedMinutes?: number) => void;
}

export const AddTaskModal = ({ isOpen, onClose, onAdd }: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General Study');
  const [priority, setPriority] = useState('High Yield');
  const [duration, setDuration] = useState<number>(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, category, priority, undefined, duration);
    setTitle('');
    setCategory('General Study');
    setPriority('High Yield');
    setDuration(25);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-white dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-black tracking-tight dark:text-white uppercase">Add Task</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="editorial-label !text-indigo-600">Task Title</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-lg font-bold dark:text-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="editorial-label !text-indigo-600">Subject</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-lg font-bold dark:text-white focus:border-indigo-600 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="General Study">General Study</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="editorial-label !text-indigo-600">Priority</label>
                <div class="grid grid-cols-2 gap-4">
                  {[
                    { id: 'High Yield', label: 'High Yield', sub: 'Urgent' },
                    { id: 'Deep Review', label: 'Deep Review', sub: 'Intensive' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        priority === p.id 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'border-slate-100 dark:border-slate-800 bg-transparent opacity-60'
                      }`}
                    >
                      <p className="font-bold text-sm dark:text-white">{p.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{p.sub}</p>
                    </button>
                  ))}
                </div>
                </div>

                <div className="space-y-2">
                <label className="editorial-label !text-indigo-600">Estimated Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 50, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${
                        duration === mins 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                          : 'border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Task
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
