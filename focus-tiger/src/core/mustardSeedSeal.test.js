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
  MUSTARD_SEED_SEAL_CASE_SUMERU,
  MUSTARD_SEED_SEAL_CASE_HERO,
  MUSTARD_SEED_SEAL_CASES,
  MUSTARD_SEED_SEAL_HERO_POEM_ZH,
  MUSTARD_SEED_SEAL_HERO_ATTRIBUTION_ZH,
  clearMustardSeedSealState,
  getMustardSeedSealCase,
  isMustardSeedSealScoreMet,
  listRevealedMustardSeedCaseIds,
  markMustardSeedSealRevealed,
  nextUnrevealedMustardSeedCase,
  pickMustardSeedSealMenuCase,
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

  it('catalog has two Le Wu Zhai verse cases', () => {
    assert.equal(MUSTARD_SEED_SEAL_CASES.length, 2);
    assert.equal(MUSTARD_SEED_SEAL_CASES[0].id, MUSTARD_SEED_SEAL_CASE_SUMERU);
    assert.equal(MUSTARD_SEED_SEAL_CASES[1].id, MUSTARD_SEED_SEAL_CASE_HERO);
    assert.deepEqual(MUSTARD_SEED_SEAL_HERO_POEM_ZH, [
      '山海奇云风幡舞，',
      '红尘如电亦如露。',
      '芥子无量纳须弥，',
      '英雄岂是池中物。'
    ]);
    assert.equal(
      MUSTARD_SEED_SEAL_HERO_ATTRIBUTION_ZH,
      '乐五斋七言歌行'
    );
    assert.equal(
      getMustardSeedSealCase(MUSTARD_SEED_SEAL_CASE_HERO)?.poemZh.length,
      4
    );
  });

  it('shouldOffer only on completed + unlocked + pending case', () => {
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
        unlocked: true,
        revealed: true,
        hasUnrevealedCase: true
      }),
      true
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

  it('legacy revealed without case ids still auto-offers case 2', () => {
    const revealed = { revealed: true, revealedAt: '2026-08-11T00:00:00.000Z' };
    assert.deepEqual(listRevealedMustardSeedCaseIds(revealed), [
      MUSTARD_SEED_SEAL_CASE_SUMERU
    ]);
    assert.equal(
      nextUnrevealedMustardSeedCase(revealed)?.id,
      MUSTARD_SEED_SEAL_CASE_HERO
    );
  });

  it('legacy storage JSON without revealedCaseIds still offers case 2', () => {
    const richDays = [];
    for (let i = 1; i <= 21; i += 1) {
      const d = String(i).padStart(2, '0');
      richDays.push({ date: `2026-07-${d}`, totalMinutes: 60 });
    }
    const storage = memoryStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({ days: richDays }),
      [MUSTARD_SEED_SEAL_STORAGE_KEY]: JSON.stringify({
        revealed: true,
        revealedAt: '2026-08-11T00:00:00.000Z',
        scoreAtReveal: 21
      })
    });
    const resolved = resolveMustardSeedSeal(storage);
    assert.equal(resolved.revealed, true);
    assert.equal(resolved.shouldAutoReveal, true);
    assert.equal(resolved.nextCase?.id, MUSTARD_SEED_SEAL_CASE_HERO);
  });

  it('menu pick cycles revealed cases', () => {
    const both = {
      revealed: true,
      revealedCaseIds: [
        MUSTARD_SEED_SEAL_CASE_SUMERU,
        MUSTARD_SEED_SEAL_CASE_HERO
      ],
      lastShownCaseId: MUSTARD_SEED_SEAL_CASE_SUMERU
    };
    assert.equal(
      pickMustardSeedSealMenuCase(both).id,
      MUSTARD_SEED_SEAL_CASE_HERO
    );
    assert.equal(
      pickMustardSeedSealMenuCase({
        ...both,
        lastShownCaseId: MUSTARD_SEED_SEAL_CASE_HERO
      }).id,
      MUSTARD_SEED_SEAL_CASE_SUMERU
    );
  });

  it('resolve: below threshold → no auto; each case auto-reveals once', () => {
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
    const afterFirst = resolveMustardSeedSeal(storage);
    assert.equal(afterFirst.revealed, true);
    assert.equal(afterFirst.nextCase?.id, MUSTARD_SEED_SEAL_CASE_HERO);
    assert.equal(afterFirst.shouldAutoReveal, true);
    assert.equal(readMustardSeedSealState(storage).revealed, true);
    assert.deepEqual(afterFirst.revealedCaseIds, [
      MUSTARD_SEED_SEAL_CASE_SUMERU
    ]);

    markMustardSeedSealRevealed(storage, {
      caseId: MUSTARD_SEED_SEAL_CASE_HERO
    });
    const afterBoth = resolveMustardSeedSeal(storage);
    assert.equal(afterBoth.shouldAutoReveal, false);
    assert.equal(afterBoth.nextCase, null);
    assert.deepEqual(afterBoth.revealedCaseIds, [
      MUSTARD_SEED_SEAL_CASE_SUMERU,
      MUSTARD_SEED_SEAL_CASE_HERO
    ]);

    clearMustardSeedSealState(storage);
    assert.equal(storage.getItem(MUSTARD_SEED_SEAL_STORAGE_KEY), null);
  });
});
