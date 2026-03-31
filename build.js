// build.js
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TAG_COLORS = ['#7aa2f7', '#7dcfff', '#9ece6a', '#bb9af7', '#ff9e64', '#e0af68'];

const BASE_URL = 'https://seekmore.xyz';
const SITE_TITLE = 'seekmore.xyz';
const SITE_DESCRIPTION = 'Notes on tools, terminal setups, and the craft of software.';

/**
 * Derives a URL slug from a post filename.
 * "2026-03-15-why-i-switched-to-neovim.md" → "why-i-switched-to-neovim"
 */
export function generateSlug(filename) {
  return path.basename(filename, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/**
 * Estimates reading time from raw markdown content.
 * Returns a string like "5 min read".
 */
export function estimateReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Returns a deterministic accent color for a given tag name.
 */
export function tagColor(tag) {
  let hash = 0;
  for (const char of tag) hash = (hash * 31 + char.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

/**
 * Parses a markdown post file.
 * Returns: { title, date, tags, excerpt, slug, readTime, content (HTML) }
 */
export function parsePost(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);
  const slug = generateSlug(filepath);
  return {
    title: data.title ?? 'Untitled',
    date: data.date
      ? new Date(data.date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
      : '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: data.excerpt ?? '',
    slug,
    readTime: estimateReadTime(content),
    content: marked.parse(content),
  };
}

/**
 * Replaces all {{key}} tokens in a template string with values from vars.
 */
export function renderTemplate(template, vars) {
  return Object.entries(vars).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
}

/**
 * Renders a single tag as a linked pill badge.
 */
export function renderTagBadge(tag) {
  const color = tagColor(tag);
  return `<a href="/tags/${tag}/" class="tag" style="color:${color}">${tag}</a>`;
}

/**
 * Renders a post card for use on the index or tag page.
 */
export function renderPostCard(post) {
  const tagsHtml = post.tags.map(renderTagBadge).join('');
  return `<div class="post-card">
  <p class="post-card-meta">${post.date} · ${post.readTime}</p>
  <a href="/posts/${post.slug}/" class="post-card-title">${post.title}</a>
  <p class="post-card-excerpt">${post.excerpt}</p>
  <div class="tags">${tagsHtml}</div>
</div>`;
}

const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const CSS_DIR = path.join(__dirname, 'css');

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf8');
}

function writeFile(filepath, content) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, content, 'utf8');
}

export function build() {
  console.log('Building...');

  // Clean and recreate dist
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy CSS
  const cssDest = path.join(DIST_DIR, 'css');
  fs.mkdirSync(cssDest, { recursive: true });
  fs.copyFileSync(path.join(CSS_DIR, 'style.css'), path.join(cssDest, 'style.css'));

  const indexTemplate = readTemplate('index.html');
  const postTemplate = readTemplate('post.html');

  // Parse all posts — newest first
  const postFiles = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();

  const posts = postFiles.map(f => parsePost(path.join(POSTS_DIR, f)));

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
      site_title: SITE_TITLE,
    });
    writeFile(path.join(DIST_DIR, 'posts', post.slug, 'index.html'), html);
  }

  // Build homepage
  const homepageHtml = renderTemplate(indexTemplate, {
    page_title: SITE_TITLE,
    page_heading: 'all posts',
    posts_html: posts.map(renderPostCard).join('\n'),
    meta_description: SITE_DESCRIPTION,
    canonical_url: `${BASE_URL}/`,
    robots_meta: '',
    site_title: SITE_TITLE,
  });
  writeFile(path.join(DIST_DIR, 'index.html'), homepageHtml);

  // Build tag pages
  const tagMap = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag).push(post);
    }
  }
  for (const [tag, tagPosts] of tagMap) {
    const tagHtml = renderTemplate(indexTemplate, {
      page_title: `${tag} — ${SITE_TITLE}`,
      page_heading: `tagged: ${tag}`,
      posts_html: tagPosts.map(renderPostCard).join('\n'),
      meta_description: `Posts tagged '${tag}' on ${SITE_TITLE}.`,
      canonical_url: `${BASE_URL}/tags/${tag}/`,
      robots_meta: '<meta name="robots" content="noindex, follow">',
      site_title: SITE_TITLE,
    });
    writeFile(path.join(DIST_DIR, 'tags', tag, 'index.html'), tagHtml);
  }

  console.log(`Built ${posts.length} post(s), ${tagMap.size} tag page(s).`);
}

function startDevServer(port = 3000) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };

  createServer((req, res) => {
    let urlPath = req.url === '/' ? '/index.html' : req.url;
    // Support clean URLs: /posts/my-post/ → /posts/my-post/index.html
    if (!path.extname(urlPath)) {
      urlPath = urlPath.replace(/\/?$/, '/index.html');
    }
    const filePath = path.join(DIST_DIR, urlPath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] ?? 'text/plain';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }).listen(port, () => {
    console.log(`Dev server: http://localhost:${port}`);
  });
}

function watch() {
  build();
  startDevServer();

  const watchDirs = [POSTS_DIR, TEMPLATES_DIR, CSS_DIR];
  for (const dir of watchDirs) {
    fs.watch(dir, { recursive: false }, (_event, filename) => {
      if (!filename) return;
      console.log(`Changed: ${filename} — rebuilding...`);
      try {
        build();
      } catch (err) {
        console.error('Build error:', err.message);
      }
    });
  }

  console.log(`Watching ${watchDirs.map(d => path.relative(__dirname, d)).join(', ')}...`);
}

// CLI entry point — only runs when executed directly (not when imported by tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--watch')) {
    watch();
  } else {
    build();
  }
}
