import { writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DOMAIN = process.env.STUDYFLOW_DOMAIN || 'https://studyflow.space';
const TODAY = new Date().toISOString().split('T')[0];

interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: string;
}

// Marketing URLs only — Google does not need app/internal routes indexed
const entries: SitemapEntry[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/flip-clock/', priority: 0.9, changefreq: 'monthly' },
  { path: '/aesthetic-stopwatch/', priority: 0.9, changefreq: 'monthly' },
  { path: '/studyflow-focus-timer/', priority: 0.9, changefreq: 'weekly' },
  { path: '/pomodoro-timer/', priority: 0.9, changefreq: 'monthly' },
  { path: '/study-timer/', priority: 0.9, changefreq: 'monthly' },
  { path: '/study-planner/', priority: 0.9, changefreq: 'monthly' },
];

// Auto-discover blog posts from public/blog/
const publicBlog = join(process.cwd(), 'public', 'blog');
if (existsSync(publicBlog)) {
  const slugs = readdirSync(publicBlog, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(publicBlog, d.name, 'index.html')))
    .map(d => d.name)
    .sort();
  for (const slug of slugs) {
    entries.push({ path: `/blog/${slug}/`, priority: 0.7, changefreq: 'monthly' });
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${DOMAIN}${e.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`✓ public/sitemap.xml written (${entries.length} URLs)`);

const robots = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;

writeFileSync(join(process.cwd(), 'public', 'robots.txt'), robots, 'utf-8');
console.log('✓ public/robots.txt written');
