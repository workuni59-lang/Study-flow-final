/**
 * Storage Service Abstraction
 * High-reliability implementation with global error catching.
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  theme?: 'dark' | 'cream' | 'sepia' | 'gray';
}

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
  NOTES: 'study_flow_notes',
  MASTER_VOLUME: 'study_flow_master_volume',
  ACTIVE_TRACKS: 'study_flow_active_tracks',
  TRACK_VOLUMES: 'study_flow_track_volumes',
  ALERT_SOUND: 'study_flow_alert_sound',
  ALERT_VOLUME: 'study_flow_alert_volume',
  // Gamification v2 (sf_game_ prefix)
  GAME_GOLD: 'sf_game_gold',
  GAME_TOTAL_XP: 'sf_game_total_xp',
  GAME_HP: 'sf_game_hp',
  GAME_QUEST_PROGRESS: 'sf_game_quest_progress',
  GAME_QUEST_RESETS: 'sf_game_quest_resets',
  GAME_SHOP: 'sf_game_shop',
  GAME_SESSIONS_TODAY: 'sf_game_sessions_today',
  GAME_SESSIONS_DATE: 'sf_game_sessions_date',
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

  // --- Notepad (multi-note) ---
  getNotes: (): Note[] => {
    const old = safeGet(STORAGE_KEYS.NOTEPAD);
    if (typeof old === 'string') {
      const notes: Note[] = [{
        id: Date.now().toString(),
        title: 'Notes',
        content: old,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: 'dark',
      }];
      safeSet(STORAGE_KEYS.NOTES, notes);
      safeSet(STORAGE_KEYS.NOTEPAD, null);
      return notes;
    }
    return (safeGet(STORAGE_KEYS.NOTES) || []).map((n: Note) => ({ ...n, theme: n.theme || 'dark' }));
  },
  saveNotes: (notes: Note[]) => safeSet(STORAGE_KEYS.NOTES, notes),

  // --- Audio ---
  saveMasterVolume: (vol: number) => safeSet(STORAGE_KEYS.MASTER_VOLUME, vol),
  getMasterVolume: (): number | null => safeGet(STORAGE_KEYS.MASTER_VOLUME),

  saveActiveTracks: (ids: string[]) => safeSet(STORAGE_KEYS.ACTIVE_TRACKS, ids),
  getActiveTracks: (): string[] | null => safeGet(STORAGE_KEYS.ACTIVE_TRACKS),

  saveTrackVolumes: (volumes: Record<string, number>) => safeSet(STORAGE_KEYS.TRACK_VOLUMES, volumes),
  getTrackVolumes: (): Record<string, number> | null => safeGet(STORAGE_KEYS.TRACK_VOLUMES),

  saveAlertSound: (id: string) => safeSet(STORAGE_KEYS.ALERT_SOUND, id),
  getAlertSound: (): string | null => safeGet(STORAGE_KEYS.ALERT_SOUND),

  saveAlertVolume: (vol: number) => safeSet(STORAGE_KEYS.ALERT_VOLUME, vol),
  getAlertVolume: (): number | null => safeGet(STORAGE_KEYS.ALERT_VOLUME),

  // --- Gamification v2 (sf_game_ prefix) ---
  getGold: (): number => safeGet(STORAGE_KEYS.GAME_GOLD) ?? 0,
  saveGold: (gold: number) => safeSet(STORAGE_KEYS.GAME_GOLD, gold),

  getTotalXp: (): number => safeGet(STORAGE_KEYS.GAME_TOTAL_XP) ?? 0,
  saveTotalXp: (xp: number) => safeSet(STORAGE_KEYS.GAME_TOTAL_XP, xp),

  getHp: (): { current: number; max: number; lastDecayDate: string | null } | null =>
    safeGet(STORAGE_KEYS.GAME_HP),
  saveHp: (hp: { current: number; max: number; lastDecayDate: string | null }) =>
    safeSet(STORAGE_KEYS.GAME_HP, hp),

  getQuestProgress: (): Record<string, number> => safeGet(STORAGE_KEYS.GAME_QUEST_PROGRESS) ?? {},
  saveQuestProgress: (progress: Record<string, number>) =>
    safeSet(STORAGE_KEYS.GAME_QUEST_PROGRESS, progress),

  getQuestResets: (): Record<string, string> => safeGet(STORAGE_KEYS.GAME_QUEST_RESETS) ?? {},
  saveQuestResets: (resets: Record<string, string>) =>
    safeSet(STORAGE_KEYS.GAME_QUEST_RESETS, resets),

  getShopItems: (): { id: string; unlocked: boolean }[] =>
    safeGet(STORAGE_KEYS.GAME_SHOP) ?? [],
  saveShopItems: (items: { id: string; unlocked: boolean }[]) =>
    safeSet(STORAGE_KEYS.GAME_SHOP, items),

  getSessionsToday: (): number => safeGet(STORAGE_KEYS.GAME_SESSIONS_TODAY) ?? 0,
  saveSessionsToday: (count: number) => safeSet(STORAGE_KEYS.GAME_SESSIONS_TODAY, count),

  getSessionsDate: (): string | null => safeGet(STORAGE_KEYS.GAME_SESSIONS_DATE),
  saveSessionsDate: (date: string) => safeSet(STORAGE_KEYS.GAME_SESSIONS_DATE, date),

  // --- Generic ---
  clearAll: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Storage clear error:", e);
    }
  }
};
