/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sharedSittingProgressPercent } from './sharedSittingProgress.js';

describe('sharedSittingProgressPercent', () => {
  it('maps completed + live minutes toward soft daily target', () => {
    assert.equal(sharedSittingProgressPercent({ completedMinutes: 0, softTargetMinutes: 25 }), 0);
    assert.equal(
      sharedSittingProgressPercent({
        completedMinutes: 10,
        liveSessionMinutes: 2.5,
        softTargetMinutes: 25
      }),
      50
    );
  });

  it('caps at 100 and never treats shortfall as negative', () => {
    assert.equal(
      sharedSittingProgressPercent({ completedMinutes: 40, softTargetMinutes: 25 }),
      100
    );
    assert.equal(
      sharedSittingProgressPercent({ completedMinutes: -3, liveSessionMinutes: -1 }),
      0
    );
  });
});
