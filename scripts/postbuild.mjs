import { existsSync, mkdirSync, cpSync, renameSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
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
  if (existsSync(src)) {
    cpSync(src, dst);
    console.log(`✓ Copied ${file}`);
  }
}

// 4. Copy blog directory to dist (handles nested subdirectories and their index.html files)
const blogSrc = join(ROOT, 'public', 'blog');
const blogDst = join(SRC, 'blog');
if (existsSync(blogSrc)) {
  // Remove existing blog dir if present
  if (existsSync(blogDst)) rmSync(blogDst, { recursive: true, force: true });
  const copyRecursive = (src, dst) => {
    mkdirSync(dst, { recursive: true });
    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const s = join(src, entry.name);
      const d = join(dst, entry.name);
      if (entry.isDirectory()) copyRecursive(s, d);
      else cpSync(s, d);
    }
  };
  copyRecursive(blogSrc, blogDst);
  console.log('✓ Copied blog/ to dist/');
}

// 4. Remove Worker config from wrangler.json (no more _worker.mjs)
const wranglerPath = join(DIST, 'wrangler.json');
if (existsSync(wranglerPath)) {
  const wrangler = JSON.parse(readFileSync(wranglerPath, 'utf-8'));
  delete wrangler.main;
  writeFileSync(wranglerPath, JSON.stringify(wrangler, null, 2));
  console.log('✓ Removed Worker main from wrangler.json');
}

// 5. Patch SW precache manifest: remove root index.html (now landing page) and landing/ pages
const swPath = join(SRC, 'sw.js');
if (existsSync(swPath)) {
  let sw = readFileSync(swPath, 'utf-8');
  sw = sw.replace(/\{url:"index\.html",revision:"[^"]+"},?/g, '');
  sw = sw.replace(/\{url:"landing\/[^"]+",revision:"[^"]+"},?/g, '');
  // Also remove standalone tool pages from precache (not part of PWA)
  for (const subdir of ['flip-clock', 'pomodoro-timer', 'study-timer', 'study-planner', 'study-with-me', 'aesthetic-stopwatch', 'studyflow-focus-timer', 'blog']) {
    sw = sw.replace(new RegExp(`\\{url:"${subdir}\\/index\\.html",revision:"[^"]+"},?`, 'g'), '');
  }
  writeFileSync(swPath, sw);
  console.log('✓ Patched sw.js precache manifest');
}

// 6. Update manifest.webmanifest: set start_url to /app/
const manifestPath = join(SRC, 'manifest.webmanifest');
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  manifest.start_url = '/app/';
  writeFileSync(manifestPath, JSON.stringify(manifest));
  console.log('✓ Updated manifest.webmanifest start_url → /app/');
}

console.log('✓ Postbuild complete — SPA at /app/, landing at /, no Worker');
