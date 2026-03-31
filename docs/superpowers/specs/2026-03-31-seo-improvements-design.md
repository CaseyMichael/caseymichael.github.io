# SEO Improvements — Design Spec

**Date:** 2026-03-31
**Repo:** caseymichael.github.io
**Status:** Approved

---

## Overview

Add foundational SEO signals to seekmore.xyz. The site is a custom Node.js static site generator (`build.js`) producing plain HTML from Markdown posts. All changes are confined to `build.js` and the two HTML templates (`templates/index.html`, `templates/post.html`).

---

## Changes

### 1. Meta Descriptions

- Add `{{meta_description}}` slot to both templates, rendered as:
  `<meta name="description" content="{{meta_description}}">`
- Post pages: use the post's `excerpt` frontmatter field.
- Homepage: hardcoded description, e.g. `"Notes on tools, terminal setups, and the craft of software."`
- Tag pages: dynamically generated, e.g. `"Posts tagged '${tag}' on seekmore.xyz."`

### 2. Open Graph + Twitter Card Tags

Add to `<head>` in both templates:

```html
<meta property="og:title" content="{{og_title}}">
<meta property="og:description" content="{{og_description}}">
<meta property="og:type" content="{{og_type}}">
<meta property="og:url" content="{{canonical_url}}">
<meta name="twitter:card" content="summary">
```

- Post pages: `og:type = "article"`, title/description from post data.
- Index/tag pages: `og:type = "website"`, site-level title/description.
- `og_title` and `og_description` use the same values as `<title>` and `meta_description`.

### 3. Canonical Tags

Add to `<head>` in both templates:
```html
<link rel="canonical" href="{{canonical_url}}">
```

- A `BASE_URL` constant (`"https://seekmore.xyz"`) is defined in `build.js`.
- Post pages: `${BASE_URL}/posts/${post.slug}/`
- Homepage: `${BASE_URL}/`
- Tag pages: `${BASE_URL}/tags/${tag}/`

### 4. XML Sitemap

- Generate `dist/sitemap.xml` at the end of `build()`.
- Includes one `<url>` per page: homepage, each post page, each tag page.
- Uses `<loc>` with full absolute URLs. No `<lastmod>` (not reliably available).
- Standard sitemap 0.9 format.

### 5. RSS Feed

- Generate `dist/feed.xml` (RSS 2.0) from all posts, newest first.
- Each item includes `<title>`, `<link>`, `<description>` (excerpt), and `<pubDate>`.
- Add to `<head>` in both templates:
  `<link rel="alternate" type="application/rss+xml" title="seekmore.xyz" href="/feed.xml">`

### 6. `noindex` on Tag Pages

- Add `{{robots_meta}}` slot to the index template.
- Tag pages: render as `<meta name="robots" content="noindex, follow">`.
- Homepage: render as empty string (no robots tag = default indexing behavior).

### 7. H1 on Homepage

- In `templates/index.html`, change `<p class="page-heading">` to `<h1 class="page-heading">`.
- CSS adjustment may be needed to preserve visual appearance (currently styled as `p.page-heading`).

---

## Constants Added to `build.js`

```js
const BASE_URL = 'https://seekmore.xyz';
const SITE_DESCRIPTION = 'Notes on tools, terminal setups, and the craft of software.';
const SITE_TITLE = 'seekmore.xyz';
```

---

## Files Changed

| File | Change |
|------|--------|
| `build.js` | Add `BASE_URL`, `SITE_DESCRIPTION`, `SITE_TITLE` constants; pass new template vars; add `buildSitemap()` and `buildFeed()` functions called from `build()` |
| `templates/index.html` | Add meta description, OG tags, canonical, RSS link, robots slot; change `<p>` to `<h1>` |
| `templates/post.html` | Add meta description, OG tags, canonical, RSS link |
| `css/style.css` | Update `.page-heading` selector if needed (add `h1` selector) |

---

## Out of Scope

- Images / og:image (no images on the site currently)
- Google Search Console registration (manual step for the user)
- Structured data / JSON-LD (low priority for a personal blog at this stage)
