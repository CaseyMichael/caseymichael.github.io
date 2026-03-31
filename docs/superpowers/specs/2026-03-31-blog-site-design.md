# Blog Site Design — seekmore.xyz

**Date:** 2026-03-31
**Repo:** caseymichael.github.io
**Domain:** seekmore.xyz (GitHub Pages)

## Overview

A static personal blog for tech, coding, and developer tools content. Built with plain HTML & CSS, a custom Node.js build script, and no framework. Posts are written in Markdown with YAML frontmatter and compiled to HTML at build time.

## File Structure

```
caseymichael.github.io/
├── posts/
│   └── YYYY-MM-slug.md          # markdown source files
├── templates/
│   ├── index.html               # homepage template
│   └── post.html                # single post template
├── css/
│   └── style.css                # tokyo night theme
├── dist/                        # generated output (committed for GH Pages)
│   ├── index.html
│   ├── tags/
│   │   └── <tag>/index.html     # one page per tag
│   └── posts/
│       └── <slug>/index.html    # one page per post
├── build.js                     # build + watch + dev server
└── package.json
```

## Post Frontmatter Format

```markdown
---
title: Why I switched to Neovim
date: 2026-03-15
tags: [tooling, neovim]
excerpt: After years of VSCode, I made the jump...
---

Post content here...
```

## Build Script (`build.js`)

Three modes:

| Command | Behavior |
|---|---|
| `node build.js` | One-shot build: reads `posts/*.md`, writes `dist/` |
| `node build.js --watch` | Watches `posts/` and `templates/` for changes, rebuilds on save, serves on `localhost:3000` |
| GitHub Actions | Runs `node build.js` on push to `main`, deploys `dist/` to GitHub Pages |

**Dependencies:**
- `marked` — Markdown to HTML
- `gray-matter` — YAML frontmatter parsing
- Node's built-in `http` module — dev server (no extra dep)

## Pages

- **Homepage** (`/`) — chronological feed, each entry shows title + date + excerpt + tags
- **Post page** (`/posts/<slug>/`) — full post content with tags, title, date, read-time estimate
- **Tag page** (`/tags/<tag>/`) — filtered list of posts with that tag, same feed layout as homepage

No about page. No comments. No JS in the browser (all static).

## Design

**Theme:** Tokyo Night
**Font:** Monospace throughout (`font-family: monospace`)
**Colors:**
- Background: `#1a1b26`
- Surface: `#16161e`
- Border: `#292e42`
- Foreground: `#c0caf5`
- Dimmed text: `#565f89`
- Body text: `#a9b1d6`
- Accent blue: `#7aa2f7`
- Accent cyan: `#7dcfff`
- Accent green: `#9ece6a`
- Accent purple: `#bb9af7`

**Layout:** Centered single column, max-width 680px for post content. Navigation bar at top with site name + back link on post pages.

**Tags:** Displayed as small pill badges using accent colors. Each tag links to its tag page.

**Code blocks:** Dark surface (`#16161e`), green syntax color, monospace, border `#292e42`.

## Deployment

GitHub Actions workflow: on push to `main`, run `node build.js`, then push the contents of `dist/` to the `gh-pages` branch using `peaceiris/actions-gh-pages`. GitHub Pages is configured to serve from `gh-pages`. The `dist/` directory is gitignored on `main`.

## Out of Scope

- About page
- Comments
- Search
- RSS feed (can be added later)
- Any client-side JavaScript
