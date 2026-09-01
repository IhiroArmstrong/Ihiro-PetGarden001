/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'TipKindnessBadgesChrome.js'), 'utf8');

test('C.1 badge strip hides marketing label/hint but keeps per-badge download names', () => {
  assert.doesNotMatch(src, /yin-tip-kindness-badges__label/);
  assert.doesNotMatch(src, /yin-tip-kindness-badges__hint/);
  assert.doesNotMatch(src, /BADGES_DOWNLOAD_HINT/);
  assert.match(src, /setAttribute\('aria-label'/);
  assert.match(src, /BADGES_BESIDE_LABEL/);
  assert.match(src, /BADGES_DOWNLOAD_ONE/);
  assert.match(src, /btn\.setAttribute\('aria-label'/);
});

test('C.1 badge strip softens achievement-panel chrome', () => {
  assert.match(src, /box-shadow: none;/);
  assert.doesNotMatch(src, /GLASS_SHADOW/);
  assert.doesNotMatch(src, /GLASS_BORDER/);
});
