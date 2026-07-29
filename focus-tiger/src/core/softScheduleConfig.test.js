import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CELEBRATE_DANCE_VARIANTS,
  DAILY_MESSAGE_TECH_VERIFY_KEYS,
  DEFAULT_CELEBRATE_DANCE_WEIGHTS,
  pickCelebrateDanceVariant,
  pickDailyMessageKey,
  pickWeightedVariantId
} from './softScheduleConfig.js';

describe('softScheduleConfig · celebrating weights', () => {
  it('default pick is 50/50 over celebrateDance / V2', () => {
    const counts = { celebrateDance: 0, celebrateDanceV2: 0 };
    let i = 0;
    const seq = [0.0, 0.49, 0.5, 0.99];
    for (const r of seq) {
      const id = pickCelebrateDanceVariant(() => r);
      counts[id] += 1;
      i += 1;
    }
    assert.equal(i, 4);
    assert.equal(counts.celebrateDance, 2);
    assert.equal(counts.celebrateDanceV2, 2);
    assert.deepEqual(
      CELEBRATE_DANCE_VARIANTS,
      DEFAULT_CELEBRATE_DANCE_WEIGHTS.map((v) => v.id)
    );
  });

  it('A6: all-zero weights fall back to default 50/50', () => {
    const zeros = [
      { id: 'celebrateDance', weight: 0 },
      { id: 'celebrateDanceV2', weight: 0 }
    ];
    assert.equal(pickWeightedVariantId(zeros, () => 0.1), 'celebrateDance');
    assert.equal(pickWeightedVariantId(zeros, () => 0.9), 'celebrateDanceV2');
  });

  it('can bias entirely to V2 when weight table says so', () => {
    const onlyV2 = [
      { id: 'celebrateDance', weight: 0 },
      { id: 'celebrateDanceV2', weight: 1 }
    ];
    assert.equal(pickCelebrateDanceVariant(() => 0.01, onlyV2), 'celebrateDanceV2');
    assert.equal(pickCelebrateDanceVariant(() => 0.99, onlyV2), 'celebrateDanceV2');
  });
});

describe('softScheduleConfig · daily message tech verify', () => {
  it('same localDate+locale+slot → same messageKey', () => {
    const a = pickDailyMessageKey({
      locale: 'en',
      localDate: '2026-07-29',
      slot: 'tech_verify'
    });
    const b = pickDailyMessageKey({
      locale: 'en',
      localDate: '2026-07-29',
      slot: 'tech_verify'
    });
    assert.equal(a.messageKey, b.messageKey);
    assert.equal(a.variantSeed, '2026-07-29:en:tech_verify');
    assert.ok(DAILY_MESSAGE_TECH_VERIFY_KEYS.includes(a.messageKey));
  });

  it('different dates can differ (not required equal)', () => {
    const keys = new Set();
    for (let d = 1; d <= 30; d += 1) {
      const day = String(d).padStart(2, '0');
      keys.add(
        pickDailyMessageKey({
          locale: 'en',
          localDate: `2026-07-${day}`
        }).messageKey
      );
    }
    assert.ok(keys.size >= 2, 'expected hash to spread across pool over a month');
  });
});
