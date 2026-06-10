# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-audit.spec.ts >> Viewport: mobile (390×844) >> a23 - Stopwatch mode
- Location: ui-audit\ui-audit.spec.ts:452:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Timer presets' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Timer presets' }).first()

```

```yaml
- button "Open menu":
  - img
- img "StudyFlow"
- button "Home"
- button "Focus"
- button "Leaderboard":
  - img
  - text: Leaderboard
- button "View your profile": D
- button "Help": "?"
- main:
  - button "Lv.1":
    - img
    - text: Lv.1
  - paragraph: The night is young, Demo. One more session?
  - text: "06 : 05 PM"
  - button "Customize"
  - paragraph: Ready for a focused session?
  - paragraph: 0m
  - paragraph: Focus
  - paragraph: "0"
  - paragraph: Streak
  - paragraph: "0"
  - paragraph: XP
  - paragraph: “The secret of getting ahead is getting started.”
  - button
- navigation:
  - button "Home"
  - button "Focus"
  - button "Tasks"
  - button "Notes"
  - button "Stats"
- button "Change background"
```

# Test source

```ts
  1   | import { test, type Page, expect } from '@playwright/test';
  2   | import path from 'path';
  3   | import fs from 'fs';
  4   | import { fileURLToPath } from 'url';
  5   | 
  6   | const __filename = fileURLToPath(import.meta.url);
  7   | const __dirname = path.dirname(__filename);
  8   | const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
  9   | const APP_URL = 'http://localhost:3000/?demo=1';
  10  | 
  11  | // ── Shared accumulator for afterAll reports ─────────────────────────────────
  12  | 
  13  | interface ShotMeta {
  14  |   testName: string;
  15  |   viewport: string;
  16  |   file: string;
  17  |   status: 'passed' | 'failed';
  18  |   errors: string[];
  19  | }
  20  | 
  21  | const allShots: ShotMeta[] = [];
  22  | 
  23  | // ── Helpers ─────────────────────────────────────────────────────────────────
  24  | 
  25  | async function shot(page: Page, name: string, viewport: string, meta: ShotMeta) {
  26  |   await page.waitForTimeout(800);
  27  |   const file = `${viewport}-${name}.png`;
  28  |   const p = path.join(SCREENSHOT_DIR, file);
  29  |   await page.screenshot({ path: p, fullPage: true });
  30  |   meta.file = file;
  31  |   meta.viewport = viewport;
  32  |   allShots.push(meta);
  33  | }
  34  | 
  35  | async function clickVisible(page: Page, locator: ReturnType<Page['locator']>, label: string) {
  36  |   const el = locator.first();
> 37  |   await expect(el).toBeVisible({ timeout: 5000 });
      |                    ^ Error: expect(locator).toBeVisible() failed
  38  |   await el.click();
  39  |   await page.waitForTimeout(300);
  40  | }
  41  | 
  42  | function captureConsole(page: Page): string[] {
  43  |   const errors: string[] = [];
  44  |   page.on('console', (msg) => {
  45  |     if (msg.type() === 'error') errors.push(msg.text());
  46  |   });
  47  |   page.on('pageerror', (err) => errors.push(err.message));
  48  |   (page as any).__capturedErrors = errors;
  49  |   return errors;
  50  | }
  51  | 
  52  | function getErrors(page: Page): string[] {
  53  |   return (page as any).__capturedErrors ?? [];
  54  | }
  55  | 
  56  | function makeMeta(testName: string): ShotMeta {
  57  |   return { testName, viewport: '', file: '', status: 'passed', errors: [] };
  58  | }
  59  | 
  60  | /** Load the app fresh. */
  61  | async function loadApp(page: Page) {
  62  |   await page.goto(APP_URL);
  63  |   await page.waitForLoadState('networkidle');
  64  |   await page.waitForTimeout(1500);
  65  | }
  66  | 
  67  | /** Switch to Focus mode. */
  68  | async function switchToFocus(page: Page) {
  69  |   const focusBtn = page.getByRole('button', { name: 'Focus' });
  70  |   if (await focusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  71  |     await focusBtn.click();
  72  |     await page.waitForTimeout(1200);
  73  |   }
  74  | }
  75  | 
  76  | /** Open the nav drawer (hamburger). */
  77  | async function openNav(page: Page) {
  78  |   await clickVisible(page, page.getByRole('button', { name: 'Open menu' }), 'hamburger');
  79  |   await page.waitForTimeout(400);
  80  | }
  81  | 
  82  | /** Wait for nav drawer/sidebar to close after clicking an item. */
  83  | async function waitForNavClose(page: Page) {
  84  |   // On desktop the sidebar overlay backdrop disappears; on mobile the drawer does
  85  |   await page.waitForTimeout(500);
  86  |   const backdrop = page.locator('.fixed.inset-0').filter({ hasText: '' }).first();
  87  |   try {
  88  |     await backdrop.waitFor({ state: 'hidden', timeout: 3000 });
  89  |   } catch {
  90  |     // already gone
  91  |   }
  92  | }
  93  | 
  94  | /** Wait for the section back-header to confirm the page rendered. */
  95  | async function waitForSection(page: Page, sectionName: string) {
  96  |   // The back-header in MainLayout / MobileLayout shows the capitalized section name
  97  |   const header = page.locator('header').filter({ has: page.getByText(sectionName, { exact: true }) }).first();
  98  |   try {
  99  |     await header.waitFor({ state: 'visible', timeout: 8000 });
  100 |   } catch {
  101 |     // screenshot anyway
  102 |   }
  103 |   await page.waitForTimeout(400);
  104 | }
  105 | 
  106 | /* ── Navigation strategies ──────────────────────────────────── */
  107 | 
  108 | /**
  109 |  * Navigate to one of the 5 sections inside the nav drawer:
  110 |  * Analytics, Quests, Subjects, Achievements, Settings.
  111 |  * Works on both DesktopSidebar (desktop) and MenuDrawer (mobile).
  112 |  * Uses role-based selectors — children of display:none parents are
  113 |  * excluded from the accessibility tree, so only the visible nav is matched.
  114 |  */
  115 | async function navToMenuItem(page: Page, sectionName: string) {
  116 |   await test.step(`Navigate → "${sectionName}"`, async () => {
  117 |     await openNav(page);
  118 | 
  119 |     const btn = page.getByRole('button', { name: sectionName, exact: true });
  120 |     await expect(btn).toBeVisible({ timeout: 3000 });
  121 |     await btn.click();
  122 | 
  123 |     await waitForNavClose(page);
  124 |     await waitForSection(page, sectionName);
  125 |   });
  126 | }
  127 | 
  128 | /** Navigate to Progression via the badge widget in the nav drawer. */
  129 | async function navToProgression(page: Page) {
  130 |   await test.step('Navigate → Progression', async () => {
  131 |     await openNav(page);
  132 | 
  133 |     const badgeWidget = page.getByRole('button', { name: /Lv\.\s*\d+/ });
  134 |     await expect(badgeWidget).toBeVisible({ timeout: 3000 });
  135 |     await badgeWidget.click();
  136 | 
  137 |     await waitForNavClose(page);
```