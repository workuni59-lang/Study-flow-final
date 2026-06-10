import { test, type Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
const APP_URL = 'http://localhost:3000/?demo=1';

// ── Shared accumulator for afterAll reports ─────────────────────────────────

interface ShotMeta {
  testName: string;
  viewport: string;
  file: string;
  status: 'passed' | 'failed';
  errors: string[];
}

const allShots: ShotMeta[] = [];

// ── Helpers ─────────────────────────────────────────────────────────────────

async function shot(page: Page, name: string, viewport: string, meta: ShotMeta) {
  await page.waitForTimeout(800);
  const file = `${viewport}-${name}.png`;
  const p = path.join(SCREENSHOT_DIR, file);
  await page.screenshot({ path: p, fullPage: true });
  meta.file = file;
  meta.viewport = viewport;
  allShots.push(meta);
}

async function clickVisible(page: Page, locator: ReturnType<Page['locator']>, label: string) {
  const el = locator.first();
  await expect(el).toBeVisible({ timeout: 5000 });
  await el.click();
  await page.waitForTimeout(300);
}

function captureConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  (page as any).__capturedErrors = errors;
  return errors;
}

function getErrors(page: Page): string[] {
  return (page as any).__capturedErrors ?? [];
}

function makeMeta(testName: string): ShotMeta {
  return { testName, viewport: '', file: '', status: 'passed', errors: [] };
}

/** Load the app fresh. */
async function loadApp(page: Page) {
  await page.goto(APP_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

/** Switch to Focus mode. */
async function switchToFocus(page: Page) {
  const focusBtn = page.getByRole('button', { name: 'Focus' });
  if (await focusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await focusBtn.click();
    await page.waitForTimeout(1200);
  }
}

/** Open the nav drawer (hamburger). */
async function openNav(page: Page) {
  await clickVisible(page, page.getByRole('button', { name: 'Open menu' }), 'hamburger');
  await page.waitForTimeout(400);
}

/** Wait for nav drawer/sidebar to close after clicking an item. */
async function waitForNavClose(page: Page) {
  // On desktop the sidebar overlay backdrop disappears; on mobile the drawer does
  await page.waitForTimeout(500);
  const backdrop = page.locator('.fixed.inset-0').filter({ hasText: '' }).first();
  try {
    await backdrop.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // already gone
  }
}

/** Wait for the section back-header to confirm the page rendered. */
async function waitForSection(page: Page, sectionName: string) {
  // The back-header in MainLayout / MobileLayout shows the capitalized section name
  const header = page.locator('header').filter({ has: page.getByText(sectionName, { exact: true }) }).first();
  try {
    await header.waitFor({ state: 'visible', timeout: 8000 });
  } catch {
    // screenshot anyway
  }
  await page.waitForTimeout(400);
}

/* ── Navigation strategies ──────────────────────────────────── */

/**
 * Navigate to one of the 5 sections inside the nav drawer:
 * Analytics, Quests, Subjects, Achievements, Settings.
 * Works on both DesktopSidebar (desktop) and MenuDrawer (mobile).
 * Uses role-based selectors — children of display:none parents are
 * excluded from the accessibility tree, so only the visible nav is matched.
 */
async function navToMenuItem(page: Page, sectionName: string) {
  await test.step(`Navigate → "${sectionName}"`, async () => {
    await openNav(page);

    const btn = page.getByRole('button', { name: sectionName, exact: true });
    await expect(btn).toBeVisible({ timeout: 3000 });
    await btn.click();

    await waitForNavClose(page);
    await waitForSection(page, sectionName);
  });
}

/** Navigate to Progression via the badge widget in the nav drawer. */
async function navToProgression(page: Page) {
  await test.step('Navigate → Progression', async () => {
    await openNav(page);

    const badgeWidget = page.getByRole('button', { name: /Lv\.\s*\d+/ });
    await expect(badgeWidget).toBeVisible({ timeout: 3000 });
    await badgeWidget.click();

    await waitForNavClose(page);
    await waitForSection(page, 'Progression');
  });
}

/** Navigate to Leaderboard via the TopBar ladder icon button. */
async function navToLeaderboard(page: Page) {
  await test.step('Navigate → Leaderboard', async () => {
    const btn = page.getByRole('button', { name: /Leaderboard/i });
    await expect(btn).toBeVisible({ timeout: 3000 });
    await btn.click();
    await waitForSection(page, 'Leaderboard');
  });
}

/** Navigate to Profile via the TopBar avatar button. */
async function navToProfile(page: Page) {
  await test.step('Navigate → Profile', async () => {
    const btn = page.getByRole('button', { name: 'View your profile' });
    await expect(btn).toBeVisible({ timeout: 3000 });
    await btn.click();
    // Profile is async — wait for data to load
    await page.waitForTimeout(2000);
    try {
      await page.locator('text=Member since').waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      // screenshot anyway
    }
    await page.waitForTimeout(400);
  });
}

// ── Before all: ensure screenshot directory exists ────────

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

// ── Viewport fixtures ─────────────────────────────────────

const VIEWPORTS = [
  { width: 1440, height: 900, label: 'desktop' },
  { width: 390, height: 844, label: 'mobile' },
];

// ── Tests ─────────────────────────────────────────────────

VIEWPORTS.forEach(({ width, height, label }) => {
  test.describe(`Viewport: ${label} (${width}×${height})`, () => {
    test.use({ viewport: { width, height } });

    test.beforeEach(async ({ page }) => {
      captureConsole(page);
    });

    test('a00 - Dashboard (Home)', async ({ page }) => {
      const meta = makeMeta('a00 - Dashboard (Home)');
      await loadApp(page);
      await shot(page, 'a00-dashboard-home', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a01 - Focus mode - pomodoro timer', async ({ page }) => {
      const meta = makeMeta('a01 - Focus mode - pomodoro timer');
      await loadApp(page);
      await switchToFocus(page);
      await shot(page, 'a01-focus-timer', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a02 - Break mode timer', async ({ page }) => {
      const meta = makeMeta('a02 - Break mode timer');
      await loadApp(page);
      await switchToFocus(page);
      const breakPill = page.locator('button').filter({ hasText: /^Break$|^Short Break$/ }).first();
      if (await breakPill.isVisible({ timeout: 2000 }).catch(() => false)) {
        await breakPill.click();
        await page.waitForTimeout(800);
      }
      await shot(page, 'a02-break-timer', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a03 - Timer presets dropdown', async ({ page }) => {
      const meta = makeMeta('a03 - Timer presets dropdown');
      await loadApp(page);
      await switchToFocus(page);
      await clickVisible(page, page.getByRole('button', { name: 'Timer presets' }), 'presets');
      await page.waitForTimeout(500);
      await shot(page, 'a03-timer-presets', label, meta);
      await page.keyboard.press('Escape');
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a04 - Theme & atmosphere picker', async ({ page }) => {
      const meta = makeMeta('a04 - Theme & atmosphere picker');
      await loadApp(page);
      await switchToFocus(page);
      await clickVisible(page, page.getByRole('button', { name: 'Theme and atmosphere' }), 'theme picker');
      await page.waitForTimeout(800);
      await shot(page, 'a04-theme-picker', label, meta);
      await page.keyboard.press('Escape');
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a05 - Timer running', async ({ page }) => {
      const meta = makeMeta('a05 - Timer running');
      await loadApp(page);
      await switchToFocus(page);
      const startBtn = page.getByRole('button', { name: 'Start' });
      if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startBtn.click();
        await page.waitForTimeout(2000);
      }
      await shot(page, 'a05-timer-running', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a06 - Tasks panel', async ({ page }) => {
      const meta = makeMeta('a06 - Tasks panel');
      await loadApp(page);
      await switchToFocus(page);
      const tasksBtn = page.getByRole('button', { name: 'Tasks', exact: true });
      if (await tasksBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tasksBtn.click();
        await page.waitForTimeout(800);
      }
      await shot(page, 'a06-tasks-panel', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a07 - Ambience panel', async ({ page }) => {
      const meta = makeMeta('a07 - Ambience panel');
      await loadApp(page);
      await switchToFocus(page);
      const ambBtn = page.getByRole('button', { name: 'Ambience' });
      if (await ambBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await ambBtn.click();
        await page.waitForTimeout(1000);
      }
      await shot(page, 'a07-ambience-panel', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a08 - Notes panel', async ({ page }) => {
      const meta = makeMeta('a08 - Notes panel');
      await loadApp(page);
      await switchToFocus(page);
      const notesBtn = page.getByRole('button', { name: 'Notes' });
      if (await notesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await notesBtn.click();
        await page.waitForTimeout(800);
      }
      await shot(page, 'a08-notes-panel', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a09 - Menu drawer', async ({ page }) => {
      const meta = makeMeta('a09 - Menu drawer');
      await loadApp(page);
      await openNav(page);
      await shot(page, 'a09-menu-drawer', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a10 - Analytics section', async ({ page }) => {
      const meta = makeMeta('a10 - Analytics section');
      await loadApp(page);
      await navToMenuItem(page, 'Analytics');
      await shot(page, 'a10-analytics', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a11 - Quests section', async ({ page }) => {
      const meta = makeMeta('a11 - Quests section');
      await loadApp(page);
      await navToMenuItem(page, 'Quests');
      await shot(page, 'a11-quests', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a12 - Subjects section', async ({ page }) => {
      const meta = makeMeta('a12 - Subjects section');
      await loadApp(page);
      await navToMenuItem(page, 'Subjects');
      await shot(page, 'a12-subjects', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a13 - Achievements section', async ({ page }) => {
      const meta = makeMeta('a13 - Achievements section');
      await loadApp(page);
      await navToMenuItem(page, 'Achievements');
      await shot(page, 'a13-achievements', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a14 - Settings section', async ({ page }) => {
      const meta = makeMeta('a14 - Settings section');
      await loadApp(page);
      await navToMenuItem(page, 'Settings');
      await shot(page, 'a14-settings', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a15 - Progression section', async ({ page }) => {
      const meta = makeMeta('a15 - Progression section');
      await loadApp(page);
      await navToProgression(page);
      await page.waitForTimeout(1500);
      await shot(page, 'a15-progression', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a16 - Leaderboard section', async ({ page }) => {
      const meta = makeMeta('a16 - Leaderboard section');
      await loadApp(page);
      await navToLeaderboard(page);
      await shot(page, 'a16-leaderboard', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a17 - Profile section', async ({ page }) => {
      const meta = makeMeta('a17 - Profile section');
      await loadApp(page);
      await navToProfile(page);
      await shot(page, 'a17-profile', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a18 - Premium modal', async ({ page }) => {
      const meta = makeMeta('a18 - Premium modal');
      await loadApp(page);
      await openNav(page);
      const proBtn = page.getByRole('button', { name: /Upgrade to Pro|Pro Member/ });
      if (await proBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await proBtn.click();
        await page.waitForTimeout(800);
      }
      await shot(page, 'a18-premium-modal', label, meta);
      await page.keyboard.press('Escape');
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a19 - Help popover', async ({ page }) => {
      const meta = makeMeta('a19 - Help popover');
      await loadApp(page);
      await clickVisible(page, page.getByRole('button', { name: 'Help' }), 'help');
      await page.waitForTimeout(500);
      await shot(page, 'a19-help-popover', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a20 - Leaderboard tab switch (Weekly)', async ({ page }) => {
      const meta = makeMeta('a20 - Leaderboard tab switch (Weekly)');
      await loadApp(page);
      await navToLeaderboard(page);
      const weeklyTab = page.getByRole('button', { name: 'Weekly' });
      if (await weeklyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await weeklyTab.click();
        await page.waitForTimeout(600);
      }
      await shot(page, 'a20-leaderboard-weekly', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a21 - Leaderboard tab switch (Monthly)', async ({ page }) => {
      const meta = makeMeta('a21 - Leaderboard tab switch (Monthly)');
      await loadApp(page);
      await navToLeaderboard(page);
      const monthlyTab = page.getByRole('button', { name: 'Monthly' });
      if (await monthlyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await monthlyTab.click();
        await page.waitForTimeout(600);
      }
      await shot(page, 'a21-leaderboard-monthly', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a22 - Analytics tab switch (Heatmap)', async ({ page }) => {
      const meta = makeMeta('a22 - Analytics tab switch (Heatmap)');
      await loadApp(page);
      await navToMenuItem(page, 'Analytics');
      const heatmapTab = page.getByRole('button', { name: 'Heatmap' });
      if (await heatmapTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await heatmapTab.click();
        await page.waitForTimeout(800);
      }
      await shot(page, 'a22-analytics-heatmap', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a23 - Stopwatch mode', async ({ page }) => {
      const meta = makeMeta('a23 - Stopwatch mode');
      await loadApp(page);
      await switchToFocus(page);
      await clickVisible(page, page.getByRole('button', { name: 'Timer presets' }), 'presets');
      await page.waitForTimeout(400);
      const sw = page.getByText('Stopwatch', { exact: true });
      if (await sw.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sw.click();
        await page.waitForTimeout(800);
      }
      await shot(page, 'a23-stopwatch', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });

    test('a24 - Auth modal (sign in view)', async ({ page }) => {
      const meta = makeMeta('a24 - Auth modal (sign in view)');
      await test.step('Load without demo, click Sign In', async () => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        const signInBtn = page.getByRole('button', { name: 'Sign In' });
        if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await signInBtn.click();
          await page.waitForTimeout(800);
        }
      });
      await shot(page, 'a24-auth-modal', label, meta);
      meta.errors = getErrors(page);
      if (meta.errors.length) meta.status = 'failed';
    });
  });
});

// ── After all: generate report + manifest ──────────────────

test.afterAll(async () => {
  // ── manifest.json ──
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalShots: allShots.length,
    passed: allShots.filter(s => s.status === 'passed').length,
    failed: allShots.filter(s => s.status === 'failed').length,
    shots: allShots,
  };
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // ── errors.json ──
  const allErrors = allShots.filter(s => s.errors.length > 0).map(s => ({
    test: s.testName,
    viewport: s.viewport,
    errors: s.errors,
  }));
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'errors.json'), JSON.stringify(allErrors, null, 2));

  // ── report.html ──
  const rows = allShots.map(s => {
    const badge = s.status === 'passed'
      ? '<span style="background:#22c55e;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">PASS</span>'
      : '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">FAIL</span>';
    const errCount = s.errors.length;
    const errBadge = errCount > 0
      ? `<span style="background:#f59e0b;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:4px">${errCount} err</span>`
      : '';
    return `
    <div class="shot" data-viewport="${s.viewport}">
      <div class="shot-header">
        <span class="shot-name">${s.testName}</span>
        ${badge} ${errBadge}
        <span class="shot-viewport">${s.viewport}</span>
      </div>
      <a href="${s.file}" target="_blank">
        <img src="${s.file}" alt="${s.testName}" loading="lazy" />
      </a>
    </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StudyFlow UI Audit Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f0f13;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px}
h1{font-size:24px;font-weight:700;margin-bottom:4px}
.sub{color:#94a3b8;font-size:14px;margin-bottom:24px}
.filters{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap}
.filters button{padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#94a3b8;cursor:pointer;font-size:13px;transition:all .15s}
.filters button.active{background:#6366f1;border-color:#6366f1;color:#fff}
.filters button:hover{background:rgba(255,255,255,0.08)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:20px}
.shot{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden}
.shot-header{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.04)}
.shot-name{font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.shot-viewport{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;background:rgba(255,255,255,0.04);padding:2px 8px;border-radius:4px}
.shot img{width:100%;height:auto;display:block}
.pass-count{color:#22c55e;font-weight:700}
.fail-count{color:#ef4444;font-weight:700}
</style>
</head>
<body>
<h1>StudyFlow UI Audit</h1>
<p class="sub">${manifest.totalShots} screenshots &middot; <span class="pass-count">${manifest.passed} passed</span> &middot; <span class="fail-count">${manifest.failed} failed</span></p>
<div class="filters" id="filters">
  <button class="active" data-filter="all">All</button>
  <button data-filter="desktop">Desktop</button>
  <button data-filter="mobile">Mobile</button>
</div>
<div class="grid" id="grid">${rows}</div>
<script>
document.getElementById('filters').addEventListener('click',(e)=>{
  const btn=e.target.closest('button'); if(!btn)return;
  document.querySelectorAll('#filters button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); const f=btn.dataset.filter;
  document.querySelectorAll('.shot').forEach(el=>{el.style.display=f==='all'||el.dataset.viewport===f?'':'none'});
});
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'report.html'), html);
});
