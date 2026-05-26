import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Brain, Calendar, Clock, Key, ArrowRight, Loader2, Info, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { generateStudyPlan } from '../../services/ai';
import { useStudy } from '../../context/StudyContext';

interface AIArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIArchitectModal = ({ isOpen, onClose }: AIArchitectModalProps) => {
  const { applyAIPlan } = useStudy();
  
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState(localStorage.getItem('study_flow_gemini_key') || '');
  const [syllabus, setSyllabus] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleArchitect = async () => {
    if (isLoading || cooldown > 0) return;
    
    if (!apiKey || !syllabus || !examDate) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);
    localStorage.setItem('study_flow_gemini_key', apiKey);

    try {
      const plan = await generateStudyPlan(apiKey, syllabus, examDate, hours);
      applyAIPlan(plan);
      setStep(3); // Success
      setTimeout(() => {
        onClose();
        setStep(1);
        setSyllabus('');
      }, 3000);
    } catch (err: any) {
      if (err.message === "QUOTA_LOCK") {
        setCooldown(60);
        setError("Google's Free Tier is overwhelmed. Cooldown activated.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black dark:text-white uppercase tracking-tight">AI Timetable Architect</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Safe Connection Active</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* API Key Setup */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 p-6 rounded-3xl mb-8">
                    <div className="flex items-start gap-4">
                      <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-400 text-sm mb-1">Elite Scholar Setup</h4>
                        <p className="text-xs text-indigo-700/70 dark:text-indigo-500/70 leading-relaxed mb-4">
                          We use Gemini 1.5 Flash to build your plan. This ensures your data stays private and your experience stays 100% free.
                        </p>
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline flex items-center gap-2"
                        >
                          Verify API Key <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Gemini API Key</label>
                        <div className="relative">
                          <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="password"
                            placeholder="paste_your_key_here..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                          />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Exam Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="date"
                              value={examDate}
                              onChange={(e) => setExamDate(e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Study Hours/Day</label>
                          <div className="relative">
                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="number"
                              min="1"
                              max="16"
                              value={hours}
                              onChange={(e) => setHours(parseInt(e.target.value))}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                            />
                          </div>
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                  >
                    Next: Enter Syllabus <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Paste Syllabus or Topics</label>
                    <textarea 
                      placeholder="e.g. Molecular Biology: DNA, RNA. Calculus: Integrals..."
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      rows={6}
                      className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] focus:ring-2 ring-indigo-500 transition-all dark:text-white resize-none text-sm leading-relaxed"
                    />
                  </div>

                  {error && (
                    <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-[24px] border border-rose-100 dark:border-rose-900/50">
                       <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Handshake Info</span>
                       </div>
                       <p className="text-xs text-rose-700 dark:text-rose-300 font-bold leading-relaxed">
                          {error}
                       </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-3xl font-black uppercase tracking-widest text-xs"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleArchitect}
                      disabled={isLoading || cooldown > 0}
                      className={`flex-1 py-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all ${
                        cooldown > 0 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-slate-900'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Building Flow...
                        </>
                      ) : cooldown > 0 ? (
                        <>
                          <Timer className="w-5 h-5" />
                          Wait {cooldown}s
                        </>
                      ) : (
                        <>
                          Generate My Timetable <Sparkles className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-display font-black dark:text-white uppercase mb-2">Architecting Complete!</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Your subjects and task list have been intelligently populated.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
