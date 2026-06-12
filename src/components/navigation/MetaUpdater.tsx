import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { ROUTE_META } from '../../lib/metadata';

function ensureMetaTag(attr: string, value: string, content: string) {
  let el = document.querySelector(`[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function MetaUpdater() {
  const { section, mode, activePanel } = useNavigationContext();
  const location = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[location.pathname] || ROUTE_META['/'];

    let title = meta.title;
    let description = meta.description;

    if (mode === 'focus') {
      title = 'Focus Mode — Study Flow';
      description = 'Enter deep work mode with a Pomodoro timer, calming ambience, and focused tools. Minimize distractions and maximize your study sessions.';
    }

    if (activePanel) {
      const panelLabels: Record<string, string> = {
        tasks: 'Tasks',
        ambience: 'Ambience',
        notepad: 'Notes',
        themes: 'Themes',
      };
      const label = panelLabels[activePanel] || activePanel;
      title = `${label} — Study Flow`;
      description = `Manage your ${label.toLowerCase()} within Study Flow's focus workspace.`;
    }

    document.title = title;

    ensureMetaTag('name', 'description', description);
    ensureMetaTag('property', 'og:title', title);
    ensureMetaTag('property', 'og:description', description);
    ensureMetaTag('property', 'og:url', window.location.href);
    ensureMetaTag('property', 'og:type', 'website');
    ensureMetaTag('property', 'og:image', `${window.location.origin}/logo.png`);
    ensureMetaTag('name', 'twitter:card', 'summary_large_image');
    ensureMetaTag('name', 'twitter:title', title);
    ensureMetaTag('name', 'twitter:description', description);
  }, [section, mode, activePanel, location.pathname]);

  return null;
}
