import { ROUTE_META } from '../src/lib/metadata';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DOMAIN = process.env.STUDYFLOW_DOMAIN || 'https://studyflow.space';

const DIST = 'dist';
const INDEX_HTML = join(DIST, 'index.html');

if (!existsSync(INDEX_HTML)) {
  console.error('✗ dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const sourceHtml = readFileSync(INDEX_HTML, 'utf-8');

for (const [routePath, meta] of Object.entries(ROUTE_META)) {
  let html = sourceHtml;

  if (routePath === '/') {
    html = injectMeta(html, meta, `${DOMAIN}/`);
    writeFileSync(INDEX_HTML, html, 'utf-8');
    console.log(`✓ ${INDEX_HTML} updated`);
    continue;
  }

  const dir = join(DIST, routePath.slice(1));
  mkdirSync(dir, { recursive: true });

  html = injectMeta(html, meta, `${DOMAIN}${routePath}`);

  const outPath = join(dir, 'index.html');
  writeFileSync(outPath, html, 'utf-8');
  console.log(`✓ ${outPath} written`);
}

function injectMeta(html: string, meta: { title: string; description: string }, url: string): string {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);

  const descPattern = /<meta name="description"[^>]*\/?>/i;
  const descTag = `<meta name="description" content="${escapeAttr(meta.description)}">`;
  if (descPattern.test(html)) {
    html = html.replace(descPattern, descTag);
  } else {
    html = html.replace('</head>', `  ${descTag}\n</head>`);
  }

  const headTags = [
    `<meta property="og:title" content="${escapeAttr(meta.title)}">`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}">`,
    `<meta property="og:url" content="${escapeAttr(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:image" content="${DOMAIN}/logo.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}">`,
  ];

  for (const tag of headTags) {
    const attrName = tag.startsWith('<meta property') ? 'property' : 'name';
    const attrValue = tag.match(new RegExp(`${attrName}="([^"]+)"`))?.[1];
    if (attrValue) {
      const pattern = new RegExp(`<meta ${attrName}="${escapeRegex(attrValue)}"[^>]*\/?>`, 'i');
      if (pattern.test(html)) {
        html = html.replace(pattern, tag);
        continue;
      }
    }
    html = html.replace('</head>', `  ${tag}\n</head>`);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url,
    isPartOf: {
      '@type': 'WebApplication',
      name: 'Study Flow',
      description: 'A gamified productivity platform for students to focus, track, and level up their studies.',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: DOMAIN,
    },
  };

  const jsonLdTag = `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;

  const jsonLdPattern = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  if (jsonLdPattern.test(html)) {
    html = html.replace(jsonLdPattern, jsonLdTag);
  } else {
    html = html.replace('</head>', `${jsonLdTag}\n</head>`);
  }

  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
