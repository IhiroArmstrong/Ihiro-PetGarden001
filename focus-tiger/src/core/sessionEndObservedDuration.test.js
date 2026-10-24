/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveObservedSessionMinutes,
  formatObservedSessionDurationLine,
  SESSION_END_DURATION_MIN_ELAPSED_SECONDS
} from './sessionEndObservedDuration.js';

test('resolveObservedSessionMinutes rounds and enforces minimum elapsed', () => {
  assert.equal(
    resolveObservedSessionMinutes(SESSION_END_DURATION_MIN_ELAPSED_SECONDS - 1),
    null
  );
  assert.equal(resolveObservedSessionMinutes(30), 1);
  assert.equal(resolveObservedSessionMinutes(89), 1);
  assert.equal(resolveObservedSessionMinutes(90), 2);
  assert.equal(resolveObservedSessionMinutes(12 * 60 + 29), 12);
  assert.equal(resolveObservedSessionMinutes(12 * 60 + 30), 13);
});

test('formatObservedSessionDurationLine returns null when too short', () => {
  assert.equal(formatObservedSessionDurationLine(10), null);
});

test('formatObservedSessionDurationLine interpolates minutes', () => {
  const line = formatObservedSessionDurationLine(12 * 60 + 20);
  assert.ok(line);
  assert.match(line, /12/);
  assert.doesNotMatch(line, /\{minutes\}/);
});
