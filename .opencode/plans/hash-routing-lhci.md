# Hash Routing + Lighthouse CI

## Goal
Replace Playwright UI audit with URL-based routing (`#analytics`, `#quests`, etc.) + Lighthouse CI for comprehensive Perf/A11y/SEO audits without fragile selector tests.

---

## Step 1 — Create `src/hooks/useSectionHash.ts`

Custom hook that syncs `section` state with `window.location.hash`.

```typescript
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

  // Listen for back/forward navigation
  useEffect(() => {
    const onHashChange = () => setSection(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update URL when section changes
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
```

**Place in:** `src/hooks/useSectionHash.ts`

---

## Step 2 — Integrate into `MainLayout.tsx`

**Line 52 — Replace state declaration:**
```tsx
// Before:
const [section, setSection] = useState<Section>('dashboard');

// After:
const [section, setSection] = useSectionHash();
```

That's **one line changed.** All existing `setSection(...)` calls automatically update the URL hash. Back/forward browser buttons work. No other code changes needed.

---

## Step 3 — Integrate into `MobileLayout.tsx`

**Line 49 — Same one-line change:**
```tsx
// Before:
const [section, setSection] = useState<Section>('dashboard');

// After:
const [section, setSection] = useSectionHash();
```

---

## Step 4 — Handle `#focus` for timer mode

Add at the top of both layouts, next to the section hook:

**MainLayout.tsx (after line 51):**
```tsx
useEffect(() => {
  if (window.location.hash === '#focus') setMode('focus');
}, []);
```

**MobileLayout.tsx (after line 48):**
```tsx
useEffect(() => {
  if (window.location.hash === '#focus') setMode('focus');
}, []);
```

This makes `?demo=1#focus` load the app in focus mode so Lighthouse can audit the timer UI.

---

## Step 5 — Install Lighthouse CI

```bash
npm i -D @lhci/cli
```

---

## Step 6 — Configure `lighthouserc.json`

Create in project root:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npx vite --port 3000 --host=0.0.0.0",
      "startServerReadyPattern": "Local:",
      "url": [
        "http://localhost:3000/?demo=1",
        "http://localhost:3000/?demo=1#focus",
        "http://localhost:3000/?demo=1#analytics",
        "http://localhost:3000/?demo=1#quests",
        "http://localhost:3000/?demo=1#subjects",
        "http://localhost:3000/?demo=1#achievements",
        "http://localhost:3000/?demo=1#settings",
        "http://localhost:3000/?demo=1#progression",
        "http://localhost:3000/?demo=1#leaderboard",
        "http://localhost:3000/?demo=1#profile"
      ],
      "numberOfRuns": 1,
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance", "accessibility", "best-practices", "seo"]
      }
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.7}],
        "categories:accessibility": ["warn", {"minScore": 0.85}],
        "categories:seo": ["warn", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "filesystem",
      "outputDir": "./lhci-reports"
    }
  }
}
```

---

## Step 7 — Add npm scripts

**package.json scripts block:**
```json
"scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "npm run build && wrangler dev",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit",
    "server": "tsx server/index.ts",
    "deploy": "npm run build && wrangler deploy",
    "ui-audit": "playwright test ui-audit/ui-audit.spec.ts",
    "lhci": "lhci autorun"
}
```

---

## What This Unlocks

| URL | Audits |
|-----|--------|
| `?demo=1` | Dashboard (HomeView) — greeting, stats, pet |
| `?demo=1#focus` | FocusEnvironment — timer, dock buttons, ambience |
| `?demo=1#analytics` | Analytics section (lazy-loaded) |
| `?demo=1#quests` | Quests section |
| `?demo=1#subjects` | Subjects section |
| `?demo=1#achievements` | Achievements section |
| `?demo=1#settings` | Settings section |
| `?demo=1#progression` | Progression section |
| `?demo=1#leaderboard` | Leaderboard section |
| `?demo=1#profile` | Profile section (auto-sets profileUserId to DEMO_USER) |

Each URL gives Lighthouse a full Perf/A11y/SEO/Best-Practices report **without any Playwright selector code.**

---

## Order of Implementation

1. Create `useSectionHash.ts` hook
2. Edit `MainLayout.tsx` — 1 line changed + mount effect for `#focus`
3. Edit `MobileLayout.tsx` — 1 line changed + mount effect for `#focus`
4. `npm i -D @lhci/cli`
5. Create `lighthouserc.json`
6. Add `"lhci": "lhci autorun"` to package.json scripts
7. Build + verify (`npx vite build`)
8. Run: `npx lhci autorun` → reports in `./lhci-reports/`
9. (Optional) Remove `ui-audit/` Playwright spec and config if no longer needed

---

## Files Changed

| File | Type | Lines changed |
|------|------|--------------|
| `src/hooks/useSectionHash.ts` | **New** | ~35 |
| `src/components/layout/MainLayout.tsx` | Edit | 2 |
| `src/components/layout/MobileLayout.tsx` | Edit | 2 |
| `lighthouserc.json` | **New** | ~40 |
| `package.json` | Edit | 2 |
