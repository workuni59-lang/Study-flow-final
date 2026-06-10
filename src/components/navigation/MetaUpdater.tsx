import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationContext } from '../../hooks/useNavigationContext';

const TITLE_MAP: Record<string, string> = {
  dashboard: 'StudyFlow – Gamified Study Dashboard',
  analytics: 'Study Analytics – StudyFlow',
  progression: 'My Progression – StudyFlow',
  quests: 'Daily Quests – StudyFlow',
  subjects: 'My Subjects – StudyFlow',
  achievements: 'Achievements – StudyFlow',
  leaderboard: 'Community Leaderboard – StudyFlow',
  settings: 'Settings – StudyFlow',
  profile: 'User Profile – StudyFlow',
};

export function MetaUpdater() {
  const { section, mode, activePanel } = useNavigationContext();
  const location = useLocation();

  useEffect(() => {
    let title = TITLE_MAP[section] || 'StudyFlow';

    if (section === 'dashboard') {
      if (mode === 'focus') {
        title = 'Focus Mode – StudyFlow';
      }
      if (activePanel) {
        const panelName = activePanel.charAt(0).toUpperCase() + activePanel.slice(1);
        title = `${panelName} – StudyFlow`;
      }
    }

    document.title = title;

    // Update meta description if needed
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      if (section === 'analytics') {
        metaDesc.setAttribute('content', 'Track your study progress and focus time with detailed analytics.');
      } else if (mode === 'focus') {
        metaDesc.setAttribute('content', 'Enter deep work mode with calming ambience and focused tools.');
      } else {
        metaDesc.setAttribute('content', 'A gamified productivity platform for students to focus, track, and level up their studies.');
      }
    }
  }, [section, mode, activePanel, location.pathname]);

  return null;
}
