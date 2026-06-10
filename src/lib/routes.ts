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
  // Side Panels (Nested/Context-aware)
  TASKS: '/tasks',
  FOCUS_TASKS: '/focus/tasks',
  AMBIENCE: '/ambience',
  FOCUS_AMBIENCE: '/focus/ambience',
  NOTEPAD: '/notes',
  FOCUS_NOTEPAD: '/focus/notes',
} as const;

export type RoutePath = typeof ROUTES[keyof Omit<typeof ROUTES, 'PROFILE'>] | string;
