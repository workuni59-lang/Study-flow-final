import { ROUTE_META } from '../src/lib/metadata';
import { writeFileSync } from 'fs';

const DOMAIN = process.env.STUDYFLOW_DOMAIN || 'https://studyflow.space';
const TODAY = new Date().toISOString().split('T')[0];

const entries = Object.entries(ROUTE_META).map(([path, meta]) => {
  const loc = path === '/' ? DOMAIN : `${DOMAIN}${path}`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

writeFileSync('public/sitemap.xml', sitemap, 'utf-8');
console.log('✓ public/sitemap.xml written');

const robots = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;

writeFileSync('public/robots.txt', robots, 'utf-8');
console.log('✓ public/robots.txt written');
