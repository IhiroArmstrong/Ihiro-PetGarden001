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
const src = readFileSync(join(here, 'FocusCirclePresenceChrome.js'), 'utf8');

test('refresh prefers live sittingOthers snapshot over cached chrome count', () => {
  assert.match(
    src,
    /const snapshot = getFocusCircleSittingOthersSnapshot\(\);\s*let sittingOthers = snapshot != null \? snapshot : this\._sittingOthers;/
  );
});

test('hides while contributing or focusing', () => {
  assert.match(src, /!isFocusCirclePresenceContributing\(\)/);
  assert.match(src, /!this\._focusing/);
});

test('was-here mode shows when sitting is zero', () => {
  assert.match(src, /is-was-here/);
  assert.match(src, /FOCUS_CIRCLE_WAS_HERE_CAPTION/);
  assert.match(src, /sittingOthers === 0/);
});

test('pointer-events none and stacks above lanterns', () => {
  assert.match(src, /pointer-events:\s*none/);
  assert.match(src, /IDLE_LANTERN_BOTTOM_WIDE_CSS/);
});

test('uses svg lantern shells instead of css dots', () => {
  assert.match(src, /createPresenceLanternShell/);
  assert.match(src, /focus-circle-presence__lantern/);
  assert.doesNotMatch(src, /focus-circle-presence__dot/);
});

test('debugLanterns preview bypasses circle membership gates', () => {
  assert.match(src, /readDebugLanternsQueryFlag/);
  assert.match(src, /DEBUG_LANTERNS_CIRCLE_MOCK_COUNT/);
});
