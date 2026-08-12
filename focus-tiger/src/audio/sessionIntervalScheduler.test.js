import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_INTERVAL_MS,
  SESSION_INTERVAL_MS_5MIN,
  SESSION_INTERVAL_END_SKIP_MS,
  evaluateIntervalCue
} from './sessionIntervalScheduler.js';

test('interval constants match 3min / 5min / 30s skip', () => {
  assert.equal(SESSION_INTERVAL_MS, 180_000);
  assert.equal(SESSION_INTERVAL_MS_5MIN, 300_000);
  assert.equal(SESSION_INTERVAL_END_SKIP_MS, 30_000);
});

test('evaluateIntervalCue disables when intervalMs is 0', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 600_000,
      lastFiredCount: 0,
      intervalMs: 0
    }),
    { action: 'disabled' }
  );
});

test('evaluateIntervalCue waits before first 180s', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 179_999,
      targetMs: 600_000,
      lastFiredCount: 0,
      intervalMs: 180_000
    }),
    { action: 'wait' }
  );
});

test('evaluateIntervalCue plays at 180s when remaining >= 30s', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 600_000,
      lastFiredCount: 0,
      intervalMs: 180_000
    }),
    { action: 'play', firedCount: 1 }
  );
});

test('evaluateIntervalCue plays at 300s for 5-min rhythm', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 300_000,
      targetMs: 900_000,
      lastFiredCount: 0,
      intervalMs: 300_000
    }),
    { action: 'play', firedCount: 1 }
  );
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 900_000,
      lastFiredCount: 0,
      intervalMs: 300_000
    }),
    { action: 'wait' }
  );
});

test('evaluateIntervalCue skips when remaining < 30s', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 200_000,
      lastFiredCount: 0,
      intervalMs: 180_000
    }),
    { action: 'skip', firedCount: 1 }
  );
});

test('evaluateIntervalCue does not fire at t≈0', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 0,
      targetMs: 600_000,
      lastFiredCount: 0,
      intervalMs: 180_000
    }),
    { action: 'wait' }
  );
});
