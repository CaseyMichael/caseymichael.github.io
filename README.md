# seekmore.xyz

A static blog generator that builds [seekmore.xyz](https://seekmore.xyz) from Markdown posts and HTML templates, deployed via GitHub Pages.

## Project structure

```
posts/          Markdown blog posts (YYYY-MM-DD-slug.md)
templates/      HTML templates (index.html, post.html)
css/            Stylesheet (style.css)
dist/           Build output (gitignored)
build.js        Build script and dev server
build.test.js   Unit tests
```

## Commands

```bash
npm run build   # Build to dist/
npm run watch   # Build, watch for changes, and start dev server at localhost:3000
npm test        # Run tests
```

## Writing posts

Create a file in `posts/` named `YYYY-MM-DD-slug.md` with frontmatter:

```markdown
---
title: My Post Title
date: 2026-01-01
tags: [tag1, tag2]
excerpt: A short description shown in post cards.
---

Post content here...
```

The filename date prefix determines sort order; the slug (everything after the date prefix) becomes the URL path at `/posts/slug/`.

## Build output

`build.js` produces:

- `/index.html` — homepage listing all posts
- `/posts/<slug>/index.html` — individual post pages
- `/tags/<tag>/index.html` — tag archive pages (noindexed)
- `/sitemap.xml` — sitemap for search engines
- `/feed.xml` — RSS feed
- `/robots.txt` — allows all crawlers and references the sitemap
