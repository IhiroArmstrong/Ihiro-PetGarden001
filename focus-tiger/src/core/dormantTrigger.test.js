import test from 'node:test';
import assert from 'node:assert/strict';

import {
  hasAnyFocusSessionEver,
  shouldEnterDormantIdle
} from './dormantTrigger.js';
import { DORMANT_IDLE_MS } from '../utils/Constants.js';

const TWO_HOURS_MS = DORMANT_IDLE_MS;
const BASE = Date.parse('2026-07-21T12:00:00');

test('new user with no focus end record does not trigger DORMANT', () => {
  assert.equal(hasAnyFocusSessionEver(null), false);
  assert.equal(
    shouldEnterDormantIdle({
      lastEndedAt: null,
      nowMs: BASE + TWO_HOURS_MS + 1
    }),
    false
  );
});

test('full 2h idle since last focus end triggers DORMANT', () => {
  const lastEndedAt = BASE;
  const nowMs = BASE + TWO_HOURS_MS;
  assert.equal(
    shouldEnterDormantIdle({ lastEndedAt, nowMs, idleMs: TWO_HOURS_MS }),
    true
  );
  assert.equal(
    shouldEnterDormantIdle({
      lastEndedAt,
      nowMs: nowMs + 60_000,
      idleMs: TWO_HOURS_MS
    }),
    true
  );
});

test('under 2h since last focus end does not trigger DORMANT', () => {
  const lastEndedAt = BASE;
  assert.equal(
    shouldEnterDormantIdle({
      lastEndedAt,
      nowMs: BASE + TWO_HOURS_MS - 1,
      idleMs: TWO_HOURS_MS
    }),
    false
  );
});
