/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_PENDING_REPLY_WATCHDOG_MS,
  shouldTripConfidePendingReplyWatchdog
} from './confidePendingReplyWatchdog.js';

test('pending-reply watchdog trips at the configured budget', () => {
  assert.equal(CONFIDE_PENDING_REPLY_WATCHDOG_MS, 45_000);
  assert.equal(
    shouldTripConfidePendingReplyWatchdog({
      startedAtMs: 1_000,
      nowMs: 1_000 + 44_999
    }),
    false
  );
  assert.equal(
    shouldTripConfidePendingReplyWatchdog({
      startedAtMs: 1_000,
      nowMs: 1_000 + 45_000
    }),
    true
  );
});

test('pending-reply watchdog ignores invalid clocks', () => {
  assert.equal(
    shouldTripConfidePendingReplyWatchdog({
      startedAtMs: Number.NaN,
      nowMs: 10
    }),
    false
  );
  assert.equal(
    shouldTripConfidePendingReplyWatchdog({
      startedAtMs: 0,
      nowMs: 10_000,
      timeoutMs: 0
    }),
    false
  );
});
