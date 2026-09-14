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
const src = readFileSync(join(here, 'TransitionMomentUI.js'), 'utf8');
const registrySrc = readFileSync(
  join(here, '../core/overlaySlotContractRegistry.js'),
  'utf8'
);

test('transition moment uses whisper placement and does not declare modal chrome', () => {
  assert.match(src, /homeClearanceTopCss/);
  assert.match(src, /transition-moment-whisper/);
  assert.match(src, /pointer-events: auto/);
  assert.doesNotMatch(src, /aria-modal/);
  assert.doesNotMatch(src, /role', 'dialog'/);
  assert.doesNotMatch(src, /inset: 0/);
});

test('transition moment overlay contract no longer blocks idle yin tap', () => {
  const block = registrySrc.match(
    /id: OVERLAY_SOURCES\.TRANSITION_MOMENT[\s\S]*?snapshotField: 'transitionMomentOpen'/
  )?.[0];
  assert.ok(block);
  assert.match(block, /blocksIdleYinTap: false/);
  assert.doesNotMatch(block, /dismissRoot:/);
  assert.doesNotMatch(block, /BLANK_CLOSES/);
});
