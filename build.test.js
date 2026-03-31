// build.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSlug, estimateReadTime, tagColor } from './build.js';
import { renderTemplate, renderTagBadge, renderPostCard } from './build.js';

test('generateSlug strips date prefix and .md extension', () => {
  assert.equal(generateSlug('2026-03-15-why-i-switched-to-neovim.md'), 'why-i-switched-to-neovim');
});

test('generateSlug handles filename without date prefix', () => {
  assert.equal(generateSlug('hello-world.md'), 'hello-world');
});

test('estimateReadTime returns at least 1 min read for short text', () => {
  assert.equal(estimateReadTime('short'), '1 min read');
});

test('estimateReadTime calculates correctly for 400 words', () => {
  const words = 'word '.repeat(400);
  assert.equal(estimateReadTime(words), '2 min read');
});

test('tagColor returns a hex color string', () => {
  const color = tagColor('typescript');
  assert.match(color, /^#[0-9a-f]{6}$/);
});

test('tagColor is deterministic — same input always gives same output', () => {
  assert.equal(tagColor('tooling'), tagColor('tooling'));
});

test('tagColor produces multiple distinct colors across different tag names', () => {
  const colors = ['typescript', 'neovim', 'go', 'rust', 'css', 'tooling'].map(tagColor);
  const unique = new Set(colors);
  assert.ok(unique.size > 1, 'expected multiple colors across different tags');
});

test('renderTemplate replaces a single token', () => {
  assert.equal(renderTemplate('Hello {{name}}', { name: 'world' }), 'Hello world');
});

test('renderTemplate replaces multiple different tokens', () => {
  assert.equal(renderTemplate('{{a}} and {{b}}', { a: 'foo', b: 'bar' }), 'foo and bar');
});

test('renderTemplate replaces all occurrences of the same token', () => {
  assert.equal(renderTemplate('{{x}} {{x}}', { x: 'hi' }), 'hi hi');
});

test('renderTagBadge returns an anchor with correct href', () => {
  const html = renderTagBadge('neovim');
  assert.ok(html.includes('href="/tags/neovim/"'), 'should link to /tags/neovim/');
  assert.ok(html.includes('>neovim<'), 'should display tag name');
});

test('renderPostCard includes title, excerpt, slug link, and tag link', () => {
  const post = {
    title: 'Test Post',
    date: 'March 31, 2026',
    readTime: '2 min read',
    excerpt: 'A short summary.',
    slug: 'test-post',
    tags: ['tooling'],
    content: '<p>body</p>',
  };
  const card = renderPostCard(post);
  assert.ok(card.includes('Test Post'));
  assert.ok(card.includes('A short summary.'));
  assert.ok(card.includes('href="/posts/test-post/"'));
  assert.ok(card.includes('href="/tags/tooling/"'));
});
