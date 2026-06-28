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
  STATS: 'study_flow_stats',
  THEME: 'study_flow_theme',
  TIMER: 'study_flow_timer',
  SUBJECTS: 'study_flow_subjects',
  THEME_CONFIG: 'study_flow_theme_config',
  USER_STATS: 'study_flow_user_stats',
  UNLOCKED_BADGES: 'study_flow_unlocked_badges',
  DAILY_QUESTS: 'study_flow_daily_quests',
  SIDEBAR_COLLAPSED: 'study_flow_sidebar_collapsed',
  NOTEPAD: 'study_flow_notepad',
  NOTES: 'study_flow_notes',
  MASTER_VOLUME: 'study_flow_master_volume',
  ACTIVE_TRACKS: 'study_flow_active_tracks',
  TRACK_VOLUMES: 'study_flow_track_volumes',
  ALERT_SOUND: 'study_flow_alert_sound',
  ALERT_VOLUME: 'study_flow_alert_volume',
  SUBJECT_STREAKS: 'study_flow_subject_streaks',
  // Gamification v2 (sf_game_ prefix)
  GAME_GOLD: 'sf_game_gold',
  GAME_TOTAL_XP: 'sf_game_total_xp',
  GAME_HP: 'sf_game_hp',
  GAME_QUEST_PROGRESS: 'sf_game_quest_progress',
  GAME_QUEST_RESETS: 'sf_game_quest_resets',
  GAME_SHOP: 'sf_game_shop',
  GAME_SESSIONS_TODAY: 'sf_game_sessions_today',
  GAME_SESSIONS_DATE: 'sf_game_sessions_date',
  THEME_CUSTOMIZED: 'study_flow_theme_customized',
  // Timer custom durations
  CUSTOM_DURATIONS: 'study_flow_custom_durations',
  // Flow mode session log (for adaptive duration)
  FLOW_LOG: 'study_flow_flow_log',
  // Daily focus goal (seconds)
  DAILY_GOAL: 'study_flow_daily_goal',
  // Today's focus seconds + date (for daily goal ring)
  TODAY_FOCUS: 'study_flow_today_focus',
  TODAY_DATE: 'study_flow_today_date',
  // Onboarding tour
  ONBOARDING_COMPLETE: 'study_flow_onboarding_complete',
  // Wallpaper daily rotation
  WALLPAPER_ROTATION_DATE: 'study_flow_wallpaper_rotation_date',
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

const stamp = () => new Date().toISOString();

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
  saveThemeCustomized: (val: boolean) => safeSet(STORAGE_KEYS.THEME_CUSTOMIZED, val),
  loadThemeCustomized: (): boolean => safeGet(STORAGE_KEYS.THEME_CUSTOMIZED) ?? false,

  // --- Subjects ---
  saveSubjects: (subjects: any[]) => safeSet(STORAGE_KEYS.SUBJECTS, subjects.map(s => ({ ...s, updated_at: s.updated_at ?? stamp() }))),
  getSubjects: (): any[] | null => safeGet(STORAGE_KEYS.SUBJECTS),

  // --- Tasks ---
  saveTasks: (tasks: any[]) => safeSet(STORAGE_KEYS.TASKS, tasks.map(t => ({ ...t, updated_at: t.updated_at ?? stamp() }))),
  getTasks: (): any[] | null => safeGet(STORAGE_KEYS.TASKS),

  // --- Stats ---
  saveStats: (stats: any) => safeSet(STORAGE_KEYS.STATS, stats),
  getStats: (): any | null => safeGet(STORAGE_KEYS.STATS),

  // --- Settings & State ---
  saveTheme: (isDark: boolean) => safeSet(STORAGE_KEYS.THEME, isDark),
  getTheme: (): boolean | null => safeGet(STORAGE_KEYS.THEME),

  saveTimerState: (seconds: number) => safeSet(STORAGE_KEYS.TIMER, seconds),
  getTimerState: (): number | null => safeGet(STORAGE_KEYS.TIMER),

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

  saveSubjectStreaks: (streaks: Record<string, string>) => safeSet(STORAGE_KEYS.SUBJECT_STREAKS, streaks),
  getSubjectStreaks: (): Record<string, string> | null => safeGet(STORAGE_KEYS.SUBJECT_STREAKS),

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

  // --- Custom Timer Durations ---
  saveCustomDurations: (durations: { focus: number; short: number; long: number }) =>
    safeSet(STORAGE_KEYS.CUSTOM_DURATIONS, durations),
  loadCustomDurations: (): { focus: number; short: number; long: number } =>
    safeGet(STORAGE_KEYS.CUSTOM_DURATIONS) ?? { focus: 25, short: 5, long: 15 },

  // --- Flow Mode Adaptive Duration Log ---
  saveFlowLogEntry: (durationMinutes: number) => {
    const log = (safeGet(STORAGE_KEYS.FLOW_LOG) as number[]) ?? [];
    log.push(durationMinutes);
    if (log.length > 20) log.splice(0, log.length - 20);
    safeSet(STORAGE_KEYS.FLOW_LOG, log);
  },
  loadFlowLog: (): number[] => (safeGet(STORAGE_KEYS.FLOW_LOG) as number[]) ?? [],
  clearFlowLog: () => safeSet(STORAGE_KEYS.FLOW_LOG, []),

  // --- Daily Goal ---
  saveDailyGoal: (seconds: number) => safeSet(STORAGE_KEYS.DAILY_GOAL, seconds),
  getDailyGoal: (): number => safeGet(STORAGE_KEYS.DAILY_GOAL) ?? 7200,

  saveTodayFocus: (seconds: number) => safeSet(STORAGE_KEYS.TODAY_FOCUS, seconds),
  getTodayFocus: (): number => safeGet(STORAGE_KEYS.TODAY_FOCUS) ?? 0,
  saveTodayDate: (date: string) => safeSet(STORAGE_KEYS.TODAY_DATE, date),
  getTodayDate: (): string | null => safeGet(STORAGE_KEYS.TODAY_DATE),

  // --- Onboarding ---
  saveOnboardingComplete: (val: boolean) => safeSet(STORAGE_KEYS.ONBOARDING_COMPLETE, val),
  getOnboardingComplete: (): boolean => safeGet(STORAGE_KEYS.ONBOARDING_COMPLETE) ?? false,

  // --- Wallpaper Rotation ---
  saveWallpaperRotationDate: (date: string) => safeSet(STORAGE_KEYS.WALLPAPER_ROTATION_DATE, date),
  getWallpaperRotationDate: (): string | null => safeGet(STORAGE_KEYS.WALLPAPER_ROTATION_DATE),

  // --- Generic (scoped: only removes study_flow_* and sf_game_* keys) ---
  clearAll: () => {
    try {
      const keys = Object.values(STORAGE_KEYS) as string[];
      keys.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error("Storage clear error:", e);
    }
  }
};
