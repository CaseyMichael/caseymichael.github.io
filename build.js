// build.js
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TAG_COLORS = ['#7aa2f7', '#7dcfff', '#9ece6a', '#bb9af7', '#ff9e64', '#e0af68'];

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
