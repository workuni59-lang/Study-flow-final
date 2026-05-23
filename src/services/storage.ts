/**
 * Storage Service Abstraction
 * Currently implements localStorage but can be swapped for cloud providers later.
 */

const STORAGE_KEYS = {
  TASKS: 'study_flow_tasks',
  EXAMS: 'study_flow_exams',
  STATS: 'study_flow_stats',
  THEME: 'study_flow_theme',
  TIMER: 'study_flow_timer',
  SUBJECTS: 'study_flow_subjects',
  THEME_CONFIG: 'study_flow_theme_config',
  USER_STATS: 'study_flow_user_stats',
  UNLOCKED_BADGES: 'study_flow_unlocked_badges',
  DAILY_QUESTS: 'study_flow_daily_quests',
};

export const storage = {
  // --- Gamification ---
  saveUserStats: (stats: any) => {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  },
  getUserStats: (): any | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    return data ? JSON.parse(data) : null;
  },
  saveUnlockedBadges: (badges: any[]) => {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify(badges));
  },
  getUnlockedBadges: (): any[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_BADGES);
    return data ? JSON.parse(data) : null;
  },
  saveDailyQuests: (quests: any[]) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
  },
  getDailyQuests: (): any[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
    return data ? JSON.parse(data) : null;
  },

  // --- Themes ---
  saveThemeConfig: (config: any) => {
    localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(config));
  },
  getThemeConfig: (): any | null => {
    const data = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
    return data ? JSON.parse(data) : null;
  },

  // --- Subjects ---
  saveSubjects: (subjects: any[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },
  getSubjects: (): any[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : null;
  },

  // --- Tasks ---
  saveTasks: (tasks: any[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
  getTasks: (): any[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : null;
  },

  // --- Exams ---
  saveExams: (exams: any[]) => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },
  getExams: (): any[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return data ? JSON.parse(data) : null;
  },

  // --- Stats ---
  saveStats: (stats: any) => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  },
  getStats: (): any | null => {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? JSON.parse(data) : null;
  },

  // --- Settings & State ---
  saveTheme: (isDark: boolean) => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
  },
  getTheme: (): boolean | null => {
    const data = localStorage.getItem(STORAGE_KEYS.THEME);
    return data ? JSON.parse(data) : null;
  },

  saveTimerState: (seconds: number) => {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(seconds));
  },
  getTimerState: (): number | null => {
    const data = localStorage.getItem(STORAGE_KEYS.TIMER);
    return data ? JSON.parse(data) : null;
  },

  // --- Generic ---
  clearAll: () => {
    localStorage.clear();
  }
};
