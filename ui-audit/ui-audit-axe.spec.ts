import { test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORT_DIR = path.resolve(__dirname, 'screenshots');
const APP_URL = 'http://localhost:3000/?demo=1';

interface A11yResult {
  page: string;
  violations: { id: string; impact: string; help: string; helpUrl: string; nodes: number }[];
  passCount: number;
}

const allResults: A11yResult[] = [];
let totalViolations = 0;
let totalCritical = 0;

async function loadApp(page: Page) {
  await page.goto(APP_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

async function runAxe(page: Page, pageName: string) {
  return await test.step(`Accessibility audit: ${pageName}`, async () => {
    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    }));
    allResults.push({ page: pageName, violations, passCount: results.passes.length });

    const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    totalViolations += results.violations.length;
    totalCritical += critical.length;

    if (violations.length) {
      console.log(`  ${violations.length} violation(s) on ${pageName}:`);
      violations.forEach(v =>
        console.log(`    [${v.impact}] ${v.id} — ${v.help} (${v.nodes} elements)`)
      );
    } else {
      console.log(`  No violations on ${pageName}`);
    }

    return results;
  });
}

test.beforeAll(() => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
});

test.use({ viewport: { width: 1440, height: 900 } });

const PAGES = ['Home dashboard', 'Focus mode', 'Tasks panel', 'Ambience panel',
  'Analytics', 'Achievements', 'Settings', 'Premium modal'] as const;

test('a11y - Home dashboard', async ({ page }) => {
  await loadApp(page);
  await runAxe(page, 'Home dashboard');
});

test('a11y - Focus mode', async ({ page }) => {
  await loadApp(page);
  const focusBtn = page.getByRole('button', { name: 'Focus' });
  if (await focusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await focusBtn.click();
    await page.waitForTimeout(1200);
  }
  await runAxe(page, 'Focus mode');
});

test('a11y - Tasks panel', async ({ page }) => {
  await loadApp(page);
  const tasksBtn = page.getByRole('button', { name: 'Tasks', exact: true });
  if (await tasksBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await tasksBtn.click();
    await page.waitForTimeout(800);
  }
  await runAxe(page, 'Tasks panel');
});

test('a11y - Ambience panel', async ({ page }) => {
  await loadApp(page);
  const ambBtn = page.getByRole('button', { name: 'Ambience' });
  if (await ambBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await ambBtn.click();
    await page.waitForTimeout(1000);
  }
  await runAxe(page, 'Ambience panel');
});

test('a11y - Analytics', async ({ page }) => {
  await loadApp(page);
  const btn = page.getByRole('button', { name: 'Analytics', exact: true });
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
  await runAxe(page, 'Analytics');
});

test('a11y - Achievements', async ({ page }) => {
  await loadApp(page);
  const btn = page.getByRole('button', { name: 'Achievements', exact: true });
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
  await runAxe(page, 'Achievements');
});

test('a11y - Settings', async ({ page }) => {
  await loadApp(page);
  const btn = page.getByRole('button', { name: 'Settings', exact: true });
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
  await runAxe(page, 'Settings');
});

test('a11y - Premium modal', async ({ page }) => {
  await loadApp(page);
  const proBtn = page.getByRole('button', { name: /Upgrade to Pro|Pro Member/ });
  if (await proBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await proBtn.click();
    await page.waitForTimeout(800);
  }
  await runAxe(page, 'Premium modal');
});

test.afterAll(() => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StudyFlow Accessibility Audit</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f0f13;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px}
h1{font-size:24px;font-weight:700;margin-bottom:4px}
.sub{color:#94a3b8;font-size:14px;margin-bottom:24px}
.summary{display:flex;gap:16px;margin-bottom:24px}
.stat-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 24px}
.stat-value{font-size:28px;font-weight:700}
.stat-label{font-size:12px;color:#94a3b8;margin-top:2px}
.page-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin-bottom:20px;overflow:hidden}
.page-header{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04)}
.page-name{font-weight:600;flex:1}
.badge{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
.badge-pass{background:#22c55e;color:#fff}
.badge-fail{background:#ef4444;color:#fff}
.violation{padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:12px;display:flex;align-items:center;gap:8px}
.violation:last-child{border-bottom:none}
.impact-tag{padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;text-transform:uppercase}
.impact-critical{background:#ef4444;color:#fff}
.impact-serious{background:#f59e0b;color:#fff}
.impact-moderate{background:#6366f1;color:#fff}
.impact-minor{background:#64748b;color:#fff}
.pass-count{color:#22c55e;font-weight:700}
.fail-count{color:#ef4444;font-weight:700}
</style>
</head>
<body>
<h1>StudyFlow Accessibility Audit</h1>
<p class="sub">axe-core scan — ${allResults.length} pages</p>
<div class="summary">
  <div class="stat-card"><div class="stat-value" style="color:#ef4444">${totalCritical}</div><div class="stat-label">Critical/Serious</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#f59e0b">${totalViolations}</div><div class="stat-label">Total violations</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#22c55e">${allResults.reduce((s, r) => s + r.passCount, 0)}</div><div class="stat-label">Passed checks</div></div>
</div>
${allResults.map(r => {
  const c = r.violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
  const badge = r.violations.length === 0 ? '<span class="badge badge-pass">PASS</span>'
    : c > 0 ? '<span class="badge badge-fail">FAIL</span>'
    : '<span class="badge badge-pass">PASS</span>';
  return `<div class="page-card">
    <div class="page-header">
      <span class="page-name">${r.page}</span>
      ${badge}
      <span style="color:#94a3b8;font-size:11px">${r.violations.length} violations</span>
      <span style="color:#94a3b8;font-size:11px">${r.passCount} passed checks</span>
    </div>
    ${r.violations.map(v => `<div class="violation">
      <span class="impact-tag impact-${v.impact}">${v.impact || 'n/a'}</span>
      <span style="flex:1">[${v.id}] ${v.help}</span>
      <span style="color:#94a3b8;font-size:10px">${v.nodes} elements</span>
    </div>`).join('')}
    ${r.violations.length === 0 ? '<div style="padding:12px 14px;font-size:12px;color:#22c55e">✓ No violations found</div>' : ''}
  </div>`;
}).join('\n')}
</body>
</html>`;
  fs.writeFileSync(path.join(REPORT_DIR, 'a11y-report.html'), html);
  fs.writeFileSync(path.join(REPORT_DIR, 'a11y-results.json'), JSON.stringify(allResults, null, 2));
  console.log(`\n  Accessibility audit complete — ${totalCritical} critical/serious, ${totalViolations} total violations across ${allResults.length} pages`);
  console.log(`  Report: ${path.join(REPORT_DIR, 'a11y-report.html')}\n`);
});
