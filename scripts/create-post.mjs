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
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://studyflow.space/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://studyflow.space/blog/" },
        { "@type": "ListItem", "position": 3, "name": "${title}" }
      ]
    }
    </script>

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
      },
      "publisher": {
        "@type": "Organization",
        "name": "StudyFlow",
        "logo": {
          "@type": "ImageObject",
          "url": "https://studyflow.space/logo.png"
        }
      }
    }
    </script>

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
      body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background: #fafafa; color: #1e293b; line-height: 1.6;
      }
      h1, h2, h3 { font-family: 'Outfit', 'Inter', system-ui, sans-serif; line-height: 1.15; letter-spacing: -0.02em; }
      a { color: inherit; text-decoration: none; }
      img { max-width: 100%; display: block; }
      .container { max-width: 720px; margin: 0 auto; padding: 0 24px; }

      .breadcrumb {
        max-width: 720px; margin: 24px auto 0; padding: 0 24px;
        font-size: 13px; color: #94a3b8;
      }
      .breadcrumb a { color: #6366f1; font-weight: 500; }
      .breadcrumb a:hover { text-decoration: underline; }

      .header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; max-width: 1120px; margin: 0 auto; }
      .header-logo { display: flex; align-items: center; gap: 10px; font-family: 'Outfit','Inter',sans-serif; font-weight: 700; font-size: 20px; letter-spacing: -0.3px; }
      .header-logo img { width: 32px; height: 32px; border-radius: 8px; }
      .header-nav { display: flex; align-items: center; gap: 24px; }
      .header-nav a { font-size: 14px; font-weight: 500; color: #64748b; transition: color 0.15s; }
      .header-nav a:hover { color: #6366f1; }
      .header-cta { padding: 8px 20px; background: #6366f1; color: #fff; font-size: 14px; font-weight: 600; border-radius: 10px; }
      .header-cta:hover { background: #5558e6; }

      .article-header { text-align: center; padding: 60px 24px 40px; }
      .article-header h1 { font-size: clamp(30px, 4vw, 42px); font-weight: 900; color: #0f172a; margin-bottom: 12px; max-width: 680px; margin-left: auto; margin-right: auto; }
      .article-header .meta { font-size: 14px; color: #94a3b8; display: flex; justify-content: center; gap: 16px; align-items: center; }
      .article-header .meta time { color: #64748b; }
      .article-header .meta .author { display: flex; align-items: center; gap: 6px; }
      .article-header .meta .author-icon { width: 24px; height: 24px; border-radius: 50%; background: #e0e7ff; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6366f1; font-weight: 700; }

      .content { padding: 0 24px 60px; }
      .content h2 { font-size: clamp(22px, 2.5vw, 28px); font-weight: 700; color: #0f172a; margin: 40px 0 16px; }
      .content h3 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 28px 0 12px; }
      .content p { font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 16px; }
      .content ul, .content ol { margin: 0 0 20px 24px; }
      .content li { font-size: 15px; color: #475569; line-height: 1.8; margin-bottom: 8px; }
      .content blockquote {
        margin: 24px 0; padding: 16px 24px; background: #eef2ff; border-left: 4px solid #6366f1;
        border-radius: 8px; font-style: italic; color: #334155;
      }
      .content a { color: #6366f1; font-weight: 500; text-decoration: underline; }
      .content a:hover { color: #5558e6; }

      .faq-section { padding: 60px 24px; background: #f8fafc; }
      .faq-section h2 { text-align: center; font-size: clamp(24px, 3vw, 30px); font-weight: 700; color: #0f172a; margin-bottom: 32px; }
      .faq-item { padding: 20px 0; border-bottom: 1px solid #e2e8f0; max-width: 680px; margin: 0 auto; }
      .faq-item:last-child { border-bottom: none; }
      .faq-item h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; color: #0f172a; }
      .faq-item p { font-size: 14px; color: #64748b; }

      .cta-section { text-align: center; padding: 80px 24px; background: linear-gradient(180deg, #fafafa 0%, #eef2ff 100%); }
      .cta-section h2 { font-size: clamp(26px, 3vw, 34px); margin-bottom: 12px; }
      .cta-section p { font-size: 15px; color: #64748b; margin-bottom: 28px; }
      .cta-button { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #6366f1; color: #fff; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 24px rgba(99,102,241,0.3); }
      .cta-button:hover { background: #5558e6; }

      .footer { padding: 32px 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      .footer a { color: #6366f1; font-weight: 500; }
      .footer a:hover { text-decoration: underline; }
      .footer-links { display: flex; justify-content: center; gap: 24px; margin-bottom: 12px; flex-wrap: wrap; }

      @media (max-width: 640px) {
        .article-header { padding: 40px 24px 30px; }
        .header-nav { display: none; }
      }
    </style>
  </head>
  <body>

    <header class="header">
      <a href="/" class="header-logo"><img src="/logo.png" alt="StudyFlow" width="32" height="32" />StudyFlow</a>
      <nav class="header-nav">
        <a href="/pomodoro-timer/">Pomodoro Timer</a>
        <a href="/study-timer/">Study Timer</a>
        <a href="/study-planner/">Study Planner</a>
        <a href="/app/" class="header-cta">Open App</a>
      </nav>
    </header>

    <nav class="breadcrumb">
      <a href="/">Home</a> / Blog / ${title}
    </nav>

    <article>
      <header class="article-header">
        <h1>${title}</h1>
        <div class="meta">
          <span class="author"><span class="author-icon">S</span> StudyFlow</span>
          <time datetime="${date}">${date}</time>
        </div>
      </header>

      <div class="content container">
        <!-- TODO: write 2,000+ words of article content -->
        <!-- Template sections: -->
        <!-- <h2>Introduction</h2> -->
        <!-- <p>...</p> -->
        <!-- <h2>Why this matters</h2> -->
        <!-- <p>...</p> -->
        <!-- <h2>Key takeaways</h2> -->
        <!-- <ul><li>...</li></ul> -->
        <!-- <blockquote>Quote</blockquote> -->
        <!-- <h2>Conclusion</h2> -->
        <!-- <p>...</p> -->

        <p><em>This article is in progress. Check back soon for the full guide.</em></p>
      </div>

      <section class="faq-section">
        <div class="container">
          <h2>Frequently asked questions</h2>

          <div class="faq-item">
            <h3>How does StudyFlow help with ${title.toLowerCase()}?</h3>
            <p>StudyFlow provides a focused environment with a Pomodoro timer, ambient soundscapes, and gamification to help you stay consistent. <a href="/app/">Try it free</a> — no account needed.</p>
          </div>
          <div class="faq-item">
            <h3>Is StudyFlow really free?</h3>
            <p>Yes. StudyFlow is completely free with no sign-up required. All features including the Pomodoro timer, ambient sounds, wallpapers, task management, and gamification are available without payment.</p>
          </div>
          <div class="faq-item">
            <h3>Can I use StudyFlow on mobile?</h3>
            <p>Yes. StudyFlow works on any device with a browser. You can also install it as a Progressive Web App for a native-like experience.</p>
          </div>
        </div>
      </section>
    </article>

    <section class="cta-section">
      <h2>Ready to focus?</h2>
      <p>Open StudyFlow in your browser and start your first session. No account, no credit card, no setup.</p>
      <a href="/app/" class="cta-button">Start Focusing Free</a>
    </section>

    <footer class="footer">
      <div class="footer-links">
        <a href="/">Home</a>
        <a href="/pomodoro-timer/">Pomodoro Timer</a>
        <a href="/study-timer/">Study Timer</a>
        <a href="/study-planner/">Study Planner</a>
        <a href="/studyflow-focus-timer/">StudyFlow Focus Timer</a>
      </div>
      <p>&copy; 2026 StudyFlow</p>
    </footer>

  </body>
</html>
`;

writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
console.log(`✓ Created public/blog/${slug}/index.html`);
