import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar } from 'lucide-react';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subject: string, type: string, date: string, subjectId?: string) => void;
}

import { useStudy } from '../../context/StudyContext';

export const AddExamModal = ({ isOpen, onClose, onAdd }: AddExamModalProps) => {
  const { subjects } = useStudy();
  const [subject, setSubject] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [type, setType] = useState('Final Exam');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !date) return;
    onAdd(subject, type, date, selectedSubjectId || undefined);
    setSubject('');
    setSelectedSubjectId('');
    setType('Final Exam');
    setDate('');
    onClose();
  };

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id);
    const s = subjects.find(sub => sub.id === id);
    if (s) setSubject(s.name);
  };

  const handleDateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector('input');
    if (input && 'showPicker' in HTMLInputElement.prototype) {
      try {
        input.showPicker();
      } catch (err) {
        console.warn("showPicker not supported, falling back to focus");
        input.focus();
      }
    } else if (input) {
      input.focus();
    }
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
              <h2 className="text-2xl font-display font-black tracking-tight dark:text-white uppercase">Add Deadline</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="editorial-label !text-indigo-600">Link to Subject (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSubjectSelect(s.id === selectedSubjectId ? '' : s.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedSubjectId === s.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="editorial-label !text-indigo-600">Exam / Deadline Name</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSelectedSubjectId(''); // Clear link if manually typing
                    }}
                    placeholder="e.g., Advanced Mathematics"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-lg font-bold text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="editorial-label !text-indigo-600">Exam Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-base font-bold text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Final Exam">Final Exam</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Certification">Certification</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="editorial-label !text-indigo-600">Date</label>
                  <div 
                    onClick={handleDateClick}
                    className="relative cursor-pointer group"
                  >
                    <input 
                      required
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-base font-bold text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none min-h-[64px] cursor-pointer"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!subject || !date}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Schedule Exam
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
