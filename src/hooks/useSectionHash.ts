import { useState, useEffect, useCallback } from 'react';
import type { Section } from '../components/layout/MenuDrawer';

const HASH_MAP: Record<string, Section> = {
  '': 'dashboard',
  'dashboard': 'dashboard',
  'analytics': 'analytics',
  'quests': 'quests',
  'subjects': 'subjects',
  'achievements': 'achievements',
  'settings': 'settings',
  'progression': 'progression',
  'leaderboard': 'leaderboard',
  'profile': 'profile',
};

function parseHash(hash: string): Section {
  const key = hash.replace(/^#/, '').split('/')[0];
  return HASH_MAP[key] ?? 'dashboard';
}

function sectionToHash(s: Section): string {
  return s === 'dashboard' ? '' : s;
}

export function useSectionHash(): [Section, (s: Section) => void] {
  const [section, setSection] = useState<Section>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setSection(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const updateSection = useCallback((s: Section) => {
    setSection(s);
    const hash = sectionToHash(s);
    const current = window.location.hash.replace(/^#/, '');
    if (current !== hash) {
      window.history.pushState(null, '', `#${hash}`);
    }
  }, []);

  return [section, updateSection];
}
