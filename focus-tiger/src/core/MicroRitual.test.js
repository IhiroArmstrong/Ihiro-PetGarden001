import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MICRO_RITUAL_BREATH_PHASE_MS,
  MICRO_RITUAL_DURATION_OPTIONS_MINUTES,
  MICRO_RITUAL_MS_DEFAULT,
  MICRO_RITUAL_MS_MAX,
  MICRO_RITUAL_MS_MIN,
  hasMicroRitualMsOverride,
  isInhalePhase,
  microRitualMinutesToMs,
  normalizeMicroRitualMinutes,
  resolveMicroRitualMs,
  shouldCompleteMicroRitualByWallClock
} from './MicroRitual.js';

describe('resolveMicroRitualMs', () => {
  it('defaults to 60s', () => {
    assert.equal(resolveMicroRitualMs(''), MICRO_RITUAL_MS_DEFAULT);
    assert.equal(resolveMicroRitualMs('?product=1'), MICRO_RITUAL_MS_DEFAULT);
  });

  it('reads ?microRitualMs= for e2e shortening', () => {
    assert.equal(resolveMicroRitualMs('?microRitualMs=1500'), 1500);
    assert.equal(
      resolveMicroRitualMs('?product=1&microRitualMs=800'),
      800
    );
  });

  it('clamps illegal / extreme values up to 20 minutes', () => {
    assert.equal(resolveMicroRitualMs('?microRitualMs=0'), MICRO_RITUAL_MS_MIN);
    assert.equal(
      resolveMicroRitualMs('?microRitualMs=99999999'),
      MICRO_RITUAL_MS_MAX
    );
    assert.equal(
      resolveMicroRitualMs('?microRitualMs=nope'),
      MICRO_RITUAL_MS_DEFAULT
    );
  });
});

describe('duration options', () => {
  it('exposes 1/3/5/10/20 minutes', () => {
    assert.deepEqual([...MICRO_RITUAL_DURATION_OPTIONS_MINUTES], [1, 3, 5, 10, 20]);
    assert.equal(MICRO_RITUAL_MS_MAX, 20 * 60_000);
  });

  it('microRitualMinutesToMs and normalizeMicroRitualMinutes', () => {
    assert.equal(microRitualMinutesToMs(5), 300_000);
    assert.equal(normalizeMicroRitualMinutes(10), 10);
    assert.equal(normalizeMicroRitualMinutes(7), 1);
  });

  it('hasMicroRitualMsOverride', () => {
    assert.equal(hasMicroRitualMsOverride(''), false);
    assert.equal(hasMicroRitualMsOverride('?microRitualMs=1500'), true);
  });
});

describe('shouldCompleteMicroRitualByWallClock', () => {
  it('false until duration elapsed', () => {
    const start = 1_000_000;
    assert.equal(
      shouldCompleteMicroRitualByWallClock(start, 60_000, start + 59_999),
      false
    );
    assert.equal(
      shouldCompleteMicroRitualByWallClock(start, 60_000, start + 60_000),
      true
    );
  });

  it('false when not started', () => {
    assert.equal(shouldCompleteMicroRitualByWallClock(null, 60_000, 1), false);
  });
});

describe('isInhalePhase', () => {
  it('even segments inhale, odd exhale', () => {
    assert.equal(isInhalePhase(0), true);
    assert.equal(isInhalePhase(MICRO_RITUAL_BREATH_PHASE_MS - 1), true);
    assert.equal(isInhalePhase(MICRO_RITUAL_BREATH_PHASE_MS), false);
    assert.equal(isInhalePhase(MICRO_RITUAL_BREATH_PHASE_MS * 2), true);
  });
});
