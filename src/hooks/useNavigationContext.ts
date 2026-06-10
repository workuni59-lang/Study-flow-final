import { useLocation, useParams } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import type { Mode } from '../components/layout/TopBar';
import type { Section } from '../components/layout/MenuDrawer';

export type Panel = 'tasks' | 'ambience' | 'notepad';
export type AmbienceTab = 'sounds' | 'music' | 'playlists';

interface NavigationContext {
  mode: Mode;
  section: Section;
  activePanel: Panel | null;
  ambienceTab: AmbienceTab;
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
  } else if (path === '/focus' || path === '/') {
    section = 'dashboard';
  }

  return { mode, section, activePanel, ambienceTab, profileId };
}
