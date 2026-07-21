import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MICRO_RITUAL_MS_DEFAULT,
  MICRO_RITUAL_MS_MIN,
  resolveMicroRitualMs
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

  it('clamps illegal / extreme values', () => {
    assert.equal(resolveMicroRitualMs('?microRitualMs=0'), MICRO_RITUAL_MS_MIN);
    assert.equal(
      resolveMicroRitualMs('?microRitualMs=999999'),
      MICRO_RITUAL_MS_DEFAULT
    );
    assert.equal(
      resolveMicroRitualMs('?microRitualMs=nope'),
      MICRO_RITUAL_MS_DEFAULT
    );
  });
});
