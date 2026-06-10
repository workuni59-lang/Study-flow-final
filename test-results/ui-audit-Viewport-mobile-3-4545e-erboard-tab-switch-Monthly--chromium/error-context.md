# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-audit.spec.ts >> Viewport: mobile (390×844) >> a21 - Leaderboard tab switch (Monthly)
- Location: ui-audit\ui-audit.spec.ts:424:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
```

# Test source

```ts
  331 |       const meta = makeMeta('a12 - Subjects section');
  332 |       await loadApp(page);
  333 |       await navToMenuItem(page, 'Subjects');
  334 |       await shot(page, 'a12-subjects', label, meta);
  335 |       meta.errors = getErrors(page);
  336 |       if (meta.errors.length) meta.status = 'failed';
  337 |     });
  338 | 
  339 |     test('a13 - Achievements section', async ({ page }) => {
  340 |       const meta = makeMeta('a13 - Achievements section');
  341 |       await loadApp(page);
  342 |       await navToMenuItem(page, 'Achievements');
  343 |       await shot(page, 'a13-achievements', label, meta);
  344 |       meta.errors = getErrors(page);
  345 |       if (meta.errors.length) meta.status = 'failed';
  346 |     });
  347 | 
  348 |     test('a14 - Settings section', async ({ page }) => {
  349 |       const meta = makeMeta('a14 - Settings section');
  350 |       await loadApp(page);
  351 |       await navToMenuItem(page, 'Settings');
  352 |       await shot(page, 'a14-settings', label, meta);
  353 |       meta.errors = getErrors(page);
  354 |       if (meta.errors.length) meta.status = 'failed';
  355 |     });
  356 | 
  357 |     test('a15 - Progression section', async ({ page }) => {
  358 |       const meta = makeMeta('a15 - Progression section');
  359 |       await loadApp(page);
  360 |       await navToProgression(page);
  361 |       await page.waitForTimeout(1500);
  362 |       await shot(page, 'a15-progression', label, meta);
  363 |       meta.errors = getErrors(page);
  364 |       if (meta.errors.length) meta.status = 'failed';
  365 |     });
  366 | 
  367 |     test('a16 - Leaderboard section', async ({ page }) => {
  368 |       const meta = makeMeta('a16 - Leaderboard section');
  369 |       await loadApp(page);
  370 |       await navToLeaderboard(page);
  371 |       await shot(page, 'a16-leaderboard', label, meta);
  372 |       meta.errors = getErrors(page);
  373 |       if (meta.errors.length) meta.status = 'failed';
  374 |     });
  375 | 
  376 |     test('a17 - Profile section', async ({ page }) => {
  377 |       const meta = makeMeta('a17 - Profile section');
  378 |       await loadApp(page);
  379 |       await navToProfile(page);
  380 |       await shot(page, 'a17-profile', label, meta);
  381 |       meta.errors = getErrors(page);
  382 |       if (meta.errors.length) meta.status = 'failed';
  383 |     });
  384 | 
  385 |     test('a18 - Premium modal', async ({ page }) => {
  386 |       const meta = makeMeta('a18 - Premium modal');
  387 |       await loadApp(page);
  388 |       await openNav(page);
  389 |       const proBtn = page.getByRole('button', { name: /Upgrade to Pro|Pro Member/ });
  390 |       if (await proBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  391 |         await proBtn.click();
  392 |         await page.waitForTimeout(800);
  393 |       }
  394 |       await shot(page, 'a18-premium-modal', label, meta);
  395 |       await page.keyboard.press('Escape');
  396 |       meta.errors = getErrors(page);
  397 |       if (meta.errors.length) meta.status = 'failed';
  398 |     });
  399 | 
  400 |     test('a19 - Help popover', async ({ page }) => {
  401 |       const meta = makeMeta('a19 - Help popover');
  402 |       await loadApp(page);
  403 |       await clickVisible(page, page.getByRole('button', { name: 'Help' }), 'help');
  404 |       await page.waitForTimeout(500);
  405 |       await shot(page, 'a19-help-popover', label, meta);
  406 |       meta.errors = getErrors(page);
  407 |       if (meta.errors.length) meta.status = 'failed';
  408 |     });
  409 | 
  410 |     test('a20 - Leaderboard tab switch (Weekly)', async ({ page }) => {
  411 |       const meta = makeMeta('a20 - Leaderboard tab switch (Weekly)');
  412 |       await loadApp(page);
  413 |       await navToLeaderboard(page);
  414 |       const weeklyTab = page.getByRole('button', { name: 'Weekly' });
  415 |       if (await weeklyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
  416 |         await weeklyTab.click();
  417 |         await page.waitForTimeout(600);
  418 |       }
  419 |       await shot(page, 'a20-leaderboard-weekly', label, meta);
  420 |       meta.errors = getErrors(page);
  421 |       if (meta.errors.length) meta.status = 'failed';
  422 |     });
  423 | 
  424 |     test('a21 - Leaderboard tab switch (Monthly)', async ({ page }) => {
  425 |       const meta = makeMeta('a21 - Leaderboard tab switch (Monthly)');
  426 |       await loadApp(page);
  427 |       await navToLeaderboard(page);
  428 |       const monthlyTab = page.getByRole('button', { name: 'Monthly' });
  429 |       if (await monthlyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
  430 |         await monthlyTab.click();
> 431 |         await page.waitForTimeout(600);
      |                    ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  432 |       }
  433 |       await shot(page, 'a21-leaderboard-monthly', label, meta);
  434 |       meta.errors = getErrors(page);
  435 |       if (meta.errors.length) meta.status = 'failed';
  436 |     });
  437 | 
  438 |     test('a22 - Analytics tab switch (Heatmap)', async ({ page }) => {
  439 |       const meta = makeMeta('a22 - Analytics tab switch (Heatmap)');
  440 |       await loadApp(page);
  441 |       await navToMenuItem(page, 'Analytics');
  442 |       const heatmapTab = page.getByRole('button', { name: 'Heatmap' });
  443 |       if (await heatmapTab.isVisible({ timeout: 2000 }).catch(() => false)) {
  444 |         await heatmapTab.click();
  445 |         await page.waitForTimeout(800);
  446 |       }
  447 |       await shot(page, 'a22-analytics-heatmap', label, meta);
  448 |       meta.errors = getErrors(page);
  449 |       if (meta.errors.length) meta.status = 'failed';
  450 |     });
  451 | 
  452 |     test('a23 - Stopwatch mode', async ({ page }) => {
  453 |       const meta = makeMeta('a23 - Stopwatch mode');
  454 |       await loadApp(page);
  455 |       await switchToFocus(page);
  456 |       await clickVisible(page, page.getByRole('button', { name: 'Timer presets' }), 'presets');
  457 |       await page.waitForTimeout(400);
  458 |       const sw = page.getByText('Stopwatch', { exact: true });
  459 |       if (await sw.isVisible({ timeout: 2000 }).catch(() => false)) {
  460 |         await sw.click();
  461 |         await page.waitForTimeout(800);
  462 |       }
  463 |       await shot(page, 'a23-stopwatch', label, meta);
  464 |       meta.errors = getErrors(page);
  465 |       if (meta.errors.length) meta.status = 'failed';
  466 |     });
  467 | 
  468 |     test('a24 - Auth modal (sign in view)', async ({ page }) => {
  469 |       const meta = makeMeta('a24 - Auth modal (sign in view)');
  470 |       await test.step('Load without demo, click Sign In', async () => {
  471 |         await page.goto('http://localhost:3000');
  472 |         await page.waitForLoadState('networkidle');
  473 |         await page.waitForTimeout(1000);
  474 |         const signInBtn = page.getByRole('button', { name: 'Sign In' });
  475 |         if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  476 |           await signInBtn.click();
  477 |           await page.waitForTimeout(800);
  478 |         }
  479 |       });
  480 |       await shot(page, 'a24-auth-modal', label, meta);
  481 |       meta.errors = getErrors(page);
  482 |       if (meta.errors.length) meta.status = 'failed';
  483 |     });
  484 |   });
  485 | });
  486 | 
  487 | // ── After all: generate report + manifest ──────────────────
  488 | 
  489 | test.afterAll(async () => {
  490 |   // ── manifest.json ──
  491 |   const manifest = {
  492 |     generatedAt: new Date().toISOString(),
  493 |     totalShots: allShots.length,
  494 |     passed: allShots.filter(s => s.status === 'passed').length,
  495 |     failed: allShots.filter(s => s.status === 'failed').length,
  496 |     shots: allShots,
  497 |   };
  498 |   fs.writeFileSync(path.join(SCREENSHOT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  499 | 
  500 |   // ── errors.json ──
  501 |   const allErrors = allShots.filter(s => s.errors.length > 0).map(s => ({
  502 |     test: s.testName,
  503 |     viewport: s.viewport,
  504 |     errors: s.errors,
  505 |   }));
  506 |   fs.writeFileSync(path.join(SCREENSHOT_DIR, 'errors.json'), JSON.stringify(allErrors, null, 2));
  507 | 
  508 |   // ── report.html ──
  509 |   const rows = allShots.map(s => {
  510 |     const badge = s.status === 'passed'
  511 |       ? '<span style="background:#22c55e;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">PASS</span>'
  512 |       : '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">FAIL</span>';
  513 |     const errCount = s.errors.length;
  514 |     const errBadge = errCount > 0
  515 |       ? `<span style="background:#f59e0b;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:4px">${errCount} err</span>`
  516 |       : '';
  517 |     return `
  518 |     <div class="shot" data-viewport="${s.viewport}">
  519 |       <div class="shot-header">
  520 |         <span class="shot-name">${s.testName}</span>
  521 |         ${badge} ${errBadge}
  522 |         <span class="shot-viewport">${s.viewport}</span>
  523 |       </div>
  524 |       <a href="${s.file}" target="_blank">
  525 |         <img src="${s.file}" alt="${s.testName}" loading="lazy" />
  526 |       </a>
  527 |     </div>`;
  528 |   }).join('\n');
  529 | 
  530 |   const html = `<!DOCTYPE html>
  531 | <html lang="en">
```