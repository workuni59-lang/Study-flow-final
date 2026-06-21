import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { audioController } from '../services/AudioController';
import { storage } from '../services/storage';
import { UserStats, Badge, ACHIEVEMENTS, Achievement, Quest, XP_PER_TASK, XP_PER_FOCUS_MINUTE, AtmosphereId, WallpaperId, GameQuest, SEED_QUESTS, calculateFormalLevel, goldForTask, goldForSubjectTask, goldForLevelUp, MAX_HP, HP_REGEN_PER_SESSION, INITIAL_HP, HpState, checkDailyHp as checkHpFn, regenHp, shouldResetQuests, ShopItem, SHOP_ITEMS, XP_STREAK_BONUS_PER_DAY } from '../lib/gamification';
import { getProgress, getRankForLevel, getNextRank, getBadgesForLevel, getNewlyUnlockedBadges, getRewardsBetweenLevels, type ProgressionState, type ProgressionBadge } from '../lib/progression';
import { syncFocusSession } from '../lib/leaderboard';
import { syncDailyStats } from '../lib/dailyStats';
import { supabase } from '../lib/supabase';
import { sync } from '../services/sync';
import { useAuth } from './AuthContext';
export interface FocusSessionState {
  mode: 'focus' | 'shortBreak' | 'longBreak' | 'idle' | 'taskETA';
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  sessionsCompleted: number;
}

// Separate high-frequency context to prevent mass re-renders on every timer tick
interface FocusContextType {
  focusSession: FocusSessionState | null;
  setFocusSession: (state: FocusSessionState | null) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [focusSession, setFocusSession] = useState<FocusSessionState | null>(null);
  const value = useMemo(() => ({ focusSession, setFocusSession }), [focusSession]);
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used within a FocusProvider');
  return ctx;
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
  estimatedMinutes?: number;
  subjectId?: string;
  topicId?: string;
}

export interface ThemeConfig {
  atmosphere: AtmosphereId;
  wallpaper: WallpaperId;
  customWallpaperUrl?: string;
  // Granular Controls (Flocus style)
  blur: number; // 0-20px
  brightness: number; // 0-100%
  saturation: number; // 0-200%
  showGreeting: boolean;
  showQuote: boolean;
  showClock: boolean;
  scaleFactor: number; // 0.5-1.5
  clearMode: boolean;
  autoStartNext: boolean;
}

interface StudyContextType {
  accessToken: string | null;
  subjects: Subject[];
  tasks: Task[];
  quests: Quest[];
  themeConfig: ThemeConfig;
  userStats: UserStats;
  unlockedBadges: Badge[];
  activeNotification: Achievement | null;
  confettiActive: boolean;
  panicModeActive: boolean;
  setThemeConfig: (config: ThemeConfig) => void;
  addSubject: (name: string, color?: string, initialTopics?: string[]) => string;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, title: string) => void;
  updateTopicMastery: (subjectId: string, topicId: string, mastery: MasteryLevel) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;
  addTask: (title: string, category: string, priority: string, dueDate?: string, estimatedMinutes?: number, subjectId?: string, topicId?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  recalibrateTasks: () => void;
  setTasks: (tasks: Task[]) => void;
  completeFocusSession: (seconds: number) => void;
  logSession: (record: import('../lib/gamification').SessionRecord) => void;
  closeNotification: () => void;
  triggerConfetti: () => void;
  resetStreak: () => void;
  setPanicMode: (active: boolean) => void;
  syncPremiumStatus: (isPremium: boolean) => void;
  showPremiumModal: boolean;
  setShowPremiumModal: (show: boolean) => void;
  activeTracks: Record<string, { volume: number; isLoading?: boolean; isError?: boolean }>;
  masterVolume: number;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  toggleTrack: (id: string) => void;
  setTrackVolume: (id: string, vol: number) => void;
  stopAllTracks: () => void;
  setMasterVolume: (vol: number) => void;
  // Gamification v2
  gameGold: number;
  gameXp: number;
  gameLevel: number;
  gameHp: HpState;
  gameQuestProgress: Record<string, number>;
  shopItems: { id: string; unlocked: boolean }[];
  sessionsToday: number;
  levelUpEvent: number | null;
  questCompleteEvent: string | null;
  playerDownEvent: boolean;
  awardGold: (amount: number) => void;
  awardXp: (amount: number) => void;
  purchaseItem: (itemId: string) => boolean;
  checkDailyHp: () => void;
  dismissLevelUp: () => void;
  dismissQuestComplete: () => void;
  dismissPlayerDown: () => void;
  updateGameQuestProgress: (metric: GameQuest['metric'], amount: number) => void;
  subjectStreaks: Record<string, string>;
  // Progression system
  progression: ProgressionState;
  progressionBadges: ProgressionBadge[];
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  totalFocusSeconds: 0,
  totalTasksCompleted: 0,
  dailyXPHistory: {},
  sessionHistory: [],
  hasShield: false,
  isPremium: false
};

const DEFAULT_THEME: ThemeConfig = {
  atmosphere: 'indigo',
  wallpaper: 'mesh',
  blur: 0,
  brightness: 100,
  saturation: 100,
  showGreeting: true,
  showQuote: true,
  showClock: true,
  scaleFactor: 1,
  clearMode: false,
  autoStartNext: false,

};

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>('mock-access-token');

  const { user: authUser, profile: authProfile } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks() || []);
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects() || []);
  
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = storage.getThemeConfig();
    return { ...DEFAULT_THEME, ...saved };
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = storage.getUserStats();
    const base = saved ? { ...INITIAL_STATS, ...saved, dailyXPHistory: saved.dailyXPHistory || {}, sessionHistory: saved.sessionHistory || [] } : INITIAL_STATS;
    
    // Force premium ONLY if secret admin key is in URL
    const isAdmin = window.location.search.includes('sf_admin=true');
    if (authUser?.uid === 'demo-user-001' && isAdmin) {
      return { ...base, isPremium: true, hasShield: true };
    }
    return base;
  });

  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>(() => storage.getUnlockedBadges() || []);
  const [quests, setQuests] = useState<Quest[]>(() => storage.getDailyQuests() || []);
  const [activeNotification, setActiveNotification] = useState<Achievement | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [panicModeActive, setPanicModeActive] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeTracks, setActiveTracks] = useState<Record<string, { volume: number, isLoading: boolean, isError: boolean }>>({});
  const [masterVolume, setMasterVolumeVal] = useState(() => storage.getMasterVolume() ?? 0.5);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Gamification v2
  const [gameGold, setGameGold] = useState(() => storage.getGold());
  const [gameXp, setGameXp] = useState(() => storage.getTotalXp());
  const [gameHp, setGameHp] = useState<HpState>(() => storage.getHp() ?? INITIAL_HP);
  const [gameQuestProgress, setGameQuestProgress] = useState<Record<string, number>>(() => storage.getQuestProgress());
  const [questResets, setQuestResets] = useState<Record<string, string>>(() => storage.getQuestResets());
  const [shopItems, setShopItems] = useState<{ id: string; unlocked: boolean }[]>(() => storage.getShopItems());
  const [sessionsToday, setSessionsToday] = useState(() => storage.getSessionsToday());
  const [sessionsDate, setSessionsDate] = useState(() => storage.getSessionsDate());
  const [subjectStreaks, setSubjectStreaks] = useState<Record<string, string>>(() => storage.getSubjectStreaks() || {});

  const [levelUpEvent, setLevelUpEvent] = useState<number | null>(null);
  const [questCompleteEvent, setQuestCompleteEvent] = useState<string | null>(null);

  // Migrate v1 XP into v2 pool on first load
  useEffect(() => {
    const savedStats = storage.getUserStats();
    if (savedStats && savedStats.xp > 0 && gameXp === 0) {
      setGameXp(savedStats.xp);
    }
  }, []);

  const [playerDownEvent, setPlayerDownEvent] = useState(false);

  const gameLevel = useMemo(() => calculateFormalLevel(gameXp), [gameXp]);
  const progression = useMemo<ProgressionState>(() => {
    const { level, currentXp, xpForNext, percentage } = getProgress(gameXp);
    const rank = getRankForLevel(level);
    const nextRank = getNextRank(level);
    return { level, totalXp: gameXp, currentXp, xpForNext, percentage, rank, nextRank };
  }, [gameXp]);
  const progressionBadges = useMemo(() => getBadgesForLevel(progression.level), [progression.level]);

  const syncAudioState = useCallback(() => {
    const states = audioController.getStates();
    const nextState: Record<string, { volume: number, isLoading: boolean, isError: boolean }> = {};
    states.forEach(s => {
      if (s.isPlaying || s.isLoading || s.isError) {
        nextState[s.id] = { volume: s.volume, isLoading: s.isLoading, isError: s.isError };
      }
    });
    setActiveTracks(nextState);
  }, []);

  const stopAllTracks = useCallback(() => {
    audioController.stopAll();
    syncAudioState();
  }, [syncAudioState]);

  const setTrackVolume = useCallback((id: string, vol: number) => {
    audioController.setVolume(id, vol);
    syncAudioState();
  }, [syncAudioState]);

  const toggleTrack = useCallback((id: string) => {
    audioController.toggle(id);
    syncAudioState();
  }, [syncAudioState]);

  const setMasterVolume = useCallback((vol: number) => {
    setMasterVolumeVal(vol);
    audioController.setMasterVolume(vol);
    syncAudioState();
  }, [syncAudioState]);

  // Connect Controller to React
  useEffect(() => {
    audioController.setNotifyCallback(syncAudioState);
    audioController.setMasterVolume(masterVolume);

    const savedTracks = storage.getActiveTracks();
    const savedVolumes = storage.getTrackVolumes() ?? {};
    if (savedTracks && savedTracks.length > 0) {
      audioController.setActiveIds(savedTracks);
      savedTracks.forEach(id => {
        audioController.restoreVolume(id, savedVolumes[id] ?? 0.5);
      });
    }

    audioController.preload();
    syncAudioState();
    return () => audioController.setNotifyCallback(null);
  }, []);

  // Persist master volume
  useEffect(() => {
    storage.saveMasterVolume(masterVolume);
  }, [masterVolume]);

  // Persist active track IDs and volumes when changed
  useEffect(() => {
    const ids = Object.keys(activeTracks);
    storage.saveActiveTracks(ids);
    const volumes: Record<string, number> = {};
    for (const [id, s] of Object.entries(activeTracks)) {
      volumes[id] = (s as { volume: number }).volume;
    }
    storage.saveTrackVolumes(volumes);
  }, [activeTracks]);

  useEffect(() => { storage.saveSubjects(subjects); }, [subjects]);
  useEffect(() => { storage.saveTasks(tasks); }, [tasks]);
  useEffect(() => {
    storage.saveThemeConfig(themeConfig);
    document.documentElement.setAttribute('data-atmosphere', themeConfig.atmosphere);
    document.documentElement.setAttribute('data-wallpaper', themeConfig.wallpaper);
    document.documentElement.setAttribute('data-clear-mode', String(themeConfig.clearMode));
    document.documentElement.style.setProperty('--scale-factor', String(themeConfig.scaleFactor));
  }, [themeConfig]);
  
  useEffect(() => { storage.saveUserStats(userStats); }, [userStats]);
  useEffect(() => { storage.saveUnlockedBadges(unlockedBadges); }, [unlockedBadges]);
  useEffect(() => { storage.saveDailyQuests(quests); }, [quests]);

  // Persist gamification v2 state
  useEffect(() => { storage.saveGold(gameGold); }, [gameGold]);
  useEffect(() => { storage.saveTotalXp(gameXp); }, [gameXp]);
  useEffect(() => { storage.saveHp(gameHp); }, [gameHp]);
  useEffect(() => { storage.saveQuestProgress(gameQuestProgress); }, [gameQuestProgress]);
  useEffect(() => { storage.saveQuestResets(questResets); }, [questResets]);
  useEffect(() => { storage.saveShopItems(shopItems); }, [shopItems]);
  useEffect(() => { storage.saveSessionsToday(sessionsToday); }, [sessionsToday]);
  useEffect(() => { storage.saveSessionsDate(sessionsDate); }, [sessionsDate]);
  useEffect(() => { storage.saveSubjectStreaks(subjectStreaks); }, [subjectStreaks]);

  // Cloud sync: gamification state
  const isRealUser = authUser && authUser.uid !== 'demo-user-001' && supabase;
  const isSyncEnabled = isRealUser && userStats.isPremium;
  useEffect(() => {
    if (!isSyncEnabled) return;
    const payload = {
      gold: gameGold,
      hp: gameHp,
      quest_progress: gameQuestProgress,
      quest_resets: questResets,
      shop_items: shopItems,
      sessions_today: sessionsToday,
      sessions_date: sessionsDate,
      daily_quests: quests,
    };
    localStorage.setItem('study_flow_gamification_updated_at', new Date().toISOString());
    sync.enqueue('gamification_state', 'upsert', payload);
  }, [isSyncEnabled, gameGold, gameHp, gameQuestProgress, questResets, shopItems, sessionsToday, sessionsDate, quests]);

  // Badge sync to Supabase (canonical source)
  useEffect(() => {
    if (!authUser || !isSyncEnabled) return;
    const badgeIds = unlockedBadges.map(b => b.achievementId);
    supabase.from('user_stats').upsert({
      user_id: authUser.uid,
      badges_earned: badgeIds,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).then(undefined, (err: any) => {
      console.warn('[StudyContext] badge sync failed:', err?.message ?? err);
    });
  }, [unlockedBadges, authUser]);

  // Load badges from Supabase on auth init (replace local)
  useEffect(() => {
    if (!authUser || !isSyncEnabled) return;
    const onBadgeErr = (err: any) => {
      console.warn('[StudyContext] badge load failed:', err?.message ?? err);
    };
    supabase.from('user_stats').select('badges_earned').eq('user_id', authUser.uid).single().then(({ data }) => {
      if (data?.badges_earned) {
        const supabaseIds = new Set(data.badges_earned as string[]);
        setUnlockedBadges(prev => {
          const merged = prev.filter(b => supabaseIds.has(b.achievementId));
          const missing = (data.badges_earned as string[])
            .filter(id => !prev.some(b => b.achievementId === id))
            .map(id => ({ id: `supabase-${id}`, achievementId: id, unlockedAt: new Date().toISOString() }));
          const result = [...merged, ...missing];
          storage.saveUnlockedBadges(result);
          return result;
        });
      }
    }, onBadgeErr);
  }, [authUser ? authUser.uid : null]);

  // ─── Cloud Sync ─────────────────────────────────────────────────

  function mergeItems<T extends Record<string, any>>(local: T[], cloud: T[], key: string): T[] {
    const cloudMap = new Map(cloud.map(c => [c[key], c]));
    const merged = local.map(item => {
      const cloudItem = cloudMap.get(item[key]);
      if (!cloudItem) return item;
      cloudMap.delete(item[key]);
      const localTime = item.updated_at ? new Date(item.updated_at).getTime() : 0;
      const cloudTime = cloudItem.updated_at ? new Date(cloudItem.updated_at).getTime() : 0;
      return cloudTime > localTime ? cloudItem : item;
    });
    cloudMap.forEach(item => merged.push(item));
    return merged;
  }

  // Pull cloud data on login (premium only)
  useEffect(() => {
    if (!authUser || !isSyncEnabled) return;
    sync.pullAll(authUser.uid).then(cloud => {
      setTasks(prev => mergeItems(prev, cloud.tasks, 'id'));
      setSubjects(prev => mergeItems(prev, cloud.subjects, 'id'));
      if (cloud.gamification) {
        const g = cloud.gamification as Record<string, any>;
        const localUpdated = localStorage.getItem('study_flow_gamification_updated_at');
        const cloudTime = g.updated_at ? new Date(g.updated_at).getTime() : 0;
        const localTime = localUpdated ? new Date(localUpdated).getTime() : 0;
        if (cloudTime > localTime) {
          if (g.gold != null) setGameGold(g.gold as number);
          if (g.hp) setGameHp(g.hp as HpState);
          if (g.quest_progress) setGameQuestProgress(g.quest_progress as Record<string, number>);
          if (g.quest_resets) setQuestResets(g.quest_resets as Record<string, string>);
          if (g.shop_items) setShopItems(g.shop_items as { id: string; unlocked: boolean }[]);
          if (g.sessions_today != null) setSessionsToday(g.sessions_today as number);
          if (g.sessions_date) setSessionsDate(g.sessions_date as string);
          if (g.daily_quests) setQuests(g.daily_quests as Quest[]);
        }
      }
    }).catch((err: any) => {
      console.warn('[StudyContext] pullAll failed:', err?.message ?? err);
    });
  }, [authUser ? authUser.uid : null]);

  // Notification Queue Processor
  useEffect(() => {
    if (!activeNotification && notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setNotificationQueue(prev => prev.slice(1));
      setActiveNotification(next);
      triggerConfetti();
    }
  }, [notificationQueue, activeNotification]);

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 500);
  };

  const resetStreak = () => { setUserStats(prev => ({ ...prev, currentStreak: 0 })); };

  const setPanicMode = (active: boolean) => {
    setPanicModeActive(active);
    if (active) setThemeConfig(prev => ({ ...prev, atmosphere: 'slate' }));
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

  useEffect(() => { generateDailyQuests(); }, [generateDailyQuests]);

  const updateQuestProgress = (type: Quest['type'], amount: number) => {
    const completedRewards: number[] = [];
    setQuests(prev => {
      const result = prev.map(q => {
        if (q.type === type && !q.completed) {
          const newProgress = q.progress + amount;
          const isNowCompleted = newProgress >= q.requirement;
          if (isNowCompleted) completedRewards.push(q.xpReward);
          return { ...q, progress: Math.min(newProgress, q.requirement), completed: isNowCompleted };
        }
        return q;
      });
      return result;
    });
    completedRewards.forEach(xp => { earnXp(xp); triggerConfetti(); });
  };

  // ─── Gamification v2 ────────────────────────────────────────────

  const awardGold = useCallback((amount: number) => {
    setGameGold(prev => prev + amount);
  }, []);

  const gameXpRef = useRef(gameXp);
  gameXpRef.current = gameXp;

  const awardXp = useCallback((amount: number) => {
    const current = gameXpRef.current;
    const newTotal = current + amount;
    const newLevel = calculateFormalLevel(newTotal);
    const oldLevel = calculateFormalLevel(current);
    setGameXp(newTotal);
    if (newLevel > oldLevel) {
      const goldReward = goldForLevelUp(newLevel);
      setGameGold(g => g + goldReward);
      setLevelUpEvent(newLevel);
    }
  }, []);

  const updateStreak = useCallback(() => {
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
        earnXp(XP_STREAK_BONUS_PER_DAY);
        awardGold(2);
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
  }, [userStats.lastActiveDate, userStats.currentStreak, userStats.bestStreak, userStats.hasShield, awardGold]);

  const earnXp = useCallback((amount: number) => {
    const today = new Date().toISOString().split("T")[0];
    setUserStats(prev => {
      const newHistory = { ...prev.dailyXPHistory };
      newHistory[today] = (newHistory[today] || 0) + amount;
      return { ...prev, xp: prev.xp + amount, dailyXPHistory: newHistory };
    });
    awardXp(amount);
  }, [awardXp]);


  const syncPremiumStatus = useCallback((isPremium: boolean) => {
    setUserStats(prev => {
      if (prev.isPremium === isPremium) return prev;
      return { ...prev, isPremium, hasShield: isPremium ? true : prev.hasShield };
    });
  }, []);

  useEffect(() => {
    if (userStats.isPremium && !userStats.hasShield) {
      setUserStats(prev => ({ ...prev, hasShield: true }));
    }
  }, [userStats.isPremium, userStats.hasShield]);

  // Gate sync behind premium
  const prevPremiumRef = useRef(userStats.isPremium);
  useEffect(() => {
    const was = prevPremiumRef.current;
    const now = userStats.isPremium;
    prevPremiumRef.current = now;
    if (was === now) return;
    if (now && isRealUser) {
      sync.setPremium(true);
      const ts = new Date().toISOString();
      sync.enqueueAll([
        ...tasks.map(t => ({ table: 'tasks' as const, data: { ...t, updated_at: ts } })),
        ...subjects.map(s => ({ table: 'subjects' as const, data: { ...s, updated_at: ts } })),
        {
          table: 'gamification_state' as const,
          data: {
            gold: gameGold, hp: gameHp, quest_progress: gameQuestProgress,
            quest_resets: questResets, shop_items: shopItems,
            sessions_today: sessionsToday, sessions_date: sessionsDate,
            daily_quests: quests, updated_at: ts,
          },
        },
      ]);
    } else if (!now) {
      sync.setPremium(false);
    }
  }, [userStats.isPremium]);

  const checkAchievements = (stats: UserStats) => {
    const newlyUnlocked: Achievement[] = [];
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedBadges.some(b => b.achievementId === achievement.id)) return;
      let met = false;
      switch (achievement.type) {
        case 'tasks': if (stats.totalTasksCompleted >= achievement.requirement) met = true; break;
        case 'focus': if (stats.totalFocusSeconds >= achievement.requirement) met = true; break;
        case 'streak': if (stats.currentStreak >= achievement.requirement) met = true; break;
        case 'mastery':
          const greenTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.mastery === 'Green').length, 0);
          if (greenTopics >= achievement.requirement) met = true;
          break;
      }
      if (met) {
        const newBadge: Badge = { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), achievementId: achievement.id, unlockedAt: new Date().toISOString() };
        setUnlockedBadges(prev => {
           if (prev.some(b => b.achievementId === achievement.id)) return prev;
           return [...prev, newBadge];
        });
        newlyUnlocked.push(achievement);
      }
    });
    if (newlyUnlocked.length > 0) {
      setNotificationQueue(prev => [...prev, ...newlyUnlocked]);
      const rarest = newlyUnlocked.reduce((a, b) => {
        const rank = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
        return rank[b.rarity as keyof typeof rank] > rank[a.rarity as keyof typeof rank] ? b : a;
      });
    }
  };

  const addTask = (title: string, category: string, priority: string, dueDate?: string, estimatedMinutes?: number, subjectId?: string, topicId?: string) => {
    const newTask: Task = { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), title, category, priority, completed: false, dueDate, estimatedMinutes, subjectId, topicId };
    setTasks(prev => [newTask, ...prev]);
    if (isSyncEnabled) sync.enqueue('tasks', 'upsert', newTask);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    const isCompleting = task && !task.completed;
    if (isCompleting) {
      const subject = subjects.find(s => s.id === task?.subjectId);
      earnXp(XP_PER_TASK);
      awardGold(goldForSubjectTask(task!.priority, subject));
      updateQuestProgress('tasks', 1);
      updateGameQuestProgress('tasks_completed', 1);

      // Automated Mastery Advancement
      if (task?.subjectId && task?.topicId) {
        const topic = subject?.topics.find(t => t.id === task.topicId);
        if (topic) {
          let nextMastery: MasteryLevel = topic.mastery;
          if (topic.mastery === 'Red') nextMastery = 'Amber';
          else if (topic.mastery === 'Amber') nextMastery = 'Green';
          
          if (nextMastery !== topic.mastery) {
            updateTopicMastery(task.subjectId, task.topicId, nextMastery);
          }
        }

        // Subject Streak Tracking
        const today = new Date().toISOString().split('T')[0];
        setSubjectStreaks(prev => ({
          ...prev,
          [task.subjectId!]: today
        }));
      }
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (isSyncEnabled && task) sync.enqueue('tasks', 'upsert', { ...task, completed: !task.completed });
    if (isCompleting) {
      const newTotal = userStats.totalTasksCompleted + 1;
      setUserStats(prev => ({ ...prev, totalTasksCompleted: newTotal }));
      checkAchievements({ ...userStats, totalTasksCompleted: newTotal });
      if (tasks.filter(t => t.id !== id).every(t => t.completed)) {
        setTimeout(() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }), 0);
      }
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (isSyncEnabled) sync.enqueue('tasks', 'delete', { id });
  };

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const existing = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (isSyncEnabled && existing) sync.enqueue('tasks', 'upsert', { ...existing, ...updates });
  }, [tasks, isSyncEnabled]);

  const recalibrateTasks = () => {
    setTasks(prev => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const overdueTasks = prev.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today);
      if (overdueTasks.length === 0) return prev;
      const remainingTasks = prev.filter(t => !overdueTasks.find(ot => ot.id === t.id));
      const updatedOverdue = overdueTasks.map((t, index) => {
        const newDate = new Date(); newDate.setDate(newDate.getDate() + (index % 3));
        return { ...t, dueDate: newDate.toISOString().split('T')[0] };
      });
      return [...remainingTasks, ...updatedOverdue];
    });
  };

  const addSubject = (name: string, color?: string, initialTopics: string[] = []): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newSubject: Subject = {
      id, name, topics: initialTopics.map(title => ({ id: Math.random().toString(36).substr(2, 9), title, mastery: 'Red' })), color: color || 'indigo'
    };
    setSubjects(prev => [...prev, newSubject]);
    if (isSyncEnabled) sync.enqueue('subjects', 'upsert', newSubject);
    return id;
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    if (isSyncEnabled) sync.enqueue('subjects', 'delete', { id });
  };

  const addTopic = (subjectId: string, title: string) => {
    const newTopic = { id: Date.now().toString(), title, mastery: 'Red' as MasteryLevel };
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s));
    const subject = subjects.find(s => s.id === subjectId);
    if (isSyncEnabled && subject) {
      const updated = { ...subject, topics: [...subject.topics, newTopic] };
      sync.enqueue('subjects', 'upsert', updated);
    }
  };

  const updateTopicMastery = (subjectId: string, topicId: string, mastery: MasteryLevel) => {
    const subject = subjects.find(s => s.id === subjectId);
    const topic = subject?.topics.find(t => t.id === topicId);
    const isNewGreen = topic && topic.mastery !== 'Green' && mastery === 'Green';
    if (isNewGreen) {
      updateQuestProgress('mastery', 1);
      earnXp(100);
      triggerConfetti();
    }
    setSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? { ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, mastery } : t) }
        : s
    ));
    if (isSyncEnabled && subject) {
      const updated = { ...subject, topics: subject.topics.map(t => t.id === topicId ? { ...t, mastery } : t) };
      sync.enqueue('subjects', 'upsert', updated);
    }
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } : s));
    const subject = subjects.find(s => s.id === subjectId);
    if (isSyncEnabled && subject) {
      const updated = { ...subject, topics: subject.topics.filter(t => t.id !== topicId) };
      sync.enqueue('subjects', 'upsert', updated);
    }
  };

  const completeFocusSession = async (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    earnXp(minutes * XP_PER_FOCUS_MINUTE);
    updateQuestProgress('focus', seconds);
    updateGameQuestProgress('sessions_completed', 1);
    setGameHp(prev => regenHp(prev));
    const newTotalFocus = (userStats.totalFocusSeconds || 0) + seconds;
    setUserStats(prev => ({ ...prev, totalFocusSeconds: newTotalFocus }));
    checkAchievements({ ...userStats, totalFocusSeconds: newTotalFocus });
    if (authUser && isSyncEnabled && seconds >= 60) {
      syncFocusSession(
        authUser.uid,
        authProfile?.display_name ?? authUser.displayName ?? 'Anonymous',
        authProfile?.avatar_url ?? null,
        seconds,
      ).catch((err: any) => {
        console.warn('[StudyContext] focus session sync failed:', err?.message ?? err);
      });
      // Sync user_stats (lifetime accumulators)
      if (supabase) {
        const { data: existing } = await supabase
          .from('user_stats')
          .select('total_focus_seconds, total_sessions')
          .eq('user_id', authUser.uid)
          .single();
        const currentStreak = userStats.currentStreak || 0;
        const longestStreak = Math.max(userStats.bestStreak || 0, currentStreak);
        supabase.from('user_stats').upsert({
          user_id: authUser.uid,
          total_focus_seconds: (existing?.total_focus_seconds ?? 0) + seconds,
          total_sessions: (existing?.total_sessions ?? 0) + 1,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          game_level: gameLevel,
          game_xp: gameXp,
          badges_earned: unlockedBadges.map(b => b.achievementId),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }).then(undefined, (err: any) => {
          console.warn('[StudyContext] user_stats sync failed:', err?.message ?? err);
        });

        // Sync daily activity
        const today = new Date().toISOString().split('T')[0];
        syncDailyStats(authUser.uid, today, 1, seconds, minutes * XP_PER_FOCUS_MINUTE).catch((err: any) => {
          console.warn('[StudyContext] daily_stats sync failed:', err?.message ?? err);
        });
      }
    }
  };

  const logSession = (record: import('../lib/gamification').SessionRecord) => {
    setUserStats(prev => {
      const updated = [...prev.sessionHistory, record].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      return {
        ...prev,
        sessionHistory: updated.filter(s => new Date(s.date) >= cutoff).slice(0, 500),
      };
    });
  };

  const closeNotification = () => { setActiveNotification(null); };

  const dismissLevelUp = useCallback(() => setLevelUpEvent(null), []);
  const dismissQuestComplete = useCallback(() => setQuestCompleteEvent(null), []);
  const dismissPlayerDown = useCallback(() => setPlayerDownEvent(false), []);

  const purchaseItem = useCallback((itemId: string): boolean => {
    const shopDef = SHOP_ITEMS.find(i => i.id === itemId);
    if (!shopDef) return false;
    const existing = shopItems.find(i => i.id === itemId);
    if (existing?.unlocked) return false;
    if (gameGold < shopDef.cost) return false;
    setGameGold(prev => prev - shopDef.cost);
    setShopItems(prev => {
      const filtered = prev.filter(i => i.id !== itemId);
      return [...filtered, { id: itemId, unlocked: true }];
    });
    return true;
  }, [gameGold, shopItems]);

  const checkDailyHp = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const tasksDueYesterday = tasks.filter(t => t.dueDate === yesterdayStr).length;
    const tasksCompletedYesterday = tasks.filter(t => t.dueDate === yesterdayStr && t.completed).length;
    setGameHp(prev => {
      const updated = checkHpFn(prev, tasksDueYesterday, tasksCompletedYesterday, userStats.lastActiveDate);
      if (updated.current <= 0 && prev.current > 0) {
        setPlayerDownEvent(true);
      }
      return updated;
    });
  }, [tasks, userStats.lastActiveDate]);

  const updateGameQuestProgress = useCallback((metric: GameQuest['metric'], amount: number) => {
    const today = new Date().toISOString();
    const nextResets = { ...questResets };
    SEED_QUESTS.forEach(q => {
      if (q.metric === metric && shouldResetQuests(q.tier, questResets[q.id] ?? null)) {
        nextResets[q.id] = today;
      }
    });
    setQuestResets(nextResets);

    const nextProgress = { ...gameQuestProgress };
    SEED_QUESTS.forEach(q => {
      if (q.metric !== metric) return;
      const needsReset = nextResets[q.id] !== questResets[q.id];
      const baseValue = needsReset ? 0 : (nextProgress[q.id] ?? 0);
      const newProgress = baseValue + amount;
      const capped = Math.min(newProgress, q.goal);
      nextProgress[q.id] = capped;
      const wasBelow = nextProgress[q.id] !== capped || baseValue < q.goal;
      if (baseValue < q.goal && capped >= q.goal) {
        earnXp(q.reward.xp);
        awardGold(q.reward.gold);
        setQuestCompleteEvent(q.id);
      }
    });
    setGameQuestProgress(nextProgress);
  }, [awardGold, questResets, gameQuestProgress]);

  // Optimization: Memoize the Context Value
  const contextValue = useMemo(() => ({
    accessToken, subjects, tasks, quests, themeConfig, userStats, unlockedBadges, activeNotification,
    confettiActive, panicModeActive, setThemeConfig, addSubject, deleteSubject, addTopic,
    updateTopicMastery, deleteTopic, addTask, toggleTask, deleteTask, updateTask, recalibrateTasks,
    setTasks, earnXp, completeFocusSession, logSession, closeNotification, syncPremiumStatus, triggerConfetti, resetStreak, setPanicMode,
    showPremiumModal, setShowPremiumModal,
    activeTracks, masterVolume, toggleTrack, setTrackVolume, stopAllTracks, setMasterVolume,
    selectedTaskId, setSelectedTaskId,
    // Gamification v2
    gameGold, gameXp, gameLevel, gameHp, gameQuestProgress, shopItems, sessionsToday,
    levelUpEvent, questCompleteEvent, playerDownEvent,
    awardGold, awardXp, purchaseItem, checkDailyHp, dismissLevelUp, dismissQuestComplete, dismissPlayerDown,
    updateGameQuestProgress,
    // Progression
    progression, progressionBadges,
  }), [
    accessToken, subjects, tasks, quests, themeConfig, userStats, unlockedBadges, activeNotification,
    confettiActive, panicModeActive, showPremiumModal,
    activeTracks, masterVolume, toggleTrack, setTrackVolume, stopAllTracks, setMasterVolume,
    selectedTaskId,
    // Gamification v2 deps
    gameGold, gameXp, gameLevel, gameHp, gameQuestProgress, shopItems, sessionsToday,
    levelUpEvent, questCompleteEvent, playerDownEvent,
    awardGold, awardXp, purchaseItem, checkDailyHp, dismissLevelUp, dismissQuestComplete, dismissPlayerDown,
    updateGameQuestProgress,
    // Progression deps
    progression, progressionBadges,
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
