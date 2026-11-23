/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'GuidedMeditationUI.js'), 'utf8');

test('GuidedMeditationUI uses sanctuary glass factory, not a nested cream plate', () => {
  assert.match(src, /createGlassCard/);
  assert.match(src, /id: 'guided-meditation'/);
  assert.match(src, /deck: true/);
  assert.match(src, /data-ft-glass-drag-chrome/);
  assert.match(src, /top: max\(12px, env\(safe-area-inset-top/);
  assert.match(src, /overflow-y: auto/);
  assert.match(src, /\.guided-meditation__panel \{[\s\S]*?background: transparent;/);
  assert.doesNotMatch(src, /rgba\(255,\s*252,\s*245,\s*0\.92\)/);
  assert.doesNotMatch(src, /yin-support-modal/);
  assert.doesNotMatch(src, /Z\.SUPPORT_MODAL/);
});
