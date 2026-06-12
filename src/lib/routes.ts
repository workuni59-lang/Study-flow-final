export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  FOCUS: '/focus',
  ANALYTICS: '/analytics',
  PROGRESSION: '/progress',
  QUESTS: '/quests',
  SUBJECTS: '/subjects',
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  PROFILE: (id: string) => `/profile/${id}`,
  POMODORO: '/pomodoro',
  
  // Timer Modes
  FOCUS_POMODORO: '/focus/pomodoro',
  FOCUS_STOPWATCH: '/focus/stopwatch',
  FOCUS_DEEP: '/focus/deep',
  FOCUS_FLOW: '/focus/flow',
  
  // Side Panels (Nested/Context-aware)
  TASKS: '/tasks',
  FOCUS_TASKS: '/focus/tasks',
  
  AMBIENCE: '/ambience',
  AMBIENCE_SOUNDS: '/ambience/sounds',
  AMBIENCE_MUSIC: '/ambience/music',
  AMBIENCE_PLAYLISTS: '/ambience/playlists',
  
  FOCUS_AMBIENCE: '/focus/ambience',
  FOCUS_AMBIENCE_SOUNDS: '/focus/ambience/sounds',
  FOCUS_AMBIENCE_MUSIC: '/focus/ambience/music',
  FOCUS_AMBIENCE_PLAYLISTS: '/focus/ambience/playlists',
  
  NOTEPAD: '/notes',
  FOCUS_NOTEPAD: '/focus/notes',

  // Themes
  THEMES: '/themes',
  FOCUS_THEMES: '/focus/themes',
  FOCUS_THEMES_TAB: (tab: string) => `/focus/themes/${tab}`,
} as const;

export type RoutePath = typeof ROUTES[keyof Omit<typeof ROUTES, 'PROFILE' | 'FOCUS_THEMES_TAB'>] | string;
