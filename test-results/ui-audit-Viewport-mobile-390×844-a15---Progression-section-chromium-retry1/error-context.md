# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-audit.spec.ts >> Viewport: mobile (390×844) >> a15 - Progression section
- Location: ui-audit\ui-audit.spec.ts:357:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Lv\.\s*\d+/ })
Expected: visible
Error: strict mode violation: getByRole('button', { name: /Lv\.\s*\d+/ }) resolved to 2 elements:
    1) <button class="fixed top-20 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel-light text-white/80 hover:bg-white/[0.08] transition-all text-[11px] font-semibold">…</button> aka getByRole('button', { name: 'Lv.1' })
    2) <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">…</button> aka getByRole('button', { name: '🌱 Novice Learner Lv. 1 0%' })

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for getByRole('button', { name: /Lv\.\s*\d+/ })

```

# Test source

```ts
  34  | 
  35  | async function clickVisible(page: Page, locator: ReturnType<Page['locator']>, label: string) {
  36  |   const el = locator.first();
  37  |   await expect(el).toBeVisible({ timeout: 5000 });
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
> 134 |     await expect(badgeWidget).toBeVisible({ timeout: 3000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  135 |     await badgeWidget.click();
  136 | 
  137 |     await waitForNavClose(page);
  138 |     await waitForSection(page, 'Progression');
  139 |   });
  140 | }
  141 | 
  142 | /** Navigate to Leaderboard via the TopBar ladder icon button. */
  143 | async function navToLeaderboard(page: Page) {
  144 |   await test.step('Navigate → Leaderboard', async () => {
  145 |     const btn = page.getByRole('button', { name: /Leaderboard/i });
  146 |     await expect(btn).toBeVisible({ timeout: 3000 });
  147 |     await btn.click();
  148 |     await waitForSection(page, 'Leaderboard');
  149 |   });
  150 | }
  151 | 
  152 | /** Navigate to Profile via the TopBar avatar button. */
  153 | async function navToProfile(page: Page) {
  154 |   await test.step('Navigate → Profile', async () => {
  155 |     const btn = page.getByRole('button', { name: 'View your profile' });
  156 |     await expect(btn).toBeVisible({ timeout: 3000 });
  157 |     await btn.click();
  158 |     // Profile is async — wait for data to load
  159 |     await page.waitForTimeout(2000);
  160 |     try {
  161 |       await page.locator('text=Member since').waitFor({ state: 'visible', timeout: 8000 });
  162 |     } catch {
  163 |       // screenshot anyway
  164 |     }
  165 |     await page.waitForTimeout(400);
  166 |   });
  167 | }
  168 | 
  169 | // ── Before all: ensure screenshot directory exists ────────
  170 | 
  171 | test.beforeAll(() => {
  172 |   fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  173 | });
  174 | 
  175 | // ── Viewport fixtures ─────────────────────────────────────
  176 | 
  177 | const VIEWPORTS = [
  178 |   { width: 1440, height: 900, label: 'desktop' },
  179 |   { width: 390, height: 844, label: 'mobile' },
  180 | ];
  181 | 
  182 | // ── Tests ─────────────────────────────────────────────────
  183 | 
  184 | VIEWPORTS.forEach(({ width, height, label }) => {
  185 |   test.describe(`Viewport: ${label} (${width}×${height})`, () => {
  186 |     test.use({ viewport: { width, height } });
  187 | 
  188 |     test.beforeEach(async ({ page }) => {
  189 |       captureConsole(page);
  190 |     });
  191 | 
  192 |     test('a00 - Dashboard (Home)', async ({ page }) => {
  193 |       const meta = makeMeta('a00 - Dashboard (Home)');
  194 |       await loadApp(page);
  195 |       await shot(page, 'a00-dashboard-home', label, meta);
  196 |       meta.errors = getErrors(page);
  197 |       if (meta.errors.length) meta.status = 'failed';
  198 |     });
  199 | 
  200 |     test('a01 - Focus mode - pomodoro timer', async ({ page }) => {
  201 |       const meta = makeMeta('a01 - Focus mode - pomodoro timer');
  202 |       await loadApp(page);
  203 |       await switchToFocus(page);
  204 |       await shot(page, 'a01-focus-timer', label, meta);
  205 |       meta.errors = getErrors(page);
  206 |       if (meta.errors.length) meta.status = 'failed';
  207 |     });
  208 | 
  209 |     test('a02 - Break mode timer', async ({ page }) => {
  210 |       const meta = makeMeta('a02 - Break mode timer');
  211 |       await loadApp(page);
  212 |       await switchToFocus(page);
  213 |       const breakPill = page.locator('button').filter({ hasText: /^Break$|^Short Break$/ }).first();
  214 |       if (await breakPill.isVisible({ timeout: 2000 }).catch(() => false)) {
  215 |         await breakPill.click();
  216 |         await page.waitForTimeout(800);
  217 |       }
  218 |       await shot(page, 'a02-break-timer', label, meta);
  219 |       meta.errors = getErrors(page);
  220 |       if (meta.errors.length) meta.status = 'failed';
  221 |     });
  222 | 
  223 |     test('a03 - Timer presets dropdown', async ({ page }) => {
  224 |       const meta = makeMeta('a03 - Timer presets dropdown');
  225 |       await loadApp(page);
  226 |       await switchToFocus(page);
  227 |       await clickVisible(page, page.getByRole('button', { name: 'Timer presets' }), 'presets');
  228 |       await page.waitForTimeout(500);
  229 |       await shot(page, 'a03-timer-presets', label, meta);
  230 |       await page.keyboard.press('Escape');
  231 |       meta.errors = getErrors(page);
  232 |       if (meta.errors.length) meta.status = 'failed';
  233 |     });
  234 | 
```