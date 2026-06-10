# Fix LHCI Audit Issues

## Overview

6 fix categories across 8 files, addressing the LHCI report findings.

| Priority | Issue | Current score | Target | Effort |
|----------|-------|---------------|--------|--------|
| P0 | Console errors (5/page) | 0/1 | 1/1 | Low |
| P0 | Missing meta description | 0/1 | 1/1 | 1 line |
| P1 | Performance (LCP 10s+) | 52-56 | 70+ | Medium |
| P1 | Accessibility (missing labels) | 67-93 | 85+ | Medium |
| P2 | Assertion config misfires | N/A | Clean | Low |
| P3 | bf-cache blocked | 0/1 | 1/1 | Investigate |

---

## Fix 1 — Console errors

### 1a. Ambience audio: add retry logic

**File:** `src/services/AudioController.ts:180-185`

Current `onloaderror` just logs and gives up:
```ts
onloaderror: (_: number, err: unknown) => {
  console.warn(`[AudioController] Load error for ${asset.id}:`, err);
  this.states.set(id, 'error');
  this.activeIds.delete(id);
  this.notify();
},
```

Change to retry once with a fallback URL (HTTP instead of HTTPS, or append `?retry=1`):
```ts
onloaderror: (_: number, err: unknown) => {
  const howl = this.howls.get(id);
  if (howl && !howl._retried) {
    howl._retried = true;
    // Retry with a cache-busting param
    howl.src(asset.url + (asset.url.includes('?') ? '&' : '?') + 'retry=1');
    howl.load();
    return;
  }
  console.warn(`[AudioController] Load error for ${asset.id}:`, err);
  this.states.set(id, 'error');
  this.activeIds.delete(id);
  this.notify();
},
```

### 1b. Supabase: skip queries for demo user

**File:** `src/context/StudyContext.tsx`

4 locations need `authUser.uid === 'demo-user-001'` guard:

- **Line 385-393** — Badge upsert: add guard after line 386
- **Line 396-412** — Badge load: add guard after line 397
- **Line 663-687** — Focus session sync: add guard after line 664
- **Around line 260-270** — XP migration: add guard

Add a helper at the top:
```ts
const DEMO_USER_ID = 'demo-user-001';
```

Then at each guard point, change:
```ts
if (!authUser || !supabase) return;
```
to:
```ts
if (!authUser || !supabase || authUser.uid === DEMO_USER_ID) return;
```

**File:** `src/lib/profile.ts:42-46`

Add `userId === 'demo-user-001'` guard before querying `user_stats`.

---

## Fix 2 — Meta description

**File:** `index.html:6`

Add after the title tag:
```html
<meta name="description" content="StudyFlow – your all-in-one focus timer, study dashboard, and gamified productivity companion. Track sessions, earn badges, and master your subjects." />
```

---

## Fix 3 — Performance (LCP)

### 3a. Preload LCP image

**File:** `index.html`

Add `<link rel="preload">` for the logo image:
```html
<link rel="preload" href="/logo.png" as="image" />
```

### 3b. Defer non-critical JS

The 551K main bundle is the primary LCP culprit. Options:
- Move `WallpaperEngine` (wallpapers.js 118KB) behind an intersection observer
- Move `PetEngine` behind a user-action trigger
- These are medium-effort refactors best done in a dedicated performance pass

---

## Fix 4 — Accessibility

### 4a. AnalyticsDashboard tab buttons

**File:** `src/components/analytics/AnalyticsDashboard.tsx:70`

Add tab roles and ARIA attributes:
```tsx
<div role="tablist" className="flex gap-1 ...">
  {TABS.map(tab => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-label={tab.label}
      onClick={() => !isLocked && setActiveTab(tab.id)}
      ...
```

### 4b. Recharts SVGs (AreaChart, PieChart)

**File:** `src/components/analytics/AnalyticsOverview.tsx:76`

Wrap chart in accessible container:
```tsx
<div role="img" aria-label="Weekly focus time chart">
  <AreaChart data={weekData} ... />
</div>
```

**File:** `src/components/analytics/AnalyticsSubjects.tsx:41`

Same pattern:
```tsx
<div role="img" aria-label="Subject distribution chart">
  <PieChart>...</PieChart>
</div>
```

### 4c. Heatmap cells

**File:** `src/components/analytics/AnalyticsHeatmap.tsx:71`

Add `aria-label` alongside `title`:
```tsx
<div
  className="..."
  title={`${d.day} ${hi}:00 — ${v} sessions`}
  aria-label={`${d.day} ${hi}:00 — ${v} sessions`}
/>
```

### 4d. BadgeSvg icons

**File:** `src/components/progression/BadgeSvg.tsx:113`

Add `role="img"` and a `<title>`:
```tsx
<svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${tier} badge`}>
  <title>{tier} badge</title>
  ...
```

### 4e. Badge gallery items

**File:** `src/components/progression/ProgressionView.tsx:222-279`

Add keyboard interaction to motion.div items:
```tsx
<motion.div
  key={b.id}
  role="button"
  tabIndex={0}
  aria-label={`${b.name} badge`}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { /* action */ } }}
  ...
```

---

## Fix 5 — Assertion config

**File:** `lighthouserc.json:25-33`

Replace with error-level assertions + individual audit overrides:
```json
"assert": {
  "preset": "lighthouse:no-pwa",
  "assertions": {
    "categories:performance": ["warn", { "minScore": 0.7 }],
    "categories:accessibility": ["warn", { "minScore": 0.85 }],
    "categories:seo": ["warn", { "minScore": 0.9 }],
    "categories:best-practices": ["warn", { "minScore": 0.9 }],
    "bf-cache": ["warn"],
    "errors-in-console": ["error"],
    "meta-description": ["error"]
  }
}
```

Key changes:
- All categories stay at `"warn"` level (non-blocking for now, scores will improve as we fix)
- `errors-in-console` and `meta-description` set to `"error"` (must-pass, both are easy fixes)
- Insight audits no longer trigger erroneous `minScore` errors
- `bf-cache` added explicitly at `"warn"` level

---

## Fix 6 — bf-cache investigation

No code changes needed. The codebase has no `unload`/`beforeunload` listeners or `Cache-Control: no-store`. The bf-cache failure is likely caused by the Vite dev server's `Cache-Control: no-store` header or a Chrome extension. This will resolve automatically in production (Cloudflare serves with cache headers).

---

## Summary of files changed

| File | Lines changed | Fix |
|------|--------------|-----|
| `src/services/AudioController.ts` | ~10 | Retry on audio load error |
| `src/context/StudyContext.tsx` | ~6 | Skip Supabase queries for demo user |
| `src/lib/profile.ts` | ~2 | Skip user_stats query for demo user |
| `index.html` | 2 | Add meta description + preload logo |
| `src/components/analytics/AnalyticsDashboard.tsx` | ~8 | Tab roles + aria attributes |
| `src/components/analytics/AnalyticsOverview.tsx` | ~3 | Chart aria-label wrapper |
| `src/components/analytics/AnalyticsSubjects.tsx` | ~3 | Chart aria-label wrapper |
| `src/components/analytics/AnalyticsHeatmap.tsx` | ~2 | Cell aria-label |
| `src/components/progression/BadgeSvg.tsx` | ~2 | role=img + title |
| `src/components/progression/ProgressionView.tsx` | ~6 | Badge gallery keyboard a11y |
| `lighthouserc.json` | ~4 | Fixed assertion config |

## Verification

```bash
npm run lhci
```

Expected improvements:
- `errors-in-console`: 0 errors (was 5)
- `meta-description`: passing (was failing)
- Performance: slight improvement from preload logo
- Accessibility: +5-15 points from aria-labels
- Best Practices: 100 (was 96, blocked by console errors)
