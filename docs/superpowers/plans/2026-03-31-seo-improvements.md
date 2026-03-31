# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add foundational SEO signals (meta descriptions, Open Graph tags, canonical URLs, sitemap, RSS feed, noindex on tag pages, H1 on homepage) to seekmore.xyz.

**Architecture:** All changes live in `build.js` (the Node.js SSG) and the two HTML templates. `build.js` exports pure functions testable with Node's built-in test runner. New generator functions (`buildSitemap`, `buildFeed`) are added alongside the existing `build()` function.

**Tech Stack:** Node.js (ESM), `gray-matter`, `marked`, Node built-in test runner (`node:test`)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `build.js` | Modify | Add constants, new template vars, `buildSitemap()`, `buildFeed()` |
| `templates/index.html` | Modify | Add meta/OG/canonical/RSS slots, `{{robots_meta}}`, change `<p>` → `<h1>` |
| `templates/post.html` | Modify | Add meta/OG/canonical/RSS slots |
| `css/style.css` | Modify | Add `h1.page-heading` selector to preserve visual style |
| `build.test.js` | Modify | Add tests for new exported functions |

---

## Task 1: Add site-level constants and update index template

**Files:**
- Modify: `build.js`
- Modify: `templates/index.html`
- Modify: `css/style.css`

- [ ] **Step 1: Update `templates/index.html`**

Replace the entire file with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{page_title}}</title>
  <meta name="description" content="{{meta_description}}">
  {{robots_meta}}
  <meta property="og:title" content="{{page_title}}">
  <meta property="og:description" content="{{meta_description}}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{canonical_url}}">
  <meta name="twitter:card" content="summary">
  <link rel="canonical" href="{{canonical_url}}">
  <link rel="alternate" type="application/rss+xml" title="seekmore.xyz" href="/feed.xml">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/" class="site-title">seekmore.xyz</a>
  </nav>
  <main>
    <h1 class="page-heading">{{page_heading}}</h1>
    {{posts_html}}
  </main>
</body>
</html>
```

- [ ] **Step 2: Update `css/style.css` — add `h1` to the `.page-heading` rule**

Find the existing rule:
```css
.page-heading {
```

The selector currently targets any element with the class. Since we're changing `<p>` to `<h1>`, browsers will apply default h1 margins/font-size. Add a reset inside the rule by ensuring the existing properties already override those (they do via `font-size: 0.75rem` and `margin-bottom: 32px`), but add `font-weight: 600` is already there. The only concern is browser default `h1` `display: block` and top margin. Add an explicit top margin reset:

Replace:
```css
.page-heading {
  color: #565f89;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 32px;
}
```

With:
```css
.page-heading {
  color: #565f89;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 0;
  margin-bottom: 32px;
}
```

- [ ] **Step 3: Add constants to `build.js`**

After the `TAG_COLORS` line (line 8), add:

```js
const BASE_URL = 'https://seekmore.xyz';
const SITE_TITLE = 'seekmore.xyz';
const SITE_DESCRIPTION = 'Notes on tools, terminal setups, and the craft of software.';
```

- [ ] **Step 4: Update the homepage build in `build()`**

Find the homepage build block in `build.js`:
```js
  // Build homepage
  const homepageHtml = renderTemplate(indexTemplate, {
    page_title: 'seekmore.xyz',
    page_heading: 'all posts',
    posts_html: posts.map(renderPostCard).join('\n'),
  });
  writeFile(path.join(DIST_DIR, 'index.html'), homepageHtml);
```

Replace with:
```js
  // Build homepage
  const homepageHtml = renderTemplate(indexTemplate, {
    page_title: SITE_TITLE,
    page_heading: 'all posts',
    posts_html: posts.map(renderPostCard).join('\n'),
    meta_description: SITE_DESCRIPTION,
    canonical_url: `${BASE_URL}/`,
    robots_meta: '',
  });
  writeFile(path.join(DIST_DIR, 'index.html'), homepageHtml);
```

- [ ] **Step 5: Update the tag page build in `build()`**

Find the tag page build block:
```js
  for (const [tag, tagPosts] of tagMap) {
    const tagHtml = renderTemplate(indexTemplate, {
      page_title: `${tag} — seekmore.xyz`,
      page_heading: `tagged: ${tag}`,
      posts_html: tagPosts.map(renderPostCard).join('\n'),
    });
    writeFile(path.join(DIST_DIR, 'tags', tag, 'index.html'), tagHtml);
  }
```

Replace with:
```js
  for (const [tag, tagPosts] of tagMap) {
    const tagHtml = renderTemplate(indexTemplate, {
      page_title: `${tag} — seekmore.xyz`,
      page_heading: `tagged: ${tag}`,
      posts_html: tagPosts.map(renderPostCard).join('\n'),
      meta_description: `Posts tagged '${tag}' on seekmore.xyz.`,
      canonical_url: `${BASE_URL}/tags/${tag}/`,
      robots_meta: '<meta name="robots" content="noindex, follow">',
    });
    writeFile(path.join(DIST_DIR, 'tags', tag, 'index.html'), tagHtml);
  }
```

- [ ] **Step 6: Build and verify**

```bash
cd ~/Github/caseymichael.github.io && node build.js
```

Expected output:
```
Building...
Built 2 post(s), 2 tag page(s).
```

Check `dist/index.html` contains `<h1 class="page-heading">` and the meta tags:
```bash
grep -n "page-heading\|meta_description\|canonical\|og:title\|robots" dist/index.html
```

Check a tag page:
```bash
grep -n "noindex\|canonical\|og:" dist/tags/meta/index.html
```

- [ ] **Step 7: Commit**

```bash
cd ~/Github/caseymichael.github.io
git add build.js templates/index.html css/style.css
git commit -m "feat: add meta description, OG tags, canonical, noindex to index/tag pages; h1 heading"
```

---

## Task 2: Update post template with meta/OG/canonical tags

**Files:**
- Modify: `build.js`
- Modify: `templates/post.html`

- [ ] **Step 1: Update `templates/post.html`**

Replace the entire file with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — seekmore.xyz</title>
  <meta name="description" content="{{meta_description}}">
  <meta property="og:title" content="{{title}} — seekmore.xyz">
  <meta property="og:description" content="{{meta_description}}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{{canonical_url}}">
  <meta name="twitter:card" content="summary">
  <link rel="canonical" href="{{canonical_url}}">
  <link rel="alternate" type="application/rss+xml" title="seekmore.xyz" href="/feed.xml">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/" class="site-title">seekmore.xyz</a>
    <a href="/" class="back-link">← all posts</a>
  </nav>
  <main>
    <article>
      <div class="tags">{{tags_html}}</div>
      <h1 class="post-title">{{title}}</h1>
      <p class="post-meta">{{date}} · {{read_time}}</p>
      <div class="post-content">{{content}}</div>
    </article>
  </main>
</body>
</html>
```

- [ ] **Step 2: Update the post build loop in `build.js`**

Find:
```js
  // Build individual post pages
  for (const post of posts) {
    const tagsHtml = post.tags.map(renderTagBadge).join('');
    const html = renderTemplate(postTemplate, {
      title: post.title,
      date: post.date,
      read_time: post.readTime,
      tags_html: tagsHtml,
      content: post.content,
    });
    writeFile(path.join(DIST_DIR, 'posts', post.slug, 'index.html'), html);
  }
```

Replace with:
```js
  // Build individual post pages
  for (const post of posts) {
    const tagsHtml = post.tags.map(renderTagBadge).join('');
    const html = renderTemplate(postTemplate, {
      title: post.title,
      date: post.date,
      read_time: post.readTime,
      tags_html: tagsHtml,
      content: post.content,
      meta_description: post.excerpt,
      canonical_url: `${BASE_URL}/posts/${post.slug}/`,
    });
    writeFile(path.join(DIST_DIR, 'posts', post.slug, 'index.html'), html);
  }
```

- [ ] **Step 3: Build and verify**

```bash
cd ~/Github/caseymichael.github.io && node build.js
```

Check a post page:
```bash
grep -n "og:\|canonical\|description\|twitter" dist/posts/stop-vibing/index.html
```

Expected: lines for `og:title`, `og:description`, `og:type` (article), `og:url`, `twitter:card`, `canonical`, `meta name="description"`.

- [ ] **Step 4: Commit**

```bash
cd ~/Github/caseymichael.github.io
git add build.js templates/post.html
git commit -m "feat: add meta description, OG/Twitter tags, and canonical to post pages"
```

---

## Task 3: Generate XML sitemap

**Files:**
- Modify: `build.js`
- Modify: `build.test.js`

- [ ] **Step 1: Write the failing test**

Add to `build.test.js`:

```js
import { buildSitemapXml } from './build.js';

test('buildSitemapXml includes homepage URL', () => {
  const xml = buildSitemapXml(['https://seekmore.xyz/', 'https://seekmore.xyz/posts/hello/']);
  assert.ok(xml.includes('<loc>https://seekmore.xyz/</loc>'));
});

test('buildSitemapXml includes all provided URLs', () => {
  const urls = ['https://seekmore.xyz/', 'https://seekmore.xyz/posts/hello/'];
  const xml = buildSitemapXml(urls);
  for (const url of urls) {
    assert.ok(xml.includes(`<loc>${url}</loc>`), `missing ${url}`);
  }
});

test('buildSitemapXml produces valid sitemap envelope', () => {
  const xml = buildSitemapXml([]);
  assert.ok(xml.includes('<?xml version="1.0"'));
  assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  assert.ok(xml.includes('</urlset>'));
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd ~/Github/caseymichael.github.io && node --test build.test.js 2>&1 | tail -20
```

Expected: failures about `buildSitemapXml` not being exported.

- [ ] **Step 3: Implement `buildSitemapXml` in `build.js`**

Add this exported function near the other utility functions (before the `POSTS_DIR` constant block):

```js
/**
 * Builds a sitemap XML string from an array of absolute URLs.
 */
export function buildSitemapXml(urls) {
  const urlEntries = urls
    .map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd ~/Github/caseymichael.github.io && node --test build.test.js 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Call `buildSitemapXml` from `build()`**

At the end of `build()`, before `console.log(...)`, add:

```js
  // Build sitemap
  const allUrls = [
    `${BASE_URL}/`,
    ...posts.map(p => `${BASE_URL}/posts/${p.slug}/`),
    ...[...tagMap.keys()].map(tag => `${BASE_URL}/tags/${tag}/`),
  ];
  writeFile(path.join(DIST_DIR, 'sitemap.xml'), buildSitemapXml(allUrls));
```

- [ ] **Step 6: Build and verify**

```bash
cd ~/Github/caseymichael.github.io && node build.js && cat dist/sitemap.xml
```

Expected output resembles:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seekmore.xyz/</loc>
  </url>
  <url>
    <loc>https://seekmore.xyz/posts/stop-vibing/</loc>
  </url>
  ...
</urlset>
```

- [ ] **Step 7: Commit**

```bash
cd ~/Github/caseymichael.github.io
git add build.js build.test.js
git commit -m "feat: generate sitemap.xml during build"
```

---

## Task 4: Generate RSS feed

**Files:**
- Modify: `build.js`
- Modify: `build.test.js`

- [ ] **Step 1: Write the failing test**

Add to `build.test.js`:

```js
import { buildRssFeed } from './build.js';

test('buildRssFeed includes channel title and link', () => {
  const xml = buildRssFeed([]);
  assert.ok(xml.includes('<title>seekmore.xyz</title>'));
  assert.ok(xml.includes('<link>https://seekmore.xyz/</link>'));
});

test('buildRssFeed includes item for each post', () => {
  const posts = [
    { title: 'Hello World', slug: 'hello-world', excerpt: 'Intro post.', date: 'March 31, 2026' },
  ];
  const xml = buildRssFeed(posts);
  assert.ok(xml.includes('<title>Hello World</title>'));
  assert.ok(xml.includes('<link>https://seekmore.xyz/posts/hello-world/</link>'));
  assert.ok(xml.includes('<description>Intro post.</description>'));
});

test('buildRssFeed produces valid RSS envelope', () => {
  const xml = buildRssFeed([]);
  assert.ok(xml.includes('<?xml version="1.0"'));
  assert.ok(xml.includes('<rss version="2.0"'));
  assert.ok(xml.includes('</channel>'));
  assert.ok(xml.includes('</rss>'));
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd ~/Github/caseymichael.github.io && node --test build.test.js 2>&1 | tail -20
```

Expected: failures about `buildRssFeed` not being exported.

- [ ] **Step 3: Implement `buildRssFeed` in `build.js`**

Add this exported function after `buildSitemapXml`:

```js
/**
 * Builds an RSS 2.0 feed XML string from an array of post objects.
 * Each post needs: { title, slug, excerpt, date }
 */
export function buildRssFeed(posts) {
  const items = posts.map(post => {
    const pubDate = post.date ? new Date(post.date).toUTCString() : '';
    return [
      '    <item>',
      `      <title>${post.title}</title>`,
      `      <link>${BASE_URL}/posts/${post.slug}/</link>`,
      `      <description>${post.excerpt}</description>`,
      pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
      '    </item>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${SITE_TITLE}</title>`,
    `    <link>${BASE_URL}/</link>`,
    `    <description>${SITE_DESCRIPTION}</description>`,
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd ~/Github/caseymichael.github.io && node --test build.test.js 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Call `buildRssFeed` from `build()`**

After the sitemap block added in Task 3, add:

```js
  // Build RSS feed
  writeFile(path.join(DIST_DIR, 'feed.xml'), buildRssFeed(posts));
```

- [ ] **Step 6: Build and verify**

```bash
cd ~/Github/caseymichael.github.io && node build.js && cat dist/feed.xml
```

Expected: valid RSS XML with `<title>seekmore.xyz</title>` and `<item>` blocks for each post.

Also verify the `<link rel="alternate">` tag is present in a built page:
```bash
grep "feed.xml" dist/index.html
```

- [ ] **Step 7: Commit**

```bash
cd ~/Github/caseymichael.github.io
git add build.js build.test.js
git commit -m "feat: generate RSS feed.xml during build"
```

---

## Task 5: Final verification

- [ ] **Step 1: Run all tests**

```bash
cd ~/Github/caseymichael.github.io && node --test build.test.js
```

Expected: all tests pass, no failures.

- [ ] **Step 2: Full build check**

```bash
cd ~/Github/caseymichael.github.io && node build.js
```

Expected: `Built 2 post(s), 2 tag page(s).`

- [ ] **Step 3: Spot-check output files**

```bash
# Meta tags on homepage
grep -c "og:\|canonical\|description\|twitter\|feed.xml" dist/index.html

# H1 heading on homepage
grep "page-heading" dist/index.html

# noindex on tag page
grep "noindex" dist/tags/meta/index.html

# sitemap exists and has entries
wc -l dist/sitemap.xml

# RSS feed exists
wc -l dist/feed.xml
```

Expected:
- `og:` lines: 4+, canonical: 1, description: 1, twitter: 1, feed.xml: 1
- `<h1 class="page-heading">all posts</h1>`
- `noindex` present in tag page
- sitemap has multiple `<url>` entries
- RSS feed has multiple `<item>` entries
