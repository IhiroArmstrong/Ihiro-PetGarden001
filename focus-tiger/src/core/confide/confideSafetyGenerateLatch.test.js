/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  armConfideSafetyGenerateLatch,
  createConfideSafetyGenerateLatchState,
  isConfideSafetyGenerateLatchActive,
  resolveConfideSafetyGenerateLockTurns,
  tickConfideSafetyGenerateLatchOnUserSend
} from './confideSafetyGenerateLatch.js';

describe('confideSafetyGenerateLatch T91', () => {
  it('arms and counts down on each user send', () => {
    const state = createConfideSafetyGenerateLatchState();
    assert.equal(isConfideSafetyGenerateLatchActive(state), false);
    armConfideSafetyGenerateLatch(state, 2);
    assert.equal(isConfideSafetyGenerateLatchActive(state), true);
    tickConfideSafetyGenerateLatchOnUserSend(state);
    assert.equal(isConfideSafetyGenerateLatchActive(state), true);
    tickConfideSafetyGenerateLatchOnUserSend(state);
    assert.equal(isConfideSafetyGenerateLatchActive(state), false);
  });

  it('resolveConfideSafetyGenerateLockTurns respects env override', () => {
    assert.equal(resolveConfideSafetyGenerateLockTurns({}), 3);
    assert.equal(
      resolveConfideSafetyGenerateLockTurns({ FT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS: '5' }),
      5
    );
    assert.equal(
      resolveConfideSafetyGenerateLockTurns({ FT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS: '0' }),
      3
    );
  });
});
