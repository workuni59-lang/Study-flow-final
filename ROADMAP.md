# Study Flow - Project Roadmap

This roadmap outlines the evolution of Study Flow from a minimalist dashboard to a fully adaptive, student-centric study ecosystem.

---

## Phase 1: Closing the Loop (Polish & Logic) ✅
**Goal:** Make the existing dashboard feel functional and reactive.

- [x] **Timer-Stats Integration:** Focus sessions update focus time and daily momentum.
- [x] **Task Prioritization:** Implement "High Yield" vs. "Deep Review" tags.
- [x] **Daily Reflection:** End-of-day summary modal to celebrate wins.
- [x] **Persistence Refinement:** LocalStorage sync for all state.

## Phase 2: Content Depth (The Syllabus Mapper) ✅
**Goal:** Help students organize *what* they are learning.

- [x] **Subject View:** Dedicated view for individual courses.
- [x] **Mastery Mapping:** Topic listing with Red/Amber/Green confidence levels.
- [x] **Deadline Linking:** Connect exams to mastery maps for progress tracking.

## Phase 3: The "Flow" Engine (Adaptive UX) ✅
**Goal:** Deliver the core brand promise: Exams on Autopilot.

- [x] **Auto-Schedule Generator:** Distribute topics based on exam date.
- [x] **Smart Rescheduling:** "Recalibrate" button for overdue tasks.
- [x] **Visual Timeline:** "Path to Mastery" vertical flow view.
- [x] **Subject Templates:** One-click setups for LSAT, GRE, and Finals.
- [x] **Focus Ambience:** Integrated audio player (Lofi, Rain, White Noise).
- [x] **Zen Mode:** Full-screen, distraction-free study interface.

## Phase 4: Gamification & Motivation System 🚧
**Goal:** Create a healthy, addictive loop that rewards academic consistency.

- [x] **XP & Leveling:** Earn XP for tasks, focus, and mastery.
- [x] **Streak Mechanics:** Basic daily streak tracking.
- [x] **Achievements & Badges:** Hall of Mastery with rarity tiers.
- [x] **Unlock Notifications:** Real-time corner popups for accomplishments.
- [x] **Atmosphere Gating:** Lock premium themes behind level requirements.
- [x] **Daily Quests:** 3 randomized daily objectives for bonus XP.
- [x] **Study Analytics:** Weekly velocity charts and focus patterns.
- [x] **Streak Protection:** "Shield" mechanics to prevent reset on missed days.

## Phase 5: Integration & Sync (Mock to Real)
**Goal:** Professional-grade connectivity.

- [x] **Mock Google Sync:** Simulated "Sync to Google Calendar/Tasks" for UX validation.
- [ ] **Real Authentication:** Transition to Firebase/Supabase Auth.
- [ ] **Cloud Persistence:** Migrate from `localStorage` to a real-time database.
- [ ] **Real Google API Integration:** Live sync with Google Workspace.

## Phase 6: Emotional UX & Zen
**Goal:** Reinforce the "Calm/Minimal" brand identity.

- [ ] **Smart Reminders:** Subtle browser notifications.
- [ ] **Panic Mode:** A specialized UI for the 24 hours before an exam.

---

## 🎨 Architectural Vision
- **Navigation:** Slim Side Navigation Rail (Desktop) and Bottom Bar (Mobile).
- **Contextual UI:** Information appears only when relevant.
- **Minimalist Aesthetic:** Large white space, "Outfit" typography, soft "Indigo" accents.
