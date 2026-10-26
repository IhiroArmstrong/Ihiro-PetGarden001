/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STAY
} from './FocusSession.js';
import { AWAKEN_COOLDOWN_MS } from './InterventionOrchestrator.js';
import {
  decideRhythmTiming,
  effectiveAwakenCooldownMs,
  observationalRhythmStats,
  RHYTHM_LEVEL
} from './inputRhythmEngine.js';

describe('inputRhythmEngine', () => {
  it('stays L0 when the switch is off (SB-21)', () => {
    const timing = decideRhythmTiming({
      enabled: false,
      authorized: true,
      helperAlive: true,
      companionMode: COMPANION_MODE_STAY,
      backspaceRatio: 1,
      awayFromTaskApp: true
    });
    assert.equal(timing.level, RHYTHM_LEVEL.L0);
    assert.equal(timing.reason, 'sb-21');
    assert.equal(timing.allowEarlyAwayInvite, false);
    assert.equal(effectiveAwakenCooldownMs(timing), AWAKEN_COOLDOWN_MS);
  });

  it('does not invite from typing revisions alone', () => {
    const timing = decideRhythmTiming({
      enabled: true,
      authorized: true,
      helperAlive: true,
      companionMode: COMPANION_MODE_STAY,
      backspaceRatio: 0.9,
      awayFromTaskApp: false,
      switchCount5m: 0
    });
    assert.equal(timing.allowEarlyAwayInvite, false);
    assert.equal(timing.reason, 'neutral');
  });

  it('may advance Here & Now only when backspaces rise and the user left the task app', () => {
    const timing = decideRhythmTiming({
      enabled: true,
      authorized: true,
      helperAlive: true,
      companionMode: COMPANION_MODE_STAY,
      backspaceRatio: 0.4,
      awayFromTaskApp: true
    });
    assert.equal(timing.level, RHYTHM_LEVEL.L1);
    assert.equal(timing.allowEarlyAwayInvite, true);
    assert.ok(effectiveAwakenCooldownMs(timing) < AWAKEN_COOLDOWN_MS);
  });

  it('never lets Flow State rhythm create an away invite', () => {
    const timing = decideRhythmTiming({
      enabled: true,
      authorized: true,
      helperAlive: true,
      companionMode: COMPANION_MODE_ACROSS_TOOLS,
      backspaceRatio: 0.9,
      awayFromTaskApp: true
    });
    assert.equal(timing.allowEarlyAwayInvite, false);
    assert.equal(timing.reason, 'flow-protect');
    assert.equal(effectiveAwakenCooldownMs(timing), AWAKEN_COOLDOWN_MS);
  });

  it('describes cadence without a 0-100 score', () => {
    const few = observationalRhythmStats({ keys: 20, backs: 1, switches: 0 });
    assert.equal(few.backspaceBand, 'few');
    assert.equal(few.switchBand, 'few');
  });
});
