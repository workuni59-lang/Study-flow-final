# Pet System v2 — Full Specification

> **Status:** Draft v1  
> **Goal:** Replace the existing (dead-code) pet system with a polished, performant, emotionally engaging companion that drives daily retention and premium conversion.  
> **Philosophy:** The pet is a mirror of the user's study habits — not a Tamagotchi that demands attention, but a quiet companion that thrives when the user studies and gently fades when they don't.

---

## Table of Contents

1. [References & Inspiration](#1-references--inspiration)
2. [Design Principles](#2-design-principles)
3. [Performance Budget](#3-performance-budget)
4. [Pet Characters & Skins](#4-pet-characters--skins)
5. [Emotional State System](#5-emotional-state-system)
6. [Hunger & Food System](#6-hunger--food-system)
7. [Interaction System](#7-interaction-system)
8. [Touch & Gesture Response](#8-touch--gesture-response)
9. [Animation System](#9-animation-system)
10. [UI Components](#10-ui-components)
11. [State Machine](#11-state-machine)
12. [Reward Feedback Loop](#12-reward-feedback-loop)
13. [Mobile Strategy](#13-mobile-strategy)
14. [Data Model](#14-data-model)
15. [File Structure](#15-file-structure)
16. [Implementation Phases](#16-implementation-phases)
17. [Testing & Debugging](#17-testing--debugging)

---

## 1. References & Inspiration

### Finch (Self-Care Pet)
- **Core loop:** User completes goals → pet grows, explores, returns with items/gems
- **Why it works:** The pet's *exploration* during user absence creates anticipation. You check the app to see "where your pet went."
- **What to steal:** The "pet goes on adventures while you're away" mechanic — checks in after absences with a journal entry
- **What to avoid:** The extremely slow progression curve (months to fully grow)

### Forest (Focus Timer)
- **Core loop:** Start focus timer → tree grows → if you leave the app, tree dies
- **Why it works:** Real stakes — losing a tree *hurts*. The forest visualizes cumulative focus time beautifully.
- **What to steal:** The "leave the app during focus = pet gets distracted/sad" mechanic
- **What to avoid:** The punitive tone (dead trees feel bad, not motivating)

### Duolingo (Language Learning)
- **Core loop:** Complete lessons → earn XP → keep streak → Duo reacts
- **Why it works:** Duo's expressive animations (happy when you practice, sad when you ignore) create emotional attachment. The streak is the real driver.
- **What to steal:** The expressive, reactive face — simple but varied emotional states
- **What to avoid:** The aggressive guilt-tripping notifications

### Pokémon Sleep (Sleep Tracking)
- **Core loop:** Track sleep → attract Pokémon → build relationships
- **Why it works:** Collecting and bonding with multiple creatures creates variety. The "research" angle justifies the mechanic.
- **What to steal:** The "multiple helpers" concept — different pets have different passive bonuses
- **What to avoid:** The gacha-style monetization

### Key Takeaways
1. The pet should *react* to user actions, not just exist
2. Anticipation — something happens while the user is away
3. Gradual attachment — the pet becomes more expressive/featured over time
4. Real stakes = real engagement (but keep them positive)

---

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **Calm, not needy** | The pet never demands attention. It reacts to what the user does. No "I'm hungry!" popups. |
| **Subtle by default** | 120px max, bottom corner, semi-transparent idle state. Scales up on interaction. |
| **Performance-first** | Every animation must have a reduced-motion path. Must run at 60fps on a Moto G4. |
| **Emotion = data** | Pet state is 100% derived from user activity. No random decay mechanics. |
| **Progressive attachment** | New users get a simple static companion. Over days/weeks, more animations, expressions, and interactions unlock. |
| **Touch-native** | Built for tap, drag, long-press, swipe. Mouse support is a graceful fallback. |
| **Premium as unlock, not paywall** | Free users get one complete, satisfying pet. Premium unlocks variety (skins, species, bonuses). |

---

## 3. Performance Budget

### Target Devices

| Tier | Example | Target | Constraints |
|------|---------|--------|-------------|
| Low | Moto G4 / iPhone SE | 30fps stable | ≤2 DOM elements animating, no canvas, no blur, no parallax |
| Mid | Pixel 5 / iPhone 12 | 60fps | ≤5 DOM elements, optional blur, simple parallax |
| High | Pixel 8 / iPhone 15 Pro | 60fps | All features, particle systems, parallax, glow effects |

### Detection Strategy
```typescript
type PetPerformanceTier = 'low' | 'mid' | 'high';

function getPetPerformanceTier(): PetPerformanceTier {
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as any).deviceMemory;
  if (cores <= 4 || (memory && memory <= 4)) return 'low';
  if (cores <= 6 || (memory && memory <= 6)) return 'mid';
  return 'high';
}
```

### Per-Tier Feature Matrix

| Feature | Low | Mid | High |
|---------|-----|-----|------|
| SVG render | ✓ | ✓ | ✓ |
| Frame-based idle anim | Every 8s | Every 4s | Continuous |
| Blink | ✓ | ✓ | ✓ |
| Eye tracking (pointer) | ✗ | ✓ (sampled) | ✓ (smooth) |
| Drag physics | ✗ (tap-to-reposition) | ✓ (spring, no squash) | ✓ (full spring + squash) |
| Particles | ✗ | 3 max, flat | 10 max, depth |
| Glow aura | ✗ | CSS box-shadow | Radial gradient |
| Shadow | ✗ | Static | Dynamic |
| Background idle life | ✗ | 3 actions | 12 actions |
| Feed animation | 1-frame jump | 3-frame sequence | 6-frame sequence |

### Bundle Size Target
- Core pet components (engine + state + UI): ≤25 KB gzipped
- Pet species data (all skins + configs): ≤15 KB gzipped
- Animation keyframes (CSS-in-JS): ≤5 KB gzipped

---

## 4. Pet Characters & Skins

### Species Design Guidelines

Each species must have:
1. **Silhouette** — Recognizable at 120px
2. **Flavor** — One-sentence concept linking it to study theme
3. **Mood expressions** — At least 3 distinct face states (happy, neutral, sad/asleep)
4. **Idle motion** — One subtle looping transform (float, bob, sway, pulse)
5. **Color palette** — 4 hex colors: body, accent, eyes, glow

### Recommended Characters

| Species | Vibe | Idle Motion | Passive Bonus | Premium? |
|---------|------|-------------|---------------|----------|
| **Ember** | Warm, steady | Gentle floating + ember particles | +5% focus session XP | Free |
| **Lumina** | Curious, playful | Soft bounce, occasional head tilt | +2% task completion gold | Premium |
| **Nimbus** | Sleepy, calm | Slow sway like drifting cloud | +5 min default focus duration | Premium |
| **Pixie** | Energetic, sparkly | Quick float + periodic twinkle | +10% streak bonus XP | Premium |

### Skin Design (was: "color palettes")

Skins must change more than just color. Each skin should alter:

```typescript
interface PetSkin {
  id: string;
  name: string;
  speciesId: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  // What changes:
  silhouette?: string;        // SVG path override — changes SHAPE, not just color
  colors: {                   // Still supports color changes
    body: string;
    accent: string;
    eyes: string;
    glow: string;
  };
  accessory?: string;         // SVG overlay — hat, glasses, bow, scarf, crown
  ambientParticles?: string[]; // Particle types emitted during idle
  
  unlock: {
    type: 'default' | 'level' | 'gold' | 'premium' | 'achievement';
    value?: number;           // Level number, gold cost, achievement ID
  };
}
```

**Examples of meaningful skins:**

| Skin | Species | Changes | Unlock |
|------|---------|---------|--------|
| Scholar's Cap | Ember | Adds tiny graduation cap accessory | Level 5 |
| Starry Night | Ember | Body becomes deep blue with star particles, horn glows gold | 500 gold |
| Forest Nymph | Pixie | Silhouette gains leaf-shaped wings, green/gold palette | Achievement: "100 tasks" |
| Firecracker | Ember | Silhouette sharpens, red/orange palette, spark particles | Premium |
| Snowdrift | Nimbus | Body becomes angular ice-crystal shape, blue/white palette | Level 10 |
| Magician's Familiar | Lumina | Adds tiny cape + hat silhouette overlay | Premium |

### Skin Inventory

Each skin should feel like a *meaningful unlock*, not a palette swap. Rule of thumb: if a skin doesn't change the silhouette OR add a particle effect, it doesn't deserve a rarity above "common."

---

## 5. Emotional State System

The pet's emotional state is **100% derived** from user activity data. No random walk, no hidden decay.

### States

```typescript
type PetMood = 'excited' | 'happy' | 'neutral' | 'tired' | 'asleep';
```

| Mood | Trigger | Duration | Visual |
|------|---------|----------|--------|
| **Excited** | User just completed a focus session OR task OR leveled up | 8 seconds | Big eyes, bounce animation, sparkle particles, glow intensifies |
| **Happy** | User has completed ≥1 task today OR ≥1 focus session today | Until end of day | Normal state, soft glow, regular blink |
| **Neutral** | User has opened the app today but done nothing | Until next action | Reduced glow, less frequent idle animations |
| **Tired** | User hasn't opened the app in ≥24 hours | Until next session/task completion | Half-closed eyes, slower idle, no glow |
| **Asleep** | User hasn't opened the app in ≥72 hours | Until next session/task completion | Eyes closed, Zzz particles, dimmed, curled up posture |

### Mood Transitions

```
User completes task/session → excited (8s) → happy
User does nothing for 24h  → tired
User does nothing for 72h  → asleep
User returns after absence → happy (immediately on first action)
User misses streak day    → sad (5s) then tired
User levels up            → excited (15s) then happy
User opens app after 7+ days → "missed you" sequence (15s) then neutral
```

The "missed you" sequence is optional for Phase 1 but recommended for emotional impact.

---

## 6. Hunger & Food System

Compared to v1, this system is **simplified and meaningful**.

### Food Types

```typescript
interface PetFood {
  id: string;
  name: string;
  icon: string;           // SVG path or emoji
  hungerValue: number;    // 5-60
  source: 'task' | 'focus' | 'streak' | 'achievement';
  sourceCount: number;    // 1 task = 1 star snack, or 30 min focus = 1 bar
  rarity: 'common' | 'rare' | 'epic';
}
```

| Food | Value | How to Earn | Uses |
|------|-------|-------------|------|
| Star Snack | 15 | Complete 1 task | Common. Everyday food. |
| Focus Bar | 25 | Complete 30 min of focus | Common. Rewards longer sessions. |
| Streak Treat | 20 | Maintain 3+ day streak | Rare. Streak motivation. |
| Mastery Meal | 40 | Master a topic (Green) | Rare. Topic mastery reward. |
| Time Gem | 60 | Complete 2+ hours of focus in a day | Epic. Major session reward. |
| Achievement Cookie | 50 | Unlock any achievement | Epic. One-time per achievement. |

### Hunger Logic (Simplified)

```typescript
// No hourly decay. The pet does NOT get hungry over time.
// Instead, hunger is always at 100 when the user is active.

// Hunger only matters for ASLEEP state:
// - If user is gone 72h+ AND hunger was < 30 when they last fed, 
//   pet enters "deep sleep" with a 2h recovery period.
// - Recovery: complete 1 task = restore to happy immediately.
```

**Why this approach:**
- Hourly decay punished users with lives outside the app
- It created anxiety, not motivation
- It caused battery drain (need to run interval on every app open)
- The pet represents *study health*, not a biological organism

### Feeding UX

1. Pet panel shows food inventory with quantities
2. Tap a food → drag toward pet OR tap "feed" button
3. Pet reacts (notice → approach → eat → react → back to idle) — 1.5s total
4. Hunger bar fills, mood improves if tired/asleep
5. No "feed or die" mechanics — feeding is optional and rewarding

---

## 7. Interaction System

### Available Interactions

| Gesture | Effect | Anim Duration |
|---------|--------|---------------|
| Single tap | Pet looks at cursor, happy reaction (sparkle/bounce) | 600ms |
| Double-tap | Pet does a special trick (species-specific) | 1000ms |
| Drag | Pet follows with spring physics, squash/stretch | Continuous |
| Long-press (2s) | Pet snuggles/nuzzles cursor, heart particles | 1500ms |
| Swipe away | Pet slides, then bounces back playfully | 800ms |
| Ignore (no interaction for 60s after open) | Pet does a "hey I'm here" idle (stretch, yawn, look around) | 1000ms |

### Interaction Debouncing
- After any interaction, ignore subsequent taps for 200ms (prevents accidental double-tap)
- Long-press cancels on move >10px (becomes drag)
- Swipe requires velocity > 0.3 and distance > 50px

---

## 8. Touch & Gesture Response

### Pointer Event Strategy

Use native `PointerEvent` API (unified mouse + touch + pen). Fall back to `MouseEvent` + `TouchEvent` for older browsers.

```typescript
// Event flow:
// pointerdown → track start position, timestamp
// pointermove → if moved > threshold, transition to drag mode
// pointerup → check velocity + distance → was it a tap, drag, or swipe?
//   - Distance < 10px, duration < 300ms = TAP
//   - Distance > 50px, velocity > 0.3 = SWIPE
//   - Duration > 800ms, distance < 10px = LONG PRESS
//   - Otherwise = DRAG
```

### Touch Priority

On mobile, the pet must not interfere with scrolling:
- `touch-action: none` applied to pet element only (not body)
- Drag threshold of 10px before engaging pet physics (below threshold = pass through to scroll)
- When pet is in **asleep** state, all gestures pass through (no interaction)

### Haptic Feedback
- Tap: light impact (`navigator.vibrate(10)`)
- Feed: medium impact (`navigator.vibrate([10, 50, 10])`)
- Level up: celebration (`navigator.vibrate([50, 100, 50, 100, 50])`)
- Skip on low-battery or `prefers-reduced-motion`

---

## 9. Animation System

### Architecture

```
Layer 0: Shadow (CSS: static box-shadow or dynamic)
Layer 1: Glow aura (CSS: radial gradient, opacity linked to mood)
Layer 2: Body SVG (React component, species-specific)
Layer 3: Eyes SVG (animated: blink, pupil position, expression)
Layer 4: Accessory SVG (optional, skin-dependent)
Layer 5: Particle layer (optional, performance-gated)
Layer 6: Zzz / emotion indicator (fading, only when asleep/excited)
```

### Animation Primitives

```typescript
type AnimationPrimitive = 
  | 'float'          // y: sin(time) * amplitude
  | 'bounce'         // scaleY: compress then expand on landing
  | 'sway'           // rotate: sin(time) * degrees
  | 'pulse'          // scale: pulse to 1.05 then back
  | 'blink'          // scaleY(eyes): 1 → 0.1 → 1
  | 'spin'           // rotate: 0 → 360
  | 'stretch'        // scaleY: 1 → 1.3 → 1 (yawn/stretch)
  | 'look'           // translateX(eyes): move pupils
  | 'squash'         // scaleY: 0.8, scaleX: 1.2 (drag feedback)
  | 'shake'          // translateX: rapid oscillation
  | 'curious'        // rotate: -15 → 15 (head tilt)
  | 'celebrate'      // scale: 1 → 1.2, then multiple bounces
  | 'sleep'          // opacity: pulse 0.6→1, slow float down
```

### Animation Compositions

```typescript
interface AnimationSequence {
  name: string;
  primitives: { type: AnimationPrimitive; duration: number; delay?: number }[];
  frameCount?: number;     // For sprite-sheet alternatives
  reducedMotion?: {        // Alternative for reduced-motion users
    type: 'static-frame' | 'css-transition' | 'opacity-pulse';
    value?: string | number;
  };
}
```

### Performance Strategy

- All transforms use `transform: translateZ(0)` to promote to GPU layer
- Animations use `requestAnimationFrame` with delta-time clamping (cap at 33ms to avoid spiral of death)
- When `document.hidden` (tab backgrounded), animations pause entirely
- On low-tier: no animation at all — just CSS transition between mood states
- On mid-tier: CSS `@keyframes` for idle, JS only for interactions
- On high-tier: Full JS-driven animations with spring physics

### Animation Budget

| Animation Type | Low | Mid | High |
|---------------|-----|-----|------|
| Idle body motion | ✗ | CSS `@keyframes` 4s loop | JS spring, continuous |
| Blink | ✗ | CSS keyframe every 4s | JS, every 2-5s random |
| Mood transition | CSS crossfade 400ms | CSS crossfade 400ms | Spring animation 600ms |
| Feed sequence | 2 frames, CSS | 3 frames, CSS + JS | 6 frames, full physics |
| Tap response | Opacity pulse | CSS bounce | JS spring bounce |
| Particles | ✗ | 3 elements, CSS | 10 elements, JS physics |
| Eye tracking | ✗ | Position every 100ms | Continuous smooth |

---

## 10. UI Components

### Component Tree

```
<PetManager>                    // Global provider, sits in layout
  ├── <PetEngine>               // Renders the pet SVG + interactions
  │   ├── <PetShadow />
  │   ├── <PetGlow />
  │   ├── <PetBody />           // Species-specific SVG
  │   ├── <PetEyes />           // Animated eyes with tracking
  │   ├── <PetAccessory />      // Skin overlay
  │   └── <PetParticles />      // Performance-gated
  ├── <PetPanel>                // Bottom sheet / sidebar
  │   ├── <PetStatus />         // Mood, hunger, name, level
  │   ├── <PetFoodInventory />  // Food grid with quantities
  │   ├── <PetSpeciesSelect />  // Species gallery (2-col grid)
  │   └── <PetSkinShop />       // Skins gallery with prices
  └── <PetReactionOverlay />    // Toast-style reaction popups
      ├── <PetTextBubble />     // "Nice!" "Keep going!"
      └── <PetParticleBurst />  // Hearts, stars, sparkles
```

### PetEngine Props

```typescript
interface PetEngineProps {
  visible: boolean;
  performanceTier: PetPerformanceTier;
  onPanelOpen?: () => void;
  petSize?: number;             // 80-300, default 120
  position?: { x: number; y: number }; // Corner offset
  reducedMotion?: boolean;
  disabled?: boolean;           // Complete hide
}
```

### PetPanel Tabs

| Tab | Content | Priority |
|-----|---------|----------|
| **Care** | Pet status (mood, hunger bar). Food inventory with feed buttons. | P0 |
| **Style** | Species gallery + skin grid with preview, prices, unlock status | P1 |
| **Stats** | Pet level, total fed, days together, favorite food, longest streak | P2 |

### ReactionOverlay

- Animated text popup that floats up and fades out
- Emitted on: task done, session done, streak day, level up, achievement
- Content: encouraging phrases selected by mood context and event type
- Shows for 2 seconds, max 1 at a time (queue if rapid)
- Example: completing a task shows "Nice!" (1-2 tasks today), "On fire!" (5+ tasks)

---

## 11. State Machine

### Core States

```
                         ┌─────────────────────┐
                         │        IDLE         │
                         │  Default state.     │
                         │  Looping idle anim. │
                         └──────┬──────┬───────┘
                                │      │
                    tap/double  │      │  long-press
                                │      │
                     ┌──────────┘      └──────────┐
                     ▼                             ▼
              ┌────────────┐              ┌────────────────┐
              │  INTERACT  │              │  CUDDLE        │
              │  React to  │              │  Snuggle anim  │
              │  touch     │              │  Heart burst   │
              └──────┬─────┘              └───────┬────────┘
                     │                            │
                     └──────────┬─────────────────┘
                                │ anim complete
                                ▼
                         ┌─────────────┐
                         │    IDLE     │
                         └─────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   FEEDING    │────→│   EATING     │────→│  REACTING    │
  │  Notice food │     │  Chew anim   │     │  happy anim  │
  └──────────────┘     └──────────────┘     └──────┬───────┘
                                                   │
                                                   ▼
                                            ┌────────────┐
                                            │    IDLE    │
                                            └────────────┘

  ┌──────────────┐
  │   SLEEPING   │
  │ Asleep state │←── idle for 72h+
  │ Eyes closed  │
  │ Zzz particles│
  └──────┬───────┘
         │ user does 1 task / session
         ▼
  ┌──────────────┐
  │   WAKING UP  │──→ IDLE (happy)
  │  2s animation│
  └──────────────┘

  ┌──────────────┐
  │ CELEBRATING  │
  │ Level up /   │──→ IDLE (happy)
  │ Achievement  │
  │ 1.5s anim    │
  └──────────────┘
```

### FSM Implementation Choice

Recommend using **XState v5** for the pet state machine:
- Visual debugging with `@xstate/inspect`
- Hooks API: `useMachine` / `useSelector`
- Actor model for concurrent animations
- Guards for mood transitions
- Actions for side effects (sound, particles, vibration)

**Alternative (no external dep):** Custom `usePetFSM` hook with useReducer + useRef for timing. Simpler but less debuggable.

---

## 12. Reward Feedback Loop

### Event → Reaction Mapping

```typescript
const PET_REACTIONS: Record<string, PetReaction> = {
  task_done: {
    mood: 'excited',
    duration: 8000,
    textBubble: { pool: ['Nice!', 'Keep going!', 'One down!', 'You got this!'], weightNewUser: 'positive' },
    particle: 'heart_small',
    sound: 'pop',
  },
  focus_done: {
    mood: 'excited',
    duration: 8000,
    textBubble: { pool: ['Focused!', 'Great session!', 'Locked in!'] },
    particle: 'sparkle',
    sound: 'chime',
  },
  streak_day: {
    mood: 'excited',
    duration: 10000,
    textBubble: { pool: ['On fire!', `${streak} days!`, 'Unstoppable!'] },
    particle: 'star',
    sound: 'streakChime',
  },
  level_up: {
    mood: 'excited',
    duration: 15000,
    textBubble: { pool: ['Level up!', 'You grew!', 'Amazing!'] },
    particle: 'confetti_party',
    sound: 'levelUp',
  },
  achievement: {
    mood: 'excited',
    duration: 15000,
    textBubble: { pool: ['Achievement!', 'You earned it!', 'Brilliant!'] },
    particle: 'trophy',
    sound: 'achievement',
  },
  absence_return: {
    mood: 'happy',
    duration: 15000,
    textBubble: { pool: ['Welcome back!', 'Missed you!', 'Let\'s study!'] },
    particle: 'heart_big',
    sound: 'welcomeBack',
  },
  neglect: {
    mood: 'tired',
    duration: 0, // persists until action
    textBubble: { pool: ['Where were you?', 'I waited...', 'Let\'s study?'] },
    particle: null,
    sound: null,
  },
};
```

### Particle Burst Types

| Particle | Count | Physics | Colors |
|----------|-------|---------|--------|
| `heart_small` | 6 | Float up, fade out over 1s | Pink, rose, red |
| `heart_big` | 12 | Float up + spread over 2s | Pink, rose, red, gold |
| `sparkle` | 8 | Burst outward, diamond path, 800ms | Gold, yellow, white |
| `star` | 10 | Spin + float up over 1.5s | Gold, white, cyan |
| `confetti_party` | 40 | Random spread, gravity, 3s | Rainbow from brand palette |
| `trophy` | 20 | Upward burst, slow fall, 2.5s | Gold, amber, white |
| `zzz` | 3 | Float up + sway, 2s loop | White, semi-transparent |

---

## 13. Mobile Strategy

### Decision: Include Pet on Mobile — YES, but differently

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Placement | Draggable, any screen position | Fixed bottom-left `16px` inset |
| Default size | 120px | 80px (smaller to avoid content overlap) |
| Interactions | Full drag, tap, long-press, swipe | Tap only (avoids scroll/drag conflicts) |
| Panel | Bottom corner click opens sidebar | Full-screen bottom sheet |
| Animations | Full fidelity | Mid-tier by default (battery conscious) |
| Auto-hide | Never | After 5s of inactivity → fade to opacity 0.4 |
| Bring back | Hover/click on pet area | Tap the pet's "shadow" indicator dot |

### Mobile-Specific Constraints
- Pet must not overlap keyboard when focus timer input is active
- Pet enters "sleep" (opacity 0.15, no animations) when a FloatingPanel is open
- Pet hides completely during full-view sections (analytics, subjects, etc.)
- No drag on mobile (scroll conflicts). Tap to reposition to preset corners.
- Touch target for pet must be ≥44px (accessibility)

### Safe Area Handling
```
bottom: calc(16px + env(safe-area-inset-bottom, 0px));
left: calc(16px + env(safe-area-inset-left, 0px));
```

---

## 14. Data Model

```typescript
interface PetState {
  // Identity
  name: string;
  speciesId: string;
  skinId: string | null;

  // Emotional
  mood: PetMood;                    // Derived on load, saved for persistence
  moodExpiresAt: number | null;     // Timestamp when current mood expires (for excited)

  // Food
  hunger: number;                   // 0-100, derived from food history
  foodInventory: PetFoodQuantity[];

  // Progression
  level: number;
  totalXp: number;                  // Pet XP (separate from user XP)
  totalFed: number;
  totalInteractions: number;
  daysTogether: number;             // Consecutive days app opened

  // Unlocks
  unlockedSpecies: string[];
  unlockedSkins: string[];

  // Position
  position: { x: number; y: number };  // Desktop only
  
  // Metadata
  firstMetAt: string;               // ISO date
  lastFedAt: string | null;
  lastInteractedAt: string | null;
}
```

### Storage Strategy
- Serialize to JSON, store in localStorage under `sf_pet_v2`
- Migrate from v1 on first load (discard v1 state, start fresh with defaults)
- Aim: fit in < 5 KB

### Pet Level System

| Level | XP Needed | Unlock |
|-------|-----------|--------|
| 1 | 0 | Default species + skin, basic interactions |
| 2 | 100 | Second idle animation |
| 3 | 300 | Third idle animation + blink |
| 4 | 600 | First skin unlock |
| 5 | 1000 | Tap reaction, eye tracking |
| 6 | 1500 | Particle effects (sparkle on tap) |
| 7 | 2100 | Level-up achievement |
| 8 | 2800 | Second skin unlock |
| 9 | 3600 | Feed animation sequence full |
| 10 | 4500 | Special species-specific celebration animation |

Pet XP is earned at 10% of user XP (so if user earns 500 XP, pet earns 50 XP).

---

## 15. File Structure

```
src/
├── config/
│   └── pets.ts                    // Feature flag, performance tiers, constants
│
├── hooks/
│   ├── usePetState.ts             // Pet statem machine (XState or useReducer)
│   ├── usePetAnimations.ts        // Animation controller, RAF loop, CSS keyframe gen
│   ├── usePetInteractions.ts      // Pointer/mouse/touch event handler with gesture FSM
│   ├── usePetMood.ts              // Derives mood from user activity + pet state
│   ├── usePetPerformance.ts       // Performance tier detection + feature gating
│   └── usePetIdleLife.ts          // Random idle action scheduler
│
├── lib/
│   ├── pets/
│   │   ├── types.ts               // All pet-related types (PetState, PetMood, PetFood, etc.)
│   │   ├── species.ts             // Pet species definitions + default skins
│   │   ├── skins.ts               // All skins with SVG path overrides, colors, accessories
│   │   ├── food.ts                // Food definitions, earning rules, hunger values
│   │   ├── reactions.ts           // Event→reaction mapping, text pools, particle configs
│   │   ├── animations.ts          // Animation primitives + compositions + reduced-motion alt
│   │   ├── particles.ts           // Particle burst configs, physics presets
│   │   ├── progression.ts         // Pet XP curve, level unlocks, milestone defs
│   │   └── storage.ts             // Serialize/deserialize, v1→v2 migration
│   │
│   └── pets.ts                    // Barrel file re-exporting everything above
│
├── components/
│   └── pet/
│       ├── PetManager.tsx         // Global provider wrapping pet engine + panel
│       ├── PetEngine.tsx          // Main rendering + interaction surface
│       ├── PetBody.tsx            // Species-specific SVG renderer
│       ├── PetEyes.tsx            // Animated eyes (blink + tracking + expression)
│       ├── PetAccessory.tsx       // Skin-specific SVG overlay
│       ├── PetGlow.tsx            // Mood-linked glow aura
│       ├── PetShadow.tsx          // Ground shadow
│       ├── PetParticles.tsx       // Performance-gated particle system
│       ├── PetFeedAnimation.tsx   // Feeding sequence FSM with visual feedback
│       ├── PetPanel.tsx           // Bottom sheet / drawer with tabs
│       ├── PetFoodInventory.tsx   // Food grid with feed button
│       ├── PetStatusCard.tsx      // Mood, hunger, level display
│       ├── PetSpeciesSelect.tsx   // Species gallery
│       ├── PetSkinShop.tsx        // Skin store with preview + purchase
│       ├── PetReactionOverlay.tsx // Animated text + particle burst
│       └── index.ts              // Barrel file
│
├── context/
│   └── PetContext.tsx             // React context providing pet state + actions to whole app
```

---

## 16. Implementation Phases

### Phase 1: Foundation (Estimated: 3-5 days)

**Goal:** Shipping a minimal, polished, performant pet that replaces the dead v1 code.

- [ ] Strip all v1 pet code (`PetEngine.tsx`, `PetPanel.tsx`, `PetSprite.tsx`, `petReactions.ts`, `petAnimations.ts`, `RewardAnimationLayer.tsx`, `ReactionOverlay.tsx`, `LevelUpSequence.tsx`)
- [ ] Create new file structure from §15
- [ ] Implement `PetState` type + localStorage persistence with v1→v2 migration
- [ ] Implement `PetManager` provider + `PetContext`
- [ ] Build 1 species (Ember) with 2 moods (happy, tired) and basic idle float
- [ ] Build `PetEngine` with:
  - SVG rendering for one species
  - Basic tap detection → happy reaction
  - Reduced-motion support
  - Performance tier detection + gating
- [ ] Build minimal `PetPanel` with:
  - Status card (mood, hunger, name)
  - Food inventory (feed button working)
- [ ] Wire to user activity: `task_done` → mood = happy (8s), `focus_done` → same
- [ ] Wire absence detection: 24h → tired, 72h → asleep, first action → wake
- [ ] Enable flag: `ENABLE_PETS = true` in `features.ts`
- [ ] Integrate with `MainLayout.tsx` + `DesktopSidebar.tsx`
- [ ] Test on low/mid/high tiers
- [ ] Delete dead v1 imports from bundle

**Deliverable:** A single-species pet lives in the corner, reacts to tasks/sessions, gets tired when you're away. No animations beyond idle float and a happy bounce. Works on all devices.

### Phase 2: Expressiveness (Estimated: 3-5 days)

**Goal:** Make the pet feel alive with animations, interactions, and emotional range.

- [ ] Add all 4 mood expressions (excited, happy, neutral, tired, asleep) with distinct SVG face changes
- [ ] Build blink system (random interval, 120ms duration)
- [ ] Build idle life system (look around, stretch, yawn, curious tilt)
- [ ] Build feed animation sequence (6-stage: notice → approach → eat → chew → react → idle)
- [ ] Build particle system (sparkle on tap, hearts on feed, stars on level)
- [ ] Build drag physics (spring + squash/stretch, desktop only)
- [ ] Build long-press → cuddle reaction
- [ ] Build celebration animation (level up / achievement)
- [ ] Add eye tracking (pointer following, smooth on high tier)
- [ ] Build `PetReactionOverlay` (text bubbles + particle bursts)

**Deliverable:** A responsive, expressive pet with 4 moods, 6+ interactions, particle effects, and full animation system.

### Phase 3: Species & Skins (Estimated: 3-4 days)

**Goal:** 4 species with meaningful skins, premium gating, and collection mechanics.

- [ ] Design + implement remaining 3 species (Lumina, Nimbus, Pixie) as SVG components
- [ ] Build species selector UI in PetPanel (2-col grid, unlock states)
- [ ] Build skin system with:
  - 2-3 common skins (free, level-gated)
  - 2-3 rare skins (gold purchase)
  - 1-2 epic skins (achievement-gated)
  - 1-2 legendary skins (premium or major milestone)
- [ ] Implement skin preview in PetPanel (tap to preview, then equip)
- [ ] Build skin unlock flow (gold purchase, achievement trigger, level trigger)
- [ ] Add skin accessories (hat, cape, glasses, etc. as SVG overlays)
- [ ] Wire premium gating (premium species/skins → PremiumModal)

**Deliverable:** 4 unique species, 10+ skins across rarities, full shop + unlock flow.

### Phase 4: Polish & Edge Cases (Estimated: 2-3 days)

**Goal:** Production-ready quality.

- [ ] "Missed you" sequence on 7+ day absence
- [ ] Pet grows 5% per level (scale = 1 + level * 0.005, max 1.5x)
- [ ] Sound effects (subtle, optional via user setting)
- [ ] Tooltip on first pet appearance ("Meet your study companion!")
- [ ] "Hide pet" button persists in localStorage
- [ ] Pet reacts to panic mode (concerned expression)
- [ ] Pet journey screen (stats, days together, milestones)
- [ ] Accessibility: full keyboard navigation for PetPanel
- [ ] Error boundary around PetEngine (graceful fallback: "pet is sleeping")
- [ ] Analytics: track interaction rates, feed rates, skin adoption

**Deliverable:** Production-ready pet system.

---

## 17. Testing & Debugging

### Dev Tools

- Pet state inspector: `window.__pet` exposes full state + actions in console
- Cheat panel (behind `sf_admin=true` URL param):
  - Set mood instantly
  - Add food
  - Level up pet
  - Trigger any reaction
  - Simulate 24h/72h absence
  - Toggle performance tier

### Test Matrix

| Test | Desktop | Mobile | Low-tier | Mid-tier | High-tier | Reduced motion |
|------|---------|--------|----------|----------|-----------|----------------|
| Initial render (no state) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| State load from localStorage | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tap → happy reaction | ✓ | ✓ | ✓ | ✓ | ✓ | opacity-only |
| Feed sequence | ✓ | ✓ | skip particles | ✓ | ✓ | 2-frame only |
| Mood transitions | ✓ | ✓ | skip particles | ✓ | ✓ | CSS crossfade |
| Absence detection (24h/72h) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drag | ✓ | ✗ | ✗ | ✓ (spring) | ✓ (+squash) | ✗ |
| Long-press | ✓ | ✓ | ✗ | ✓ | ✓ | opacity-only |
| Panel open/close | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Skin equip | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Species change | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Premium gating | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Keyboard navigation (panel) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Safe area insets | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Background tab (document.hidden) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Debugging Utilities

- Pet state log toggle: `localStorage.setItem('sf_pet_debug', 'true')` → console.debug() on every state change
- Animation frame counter: displays FPS when debug is on
- Performance tier badge: shows current tier on pet hover (debug mode)

---

## Appendix A: Migration from v1

```typescript
function migratePetStateV1ToV2(v1State: any): PetState | null {
  if (!v1State || typeof v1State !== 'object') return null;
  
  return {
    name: v1State.name || 'Ember',
    speciesId: 'ember',                    // Reset to default
    skinId: null,
    mood: 'happy',
    moodExpiresAt: null,
    hunger: 100,                           // Start full
    foodInventory: [
      { foodId: 'star-snack', quantity: 3 },
      { foodId: 'focus-bar', quantity: 1 },
    ],
    level: 1,
    totalXp: 0,
    totalFed: v1State.totalFed || 0,
    totalInteractions: 0,
    daysTogether: 1,
    unlockedSpecies: ['ember'],
    unlockedSkins: [],
    position: v1State.position || { x: 0, y: 0 },
    firstMetAt: new Date().toISOString(),
    lastFedAt: null,
    lastInteractedAt: null,
  };
}
```

---

## Appendix B: Premium Integration

| Premium Feature | Free | Premium |
|-----------------|------|---------|
| Species | 1 (Ember) | All 4 |
| Common skins | 2 (level-gated) | All common + rare |
| Rare/epic skins | ✗ | ✓ |
| Pet growth speed | 1x | 1.5x |
| Particle effects | ✗ | ✓ |
| "Missed you" sequence | ✗ | ✓ |
| Eye tracking | ✗ | ✓ |
| Sound effects | ✗ | ✓ |

---

## Appendix C: Key Design Decisions

**Why no hourly hunger decay?**
Hourly decay punishes users with lives outside the app. The pet represents *study health*, not a biological organism. Hunger only becomes relevant during extended absences (72h+), reinforcing "the pet misses you when you don't study" without creating anxiety.

**Why 4 species instead of 1 fully-developed one?**
Species are cheap (SVGs + config data) once the framework exists. Having 4 creates collection FOMO, premium conversion hooks, and variety. Each species needs the same animation hooks — just different SVG paths and particle colors.

**Why separate pet XP from user XP?**
Pet progression is a secondary loop. It moves slower (10% rate) so new pet unlocks keep coming long after the user has plateaued in their own level. It's a retention tool — "I'm only 2 sessions from unlocking a new skin for Ember."

**Why no sprite sheets?**
Inline SVG components are smaller to bundle, resolution-independent, easier to animate (target individual body parts), and simpler to create/modify. Sprite sheets add a build step, require PNG assets, and make runtime color changes (skins) much harder.
