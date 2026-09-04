/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  scheduleLanternPeekWhenIdle,
  shouldScheduleLanternPeekForSessionState
} from './quietTogetherIdleSchedule.js';
import {
  LANTERN_PEEK_IDLE_MS,
  resetLanternPresenceForTests
} from './quietTogetherPresence.js';

describe('quietTogetherIdleSchedule', () => {
  it('schedules peek only for IDLE', () => {
    assert.equal(shouldScheduleLanternPeekForSessionState('IDLE'), true);
    assert.equal(shouldScheduleLanternPeekForSessionState('FOCUSING'), false);
    assert.equal(shouldScheduleLanternPeekForSessionState('CELEBRATE'), false);
    assert.equal(shouldScheduleLanternPeekForSessionState('DORMANT'), false);
  });

  it('scheduleLanternPeekWhenIdle returns false when not IDLE', () => {
    resetLanternPresenceForTests();
    assert.equal(scheduleLanternPeekWhenIdle('FOCUSING', { storage: null }), false);
    resetLanternPresenceForTests();
  });

  it('scheduleLanternPeekWhenIdle schedules on IDLE (cold boot path)', () => {
    resetLanternPresenceForTests();
    const calls = [];
    const originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn, ms) => {
      calls.push(ms);
      return 0;
    };
    try {
      assert.equal(
        scheduleLanternPeekWhenIdle('IDLE', {
          storage: null,
          delayMs: LANTERN_PEEK_IDLE_MS
        }),
        true
      );
      assert.deepEqual(calls, [LANTERN_PEEK_IDLE_MS]);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      resetLanternPresenceForTests();
    }
  });
});
