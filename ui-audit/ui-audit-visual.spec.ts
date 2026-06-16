import { test, type Page, expect } from '@playwright/test';

const APP_URL = 'http://localhost:3000/?demo=1';

async function loadApp(page: Page) {
  await page.goto(APP_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

async function shot(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
}

// ── Desktop tests ────────────────────────────────────────────

test.describe('visual: desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('home dashboard', async ({ page }) => {
    await loadApp(page);
    await shot(page, 'desktop-home.png');
  });

  test('focus mode', async ({ page }) => {
    await loadApp(page);
    const focusBtn = page.getByRole('button', { name: 'Focus' });
    if (await focusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await focusBtn.click();
      await page.waitForTimeout(1200);
    }
    await shot(page, 'desktop-focus.png');
  });

  test('tasks panel open', async ({ page }) => {
    await loadApp(page);
    const tasksBtn = page.getByRole('button', { name: 'Tasks', exact: true });
    if (await tasksBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tasksBtn.click();
      await page.waitForTimeout(800);
    }
    await shot(page, 'desktop-tasks.png');
  });

  test('analytics section', async ({ page }) => {
    await loadApp(page);
    const btn = page.getByRole('button', { name: 'Analytics', exact: true });
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(800);
    }
    await shot(page, 'desktop-analytics.png');
  });
});

// ── Mobile tests ─────────────────────────────────────────────

test.describe('visual: mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('home dashboard', async ({ page }) => {
    await loadApp(page);
    await shot(page, 'mobile-home.png');
  });
});
