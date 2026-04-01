# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Build to dist/
npm run watch        # Build + watch + dev server at localhost:3000
npm test             # Run all tests
node --test --test-name-pattern="slug" build.test.js  # Run a single test by name
```

## Architecture

Everything lives in `build.js` — there is no framework. It exports pure functions that are tested in `build.test.js`, plus a `build()` function that orchestrates the full site build.

**Data flow:**
1. `posts/*.md` files are parsed via `parsePost()` (gray-matter for frontmatter, marked for HTML)
2. HTML is rendered by replacing `{{token}}` placeholders in `templates/index.html` and `templates/post.html`
3. Output is written to `dist/` (gitignored)

**What `build()` produces in `dist/`:**
- `index.html` — all posts
- `posts/<slug>/index.html` — individual post pages (slug = filename minus date prefix)
- `tags/<tag>/index.html` — tag archive pages (noindexed)
- `sitemap.xml`, `feed.xml`, `robots.txt`

## Hosting constraints

- Deployed to **pure GitHub Pages** — no CDN or Cloudflare in front
- GitHub Pages serves `.xml` as `application/xml` and this cannot be overridden (`_headers` files are ignored)
- `robots.txt` must be present in `dist/` for Google Search Console to read the sitemap
