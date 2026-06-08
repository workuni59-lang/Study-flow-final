import React, { useState } from 'react';
import { Plus, BookOpen, ChevronRight, Trash2, ArrowLeft, Target, MoreVertical, Zap, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy, Subject, Topic, MasteryLevel } from '../../context/StudyContext';
import { DashboardCard } from '../dashboard/DashboardCard';
import { storage } from '../../services/storage';
import { SUBJECT_TEMPLATES, SubjectTemplate } from '../../lib/templates';

export const SubjectsView = () => {
  const { subjects, deleteSubject } = useStudy();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  if (selectedSubject) {
    return (
      <SubjectDetails 
        subject={selectedSubject} 
        onBack={() => setSelectedSubjectId(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase mb-2">My Subjects</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Mastery Mapper</p>
        </div>
        <button 
          onClick={() => setIsAddingSubject(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" /> Add Subject
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {subjects.map((subject) => (
            <motion.div
              layout
              key={subject.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative"
              onClick={() => setSelectedSubjectId(subject.id)}
            >
              <div className={`w-14 h-14 rounded-2xl bg-${subject.color || 'indigo'}-50 dark:bg-${subject.color || 'indigo'}-900/20 flex items-center justify-center text-${subject.color || 'indigo'}-600 dark:text-${subject.color || 'indigo'}-400 mb-6 group-hover:scale-110 transition-transform`}>
                <BookOpen className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-display font-black dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                {subject.name}
              </h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full bg-${i === 0 ? 'green' : i === 1 ? 'amber' : 'rose'}-500 border border-white dark:border-slate-900`} />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {subject.topics.length} Topics
                </span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                   View Details <ChevronRight className="w-3 h-3" />
                 </span>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this subject and all its topics?')) {
                      deleteSubject(subject.id);
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {subjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <img src="/logo.png" alt="" className="w-64 h-64 object-contain grayscale" />
            </div>
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6 relative z-10" />
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium mb-8 relative z-10">No subjects yet. Start your journey by adding one.</p>
            <button 
               onClick={() => setIsAddingSubject(true)}
               className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all relative z-10"
            >
              Add Your First Subject
            </button>
          </div>
        )}
      </div>

      <AddSubjectModal 
        isOpen={isAddingSubject} 
        onClose={() => setIsAddingSubject(false)} 
      />
    </div>
  );
};

const SubjectDetails = ({ subject, onBack }: { subject: Subject, onBack: () => void }) => {
  const { addTopic, updateTopicMastery, deleteTopic, addTask } = useStudy();
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const generateSchedule = () => {
    const savedExams = storage.getExams() || [];
    const relevantExam = savedExams.find((e: any) => e.subjectId === subject.id);
    
    if (!relevantExam) {
      alert("Please link this subject to an exam in the Deadlines section first!");
      return;
    }

    const toStudy = subject.topics.filter(t => t.mastery !== 'Green');
    
    if (toStudy.length === 0) {
      alert("All topics are mastered! No schedule needed.");
      return;
    }

    const daysLeft = relevantExam.daysLeft || 1;
    const topicsPerDay = Math.ceil(toStudy.length / daysLeft);

    let tasksCreated = 0;
    toStudy.forEach((topic, index) => {
      const dayOffset = Math.floor(index / topicsPerDay);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dayOffset);
      
      const priority = topic.mastery === 'Red' ? 'High Yield' : 'Deep Review';
      addTask(
        `Mastery: ${topic.title}`, 
        subject.name, 
        priority, 
        dueDate.toISOString().split('T')[0]
      );
      tasksCreated++;
    });

    alert(`Successfully generated ${tasksCreated} study tasks leading up to your ${relevantExam.type}! Check your Dashboard.`);
  };

  const masteryColors = {
    Red: 'bg-rose-500',
    Amber: 'bg-amber-500',
    Green: 'bg-emerald-500'
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicTitle.trim()) {
      addTopic(subject.id, newTopicTitle.trim());
      setNewTopicTitle('');
    }
  };

  const calculateProgress = () => {
    if (subject.topics.length === 0) return 0;
    const greenCount = subject.topics.filter(t => t.mastery === 'Green').length;
    const amberCount = subject.topics.filter(t => t.mastery === 'Amber').length;
    return Math.round(((greenCount + amberCount * 0.5) / subject.topics.length) * 100);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Successfully synced with Google Tasks!");
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Subjects
        </button>

        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-800 hover:border-indigo-600 transition-all shadow-sm group disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Calendar className="w-3.5 h-3.5 group-hover:text-indigo-600 transition-colors" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync with Google'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <header>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase mb-4">{subject.name}</h2>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest dark:text-slate-400">Mastered</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest dark:text-slate-400">Reviewing</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest dark:text-slate-400">Starting</span>
               </div>
            </div>
          </header>

          <DashboardCard>
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-black dark:text-white tracking-tight">Syllabus Topics</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{subject.topics.length} Total</span>
             </div>

             <form onSubmit={handleAddTopic} className="mb-8 flex gap-3">
                <input 
                  type="text" 
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Add a new topic (e.g. Organic Chemistry)..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
                />
                <button 
                  type="submit"
                  className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
             </form>

             <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {subject.topics.map((topic) => (
                    <motion.div 
                      layout
                      key={topic.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                         <div className={`w-3 h-3 rounded-full ${masteryColors[topic.mastery]}`} />
                         <span className="font-bold dark:text-white">{topic.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                          {(['Red', 'Amber', 'Green'] as MasteryLevel[]).map((level) => (
                            <button
                              key={level}
                              onClick={() => updateTopicMastery(subject.id, topic.id, level)}
                              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                topic.mastery === level 
                                  ? `${masteryColors[level]} text-white shadow-sm` 
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => deleteTopic(subject.id, topic.id)}
                          className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {subject.topics.length === 0 && (
                   <div className="py-12 text-center">
                     <Target className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                     <p className="text-slate-600 dark:text-slate-400 font-medium px-4 text-sm">No topics added yet. Break down your syllabus to track progress.</p>
                   </div>
                )}
             </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
           <DashboardCard>
              <h3 className="text-xl font-display font-black dark:text-white tracking-tight mb-6 uppercase">Mastery Progress</h3>
              <div className="relative pt-12 pb-8 flex flex-col items-center">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-50 dark:text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * calculateProgress()) / 100}
                        strokeLinecap="round"
                        className="text-indigo-600 transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-display font-black dark:text-white">{calculateProgress()}%</span>
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Complete</span>
                    </div>
                 </div>
              </div>
              <p className="text-xs text-center text-slate-500 font-medium px-4">
                Based on your Red/Amber/Green ratings for each topic in this syllabus.
              </p>
           </DashboardCard>

           <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20">
              <Zap className="w-8 h-8 mb-6 fill-current" />
              <h3 className="text-xl font-display font-black mb-3 tracking-tight">Study Strategy</h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">
                Focus on the <span className="font-bold">Red</span> topics first to build base understanding, then move to <span className="font-bold">Amber</span> for deep review.
              </p>
              <button 
                onClick={generateSchedule}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                Generate Revision Plan
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const AddSubjectModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { addSubject } = useStudy();
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [activeTab, setActiveTab] = useState<'custom' | 'templates'>('custom');

  const colors = [
    { id: 'indigo', bg: 'bg-indigo-500' },
    { id: 'rose', bg: 'bg-rose-500' },
    { id: 'emerald', bg: 'bg-emerald-500' },
    { id: 'amber', bg: 'bg-amber-500' },
    { id: 'violet', bg: 'bg-violet-500' },
    { id: 'cyan', bg: 'bg-cyan-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addSubject(name.trim(), color);
      setName('');
      onClose();
    }
  };

  const handleTemplateSelect = (template: SubjectTemplate) => {
    addSubject(template.name, template.color, template.topics);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <BookOpen className="w-12 h-12 text-slate-50 dark:text-slate-800 -rotate-12" />
            </div>

            <h2 className="text-3xl font-display font-black mb-6 dark:text-white tracking-tight">New Subject</h2>

            <div className="flex gap-4 mb-8 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('custom')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'custom' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Custom
              </button>
              <button 
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Templates
              </button>
            </div>
            
            {activeTab === 'custom' ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 mb-3 block">Course Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Advanced Mathematics"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 mb-3 block">Theme Color</label>
                  <div className="flex gap-3">
                    {colors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        className={`w-10 h-10 rounded-xl transition-all ${c.bg} ${color === c.id ? 'ring-4 ring-offset-4 ring-slate-900 dark:ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Create Subject
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {SUBJECT_TEMPLATES.map((template) => (
                   <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-transparent hover:border-indigo-600/30 transition-all text-left group"
                   >
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-black dark:text-white">{template.name}</h4>
                        <div className={`w-3 h-3 rounded-full bg-${template.color}-500 shadow-lg`} />
                     </div>
                     <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                       {template.topics.length} High-Yield Topics included
                     </p>
                   </button>
                 ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
