import { ROUTES } from './routes';

export interface RouteMeta {
  title: string;
  description: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  [ROUTES.HOME]: {
    title: 'StudyFlow — Free Focus Timer, Ambient Sounds & Study Dashboard',
    description:
      'A beautiful study dashboard with a focus timer, ambient sounds, and immersive wallpapers. No sign up needed — just open it and start focusing.',
    changefreq: 'weekly',
    priority: 1.0,
  },
  '/studyflow-focus-timer/': {
    title: 'StudyFlow Focus Timer — Free Focus Timer with Wallpapers & Ambient Sounds',
    description:
      'StudyFlow is a free focus timer with beautiful wallpapers, ambient soundscapes, and gamified progress tracking. Not an AI study tool — a real focus environment.',
    changefreq: 'weekly',
    priority: 0.9,
  },
};
