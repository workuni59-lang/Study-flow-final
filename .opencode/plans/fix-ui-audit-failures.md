# Fix UI Audit Test Failures

## Problem

Five tests fail because:
1. `?demo=1` never sets `user` — profile button never renders (a17)
2. Profile button uses `title` instead of `aria-label` — `getByRole` can't find it (a17)
3. Default mode is `'focus'` — all screenshots show the timer (a00-a08, a10-a14)
4. Mobile FocusEnvironment missing `onQuestsOpen` — quests dock button filtered out

---

## Fix A — Auto-set `DEMO_USER` on page load with `?demo=1`

**File:** `src/context/AuthContext.tsx:80-82`

Current:
```tsx
  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }
```

Change to:
```tsx
  useEffect(() => {
    if (isDemo) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
```

This makes `?demo=1` auto-authenticate as `DEMO_USER` on page load, matching the existing behavior of `signIn()`, `signUp()`, and `signInWithGoogle()` in demo mode.

---

## Fix B — Add `aria-label` to profile button

**File:** `src/components/layout/TopBar.tsx:115`

Current:
```tsx
<button onClick={onProfileOpen} title="View your profile"
```

Change to:
```tsx
<button onClick={onProfileOpen} title="View your profile" aria-label="View your profile"
```

The `title` attribute is never used as the accessible name when text content exists (`user.displayName?.charAt(0) || '?'`). Adding `aria-label` makes `getByRole('button', { name: 'View your profile' })` match.

---

## Fix C — Default mode to `'home'`

**File 1:** `src/components/layout/MainLayout.tsx:51`

Current:
```tsx
const [mode, setMode] = useState<Mode>('focus');
```

Change to:
```tsx
const [mode, setMode] = useState<Mode>('home');
```

**File 2:** `src/components/layout/MobileLayout.tsx:48`

Current:
```tsx
const [mode, setMode] = useState<Mode>('focus');
```

Change to:
```tsx
const [mode, setMode] = useState<Mode>('home');
```

This ensures the app shows the dashboard/HomeView on initial load, not the focus timer. Users see the greeting/clock/stats first; they click "Focus" to enter timer mode.

---

## Fix E — Wire `onQuestsOpen` in MobileLayout

**File:** `src/components/layout/MobileLayout.tsx:177-181`

Current:
```tsx
<FocusEnvironmentLazy
  onTasksOpen={() => setPanelOpen('tasks')}
  onMusicOpen={() => setPanelOpen('ambience')}
  onNotepadOpen={() => setIsNotesOpen(true)}
/>
```

Change to:
```tsx
<FocusEnvironmentLazy
  onTasksOpen={() => setPanelOpen('tasks')}
  onMusicOpen={() => setPanelOpen('ambience')}
  onNotepadOpen={() => setIsNotesOpen(true)}
  onQuestsOpen={() => setSection('quests')}
/>
```

This matches what MainLayout already does (mainlayout.tsx:167). Without it, `utilityItems.filter(i => i.handler)` removes the Quests dock button on mobile because `onQuestsOpen` is `undefined`.

---

## Verification

After all four edits:
```bash
npx vite build 2>&1 | tail -5               # build must pass
npx playwright test --list                   # all 50 tests parse
npm run ui-audit                             # run audit, verify passes
```

Expected outcomes:
| Test | Before | After |
|------|--------|-------|
| a00 Dashboard | shows Focus timer | shows HomeView dashboard |
| a06 Tasks | timeout / wrong screenshot | dock button visible, panel opens |
| a07 Ambience | timeout / wrong screenshot | dock button visible, panel opens |
| a08 Notes | timeout / wrong screenshot | dock button visible, panel opens |
| a11 Quests | 22s timeout | nav menu clickable, section renders |
| a17 Profile | 31s timeout (button not found) | avatar button visible, profile section renders |
| all others | mixed | stable |
