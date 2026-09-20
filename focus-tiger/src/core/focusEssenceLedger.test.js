/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY
} from './FocusSession.js';
import { computeFocusCoinsGrant } from './focusCoinsLedger.js';
import {
  FOCUS_ESSENCE_DISPLAY_NAME_EN,
  FOCUS_ESSENCE_DISPLAY_NAME_JA,
  GRANT_KIND,
  computeFocusEssenceGrant,
  emptyFocusEssenceDayState,
  emptyFocusEssenceSessionState
} from './focusEssenceLedger.js';

describe('focusEssenceLedger L0', () => {
  it('display names lock EN Focus Essence and JA 精進', () => {
    assert.equal(FOCUS_ESSENCE_DISPLAY_NAME_EN, 'Focus Essence');
    assert.equal(FOCUS_ESSENCE_DISPLAY_NAME_JA, '精進');
  });

  it('incomplete / unreached timed session → 0', () => {
    const a = computeFocusEssenceGrant({ kind: GRANT_KIND.INCOMPLETE });
    assert.equal(a.points, 0);
    assert.equal(a.reason, 'incomplete');
    const b = computeFocusEssenceGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: false,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes: 25
    });
    assert.equal(b.points, 0);
    assert.equal(b.reason, 'incomplete');
  });

  it('Stay 25 min → 5; Across tools 25 min → 2', () => {
    const stay = computeFocusEssenceGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes: 25
    });
    assert.equal(stay.points, 5);
    assert.equal(stay.durationDelta, 5);
    const flow = computeFocusEssenceGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_ACROSS_TOOLS,
      durationMinutes: 25
    });
    assert.equal(flow.points, 2);
    const offline = computeFocusEssenceGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STEP_AWAY,
      durationMinutes: 25
    });
    assert.equal(offline.points, 2);
  });

  it('Honesty 30 → 3; same-day second Honesty → 0', () => {
    const first = computeFocusEssenceGrant({
      kind: GRANT_KIND.HONESTY,
      durationMinutes: 30
    });
    assert.equal(first.points, 3);
    assert.equal(first.nextDay.honestyMinted, true);
    const second = computeFocusEssenceGrant(
      { kind: GRANT_KIND.HONESTY, durationMinutes: 30 },
      first.nextDay
    );
    assert.equal(second.points, 0);
    assert.equal(second.reason, 'honesty-already-minted');
  });

  it('duration pool above 36 stops minting', () => {
    const day = emptyFocusEssenceDayState();
    day.durationGranted = 36;
    const g = computeFocusEssenceGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      day
    );
    assert.equal(g.points, 0);
    assert.equal(g.reason, 'daily-cap');
  });

  it('presence echo +3 only on first qualifying grant when yesterday practiced', () => {
    const none = computeFocusEssenceGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      emptyFocusEssenceDayState(),
      emptyFocusEssenceSessionState(),
      { yesterdayPracticed: false }
    );
    assert.equal(none.points, 5);
    assert.equal(none.echoDelta, 0);

    const echoed = computeFocusEssenceGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      emptyFocusEssenceDayState(),
      emptyFocusEssenceSessionState(),
      { yesterdayPracticed: true }
    );
    assert.equal(echoed.points, 8);
    assert.equal(echoed.echoDelta, 3);

    const second = computeFocusEssenceGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      echoed.nextDay,
      emptyFocusEssenceSessionState(),
      { yesterdayPracticed: true }
    );
    assert.equal(second.points, 5);
    assert.equal(second.echoDelta, 0);
  });

  it('passive Recover and dormantWake → 0', () => {
    assert.equal(
      computeFocusEssenceGrant({ kind: GRANT_KIND.PASSIVE_RECOVER }).points,
      0
    );
    assert.equal(
      computeFocusEssenceGrant({ kind: GRANT_KIND.DORMANT_WAKE }).points,
      0
    );
  });

  it('ritual Arrive/Reflect/active Recover respect session and daily caps', () => {
    const arrive = computeFocusEssenceGrant({ kind: GRANT_KIND.ARRIVE });
    assert.equal(arrive.points, 2);
    const arriveAgain = computeFocusEssenceGrant(
      { kind: GRANT_KIND.ARRIVE },
      arrive.nextDay,
      arrive.nextSession
    );
    assert.equal(arriveAgain.points, 0);

    const recover = computeFocusEssenceGrant({ kind: GRANT_KIND.ACTIVE_RECOVER });
    assert.equal(recover.points, 1);
    const day = recover.nextDay;
    day.activeRecoverCount = 3;
    const capped = computeFocusEssenceGrant(
      { kind: GRANT_KIND.ACTIVE_RECOVER },
      day,
      emptyFocusEssenceSessionState()
    );
    assert.equal(capped.points, 0);
    assert.equal(capped.reason, 'active-recover-daily-cap');
  });

  it('mirrors coin grant for identical event (parity lock)', () => {
    const event = {
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes: 10
    };
    const day = emptyFocusEssenceDayState();
    const session = emptyFocusEssenceSessionState();
    const essence = computeFocusEssenceGrant(event, day, session, {
      yesterdayPracticed: true
    });
    const coins = computeFocusCoinsGrant(event, day, session, {
      yesterdayPracticed: true
    });
    assert.deepEqual(
      {
        points: essence.points,
        reason: essence.reason,
        durationDelta: essence.durationDelta,
        echoDelta: essence.echoDelta
      },
      {
        points: coins.points,
        reason: coins.reason,
        durationDelta: coins.durationDelta,
        echoDelta: coins.echoDelta
      }
    );
  });
});
