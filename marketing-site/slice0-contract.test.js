/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const css = readFileSync(join(dir, 'styles.css'), 'utf8');
const redirects = readFileSync(join(dir, '_redirects'), 'utf8');

describe('marketing-site Slice 0 contract', () => {
  it('uses the locked public hostname', () => {
    assert.match(html, /rel="canonical" href="https:\/\/twinsology\.com\/"/);
    assert.match(html, /mailto:hello@twinsology\.com/);
  });

  it('names the product and studio without a practice-app CTA', () => {
    assert.match(html, /Focus Tiger™/);
    assert.match(html, /Yin/);
    assert.match(html, /Twinsology/);
    assert.doesNotMatch(html, /workers\.dev/i);
    assert.doesNotMatch(html, /focustiger\.app/i);
  });

  it('keeps www → apex in Pages redirects', () => {
    assert.match(
      redirects,
      /https:\/\/www\.twinsology\.com\/\* https:\/\/twinsology\.com\/:splat 301/
    );
  });

  it('uses the product wash, not an arcade palette', () => {
    assert.match(css, /--color-bg: #e8e6e1/);
    assert.match(css, /--color-accent: #b5623a/);
  });
});
