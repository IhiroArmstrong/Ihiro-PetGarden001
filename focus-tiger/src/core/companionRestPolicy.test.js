import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATES } from './StateManager.js';
import {
  LONG_AWAY_WAKE_MS,
  IDLE_INACTIVITY_CLOAK_MS,
  FOREGROUND_RETURN_ACTIONS,
  shouldPlayLongAwayWake,
  shouldIdleInactivityCloak,
  shouldLateNightCloakOnSessionEnd,
  isLateNightCloakHoldEmotion,
  resolveForegroundReturnAction,
  resolveSessionEndHoldEmotion
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

test('resolveForegroundReturnAction: 2B vs keep 2h DORMANT path', () => {
  assert.equal(
    resolveForegroundReturnAction({
      sessionState: STATES.FOCUSING,
      hiddenMs: LONG_AWAY_WAKE_MS
    }),
    FOREGROUND_RETURN_ACTIONS.LONG_AWAY_WAKE
  );
  assert.equal(
    resolveForegroundReturnAction({
      sessionState: STATES.IDLE,
      hiddenMs: LONG_AWAY_WAKE_MS * 3
    }),
    FOREGROUND_RETURN_ACTIONS.SYNC_DORMANT_AND_LATE_NIGHT
  );
  assert.equal(
    resolveForegroundReturnAction({
      sessionState: STATES.FOCUSING,
      hiddenMs: 1000
    }),
    FOREGROUND_RETURN_ACTIONS.SYNC_DORMANT_AND_LATE_NIGHT
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

test('resolveSessionEndHoldEmotion: late night cloak vs daytime rise pool', () => {
  assert.equal(
    resolveSessionEndHoldEmotion({
      date: new Date('2026-08-04T23:10:00'),
      pickDaytimeRiseEmotion: () => 'riseStretchCasual'
    }),
    'cloakSleep'
  );
  assert.equal(
    resolveSessionEndHoldEmotion({
      date: new Date('2026-08-04T14:00:00'),
      pickDaytimeRiseEmotion: () => 'teaDrinking'
    }),
    'teaDrinking'
  );
});

test('isLateNightCloakHoldEmotion covers classic + starlight cloak sleep keys', () => {
  assert.equal(isLateNightCloakHoldEmotion('cloakSleep'), true);
  assert.equal(isLateNightCloakHoldEmotion('starlightCloakSleep'), true);
  assert.equal(isLateNightCloakHoldEmotion('riseStretchCasual'), false);
  assert.equal(isLateNightCloakHoldEmotion(null), false);
});
