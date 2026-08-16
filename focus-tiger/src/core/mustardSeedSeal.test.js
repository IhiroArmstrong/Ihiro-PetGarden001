/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computePracticeScore } from './practiceBadgeAward.js';
import {
  MUSTARD_SEED_SEAL_SCORE_THRESHOLD,
  MUSTARD_SEED_SEAL_STORAGE_KEY,
  clearMustardSeedSealState,
  isMustardSeedSealScoreMet,
  markMustardSeedSealRevealed,
  readMustardSeedSealState,
  resolveMustardSeedSeal,
  shouldOfferMustardSeedSealAfterCeremony,
  mustardSeedSealBadgeSrc,
  MUSTARD_SEED_SEAL_BADGE_FILE,
  MUSTARD_SEED_SEAL_BADGE_PUBLIC_DIR
} from './mustardSeedSeal.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';

function memoryStorage(seed = {}) {
  /** @type {Record<string, string>} */
  const map = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
    },
    setItem(key, value) {
      map[key] = String(value);
    },
    removeItem(key) {
      delete map[key];
    }
  };
}

describe('mustardSeedSeal', () => {
  it('badge src uses dedicated mustard-seed-seal public dir', () => {
    assert.equal(
      MUSTARD_SEED_SEAL_BADGE_FILE,
      'yin-badge-square-gold-on-silver-alt.png'
    );
    assert.equal(
      mustardSeedSealBadgeSrc(),
      `${MUSTARD_SEED_SEAL_BADGE_PUBLIC_DIR}/${MUSTARD_SEED_SEAL_BADGE_FILE}`
    );
    assert.match(
      mustardSeedSealBadgeSrc(),
      /^\/ui\/support\/mustard-seed-seal\//
    );
  });

  it('score threshold matches unified practice score (21)', () => {
    assert.equal(MUSTARD_SEED_SEAL_SCORE_THRESHOLD, 21);
    assert.equal(
      computePracticeScore({ practiceDayCount: 15, lifetimeMinutes: 360 }),
      21
    );
    assert.equal(
      isMustardSeedSealScoreMet({
        practiceDayCount: 15,
        lifetimeMinutes: 360
      }),
      true
    );
    assert.equal(
      isMustardSeedSealScoreMet({
        practiceDayCount: 14,
        lifetimeMinutes: 359
      }),
      false
    );
  });

  it('shouldOffer only on completed + unlocked + not yet revealed', () => {
    assert.equal(
      shouldOfferMustardSeedSealAfterCeremony({
        completed: true,
        unlocked: true,
        revealed: false
      }),
      true
    );
    assert.equal(
      shouldOfferMustardSeedSealAfterCeremony({
        completed: false,
        unlocked: true,
        revealed: false
      }),
      false
    );
    assert.equal(
      shouldOfferMustardSeedSealAfterCeremony({
        completed: true,
        unlocked: true,
        revealed: true
      }),
      false
    );
    assert.equal(
      shouldOfferMustardSeedSealAfterCeremony({
        completed: true,
        unlocked: false,
        revealed: false
      }),
      false
    );
  });

  it('resolve: below threshold → no auto; claim persists revealed', () => {
    const storage = memoryStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: [{ date: '2026-08-01', totalMinutes: 25 }]
      })
    });
    const low = resolveMustardSeedSeal(storage);
    assert.equal(low.unlocked, false);
    assert.equal(low.shouldAutoReveal, false);

    const richDays = [];
    for (let i = 1; i <= 21; i += 1) {
      const d = String(i).padStart(2, '0');
      richDays.push({ date: `2026-07-${d}`, totalMinutes: 60 });
    }
    storage.setItem(
      PRACTICE_DAYS_STORAGE_KEY,
      JSON.stringify({ days: richDays })
    );
    const high = resolveMustardSeedSeal(storage);
    assert.ok(high.score >= 21);
    assert.equal(high.unlocked, true);
    assert.equal(high.shouldAutoReveal, true);

    markMustardSeedSealRevealed(storage, { scoreAtReveal: high.score });
    const after = resolveMustardSeedSeal(storage);
    assert.equal(after.revealed, true);
    assert.equal(after.shouldAutoReveal, false);
    assert.equal(readMustardSeedSealState(storage).revealed, true);

    clearMustardSeedSealState(storage);
    assert.equal(storage.getItem(MUSTARD_SEED_SEAL_STORAGE_KEY), null);
  });
});
