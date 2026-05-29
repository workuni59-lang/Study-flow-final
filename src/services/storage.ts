/**
 * Storage Service Abstraction
 * High-reliability implementation with global error catching.
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
  PET_STATE: 'study_flow_pet_state',
  PET_POSITION: 'study_flow_pet_position',
  PET_VISIBLE: 'study_flow_pet_visible',
  PET_SIZE: 'study_flow_pet_size',
  SIDEBAR_COLLAPSED: 'study_flow_sidebar_collapsed',
  NOTEPAD: 'study_flow_notepad',
};

const safeGet = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error(`Storage read error for ${key}:`, e);
    return null;
  }
};

const safeSet = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Storage write error for ${key}:`, e);
  }
};

export const storage = {
  // --- Gamification ---
  saveUserStats: (stats: any) => safeSet(STORAGE_KEYS.USER_STATS, stats),
  getUserStats: (): any | null => safeGet(STORAGE_KEYS.USER_STATS),
  
  saveUnlockedBadges: (badges: any[]) => safeSet(STORAGE_KEYS.UNLOCKED_BADGES, badges),
  getUnlockedBadges: (): any[] | null => safeGet(STORAGE_KEYS.UNLOCKED_BADGES),
  
  saveDailyQuests: (quests: any[]) => safeSet(STORAGE_KEYS.DAILY_QUESTS, quests),
  getDailyQuests: (): any[] | null => safeGet(STORAGE_KEYS.DAILY_QUESTS),

  // --- Themes ---
  saveThemeConfig: (config: any) => safeSet(STORAGE_KEYS.THEME_CONFIG, config),
  getThemeConfig: (): any | null => safeGet(STORAGE_KEYS.THEME_CONFIG),

  // --- Subjects ---
  saveSubjects: (subjects: any[]) => safeSet(STORAGE_KEYS.SUBJECTS, subjects),
  getSubjects: (): any[] | null => safeGet(STORAGE_KEYS.SUBJECTS),

  // --- Tasks ---
  saveTasks: (tasks: any[]) => safeSet(STORAGE_KEYS.TASKS, tasks),
  getTasks: (): any[] | null => safeGet(STORAGE_KEYS.TASKS),

  // --- Exams ---
  saveExams: (exams: any[]) => safeSet(STORAGE_KEYS.EXAMS, exams),
  getExams: (): any[] | null => safeGet(STORAGE_KEYS.EXAMS),

  // --- Stats ---
  saveStats: (stats: any) => safeSet(STORAGE_KEYS.STATS, stats),
  getStats: (): any | null => safeGet(STORAGE_KEYS.STATS),

  // --- Settings & State ---
  saveTheme: (isDark: boolean) => safeSet(STORAGE_KEYS.THEME, isDark),
  getTheme: (): boolean | null => safeGet(STORAGE_KEYS.THEME),

  saveTimerState: (seconds: number) => safeSet(STORAGE_KEYS.TIMER, seconds),
  getTimerState: (): number | null => safeGet(STORAGE_KEYS.TIMER),

  // --- Pet ---
  savePetState: (state: any) => safeSet(STORAGE_KEYS.PET_STATE, state),
  getPetState: (): any | null => safeGet(STORAGE_KEYS.PET_STATE),
  savePetPosition: (pos: { x: number; y: number }) => safeSet(STORAGE_KEYS.PET_POSITION, pos),
  getPetPosition: (): { x: number; y: number } | null => safeGet(STORAGE_KEYS.PET_POSITION),

  // --- Pet Settings ---
  savePetVisible: (visible: boolean) => safeSet(STORAGE_KEYS.PET_VISIBLE, visible),
  getPetVisible: (): boolean | null => safeGet(STORAGE_KEYS.PET_VISIBLE),
  savePetSize: (size: number) => safeSet(STORAGE_KEYS.PET_SIZE, size),
  getPetSize: (): number | null => safeGet(STORAGE_KEYS.PET_SIZE),

  // --- Sidebar ---
  saveSidebarCollapsed: (collapsed: boolean) => safeSet(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed),
  getSidebarCollapsed: (): boolean | null => safeGet(STORAGE_KEYS.SIDEBAR_COLLAPSED),

  // --- Notepad ---
  saveNotepad: (content: string) => safeSet(STORAGE_KEYS.NOTEPAD, content),
  getNotepad: (): string | null => safeGet(STORAGE_KEYS.NOTEPAD),

  // --- Generic ---
  clearAll: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Storage clear error:", e);
    }
  }
};
