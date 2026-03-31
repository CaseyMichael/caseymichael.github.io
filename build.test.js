// build.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSlug, estimateReadTime, tagColor } from './build.js';

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
