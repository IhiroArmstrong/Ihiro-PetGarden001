/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  armConfideSafetyGenerateLatch,
  createConfideSafetyGenerateLatchState,
  getConfideSafetyGenerateLatchState,
  isConfideSafetyGenerateLatchActive,
  resetConfideSafetyGenerateLatchForTests,
  tickConfideSafetyGenerateLatchOnUserSend
} from './confideSafetyGenerateLatch.js';

afterEach(() => {
  resetConfideSafetyGenerateLatchForTests();
});

describe('confideSafetyGenerateLatch T91 process lock', () => {
  it('stays locked after many user sends', () => {
    const state = createConfideSafetyGenerateLatchState();
    assert.equal(isConfideSafetyGenerateLatchActive(state), false);
    armConfideSafetyGenerateLatch(state);
    assert.equal(isConfideSafetyGenerateLatchActive(state), true);
    tickConfideSafetyGenerateLatchOnUserSend(state);
    tickConfideSafetyGenerateLatchOnUserSend(state);
    tickConfideSafetyGenerateLatchOnUserSend(state);
    tickConfideSafetyGenerateLatchOnUserSend(state);
    assert.equal(isConfideSafetyGenerateLatchActive(state), true);
  });

  it('survives a new card instance that shares the process latch', () => {
    const processState = getConfideSafetyGenerateLatchState();
    armConfideSafetyGenerateLatch(processState);
    const reopened = getConfideSafetyGenerateLatchState();
    assert.equal(reopened, processState);
    assert.equal(isConfideSafetyGenerateLatchActive(reopened), true);
  });
});
