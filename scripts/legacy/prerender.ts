import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { ROUTE_META } from '../src/lib/metadata';
import puppeteer from 'puppeteer-core';

const PORT = 4173;
const DIST = 'dist';

const CANDIDATES: string[] = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

const CHROME_PATH = CANDIDATES.find(existsSync);
if (!CHROME_PATH) {
  console.error('✗ No Chromium-based browser found.');
  console.error('  Install Chrome, Edge, or Brave, or install Playwright browsers:');
  console.error('    npx playwright install chromium');
  process.exit(1);
}
console.log(`✓ Using ${CHROME_PATH}`);

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  let pathname = req.url!.split('?')[0];
  if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  if (pathname === '') pathname = '/';

  let filePath = join(DIST, pathname);

  if (!extname(filePath)) {
    const withIndex = join(filePath, 'index.html');
    const withoutSlash = join(DIST, pathname.slice(1) || 'index.html');
    if (existsSync(withIndex)) {
      filePath = withIndex;
    } else if (existsSync(withoutSlash)) {
      filePath = withoutSlash;
    }
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    const index = readFileSync(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
  }
});

server.listen(PORT, async () => {
  console.log(`✓ Server on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const [routePath] of Object.entries(ROUTE_META)) {
    const url = `http://localhost:${PORT}${routePath}?demo=1`;
    console.log(`  Rendering ${routePath}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      await page.waitForFunction(
        () => !document.getElementById('loading-splash') && document.querySelector('#root > div'),
        { timeout: 15000 },
      );

      await new Promise(r => setTimeout(r, 3000));

      const renderedHtml = await page.content();

      const bodyMatch = renderedHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (!bodyMatch) {
        console.log(`    ✗ no body`);
        continue;
      }

      const renderedBody = bodyMatch[1];

      const isRoot = routePath === '/';
      const outFile = isRoot
        ? join(DIST, 'index.html')
        : join(DIST, routePath.slice(1), 'index.html');

      if (!existsSync(outFile)) {
        console.log(`    ✗ ${outFile} not found`);
        continue;
      }

      const existingHtml = readFileSync(outFile, 'utf-8');
      const updatedHtml = existingHtml.replace(
        /(<body[^>]*>)[\s\S]*(<\/body>)/i,
        `$1${renderedBody}$2`,
      );

      writeFileSync(outFile, updatedHtml, 'utf-8');
      console.log(`    ✓ body updated`);
    } catch (err) {
      console.log(`    ✗ ${err}`);
    }
  }

  await browser.close();
  server.close();
  console.log('✓ All pages prerendered');
});
