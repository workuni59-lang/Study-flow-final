import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Determine source directory: either dist/client/ (Worker mode) or dist/ (flat mode)
const SRC = existsSync(join(DIST, 'client')) ? join(DIST, 'client') : DIST;
const APP = join(SRC, 'app');

if (!existsSync(SRC)) {
  console.error('✗ dist/ or dist/client/ not found');
  process.exit(1);
}

const SPA_ROUTES = [
  'pomodoro',
  'analytics', 'progress', 'quests', 'subjects',
  'achievements', 'leaderboard', 'settings', 'themes',
  'focus',
  'reset-password',
  'focus/pomodoro', 'focus/stopwatch', 'focus/deep', 'focus/flow',
  'focus/tasks', 'focus/ambience', 'focus/notes', 'focus/themes',
  'tasks', 'ambience', 'notes', 'themes',
];

// 1. Move SRC/assets/ → SRC/app/assets/
const assetsSrc = join(SRC, 'assets');
if (existsSync(assetsSrc)) {
  mkdirSync(APP, { recursive: true });
  cpSync(assetsSrc, join(APP, 'assets'), { recursive: true });
  rmSync(assetsSrc, { recursive: true });
  console.log('✓ assets/ → app/assets/');
}

// 2. Move SRC/index.html → SRC/app/index.html
const spaSrc = join(SRC, 'index.html');
if (!existsSync(spaSrc)) {
  console.error('✗ index.html not found');
  process.exit(1);
}
const appIndex = join(APP, 'index.html');
cpSync(spaSrc, appIndex);
rmSync(spaSrc);
console.log('✓ index.html → app/index.html');

// 3. Generate static SPA route files
let count = 0;
for (const route of SPA_ROUTES) {
  const dir = join(APP, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), readFileSync(appIndex));
  count++;
}
console.log(`✓ ${count} SPA route files generated`);

// 4. Copy marketing landing page
const marketingSrc = join(ROOT, 'marketing', 'index.html');
const marketingDst = join(SRC, 'index.html');
if (existsSync(marketingSrc)) {
  cpSync(marketingSrc, marketingDst);
  console.log('✓ marketing/index.html → index.html');
}

// 5. Copy public/ files not handled by Vite
for (const file of ['robots.txt', 'sitemap.xml', 'logo.png']) {
  const src = join(ROOT, 'public', file);
  const dst = join(SRC, file);
  if (existsSync(src) && !existsSync(dst)) {
    cpSync(src, dst);
  }
}
