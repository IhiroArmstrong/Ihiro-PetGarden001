/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS
} from './FocusSession.js';
import {
  AWAKEN_COOLDOWN_MS,
  AWAKEN_FORBIDDEN_COPY,
  AWAKEN_STATES,
  InterventionOrchestrator,
  awakenModeState,
  decideAwakenInvite
} from './InterventionOrchestrator.js';

const STAY = {
  focusing: true,
  companionMode: COMPANION_MODE_STAY,
  now: 1_000_000
};

describe('InterventionOrchestrator', () => {
  it('uses FLOW_PROTECT for Flow / Offline and never names ANXIETY', () => {
    assert.equal(awakenModeState(COMPANION_MODE_STAY), AWAKEN_STATES.NEUTRAL);
    assert.equal(
      awakenModeState(COMPANION_MODE_STEP_AWAY),
      AWAKEN_STATES.FLOW_PROTECT
    );
    assert.equal(
      awakenModeState(COMPANION_MODE_ACROSS_TOOLS),
      AWAKEN_STATES.FLOW_PROTECT
    );
    assert.equal(Object.values(AWAKEN_STATES).includes('ANXIETY'), false);
  });

  it('yields when overlay busy or tray hidden', () => {
    assert.equal(
      decideAwakenInvite({
        ...STAY,
        kind: 'away',
        displayEligible: true,
        refocusSlotConsumed: true,
        yieldBusy: true
      }).reason,
      'sb-10'
    );
    assert.equal(
      decideAwakenInvite({
        ...STAY,
        kind: 'away',
        displayEligible: true,
        refocusSlotConsumed: true,
        trayHidden: true
      }).reason,
      'sb-18'
    );
  });

  it('keeps SB-01/02 until Re-focus has used its slot', () => {
    assert.equal(
      decideAwakenInvite({
        ...STAY,
        kind: 'away',
        displayEligible: false,
        refocusSlotConsumed: false
      }).reason,
      'below-refocus-threshold'
    );
    assert.equal(
      decideAwakenInvite({
        ...STAY,
        kind: 'away',
        displayEligible: true,
        refocusSlotConsumed: false
      }).reason,
      'refocus-first'
    );
  });

  it('cools down 10 minutes after Re-focus or an invite', () => {
    const denied = decideAwakenInvite({
      ...STAY,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true,
      lastActiveAt: STAY.now - 60_000
    });
    assert.equal(denied.reason, 'cooldown');
    const ok = decideAwakenInvite({
      ...STAY,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true,
      lastActiveAt: STAY.now - AWAKEN_COOLDOWN_MS
    });
    assert.equal(ok.show, true);
    assert.equal(ok.state, AWAKEN_STATES.AWAY_INVITE);
  });

  it('caps one active invite per hour', () => {
    const denied = decideAwakenInvite({
      ...STAY,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true,
      hourCount: 1,
      hourWindowStart: STAY.now - 1000
    });
    assert.equal(denied.reason, 'hour-cap');
  });

  it('suppresses away invites in Flow / Offline (SB-03)', () => {
    assert.equal(
      decideAwakenInvite({
        focusing: true,
        companionMode: COMPANION_MODE_STEP_AWAY,
        kind: 'away',
        displayEligible: true,
        refocusSlotConsumed: true,
        now: 1
      }).reason,
      'sb-03'
    );
    assert.equal(
      decideAwakenInvite({
        focusing: true,
        companionMode: COMPANION_MODE_ACROSS_TOOLS,
        kind: 'away',
        displayEligible: true,
        refocusSlotConsumed: true,
        now: 1
      }).reason,
      'sb-03'
    );
  });

  it('offers +5 continue only in Flow at session end', () => {
    const hereNow = decideAwakenInvite({
      ...STAY,
      kind: 'extend',
      sessionReachedTarget: true
    });
    assert.equal(hereNow.reason, 'here-and-now-no-extend');
    const flow = decideAwakenInvite({
      focusing: true,
      companionMode: COMPANION_MODE_STEP_AWAY,
      kind: 'extend',
      sessionReachedTarget: true,
      now: 1
    });
    assert.equal(flow.show, true);
    assert.equal(flow.kind, 'extend');
  });

  it('routes long-sit to the same pause surface', () => {
    const d = decideAwakenInvite({
      ...STAY,
      kind: 'long-sit',
      stretchDue: true
    });
    assert.equal(d.show, true);
    assert.equal(d.state, AWAKEN_STATES.LONG_SIT_INVITE);
  });

  it('locale copy has no diagnostic labels', () => {
    const slice = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '../locales/slices/awaken-invite.json'),
        'utf8'
      )
    );
    for (const locale of ['en', 'zh', 'ja']) {
      for (const value of Object.values(slice[locale])) {
        assert.equal(AWAKEN_FORBIDDEN_COPY.test(String(value)), false, value);
      }
    }
  });

  it('records cooldown after a shown invite', () => {
    let now = 5_000;
    const orch = new InterventionOrchestrator({ now: () => now });
    orch.startSession(COMPANION_MODE_STAY);
    const first = orch.decide({
      focusing: true,
      companionMode: COMPANION_MODE_STAY,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true
    });
    assert.equal(first.show, true);
    orch.noteInviteShown();
    now += 60_000;
    const second = orch.decide({
      focusing: true,
      companionMode: COMPANION_MODE_STAY,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true
    });
    assert.equal(second.show, false);
    assert.ok(second.reason === 'cooldown' || second.reason === 'hour-cap');
  });

  it('accepts a shorter cooldown from input rhythm without skipping Flow protect', () => {
    const ok = decideAwakenInvite({
      ...STAY,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true,
      lastActiveAt: STAY.now - 8 * 60 * 1000,
      cooldownMs: 7 * 60 * 1000
    });
    assert.equal(ok.show, true);
    assert.equal(
      decideAwakenInvite({
        focusing: true,
        companionMode: COMPANION_MODE_ACROSS_TOOLS,
        kind: 'away',
        displayEligible: true,
        refocusSlotConsumed: true,
        now: 1,
        cooldownMs: 1
      }).reason,
      'sb-03'
    );
  });
});
