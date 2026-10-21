/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_LISTENING_IDLE_TIMING,
  DEFAULT_IDLE_ORCHESTRATOR_TIMING,
  normalizeIdleOrchestratorTiming
} from './confideListeningIdlePolicy.js';

test('confide listening idle favors open-eye arcs over default', () => {
  assert.equal(DEFAULT_IDLE_ORCHESTRATOR_TIMING.breathPingpongCycles, 2);
  assert.equal(DEFAULT_IDLE_ORCHESTRATOR_TIMING.blinkPingpongCycles, 1);
  assert.equal(CONFIDE_LISTENING_IDLE_TIMING.breathPingpongCycles, 1);
  assert.equal(CONFIDE_LISTENING_IDLE_TIMING.blinkPingpongCycles, 2);
  assert.ok(
    CONFIDE_LISTENING_IDLE_TIMING.blinkPingpongCycles >
      DEFAULT_IDLE_ORCHESTRATOR_TIMING.blinkPingpongCycles
  );
  assert.ok(
    CONFIDE_LISTENING_IDLE_TIMING.breathPingpongCycles <
      DEFAULT_IDLE_ORCHESTRATOR_TIMING.breathPingpongCycles
  );
});

test('normalizeIdleOrchestratorTiming clamps invalid values', () => {
  assert.deepEqual(
    normalizeIdleOrchestratorTiming({ breathPingpongCycles: 0.2, blinkPingpongCycles: 0.2 }),
    { breathPingpongCycles: 1, blinkPingpongCycles: 1 }
  );
});
