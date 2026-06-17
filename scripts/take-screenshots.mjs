import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'public', 'screenshots');
const APP_URL = 'http://172.18.96.1:5173/?demo=1';

const SEED_SCRIPT = `
// Seed tasks
const tasks = [
  { id: 't1', title: 'Review Linear Algebra notes', completed: false, category: 'Math', priority: 'High', estimatedMinutes: 60, dueDate: '2026-06-17' },
  { id: 't2', title: 'Complete Physics problem set', completed: false, category: 'Physics', priority: 'High', estimatedMinutes: 90, dueDate: '2026-06-17' },
  { id: 't3', title: 'Read Chapter 5 - Organic Chemistry', completed: false, category: 'Chemistry', priority: 'Medium', estimatedMinutes: 45, dueDate: '2026-06-18' },
  { id: 't4', title: 'Write essay outline', completed: true, category: 'English', priority: 'Medium', estimatedMinutes: 30, dueDate: '2026-06-16' },
  { id: 't5', title: 'Practice coding - Binary Trees', completed: false, category: 'CS', priority: 'High', estimatedMinutes: 120, dueDate: '2026-06-19' },
  { id: 't6', title: 'Review Biology flashcards', completed: true, category: 'Biology', priority: 'Low', estimatedMinutes: 20, dueDate: '2026-06-16' },
  { id: 't7', title: 'Study group prep - Calculus', completed: false, category: 'Math', priority: 'Medium', estimatedMinutes: 45, dueDate: '2026-06-18' },
];
localStorage.setItem('study_flow_tasks', JSON.stringify(tasks));

// Seed subjects
const subjects = [
  { id: 's1', name: 'Mathematics', color: '#6366f1', topics: [
    { id: 'm1', title: 'Linear Algebra', mastery: 'Green' },
    { id: 'm2', title: 'Calculus II', mastery: 'Amber' },
    { id: 'm3', title: 'Probability', mastery: 'Red' },
  ]},
  { id: 's2', name: 'Physics', color: '#ec4899', topics: [
    { id: 'p1', title: 'Mechanics', mastery: 'Green' },
    { id: 'p2', title: 'Thermodynamics', mastery: 'Amber' },
    { id: 'p3', title: 'Quantum Physics', mastery: 'Red' },
  ]},
  { id: 's3', name: 'Computer Science', color: '#14b8a6', topics: [
    { id: 'c1', title: 'Data Structures', mastery: 'Green' },
    { id: 'c2', title: 'Algorithms', mastery: 'Amber' },
    { id: 'c3', title: 'Operating Systems', mastery: 'Red' },
  ]},
  { id: 's4', name: 'Chemistry', color: '#f59e0b', topics: [
    { id: 'ch1', title: 'Organic Chemistry', mastery: 'Amber' },
    { id: 'ch2', title: 'Thermochemistry', mastery: 'Red' },
  ]},
];
localStorage.setItem('study_flow_subjects', JSON.stringify(subjects));

// Seed user stats
const stats = {
  xp: 4850,
  level: 12,
  currentStreak: 7,
  bestStreak: 14,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalFocusSeconds: 158400,
  totalTasksCompleted: 47,
  dailyXPHistory: {},
  sessionHistory: [],
  hasShield: true,
  isPremium: true,
};
localStorage.setItem('study_flow_user_stats', JSON.stringify(stats));

// Seed unlocked badges
const badges = [
  { id: 'b1', name: 'First Focus', icon: '🎯', unlockedAt: new Date().toISOString() },
  { id: 'b2', name: '7-Day Streak', icon: '🔥', unlockedAt: new Date().toISOString() },
  { id: 'b3', name: 'Task Master', icon: '✅', unlockedAt: new Date().toISOString() },
  { id: 'b4', name: 'Level 10', icon: '⭐', unlockedAt: new Date().toISOString() },
];
localStorage.setItem('study_flow_unlocked_badges', JSON.stringify(badges));

// Seed daily quests
const quests = [
  { id: 'q1', title: 'Complete 3 tasks', progress: 1, target: 3, xp: 50, type: 'tasks' },
  { id: 'q2', title: 'Focus for 2 hours', progress: 45, target: 120, xp: 100, type: 'focus' },
  { id: 'q3', title: 'Study 2 subjects', progress: 1, target: 2, xp: 75, type: 'subjects' },
];
localStorage.setItem('study_flow_daily_quests', JSON.stringify(quests));

// Gamification v2
localStorage.setItem('sf_game_gold', '250');
localStorage.setItem('sf_game_total_xp', '4850');
localStorage.setItem('sf_game_hp', JSON.stringify({ current: 85, max: 100, lastDecayDate: new Date().toISOString().split('T')[0] }));
`;

async function navigateAndSeed(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Seed both the main data and theme config
  const fullSeed = SEED_SCRIPT + `
localStorage.setItem('study_flow_theme_config', JSON.stringify({ atmosphere: 'sunset', showWallpaper: true, showClock: false }));
`;
  await page.evaluate(fullSeed);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ===== TASKS SCREENSHOT =====
    console.log('Taking tasks screenshot...');
    await navigateAndSeed(page, APP_URL);
    // Navigate to tasks route to open the floating panel
    await page.goto(APP_URL.replace('/?demo=1', '/tasks?demo=1'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tasks.png') });
    console.log('  tasks.png saved');

    // ===== AMBIENCE - SOUNDS TAB =====
    console.log('Taking ambience (sounds) screenshot...');
    await page.goto(APP_URL.replace('/?demo=1', '/ambience/sounds?demo=1'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ambience.png') });
    console.log('  ambience.png saved');

    // ===== AMBIENCE - MY MUSIC TAB =====
    console.log('Taking ambience (my music) screenshot...');
    // Click the My Music tab
    const musicTab = page.locator('button:has-text("My Music"), [role="tab"]:has-text("Music")').first();
    if (await musicTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await musicTab.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto(APP_URL.replace('/?demo=1', '/ambience/music?demo=1'), { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ambience-music.png') });
    console.log('  ambience-music.png saved');

    // ===== AMBIENCE - PLAYLISTS TAB =====
    console.log('Taking ambience (playlists) screenshot...');
    const playlistsTab = page.locator('button:has-text("Playlists"), [role="tab"]:has-text("Playlists")').first();
    if (await playlistsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await playlistsTab.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto(APP_URL.replace('/?demo=1', '/ambience/playlists?demo=1'), { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ambience-playlists.png') });
    console.log('  ambience-playlists.png saved');

    // ===== ANALYTICS SCREENSHOT =====
    console.log('Taking analytics screenshot...');
    await navigateAndSeed(page, APP_URL);
    await page.goto(APP_URL.replace('/?demo=1', '/analytics?demo=1'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'analytics.png') });
    console.log('  analytics.png saved');

    // ===== DASHBOARD SCREENSHOT (wider) =====
    console.log('Taking dashboard screenshot...');
    await navigateAndSeed(page, APP_URL);
    await page.waitForTimeout(1000);
    // Resize to match existing dashboard size
    await page.setViewportSize({ width: 1918, height: 823 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard.png') });
    console.log('  dashboard.png saved');

    // ===== TIMER SCREENSHOT =====
    console.log('Taking timer screenshot...');
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.evaluate(SEED_SCRIPT);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Navigate to pomodoro / timer view
    await page.goto(APP_URL.replace('/?demo=1', '/pomodoro?demo=1'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'timer.png') });
    console.log('  timer.png saved');

    console.log('\nAll screenshots captured successfully!');
  } catch (error) {
    console.error('Screenshot error:', error.message);
    // Try to capture error state
    try {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error-state.png') });
      console.log('Error state screenshot saved');
    } catch {}
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
