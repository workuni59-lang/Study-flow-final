# StudyFlow

## Goal
Replace default presets (indigo atmosphere, daily focus goal, onboarding tour) and fix "User not found" for real profiles on Supabase.

## Constraints & Preferences
- Build: `npm run build` → succeeds; deploy `dist/`
- Lint: `npm run lint` → `tsc --noEmit`; must pass cleanly
- PWA users may need to close/reopen for new service worker
- Unsplash images must match wallpaper names, landscape, free-tier (Unsplash License)
- Ambient sounds via Howler.js from orangefreesounds.com
- Navigation state derived from URL path via `useNavigationContext()`
- driver.js v1.6.0 API: `driver({ animate, overlayOpacity, stagePadding, overlayClickBehavior, steps })` — uses `overlayOpacity` not `opacity`, `stagePadding` not `padding`, `overlayClickBehavior` not `overlayClickNext`, no `closeBtnText`
- Tour uses `localStorage.getItem('sf_tour_done')` for completion, waits 800ms on mount, `startTour()` exported for manual trigger from Help button popover

## Done
- Root cause: `country` SELECT'd in profile.ts but migration not applied → remove from query
- Default atmosphere: `amber` → `indigo` (free tier, level 1, not premium-gated)
- Daily focus goal: localStorage key `study_flow_daily_goal` (default 7200s), setting UI in SettingsView (9 options 30m–8h), circular SVG progress ring
- Today's focus: `todayFocusSeconds` in StudyContext resets daily, incremented in `completeFocusSession`
- driver.js installed (`npm install driver.js`)
- OnboardingTour rewritten with driver.js — 6 spotlight steps, `id` selectors, 800ms auto-show
- `id` attributes added: `tour-home-tab` (TopBar NavLink), `tour-focus-tab` (TopBar NavLink), `tour-clock-area` (wrapper div), `tour-daily-goal` (ring wrapper), `tour-stats-bar` (stats row), `tour-customize-btn` (Music button)
- Driver.js popover CSS overrides in `src/index.css`
- `startTour()` wired to Help button's popover "Take a tour" entry via `onStartTour` prop on TopBar
- Build & lint pass cleanly
- 3 commits ready: `07bb8f5` (remove country), `bf828a6` (presets overhaul), `b925277` (spotlight tour)

## In Progress
- (none)

## Blocked
- Push blocked (no git credentials in environment) — user must `git push` from their terminal
- Migration `010_add_country_to_profiles.sql` needs to be applied in Supabase SQL Editor after deploy

## Key Decisions
- driver.js instead of custom overlay — handles positioning, scroll, resize, popover natively
- `startTour()` exported as named function; passed to TopBar via `onStartTour` prop from MainLayout/MobileLayout
- Greeting/quote/clock grouped into `#tour-clock-area` wrapper for step 3 targeting
- `closeBtnText` not used — driver.js v1.6.0 Config rejects it; close button shows default X icon
- `allowClose` left as default (true) — users can skip via X or overlay click; `onDestroyed` marks tour complete either way
- `country` removed from SELECT but kept in `PublicProfile` interface — returns `undefined` for real users; UI handles falsy

## Next Steps
1. User runs `git push` from their terminal
2. Apply migration in Supabase SQL Editor: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;`
3. Test onboarding tour on mobile (BottomBar uses different tab selectors than TopBar)

## Critical Context
- SPA at `/app/`, landing at `/`; `_redirects` rewrites to `/app/index.html`
- `BrowserRouter basename="/"` — no `/app` prefix in routes; nginx rewrites via `_redirects`
- driver.js v1.6.0 types are in `dist/driver.js.d.ts`; API: `Driver({ steps: DriveStep[] })` with `element` as CSS selector string
- `completeFocusSession` increments both `totalFocusSeconds` and `todayFocusSeconds`
- `startTour()` creates a new Driver instance on each call (`manualDriver` cached, guards against double-activation via `isActive()`)

## Relevant Files
- `src/lib/profile.ts`: removed `country` from Supabase SELECT — root cause fix
- `src/context/StudyContext.tsx`: default `amber`→`indigo`; added `todayFocusSeconds`, `dailyGoal`, `setDailyGoal`
- `src/services/storage.ts`: added `DAILY_GOAL`, `TODAY_FOCUS`, `TODAY_DATE`, `ONBOARDING_COMPLETE` keys
- `src/components/layout/HomeView.tsx`: SVG daily goal ring, `id` attributes, grouped greeting area
- `src/components/onboarding/OnboardingTour.tsx`: driver.js spotlight tour, `startTour()` export
- `src/components/layout/TopBar.tsx`: `onStartTour` prop, "Take a tour" in help popover, `id` on NavLinks
- `src/components/layout/MainLayout.tsx`: passes `startTour` to TopBar
- `src/components/layout/MobileLayout.tsx`: passes `startTour` to TopBar
- `src/index.css`: driver.js popover style overrides
- `supabase/migrations/010_add_country_to_profiles.sql`: unapplied migration
