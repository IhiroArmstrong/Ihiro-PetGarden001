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
const src = readFileSync(join(here, 'ContemplativeInquiryUI.js'), 'utf8');

test('ContemplativeInquiryUI uses glass card layer and overlay dim, not Support z', () => {
  assert.match(src, /zIndex: Z\.OVERLAY_DIM/);
  assert.match(src, /z-index: \$\{Z\.GLASS_CARD\}/);
  assert.match(src, /createGlassCard/);
  assert.match(src, /deck: true/);
  assert.doesNotMatch(src, /yin-support-modal/);
  assert.doesNotMatch(src, /Z\.SUPPORT_MODAL/);
});

test('ContemplativeInquiryUI early end still lands; fourth option is Exit B', () => {
  assert.match(src, /contemplative-inquiry-end-early/);
  assert.match(src, /_goLanding\(''\)/);
  assert.match(src, /contemplative-inquiry-opt-uncomfy/);
  assert.match(src, /_goLanding\('b'\)/);
  assert.match(src, /CI_EX1_EXIT_B/);
  assert.match(src, /CI_EX1_LANDING/);
  assert.match(src, /onCrisis/);
  assert.match(src, /onLand/);
});
