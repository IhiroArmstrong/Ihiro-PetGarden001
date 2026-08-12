import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_INTERVAL_MS,
  SESSION_INTERVAL_END_SKIP_MS,
  evaluateIntervalCue
} from './sessionIntervalScheduler.js';

test('interval constants match Brief (180s / 30s skip)', () => {
  assert.equal(SESSION_INTERVAL_MS, 180_000);
  assert.equal(SESSION_INTERVAL_END_SKIP_MS, 30_000);
});

test('evaluateIntervalCue waits before first 180s', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 179_999,
      targetMs: 600_000,
      lastFiredCount: 0
    }),
    { action: 'wait' }
  );
});

test('evaluateIntervalCue plays at 180s when remaining >= 30s', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 600_000,
      lastFiredCount: 0
    }),
    { action: 'play', firedCount: 1 }
  );
});

test('evaluateIntervalCue skips when remaining < 30s', () => {
  // 3m20s target → at 180s remaining = 20s < 30s
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 200_000,
      lastFiredCount: 0
    }),
    { action: 'skip', firedCount: 1 }
  );
});

test('evaluateIntervalCue plays when remaining === 30s (strict <)', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 180_000,
      targetMs: 210_000,
      lastFiredCount: 0
    }),
    { action: 'play', firedCount: 1 }
  );
});

test('evaluateIntervalCue advances to second beat at 360s', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 360_000,
      targetMs: 600_000,
      lastFiredCount: 1
    }),
    { action: 'play', firedCount: 2 }
  );
});

test('evaluateIntervalCue does not fire at t≈0', () => {
  assert.deepEqual(
    evaluateIntervalCue({
      elapsedMs: 0,
      targetMs: 600_000,
      lastFiredCount: 0
    }),
    { action: 'wait' }
  );
});
