/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CLOAK_VARIANTS,
  WELLNESS_DAY_BANDS,
  cloakSleepSequenceKey,
  dormantWakeSequenceKey,
  normalizeCloakVariant,
  pickCloakVariant,
  resolveWellnessDayBand,
  sleepingSequenceKey
} from './cloakVariant.js';

describe('cloakVariant', () => {
  it('pickCloakVariant is roughly 50/50 over many draws', () => {
    let i = 0;
    const sequence = [0.1, 0.6, 0.2, 0.9, 0.49, 0.5];
    const random = () => sequence[i++ % sequence.length];
    const picks = sequence.map(() => pickCloakVariant(random));
    assert.deepEqual(picks, [
      CLOAK_VARIANTS.CLASSIC,
      CLOAK_VARIANTS.STARLIGHT,
      CLOAK_VARIANTS.CLASSIC,
      CLOAK_VARIANTS.STARLIGHT,
      CLOAK_VARIANTS.CLASSIC,
      CLOAK_VARIANTS.STARLIGHT
    ]);
  });

  it('maps variants to sequence keys', () => {
    assert.equal(cloakSleepSequenceKey('classic'), 'cloakSleep');
    assert.equal(cloakSleepSequenceKey('starlight'), 'starlightCloakSleep');
    assert.equal(sleepingSequenceKey('starlight'), 'starlightSleeping');
    assert.equal(dormantWakeSequenceKey('classic'), 'dormantWake');
    assert.equal(dormantWakeSequenceKey('starlight'), 'starlightDormantWake');
    assert.equal(normalizeCloakVariant('nope'), CLOAK_VARIANTS.CLASSIC);
  });

  it('resolveWellnessDayBand matches morning / day / lateNight', () => {
    assert.equal(
      resolveWellnessDayBand(new Date('2026-08-04T07:30:00')),
      WELLNESS_DAY_BANDS.MORNING
    );
    assert.equal(
      resolveWellnessDayBand(new Date('2026-08-04T15:00:00')),
      WELLNESS_DAY_BANDS.DAY
    );
    assert.equal(
      resolveWellnessDayBand(new Date('2026-08-04T23:30:00')),
      WELLNESS_DAY_BANDS.LATE_NIGHT
    );
    assert.equal(
      resolveWellnessDayBand(new Date('2026-08-04T02:00:00')),
      WELLNESS_DAY_BANDS.LATE_NIGHT
    );
  });
});
