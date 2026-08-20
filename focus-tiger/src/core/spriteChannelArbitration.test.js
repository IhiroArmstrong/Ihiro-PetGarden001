/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { STATES } from './StateManager.js';
import { WELLNESS_DAY_BANDS } from '../character/cloakVariant.js';
import { DORMANT_IDLE_MS } from '../utils/Constants.js';
import {
  SPRITE_OCCUPANCY,
  SPRITE_SOURCES,
  TAP_BLOCKING_OCCUPANCY,
  arbitrateSpriteChannel,
  resolveBootSpriteOccupancy,
  resolveSessionEndSpriteOccupancy,
  resolveVisibilitySpriteOccupancy
} from './spriteChannelArbitration.js';

const afternoon = new Date('2026-08-20T15:00:00');
const twoAm = new Date('2026-08-20T02:00:00');
const elevenPm = new Date('2026-08-20T23:30:00');
const staleEnded = Date.parse('2026-08-20T10:00:00');

test('boot: flower beats wellness late cloak', () => {
  const d = resolveBootSpriteOccupancy({
    now: twoAm,
    wellnessBand: WELLNESS_DAY_BANDS.LATE_NIGHT,
    flowerForce: true,
    lateNight: true
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.FLOWER);
  assert.equal(d.sessionDelta, null);
});

test('boot: checkout tip thanks beats wellness late cloak', () => {
  const d = resolveBootSpriteOccupancy({
    now: twoAm,
    wellnessBand: WELLNESS_DAY_BANDS.LATE_NIGHT,
    checkoutThanksKind: 'tip',
    playAtWelcomeSlot: 'teaDrinking',
    lateNight: true
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.PAYMENT_THANKS);
  assert.equal(d.play.emotionKey, 'teaDrinking');
  assert.equal(d.sessionDelta, null);
});

test('boot: sanctuary pending skips sleep and welcome', () => {
  const d = resolveBootSpriteOccupancy({
    now: twoAm,
    wellnessBand: WELLNESS_DAY_BANDS.LATE_NIGHT,
    checkoutThanksKind: 'sanctuary',
    lateNight: true,
    welcomeAvailable: true
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.IDLE_BASELINE);
  assert.equal(d.reason, 'checkout-pending');
});

test('boot: wellness late at 02:00 enters DORMANT', () => {
  const d = resolveBootSpriteOccupancy({
    now: twoAm,
    wellnessBand: WELLNESS_DAY_BANDS.LATE_NIGHT,
    lateNight: true
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.DORMANT_ENTER);
  assert.equal(d.sessionDelta, 'enter-dormant');
});

test('boot: morning wake before welcome', () => {
  const d = resolveBootSpriteOccupancy({
    now: new Date('2026-08-20T07:30:00'),
    wellnessBand: WELLNESS_DAY_BANDS.MORNING,
    welcomeAvailable: true,
    lateNight: false
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.MORNING_WAKE);
  assert.equal(d.play.emotionKey, 'dormantWake');
});

test('boot: welcome when quota open and daytime', () => {
  const d = resolveBootSpriteOccupancy({
    now: afternoon,
    wellnessBand: WELLNESS_DAY_BANDS.DAY,
    welcomeAvailable: true,
    lateNight: false
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.WELCOME);
});

test('visibility: short hide after welcome does not enter DORMANT on stale stamp', () => {
  const d = resolveVisibilitySpriteOccupancy({
    now: afternoon,
    sessionState: STATES.IDLE,
    occupancy: SPRITE_OCCUPANCY.WELCOME,
    hiddenMs: 60_000,
    lastEndedAt: staleEnded,
    lateNight: false
  });
  assert.equal(d.sessionDelta, null);
  assert.equal(d.occupy, SPRITE_OCCUPANCY.KEEP);
  assert.equal(d.reason, 'short-hide-after-first-paint');
});

test('visibility: overlayBusy blocks 2h enter (Reflect still open)', () => {
  const d = resolveVisibilitySpriteOccupancy({
    now: afternoon,
    sessionState: STATES.IDLE,
    overlayBusy: true,
    hiddenMs: DORMANT_IDLE_MS,
    lastEndedAt: staleEnded,
    lateNight: false
  });
  assert.equal(d.reason, 'overlay-busy');
  assert.equal(d.sessionDelta, null);
});

test('visibility: 02:00 long hide enters DORMANT without 2h stamp', () => {
  const d = resolveVisibilitySpriteOccupancy({
    now: twoAm,
    sessionState: STATES.IDLE,
    hiddenMs: DORMANT_IDLE_MS,
    lastEndedAt: Date.parse('2026-08-20T01:50:00'),
    lateNight: true
  });
  assert.equal(d.sessionDelta, 'enter-dormant');
  assert.equal(d.reason, 'late-night-idle');
});

test('visibility: long hide + 2h stamp enters DORMANT in the afternoon', () => {
  const d = resolveVisibilitySpriteOccupancy({
    now: afternoon,
    sessionState: STATES.IDLE,
    hiddenMs: DORMANT_IDLE_MS,
    lastEndedAt: staleEnded,
    lateNight: false
  });
  assert.equal(d.sessionDelta, 'enter-dormant');
});

test('session-end never returns dormant-enter', () => {
  const rise = resolveSessionEndSpriteOccupancy({ completed: false });
  assert.equal(rise.occupy, SPRITE_OCCUPANCY.RISE_HOLD);
  const cele = resolveSessionEndSpriteOccupancy({
    completed: true,
    hasCelebratedToday: false
  });
  assert.equal(cele.occupy, SPRITE_OCCUPANCY.CELEBRATE);
  assert.equal(cele.sessionDelta, 'celebrate');
  const cloak = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.DORMANT_ENTER,
    source: SPRITE_SOURCES.SESSION_END,
    context: { now: elevenPm, lateNight: true }
  });
  assert.equal(cloak.reason, 'session-end-never-cloak');
});

test('payment-async leaves DORMANT to play thanks', () => {
  const d = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.PAYMENT_THANKS,
    source: SPRITE_SOURCES.PAYMENT_ASYNC,
    emotionKey: 'mindfulAcknowledge',
    context: {
      now: twoAm,
      sessionState: STATES.DORMANT,
      lateNight: true
    }
  });
  assert.equal(d.occupy, SPRITE_OCCUPANCY.PAYMENT_THANKS);
  assert.equal(d.sessionDelta, 'leave-dormant');
  assert.equal(d.play.emotionKey, 'mindfulAcknowledge');
});

test('payment-async yields to overlay', () => {
  const d = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.PAYMENT_THANKS,
    source: SPRITE_SOURCES.PAYMENT_ASYNC,
    emotionKey: 'sessionComplete',
    context: { overlayBusy: true, now: afternoon }
  });
  assert.equal(d.reason, 'overlay-busy');
});

test('Focusing 2B wake is allowed; Focusing sleep is not', () => {
  const wake = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.LONG_AWAY_WAKE,
    source: SPRITE_SOURCES.VISIBILITY,
    context: { sessionState: STATES.FOCUSING, now: afternoon }
  });
  assert.equal(wake.occupy, SPRITE_OCCUPANCY.LONG_AWAY_WAKE);
  const sleep = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.DORMANT_ENTER,
    source: SPRITE_SOURCES.VISIBILITY,
    context: { sessionState: STATES.FOCUSING, now: afternoon }
  });
  assert.equal(sleep.reason, 'busy-session');
});

test('tap-blocking occupancy includes first-paint and sleep', () => {
  assert.equal(TAP_BLOCKING_OCCUPANCY.has(SPRITE_OCCUPANCY.WELCOME), true);
  assert.equal(TAP_BLOCKING_OCCUPANCY.has(SPRITE_OCCUPANCY.DORMANT_ENTER), true);
  assert.equal(TAP_BLOCKING_OCCUPANCY.has(SPRITE_OCCUPANCY.IDLE_BASELINE), false);
});

test('rise-sync only sleeps on 2h stamp, not late-night hour', () => {
  const freshNight = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.DORMANT_ENTER,
    source: SPRITE_SOURCES.RISE_SYNC,
    context: {
      now: twoAm,
      lateNight: true,
      lastEndedAt: Date.parse('2026-08-20T01:59:00'),
      sessionState: STATES.IDLE
    }
  });
  assert.equal(freshNight.reason, 'rise-sync-fresh');
  const stale = arbitrateSpriteChannel({
    intent: SPRITE_OCCUPANCY.DORMANT_ENTER,
    source: SPRITE_SOURCES.RISE_SYNC,
    context: {
      now: afternoon,
      lateNight: false,
      lastEndedAt: staleEnded,
      sessionState: STATES.IDLE
    }
  });
  assert.equal(stale.sessionDelta, 'enter-dormant');
});
