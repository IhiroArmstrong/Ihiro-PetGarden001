/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldShowFocusLevelPercent } from './focusHudLive.js';

test('an open-ended sit hides the percent that barely moves', () => {
  assert.equal(
    shouldShowFocusLevelPercent({
      focusing: true,
      openEnded: true,
      overlayHud: true
    }),
    false
  );
  assert.equal(
    shouldShowFocusLevelPercent({
      focusing: true,
      openEnded: false,
      overlayHud: true
    }),
    true
  );
  assert.equal(shouldShowFocusLevelPercent({ focusing: false, openEnded: true }), true);
});

test('official Focusing hides percent even on a timed sit (T45)', () => {
  assert.equal(shouldShowFocusLevelPercent({ focusing: true, openEnded: false }), false);
  assert.equal(shouldShowFocusLevelPercent({ focusing: true, openEnded: true }), false);
});
