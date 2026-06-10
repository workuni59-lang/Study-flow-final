import { test } from '@playwright/test';

test('capture homepage', async ({ page }) => {
  await page.goto('http://localhost:3000'); // or your local URL
  await page.screenshot({
    path: 'screenshots/homepage.png',
    fullPage: true,
  });
});