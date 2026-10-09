/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OPEN_ENDED_HARD_CAP_MS,
  OPEN_ENDED_MODE,
  OPEN_ENDED_NUDGE_AT_MS,
  OPEN_ENDED_REWARD_CAP_MS,
  beginOpenGap,
  closeOpenGap,
  computeOpenEndedElapsedMs,
  nudgesReached,
  takeOpenEndedNudges,
  planOpenEndedRestart,
  rewardCreditMsForElapsed,
  shouldAutoEndOpenEnded
} from './openEndedFocus.js';

const HOUR = 60 * 60 * 1000;

/**
 * @param {Partial<import('./openEndedFocus.js').OpenEndedSession>} [overrides]
 */
function session(overrides = {}) {
  return {
    mode: OPEN_ENDED_MODE,
    startedAtMs: 0,
    pausedTotalMs: 0,
    lastActiveAtMs: 0,
    openGapStartedAtMs: null,
    ...overrides
  };
}

test('counts up from the start timestamp', () => {
  const s = session({ lastActiveAtMs: HOUR });
  assert.equal(
    computeOpenEndedElapsedMs(s, HOUR + 37 * 60 * 1000 + 20_000),
    HOUR + 37 * 60 * 1000 + 20_000
  );
});

test('a two-hour suspend is not counted', () => {
  let s = session({ lastActiveAtMs: HOUR });
  s = beginOpenGap(s, HOUR);
  assert.equal(computeOpenEndedElapsedMs(s, HOUR + 2 * HOUR), HOUR);
  s = closeOpenGap(s, HOUR + 2 * HOUR);
  assert.equal(computeOpenEndedElapsedMs(s, HOUR + 2 * HOUR + 10 * 60 * 1000), HOUR + 10 * 60 * 1000);
});

test('a manual pause uses the same gap as suspend', () => {
  let s = session({ lastActiveAtMs: 30 * 60 * 1000 });
  s = beginOpenGap(s, 30 * 60 * 1000);
  s = closeOpenGap(s, 50 * 60 * 1000);
  assert.equal(s.pausedTotalMs, 20 * 60 * 1000);
  assert.equal(computeOpenEndedElapsedMs(s, 80 * 60 * 1000), 60 * 60 * 1000);
});

test('crosses midnight on wall-clock timestamps', () => {
  const started = Date.UTC(2026, 0, 1, 23, 0, 0);
  const later = Date.UTC(2026, 0, 2, 0, 30, 0);
  const s = session({ startedAtMs: started, lastActiveAtMs: later });
  assert.equal(computeOpenEndedElapsedMs(s, later), 90 * 60 * 1000);
});

test('caps the clock at 24 hours and signals auto-end', () => {
  const s = session({ lastActiveAtMs: 25 * HOUR });
  assert.equal(computeOpenEndedElapsedMs(s, 25 * HOUR), OPEN_ENDED_HARD_CAP_MS);
  assert.equal(shouldAutoEndOpenEnded(s, 25 * HOUR), true);
  assert.equal(shouldAutoEndOpenEnded(s, 23 * HOUR), false);
});

test('reward credit stops at 20 hours while the clock may show more', () => {
  const s = session({ lastActiveAtMs: 22 * HOUR });
  const elapsed = computeOpenEndedElapsedMs(s, 22 * HOUR);
  assert.equal(elapsed, 22 * HOUR);
  assert.equal(rewardCreditMsForElapsed(elapsed), OPEN_ENDED_REWARD_CAP_MS);
  assert.equal(rewardCreditMsForElapsed(OPEN_ENDED_HARD_CAP_MS), 20 * HOUR);
});

test('restart asks and does not credit the dead gap', () => {
  const s = session({ lastActiveAtMs: HOUR });
  const plan = planOpenEndedRestart(s, 9 * HOUR);
  assert.equal(plan.action, 'ask');
  assert.deepEqual(plan.choices, ['resume', 'end-at-last-active']);
  assert.equal(plan.endElapsedMs, HOUR);
  assert.equal(plan.resumeElapsedMs, HOUR);
  assert.equal(plan.silentWallClockElapsedMs, 9 * HOUR);
  assert.ok(plan.resumeElapsedMs < plan.silentWallClockElapsedMs);
});

test('restart during a suspend does not count sleep twice', () => {
  let s = session({ lastActiveAtMs: HOUR });
  s = beginOpenGap(s, HOUR);
  const plan = planOpenEndedRestart(s, 4 * HOUR);
  assert.equal(plan.action, 'ask');
  assert.equal(plan.endElapsedMs, HOUR);
  assert.equal(plan.resumeElapsedMs, HOUR);
  assert.equal(plan.silentWallClockElapsedMs, 4 * HOUR);
});

test('restart at the hard cap auto-ends instead of asking', () => {
  const s = session({ lastActiveAtMs: 24 * HOUR });
  const plan = planOpenEndedRestart(s, 30 * HOUR);
  assert.equal(plan.action, 'auto-end');
  assert.equal(plan.elapsedMs, OPEN_ENDED_HARD_CAP_MS);
  assert.equal(plan.rewardCreditMs, OPEN_ENDED_REWARD_CAP_MS);
});

test('nudges fire at 90 minutes and 3 hours, and can be turned off', () => {
  assert.deepEqual(nudgesReached(89 * 60 * 1000), []);
  assert.deepEqual(nudgesReached(OPEN_ENDED_NUDGE_AT_MS[0]), [OPEN_ENDED_NUDGE_AT_MS[0]]);
  assert.deepEqual(nudgesReached(OPEN_ENDED_NUDGE_AT_MS[1]), [...OPEN_ENDED_NUDGE_AT_MS]);
  assert.deepEqual(
    nudgesReached(OPEN_ENDED_NUDGE_AT_MS[1], {
      alreadyShownMs: [OPEN_ENDED_NUDGE_AT_MS[0]]
    }),
    [OPEN_ENDED_NUDGE_AT_MS[1]]
  );
  assert.deepEqual(nudgesReached(5 * HOUR, { enabled: false }), []);
  assert.deepEqual(takeOpenEndedNudges(89 * 60 * 1000), {
    showMs: null,
    markShownMs: []
  });
  assert.deepEqual(takeOpenEndedNudges(OPEN_ENDED_NUDGE_AT_MS[0]), {
    showMs: OPEN_ENDED_NUDGE_AT_MS[0],
    markShownMs: [OPEN_ENDED_NUDGE_AT_MS[0]]
  });
  assert.deepEqual(takeOpenEndedNudges(OPEN_ENDED_NUDGE_AT_MS[1]), {
    showMs: OPEN_ENDED_NUDGE_AT_MS[1],
    markShownMs: [...OPEN_ENDED_NUDGE_AT_MS]
  });
});

test('a closed or fixed session is not an open-ended restart', () => {
  assert.equal(planOpenEndedRestart(null, HOUR).action, 'none');
  assert.equal(
    planOpenEndedRestart(session({ closed: true, lastActiveAtMs: HOUR }), 2 * HOUR).action,
    'none'
  );
  assert.equal(computeOpenEndedElapsedMs(session({ mode: 'fixed' }), HOUR), 0);
});
