# Gamification Optimization Plan

## Step 1: Remove v1 XP functions from gamification.ts

**File:** `src/lib/gamification.ts`
- Delete lines 396-430 (from `export const XP_PER_TASK = 50` through `getProgressToNextLevel` closing brace)
- Keep the section header `// ─── FORMALIZED XP & LEVELING ────────────────────────────────────`
- Also delete the duplicate `export const XP_PER_TASK = 50;` and `export const XP_PER_FOCUS_MINUTE = 10;` at line ~396 (after ATMOSPHERE_REQUIREMENTS), keeping only the earlier declarations

---

## Step 2: Refactor StudyContext — kill dual XP

**File:** `src/context/StudyContext.tsx`

### 2a. Update import (line 5)
Replace:
```tsx
import { UserStats, Badge, ACHIEVEMENTS, Achievement, Quest, calculateLevel, XP_PER_TASK, XP_PER_FOCUS_MINUTE, AtmosphereId, WallpaperId, PetState, PetFood, PET_FOODS, PET_SPECIES, PET_SKINS, INITIAL_PET_STATE, PET_HUNGER_DECAY_PER_HOUR, PET_WEAK_THRESHOLD, PET_WEAK_DURATION_MS, PET_DORMANT_DURATION_MS, PetHealth, PetEvent, PetEventType, PetMood, PetAnimation, getPetMood, getPetAnimation, GameQuest, SEED_QUESTS, calculateFormalLevel, goldForTask, goldForLevelUp, MAX_HP, HP_REGEN_PER_SESSION, INITIAL_HP, HpState, checkDailyHp as checkHpFn, regenHp, shouldResetQuests, ShopItem, SHOP_ITEMS, XP_TASK_BASE, XP_FOCUS_SESSION, XP_STREAK_BONUS_PER_DAY } from '../lib/gamification';
```
With:
```tsx
import { UserStats, Badge, ACHIEVEMENTS, Achievement, Quest, XP_PER_TASK, XP_PER_FOCUS_MINUTE, AtmosphereId, WallpaperId, PetState, PetFood, PET_FOODS, PET_SPECIES, PET_SKINS, INITIAL_PET_STATE, PET_HUNGER_DECAY_PER_HOUR, PET_WEAK_THRESHOLD, PET_WEAK_DURATION_MS, PET_DORMANT_DURATION_MS, PetHealth, PetEvent, PetEventType, PetMood, PetAnimation, getPetMood, getPetAnimation, GameQuest, SEED_QUESTS, calculateFormalLevel, goldForTask, goldForLevelUp, MAX_HP, HP_REGEN_PER_SESSION, INITIAL_HP, HpState, checkDailyHp as checkHpFn, regenHp, shouldResetQuests, ShopItem, SHOP_ITEMS, XP_STREAK_BONUS_PER_DAY } from '../lib/gamification';
```

### 2b. Remove `addXP` from StudyContextType (line 111)
Delete line `addXP: (amount: number) => void;`

### 2c. Remove `buyShield` and `togglePremium` from StudyContextType (lines 115-116)
Delete:
```tsx
  buyShield: () => void;
  togglePremium: () => void;
```

### 2d. Replace `addXP` function (lines 453-467)
Replace the `addXP` function with a unified `earnXp` function:
```tsx
  const earnXp = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    setUserStats(prev => {
      const newHistory = { ...prev.dailyXPHistory };
      newHistory[today] = (newHistory[today] || 0) + amount;
      return { ...prev, xp: prev.xp + amount, dailyXPHistory: newHistory };
    });
    awardXp(amount);
  };
```

### 2e. Remove `buyShield` function (lines 469-474)
Delete the entire `buyShield` function.

### 2f. Remove `togglePremium` function (lines 476-485)
Delete the entire `togglePremium` function.

### 2g. Update `completeFocusSession` (lines 629-644)
Change from:
```tsx
  const completeFocusSession = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    addXP(minutes * XP_PER_FOCUS_MINUTE);
    awardXp(XP_FOCUS_SESSION);
    ...
```
To:
```tsx
  const completeFocusSession = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    earnXp(minutes * XP_PER_FOCUS_MINUTE);
    ...
```

### 2h. Update `toggleTask` (line 546-547)
Change from:
```tsx
            addXP(XP_PER_TASK);
            awardXp(XP_TASK_BASE);
```
To:
```tsx
            earnXp(XP_PER_TASK);
```

### 2i. Update `updateQuestProgress` (line 413)
Change `addXP(q.xpReward)` → `earnXp(q.xpReward)`

### 2j. Update `updateTopicMastery` (line 615)
Change `addXP(100)` → `earnXp(100)`

### 2k. Update `purchaseSkin` (lines 809-811)
Change:
```tsx
    if (userStats.level < skin.unlockLevel) return false;
    if (skin.isPremium && !userStats.isPremium && skin.price > 0) return false;
    if (userStats.xp < skin.price) return false;
    setUserStats(prev => ({ ...prev, xp: prev.xp - skin.price }));
```
To (uses gameLevel and gameGold):
```tsx
    if (gameLevel < skin.unlockLevel) return false;
    if (skin.isPremium && !userStats.isPremium && skin.price > 0) return false;
    if (gameGold < skin.price) return false;
    setGameGold(prev => prev - skin.price);
```

### 2l. Update `changePetSpecies` (line 786)
Change `userStats.level < species.unlockLevel` → `gameLevel < species.unlockLevel`

### 2m. Update pet unlock effect (line 856)
Change `userStats.level >= s.unlockLevel` → `gameLevel >= s.unlockLevel`
Change dependency `[userStats.level]` → `[gameLevel]`

### 2n. Add migration at init (after line ~246)
Add after the existing useState initializations:
```tsx
  // Migrate v1 XP into v2 pool on first load
  useEffect(() => {
    const savedStats = storage.getUserStats();
    if (savedStats && savedStats.xp > 0 && gameXp === 0) {
      setGameXp(savedStats.xp);
    }
  }, []);
```

### 2o. Update contextValue (lines 877-905)
Remove `addXP`, `buyShield`, `togglePremium` from the useMemo dependency array and value object.
Add `earnXp` to the context type and value.

### 2p. Use `gameLevel` instead of `userStats.level` for level-up detection
No change needed in context — we'll handle this in MainLayout/MobileLayout in Step 3.

---

## Step 3: Fix double session logging in StudyTimer

**File:** `src/components/dashboard/StudyTimer.tsx`

### 3a. Add a ref to track total focus time across pause/resume
After `const sessionElapsed = useRef(0);` (line 155), add:
```tsx
  const totalFocusRef = useRef(0);
```

### 3b. Accumulate total in the timer interval
In the timer interval (around line 232-236), change:
```tsx
      if (modeRef.current === 'focus') {
        sessionElapsed.current += 1;
        if (sessionElapsed.current >= 60) {
          completeFocusSession(60);
          sessionElapsed.current = 0;
        }
      }
```
To:
```tsx
      if (modeRef.current === 'focus') {
        sessionElapsed.current += 1;
        totalFocusRef.current += 1;
        if (sessionElapsed.current >= 60) {
          completeFocusSession(60);
          sessionElapsed.current = 0;
        }
      }
```

### 3c. Remove `logFocusSession` from pause branch
In `toggleTimer` (lines 301-308), change:
```tsx
    if (!nextState && (mode === 'focus' || mode === 'taskETA')) {
      if (sessionElapsed.current > 0) {
        completeFocusSession(sessionElapsed.current);
        sessionElapsed.current = 0;
      }
      const elapsed = totalTime - timeLeft;
      logFocusSession(elapsed);
    }
```
To:
```tsx
    if (!nextState && (mode === 'focus' || mode === 'taskETA')) {
      if (sessionElapsed.current > 0) {
        completeFocusSession(sessionElapsed.current);
        sessionElapsed.current = 0;
      }
    }
```

### 3d. Log accurate total on completion
In `handleTimerComplete` (line 273), change:
```tsx
    if (mode === 'focus' || mode === 'taskETA') logFocusSession(totalTime);
```
To:
```tsx
    if (mode === 'focus' || mode === 'taskETA') {
      logFocusSession(totalFocusRef.current);
      totalFocusRef.current = 0;
    }
```

### 3e. Change `userStats.level` to `gameLevel` (line 313)
In the `handleCustomizationClick` function:
```tsx
    if (userStats.level < levelReq) return;
```
Change to:
```tsx
    if (gameLevel < levelReq) return;
```
And add `gameLevel` from the useStudy destructure at line ~101.

---

## Step 4: Fix level-up modal to use v2

### 4a. MainLayout.tsx
Replace lines 62-67:
```tsx
  const [prevLevel, setPrevLevel] = useState(userStats.level);
  useEffect(() => {
    if (userStats.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(userStats.level);
    }
  }, [userStats.level, prevLevel]);
```
With:
```tsx
  useEffect(() => {
    if (levelUpEvent) {
      setShowLevelUp(true);
    }
  }, [levelUpEvent]);
```

Change line 229:
```tsx
      <LevelUpModal level={userStats.level} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
```
To:
```tsx
      <LevelUpModal level={levelUpEvent ?? gameLevel} isOpen={showLevelUp} onClose={() => { setShowLevelUp(false); dismissLevelUp(); }} />
```

Add `levelUpEvent`, `gameLevel`, `dismissLevelUp` to the useStudy destructure.

### 4b. MobileLayout.tsx
Same changes as MainLayout.

---

## Step 5: Prune sessionHistory

**File:** `src/context/StudyContext.tsx`

In `logSession` (lines 646-651), change:
```tsx
  const logSession = (record: import('../lib/gamification').SessionRecord) => {
    setUserStats(prev => ({
      ...prev,
      sessionHistory: [...prev.sessionHistory, record],
    }));
  };
```
To:
```tsx
  const logSession = (record: import('../lib/gamification').SessionRecord) => {
    setUserStats(prev => {
      const updated = [...prev.sessionHistory, record].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      return {
        ...prev,
        sessionHistory: updated.filter(s => new Date(s.date) >= cutoff).slice(0, 500),
      };
    });
  };
```

---

## Step 6: Compute Weekly Velocity

**File:** `src/components/achievements/ActivityHeatmap.tsx`

### 6a. Compute weekly XP
After the `heatmapData` useMemo (line ~26), add:
```tsx
  const weeklyXp = useMemo(() => {
    const today = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      total += userStats.dailyXPHistory[dateStr] || 0;
    }
    return total;
  }, [userStats.dailyXPHistory]);
```

### 6b. Replace hardcoded values
Change line 85 from:
```tsx
               <p className="text-sm font-bold dark:text-white">+1,240 XP</p>
```
To:
```tsx
               <p className="text-sm font-bold dark:text-white">+{weeklyXp.toLocaleString()} XP</p>
```

Also compute Flow Streak and Peak Hour from real data if desired.

---

## Step 7: Update PetPanel

**File:** `src/components/dashboard/PetPanel.tsx`

Lines 232-233:
Change:
```tsx
                   const meetsLevel = userStats.level >= skin.unlockLevel;
                   const canAfford = userStats.xp >= skin.price;
```
To:
```tsx
                   const meetsLevel = gameLevel >= skin.unlockLevel;
                   const canAfford = gameGold >= skin.price;
```

Add `gameLevel` and `gameGold` to the useStudy destructure.

---

## Step 8: Update DevMenu

**File:** `src/components/dashboard/DevMenu.tsx`

Remove `togglePremium` and `addXP` from useStudy destructure (line 9).
Replace `simulateLevelUp` to use the new XP system:
```tsx
  const simulateLevelUp = () => {
    earnXp(10000);
    triggerConfetti();
  };
```
Add `earnXp` or `awardXp` to the useStudy destructure.
The togglePremium button (lines 136-145) can stay but needs `togglePremium` removed from context — replace with direct setter or remove button.

---

## Step 9: Verify

Run `npx tsc --noEmit` to check for type errors and fix any remaining references.
