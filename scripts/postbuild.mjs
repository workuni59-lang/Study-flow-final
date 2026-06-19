import { existsSync, mkdirSync, cpSync, renameSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

const SRC = existsSync(join(DIST, 'client')) ? join(DIST, 'client') : DIST;

if (!existsSync(SRC)) {
  console.error('✗ dist/ or dist/client/ not found');
  process.exit(1);
}

// 1. Move SPA entry from root to /app/
const spaIndex = join(SRC, 'index.html');
if (!existsSync(spaIndex)) {
  console.error('✗ index.html not found at', spaIndex);
  process.exit(1);
}
const appDir = join(SRC, 'app');
mkdirSync(appDir, { recursive: true });
renameSync(spaIndex, join(appDir, 'index.html'));
console.log('✓ SPA moved to /app/index.html');

// 2. Copy landing page from /landing/ to root
const landingSrc = join(SRC, 'landing', 'index.html');
if (existsSync(landingSrc)) {
  cpSync(landingSrc, join(SRC, 'index.html'));
  // Clean up the landing directory
  rmSync(join(SRC, 'landing'), { recursive: true, force: true });
  console.log('✓ Landing page copied to root');
} else {
  console.warn('⚠ landing/index.html not found — root will serve SPA fallback');
}

// 3. Ensure public files not handled by Vite exist in dist
for (const file of ['robots.txt', 'sitemap.xml', 'logo.png', '_headers', '_redirects']) {
  const src = join(ROOT, 'public', file);
  const dst = join(SRC, file);
  if (existsSync(src) && !existsSync(dst)) {
    cpSync(src, dst);
    console.log(`✓ Copied ${file}`);
  }
}

// 4. Remove Worker config from wrangler.json (no more _worker.mjs)
const wranglerPath = join(DIST, 'wrangler.json');
if (existsSync(wranglerPath)) {
  const wrangler = JSON.parse(readFileSync(wranglerPath, 'utf-8'));
  delete wrangler.main;
  writeFileSync(wranglerPath, JSON.stringify(wrangler, null, 2));
  console.log('✓ Removed Worker main from wrangler.json');
}

console.log('✓ Postbuild complete — SPA at /app/, landing at /, no Worker');
