#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const [title, description, slug] = process.argv.slice(2);

if (!title || !slug) {
  console.error('Usage: node scripts/create-post.mjs "Title" "Description" "post-slug"');
  process.exit(1);
}

const date = new Date().toISOString().split('T')[0];
const dir = resolve(__dirname, '..', 'public', 'blog', slug);

if (existsSync(dir)) {
  console.error(`✗ public/blog/${slug}/ already exists`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} — StudyFlow</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="https://studyflow.space/blog/${slug}/" />

    <meta property="og:title" content="${title} — StudyFlow" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="https://studyflow.space/blog/${slug}/" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="https://studyflow.space/logo.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} — StudyFlow" />
    <meta name="twitter:description" content="${description}" />

    <link rel="icon" type="image/png" href="/logo.png" />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${title}",
      "description": "${description}",
      "datePublished": "${date}",
      "author": {
        "@type": "Organization",
        "name": "StudyFlow"
      }
    }
    </script>
  </head>
  <body>
    <article>
      <header>
        <h1>${title}</h1>
        <time datetime="${date}">${date}</time>
      </header>

      <!-- TODO: write 2,000+ words of article content -->

      <footer>
        <hr />
        <p><a href="/studyflow-focus-timer/">Try StudyFlow free</a></p>
      </footer>
    </article>
  </body>
</html>
`;

writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
console.log(`✓ Created public/blog/${slug}/index.html`);
