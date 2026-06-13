import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Determine source directory: either dist/client/ (Worker mode) or dist/ (flat mode)
const SRC = existsSync(join(DIST, 'client')) ? join(DIST, 'client') : DIST;

if (!existsSync(SRC)) {
  console.error('✗ dist/ or dist/client/ not found');
  process.exit(1);
}

const spaIndex = join(SRC, 'index.html');
if (!existsSync(spaIndex)) {
  console.error('✗ index.html not found at', spaIndex);
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

// 1. Generate static SPA route files (for Cloudflare Pages deep-link support)
let count = 0;
for (const route of SPA_ROUTES) {
  const dir = join(SRC, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), readFileSync(spaIndex));
  count++;
}
console.log(`✓ ${count} SPA route files generated`);

// 2. Read SPA index.html for Worker embedding at root
const SPA_HTML = readFileSync(spaIndex, 'utf-8');
console.log('✓ index.html read for Worker embedding at root');

// 3. Copy public/ files not handled by Vite
for (const file of ['robots.txt', 'sitemap.xml', 'logo.png']) {
  const src = join(ROOT, 'public', file);
  const dst = join(SRC, file);
  if (existsSync(src) && !existsSync(dst)) {
    cpSync(src, dst);
  }
}

// 4. Generate Worker that serves SPA at root (no edge cache)
const escapedHtml = JSON.stringify(SPA_HTML);
const workerCode = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(${escapedHtml}, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'no-cache, no-store, must-revalidate',
          'pragma': 'no-cache',
          'expires': '0',
        },
      });
    }
    try {
      return await env.ASSETS.fetch(request);
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }
  }
};`;
writeFileSync(join(SRC, '_worker.mjs'), workerCode);

// 5. Add main field to wrangler.json so the Worker is used
const wranglerPath = join(DIST, 'wrangler.json');
if (existsSync(wranglerPath)) {
  const wrangler = JSON.parse(readFileSync(wranglerPath, 'utf-8'));
  wrangler.main = './_worker.mjs';
  writeFileSync(wranglerPath, JSON.stringify(wrangler));
  console.log('✓ _worker.mjs generated with no-cache headers for root');
} else {
  console.warn('⚠ wrangler.json not found in dist/ — skipping worker config');
}
