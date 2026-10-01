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
const src = readFileSync(join(here, 'QuietTogetherLanternsChrome.js'), 'utf8');

test('refresh prefers live sitting snapshot over cached chrome count', () => {
  assert.match(
    src,
    /const snapshot = getLanternSittingSnapshot\(\);\s*let sitting = snapshot != null \? snapshot : this\._sitting;/
  );
});

test('uses svg lantern shells instead of css dots', () => {
  assert.match(src, /createPresenceLanternShell/);
  assert.match(src, /quiet-together-lanterns__lantern/);
  assert.doesNotMatch(src, /quiet-together-lanterns__dot/);
});

test('debugLanterns preview bypasses presence gates', () => {
  assert.match(src, /readDebugLanternsQueryFlag/);
  assert.match(src, /DEBUG_LANTERNS_GLOBAL_MOCK_COUNT/);
});
