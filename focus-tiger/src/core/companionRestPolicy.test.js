import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES } from './StateManager.js';
import {
  LONG_AWAY_WAKE_MS,
  IDLE_INACTIVITY_CLOAK_MS,
  shouldPlayLongAwayWake,
  shouldIdleInactivityCloak,
  shouldLateNightCloakOnSessionEnd,
  isLateNightCloakHoldEmotion
} from './companionRestPolicy.js';

test('shouldPlayLongAwayWake only when FOCUSING and hidden long enough', () => {
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.FOCUSING,
      hiddenMs: LONG_AWAY_WAKE_MS
    }),
    true
  );
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.FOCUSING,
      hiddenMs: LONG_AWAY_WAKE_MS - 1
    }),
    false
  );
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.IDLE,
      hiddenMs: LONG_AWAY_WAKE_MS * 2
    }),
    false
  );
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.DORMANT,
      hiddenMs: LONG_AWAY_WAKE_MS * 2
    }),
    false
  );
});

test('shouldIdleInactivityCloak only when IDLE past threshold', () => {
  assert.equal(
    shouldIdleInactivityCloak({
      sessionState: STATES.IDLE,
      idleMs: IDLE_INACTIVITY_CLOAK_MS
    }),
    true
  );
  assert.equal(
    shouldIdleInactivityCloak({
      sessionState: STATES.IDLE,
      idleMs: IDLE_INACTIVITY_CLOAK_MS - 1
    }),
    false
  );
  assert.equal(
    shouldIdleInactivityCloak({
      sessionState: STATES.FOCUSING,
      idleMs: IDLE_INACTIVITY_CLOAK_MS * 2
    }),
    false
  );
});

test('shouldLateNightCloakOnSessionEnd follows local late-night hour', () => {
  assert.equal(
    shouldLateNightCloakOnSessionEnd(new Date('2026-08-04T23:00:00')),
    true
  );
  assert.equal(
    shouldLateNightCloakOnSessionEnd(new Date('2026-08-04T22:59:00')),
    false
  );
  assert.equal(
    shouldLateNightCloakOnSessionEnd(new Date('2026-08-04T05:00:00')),
    false
  );
});

test('isLateNightCloakHoldEmotion covers classic + starlight cloak sleep keys', () => {
  assert.equal(isLateNightCloakHoldEmotion('cloakSleep'), true);
  assert.equal(isLateNightCloakHoldEmotion('starlightCloakSleep'), true);
  assert.equal(isLateNightCloakHoldEmotion('riseStretchCasual'), false);
  assert.equal(isLateNightCloakHoldEmotion(null), false);
});
