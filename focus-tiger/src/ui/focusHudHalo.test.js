/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { focusLevelToHaloVars } from './focusHudHalo.js';

describe('focusLevelToHaloVars', () => {
  test('clamps below 0 and above 1', () => {
    assert.equal(focusLevelToHaloVars(-0.5).fill, 0);
    assert.equal(focusLevelToHaloVars(1.5).fill, 1);
  });

  test('scales ring and core opacity with fill (metaphor, not scoreboard)', () => {
    const low = focusLevelToHaloVars(0);
    const high = focusLevelToHaloVars(1);
    assert.ok(high.ringOpacity > low.ringOpacity);
    assert.ok(high.coreOpacity > low.coreOpacity);
    assert.equal(low.fill, 0);
    assert.equal(high.fill, 1);
  });
});
