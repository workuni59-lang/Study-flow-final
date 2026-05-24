import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storage } from '../services/storage';
import { UserStats, Badge, ACHIEVEMENTS, Achievement, Quest, calculateLevel, XP_PER_TASK, XP_PER_FOCUS_MINUTE, AtmosphereId, WallpaperId } from '../lib/gamification';

interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type MasteryLevel = 'Red' | 'Amber' | 'Green';

export interface Topic {
  id: string;
  title: string;
  mastery: MasteryLevel;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  priority?: string;
  dueDate?: string;
}

export interface Exam {
  id: string;
  subject: string;
  type: string;
  date: string;
  daysLeft: number;
  subjectId?: string;
}

export interface ThemeConfig {
  atmosphere: AtmosphereId;
  wallpaper: WallpaperId;
}

interface StudyContextType {
  user: MockUser | null;
  loading: boolean;
  accessToken: string | null;
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  quests: Quest[];
  themeConfig: ThemeConfig;
  userStats: UserStats;
  unlockedBadges: Badge[];
  activeNotification: Achievement | null;
  confettiActive: boolean;
  panicModeActive: boolean;
  selectedExamForPath: Exam | null;
  setThemeConfig: (config: ThemeConfig) => void;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  addSubject: (name: string, color?: string, initialTopics?: string[]) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, title: string) => void;
  updateTopicMastery: (subjectId: string, topicId: string, mastery: MasteryLevel) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;
  addTask: (title: string, category: string, priority: string, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addExam: (subject: string, type: string, date: string, subjectId?: string) => void;
  deleteExam: (id: string) => void;
  recalibrateTasks: () => void;
  setTasks: (tasks: Task[]) => void;
  addXP: (amount: number) => void;
  completeFocusSession: (seconds: number) => void;
  closeNotification: () => void;
  buyShield: () => void;
  togglePremium: () => void;
  triggerConfetti: () => void;
  resetStreak: () => void;
  setPanicMode: (active: boolean) => void;
  setSelectedExamForPath: (exam: Exam | null) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const MOCK_USER: MockUser = {
  uid: 'mock-user-123',
  email: 'demo@studyflow.com',
  displayName: 'Demo Student',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
};

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  totalFocusSeconds: 0,
  totalTasksCompleted: 0,
  dailyXPHistory: {},
  hasShield: false,
  isPremium: false
};

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>('mock-access-token');
  
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks() || []);
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects() || []);
  const [exams, setExams] = useState<Exam[]>(() => storage.getExams() || []);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => storage.getThemeConfig() || { atmosphere: 'indigo', wallpaper: 'mesh' });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = storage.getUserStats();
    if (!saved) return INITIAL_STATS;
    return { ...INITIAL_STATS, ...saved, dailyXPHistory: saved.dailyXPHistory || {} };
  });

  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>(() => storage.getUnlockedBadges() || []);
  const [quests, setQuests] = useState<Quest[]>(() => storage.getDailyQuests() || []);
  
  const [activeNotification, setActiveNotification] = useState<Achievement | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [panicModeActive, setPanicModeActive] = useState(false);
  const [selectedExamForPath, setSelectedExamForPath] = useState<Exam | null>(null);

  // --- Synchronization Hooks ---

  // 1. Exam Countdown Sync (Runs on mount/load)
  useEffect(() => {
    setExams(prev => prev.map(exam => {
      // Logic to re-calculate daysLeft based on current real-world date
      const targetDate = new Date(exam.date);
      // Note: Since our storage date string is month/day, we assume current year
      if (isNaN(targetDate.getTime())) {
         const currentYear = new Date().getFullYear();
         const dateWithYear = `${exam.date}, ${currentYear}`;
         const finalTarget = new Date(dateWithYear);
         const diff = finalTarget.getTime() - new Date().getTime();
         return { ...exam, daysLeft: Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) };
      }
      const diff = targetDate.getTime() - new Date().getTime();
      return { ...exam, daysLeft: Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) };
    }));
  }, []);

  // 2. Persistence Sync
  useEffect(() => { storage.saveSubjects(subjects); }, [subjects]);
  useEffect(() => { storage.saveTasks(tasks); }, [tasks]);
  useEffect(() => { storage.saveExams(exams); }, [exams]);
  useEffect(() => {
    storage.saveThemeConfig(themeConfig);
    document.documentElement.setAttribute('data-atmosphere', themeConfig.atmosphere);
    document.documentElement.setAttribute('data-wallpaper', themeConfig.wallpaper);
  }, [themeConfig]);
  useEffect(() => { storage.saveUserStats(userStats); checkAchievements(); }, [userStats]);
  useEffect(() => { storage.saveUnlockedBadges(unlockedBadges); }, [unlockedBadges]);
  useEffect(() => { storage.saveDailyQuests(quests); }, [quests]);

  // 3. Notification Queue Processor
  useEffect(() => {
    if (!activeNotification && notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setNotificationQueue(prev => prev.slice(1));
      setActiveNotification(next);
      triggerConfetti();
    }
  }, [notificationQueue, activeNotification]);

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Core Actions ---

  const signIn = async () => {
    setUser(MOCK_USER);
    updateStreak();
    generateDailyQuests();
  };

  const logout = async () => { setUser(null); };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 500);
  };

  const resetStreak = () => { setUserStats(prev => ({ ...prev, currentStreak: 0 })); };

  const setPanicMode = (active: boolean) => {
    setPanicModeActive(active);
    if (active) setThemeConfig({ ...themeConfig, atmosphere: 'slate' });
  };

  const generateDailyQuests = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedQuests = storage.getDailyQuests() || [];
    if (savedQuests.length > 0 && savedQuests[0].id.startsWith(today)) return;

    const newQuests: Quest[] = [
      { id: `${today}-q1`, title: 'The Sprint', description: 'Complete 3 study tasks today.', requirement: 3, progress: 0, xpReward: 150, type: 'tasks', completed: false },
      { id: `${today}-q2`, title: 'Deep Diver', description: 'Accumulate 30 minutes of focus time.', requirement: 1800, progress: 0, xpReward: 200, type: 'focus', completed: false },
      { id: `${today}-q3`, title: 'Topic Master', description: 'Achieve Green mastery on 1 new topic.', requirement: 1, progress: 0, xpReward: 250, type: 'mastery', completed: false }
    ];
    setQuests(newQuests);
    storage.saveDailyQuests(newQuests);
  }, []);

  const updateQuestProgress = (type: Quest['type'], amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.type === type && !q.completed) {
        const newProgress = q.progress + amount;
        const isNowCompleted = newProgress >= q.requirement;
        if (isNowCompleted) { addXP(q.xpReward); triggerConfetti(); }
        return { ...q, progress: Math.min(newProgress, q.requirement), completed: isNowCompleted };
      }
      return q;
    }));
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userStats.lastActiveDate;
    if (lastActive === today) return;

    let newStreak = userStats.currentStreak;
    let shieldConsumed = false;
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        if (userStats.hasShield) {
          shieldConsumed = true;
          newStreak += 1; 
          alert("Streak Shield Consumed! Your streak has been preserved.");
        } else {
          newStreak = 1;
        }
      }
    } else {
      newStreak = 1;
    }
    setUserStats(prev => ({
      ...prev, currentStreak: newStreak, bestStreak: Math.max(prev.bestStreak, newStreak),
      lastActiveDate: today, hasShield: shieldConsumed ? false : prev.hasShield
    }));
  };

  const addXP = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    setUserStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      const newHistory = { ...prev.dailyXPHistory };
      newHistory[today] = (newHistory[today] || 0) + amount;
      return { ...prev, xp: newXP, level: newLevel, dailyXPHistory: newHistory };
    });
  };

  const buyShield = () => {
    const COST = 1000;
    if (userStats.xp < COST) { alert("Not enough XP!"); return; }
    if (userStats.hasShield) { alert("Already active!"); return; }
    setUserStats(prev => ({ ...prev, xp: prev.xp - COST, hasShield: true }));
  };

  const togglePremium = () => {
    setUserStats(prev => ({ ...prev, isPremium: !prev.isPremium }));
  };

  const checkAchievements = () => {
    const newlyUnlocked: Achievement[] = [];
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedBadges.some(b => b.achievementId === achievement.id)) return;
      let met = false;
      switch (achievement.type) {
        case 'tasks': if (userStats.totalTasksCompleted >= achievement.requirement) met = true; break;
        case 'focus': if (userStats.totalFocusSeconds >= achievement.requirement) met = true; break;
        case 'streak': if (userStats.currentStreak >= achievement.requirement) met = true; break;
        case 'mastery':
          const greenTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.mastery === 'Green').length, 0);
          if (greenTopics >= achievement.requirement) met = true;
          break;
      }
      if (met) {
        const newBadge: Badge = { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), achievementId: achievement.id, unlockedAt: new Date().toISOString() };
        setUnlockedBadges(prev => [...prev, newBadge]);
        newlyUnlocked.push(achievement);
      }
    });
    if (newlyUnlocked.length > 0) setNotificationQueue(prev => [...prev, ...newlyUnlocked]);
  };

  const addTask = (title: string, category: string, priority: string, dueDate?: string) => {
    const newTask: Task = { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), title, category, priority, completed: false, dueDate };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          addXP(XP_PER_TASK);
          setUserStats(s => ({ ...s, totalTasksCompleted: s.totalTasksCompleted + 1 }));
          updateQuestProgress('tasks', 1);
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const addExam = (subject: string, type: string, date: string, subjectId?: string) => {
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - new Date().getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const newExam: Exam = { id: Date.now().toString(), subject, type, date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), daysLeft: diffDays, subjectId };
    setExams(prev => [...prev, newExam].sort((a, b) => a.daysLeft - b.daysLeft));
  };

  const deleteExam = (id: string) => setExams(prev => prev.filter(e => e.id !== id));

  const recalibrateTasks = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today);
    if (overdueTasks.length === 0) return;
    const remainingTasks = tasks.filter(t => !overdueTasks.find(ot => ot.id === t.id));
    const updatedOverdue = overdueTasks.map((t, index) => {
      const newDate = new Date(); newDate.setDate(newDate.getDate() + (index % 3));
      return { ...t, dueDate: newDate.toISOString().split('T')[0] };
    });
    setTasks([...remainingTasks, ...updatedOverdue]);
  };

  const addSubject = (name: string, color?: string, initialTopics: string[] = []) => {
    const newSubject: Subject = {
      id: Date.now().toString(), name, topics: initialTopics.map(title => ({ id: Math.random().toString(36).substr(2, 9), title, mastery: 'Red' })), color: color || 'indigo'
    };
    setSubjects([...subjects, newSubject]);
  };

  const deleteSubject = (id: string) => setSubjects(subjects.filter(s => s.id !== id));

  const addTopic = (subjectId: string, title: string) => {
    setSubjects(subjects.map(s => s.id === subjectId ? { ...s, topics: [...s.topics, { id: Date.now().toString(), title, mastery: 'Red' }] } : s));
  };

  const updateTopicMastery = (subjectId: string, topicId: string, mastery: MasteryLevel) => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        const wasGreen = s.topics.find(t => t.id === topicId)?.mastery === 'Green';
        if (!wasGreen && mastery === 'Green') {
          updateQuestProgress('mastery', 1);
          addXP(100);
          triggerConfetti(); 
        }
        return { ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, mastery } : t) };
      }
      return s;
    }));
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSubjects(subjects.map(s => s.id === subjectId ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } : s));
  };

  const completeFocusSession = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    addXP(minutes * XP_PER_FOCUS_MINUTE);
    updateQuestProgress('focus', seconds);
    setUserStats(prev => ({ ...prev, totalFocusSeconds: prev.totalFocusSeconds + seconds }));
  };

  const closeNotification = () => { setActiveNotification(null); };

  // --- Optimization: Memoize the Context Value ---
  const contextValue = useMemo(() => ({
    user, loading, accessToken, subjects, tasks, exams, quests, themeConfig, userStats, unlockedBadges, activeNotification,
    confettiActive, panicModeActive, selectedExamForPath, setThemeConfig, signIn, logout, addSubject, deleteSubject, addTopic,
    updateTopicMastery, deleteTopic, addTask, toggleTask, deleteTask, addExam, deleteExam, recalibrateTasks,
    setTasks, addXP, completeFocusSession, closeNotification, buyShield, togglePremium, triggerConfetti, resetStreak, setPanicMode,
    setSelectedExamForPath
  }), [
    user, loading, accessToken, subjects, tasks, exams, quests, themeConfig, userStats, unlockedBadges, activeNotification,
    confettiActive, panicModeActive, selectedExamForPath
  ]);

  return (
    <StudyContext.Provider value={contextValue}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) throw new Error('useStudy must be used within a StudyProvider');
  return context;
}
