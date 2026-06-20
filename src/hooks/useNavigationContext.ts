import { useLocation, useParams } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import type { Mode } from '../components/layout/TopBar';
import type { Section } from '../components/layout/MenuDrawer';

export type Panel = 'tasks' | 'ambience' | 'notepad' | 'themes';
export type AmbienceTab = 'sounds' | 'music' | 'playlists';
export type ThemeTab = 'presets' | 'wallpaper' | 'atm';
export type TimerModeId = 'pomodoro' | 'stopwatch' | 'deep' | 'flow' | 'task-eta';

interface NavigationContext {
  mode: Mode;
  section: Section;
  activePanel: Panel | null;
  ambienceTab: AmbienceTab;
  themeTab: ThemeTab;
  timerId: TimerModeId | null;
  profileId: string | null;
}

export function useNavigationContext(): NavigationContext {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const path = location.pathname;

  let mode: Mode = 'home';
  let section: Section = 'dashboard';
  let activePanel: Panel | null = null;
  let ambienceTab: AmbienceTab = 'sounds';
  let themeTab: ThemeTab = 'atm';
  let timerId: TimerModeId | null = null;
  let profileId: string | null = id || null;

  // Determine Mode
  if (path.startsWith('/focus')) {
    mode = 'focus';
  }

  // Determine Section & Panel
  if (path.startsWith('/analytics')) {
    section = 'analytics';
  } else if (path.startsWith('/progress')) {
    section = 'progression';
  } else if (path.startsWith('/quests')) {
    section = 'quests';
  } else if (path.startsWith('/subjects')) {
    section = 'subjects';
  } else if (path.startsWith('/achievements')) {
    section = 'achievements';
  } else if (path.startsWith('/leaderboard')) {
    section = 'leaderboard';
  } else if (path.startsWith('/settings')) {
    section = 'settings';
  } else if (path.startsWith('/profile')) {
    section = 'profile';
  } else if (path.startsWith('/pomodoro')) {
    section = 'pomodoro';
  } else if (path.includes('/tasks')) {
    section = 'dashboard';
    activePanel = 'tasks';
  } else if (path.includes('/ambience')) {
    section = 'dashboard';
    activePanel = 'ambience';
    if (path.endsWith('/music')) ambienceTab = 'music';
    else if (path.endsWith('/playlists')) ambienceTab = 'playlists';
  } else if (path.includes('/notes')) {
    section = 'dashboard';
    activePanel = 'notepad';
  } else if (path.includes('/themes')) {
    section = 'dashboard';
    activePanel = 'themes';
    if (path.endsWith('/presets')) themeTab = 'presets';
    else if (path.endsWith('/atm')) themeTab = 'atm';
    else if (path.endsWith('/wallpaper') || path.endsWith('/moods') || path.endsWith('/animated') || path.endsWith('/photos') || path.endsWith('/custom')) themeTab = 'wallpaper';
  } else if (path === '/pomodoro') {
    section = 'pomodoro';
    timerId = 'pomodoro';
  } else if (path.includes('/stopwatch')) {
    timerId = 'stopwatch';
  } else if (path.includes('/deep')) {
    timerId = 'deep';
  } else if (path.includes('/flow')) {
    timerId = 'flow';
  } else if (path.includes('/pomodoro')) {
    timerId = 'pomodoro';
  } else if (path === '/focus' || path === '/') {
    section = 'dashboard';
  }

  return { mode, section, activePanel, ambienceTab, themeTab, timerId, profileId };
}
