/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { BreathEngine } from './breath-engine.js';
import {
  DEFAULT_PRESET_ID,
  PRESETS,
  resolveBreathPacerConfig
} from './breath-presets.js';

function createTestEngine() {
  return new BreathEngine({
    setTimer: () => 1,
    clearTimer: () => {}
  });
}

describe('BreathEngine', () => {
  it('runs 4-4-4 box breathing for 4 cycles in 48 ticks', () => {
    const engine = createTestEngine();
    /** @type {string[]} */
    const phases = [];
    let completes = 0;

    engine.on('tick', (detail) => {
      phases.push(
        /** @type {{ phase: string }} */ (detail).phase
      );
    });
    engine.on('complete', () => {
      completes += 1;
    });

    engine.start({ inhale: 4, hold: 4, exhale: 4 }, 4);
    for (let i = 0; i < 48; i += 1) {
      engine.advanceTick();
    }

    assert.equal(completes, 1);
    assert.equal(phases.length >= 48, true);
    assert.deepEqual(
      phases.slice(0, 4),
      ['inhale', 'inhale', 'inhale', 'inhale']
    );
    assert.equal(phases[4], 'hold');
  });

  it('skips hold when hold is 0 (natural preset)', () => {
    const engine = createTestEngine();
    /** @type {string[]} */
    const phaseChanges = [];

    engine.on('phase-change', (detail) => {
      phaseChanges.push(
        /** @type {{ phase: string }} */ (detail).phase
      );
    });

    engine.start({ inhale: 4, hold: 0, exhale: 6 }, 1);
    for (let i = 0; i < 10; i += 1) {
      engine.advanceTick();
    }

    assert.ok(phaseChanges.includes('inhale'));
    assert.ok(phaseChanges.includes('exhale'));
    assert.equal(phaseChanges.includes('hold'), false);
  });

  it('pause blocks interval advancement until resume', () => {
    const engine = createTestEngine();
    engine.start({ inhale: 4, hold: 0, exhale: 4 }, 1);
    const before = engine.getState().remainingSeconds;
    engine.pause();
    engine.advanceTick();
    assert.equal(engine.getState().remainingSeconds, before);
    engine.resume();
    engine.advanceTick();
    assert.equal(engine.getState().remainingSeconds, before - 1);
  });

  it('stop clears running state', () => {
    const engine = createTestEngine();
    engine.start({ inhale: 4, hold: 0, exhale: 4 }, 2);
    engine.stop();
    assert.equal(engine.getState().running, false);
  });
});

describe('breath-presets', () => {
  it('defaults to natural preset and cycles', () => {
    const resolved = resolveBreathPacerConfig(undefined, undefined);
    assert.equal(resolved.presetId, DEFAULT_PRESET_ID);
    assert.equal(resolved.preset.inhale, 4);
    assert.equal(resolved.preset.hold, 0);
    assert.equal(resolved.preset.exhale, 6);
    assert.equal(resolved.cycles, PRESETS.natural.defaultCycles);
  });

  it('clamps invalid cycles to at least 1', () => {
    const resolved = resolveBreathPacerConfig('box', 0);
    assert.equal(resolved.cycles, 1);
  });
});
