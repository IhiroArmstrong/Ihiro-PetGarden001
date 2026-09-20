/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRACTICE_IMPRINT_CATALOG_IDS,
  clearPracticeImprintState,
  formatPracticeImprintSeasonPhrase,
  markPracticeImprintRevealed,
  nextUnrevealedPracticeImprintId,
  practiceImprintMinutesThreshold,
  readPracticeImprintState,
  resolvePracticeImprint,
  shouldOfferPracticeImprintAfterCeremony,
  syncPracticeImprintAwards
} from './practiceImprint.js';

function memoryStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem(key) {
      return map[key] ?? null;
    },
    setItem(key, value) {
      map[key] = String(value);
    },
    removeItem(key) {
      delete map[key];
    }
  };
}

describe('practiceImprint', () => {
  it('catalog ids follow milestone imprint rows in order', () => {
    assert.deepEqual(PRACTICE_IMPRINT_CATALOG_IDS, [
      'imprint-minutes-600',
      'imprint-minutes-3000',
      'imprint-minutes-10800'
    ]);
    assert.equal(practiceImprintMinutesThreshold('imprint-minutes-600'), 600);
  });

  it('awards imprint tiers monotonically and never revokes', () => {
    const storage = memoryStorage();
    const context = { lifetimeMinutes: 650 };
    const first = syncPracticeImprintAwards(storage, context, () => new Date('2026-06-15'));
    assert.deepEqual(first.newlyAwardedIds, ['imprint-minutes-600']);
    assert.deepEqual(readPracticeImprintState(storage).awardedIds, [
      'imprint-minutes-600'
    ]);

    const second = syncPracticeImprintAwards(
      storage,
      { lifetimeMinutes: 100 },
      () => new Date('2026-07-01')
    );
    assert.deepEqual(second.newlyAwardedIds, []);
    assert.deepEqual(readPracticeImprintState(storage).awardedIds, [
      'imprint-minutes-600'
    ]);
  });

  it('unlocks higher tiers independently when minutes cross thresholds', () => {
    const storage = memoryStorage();
    syncPracticeImprintAwards(
      storage,
      { lifetimeMinutes: 3100 },
      () => new Date('2026-08-01')
    );
    const state = readPracticeImprintState(storage);
    assert.deepEqual(state.awardedIds, [
      'imprint-minutes-600',
      'imprint-minutes-3000'
    ]);
    assert.equal(
      nextUnrevealedPracticeImprintId(state),
      'imprint-minutes-600'
    );
  });

  it('reveal marks one tier and auto-offer gate respects reveal state', () => {
    const storage = memoryStorage();
    syncPracticeImprintAwards(storage, { lifetimeMinutes: 700 });
    markPracticeImprintRevealed(storage, 'imprint-minutes-600');
    const resolved = resolvePracticeImprint(storage, {
      storage,
      now: () => new Date('2026-09-01')
    });
    assert.equal(resolved.shouldAutoReveal, false);
    assert.equal(
      shouldOfferPracticeImprintAfterCeremony({
        completed: true,
        shouldAutoReveal: resolved.shouldAutoReveal
      }),
      false
    );
  });

  it('offers lowest unrevealed awarded tier after ceremony', () => {
    const storage = memoryStorage();
    syncPracticeImprintAwards(storage, { lifetimeMinutes: 3200 });
    const resolved = resolvePracticeImprint(storage, { storage });
    assert.equal(resolved.nextCatalogId, 'imprint-minutes-600');
    assert.equal(
      shouldOfferPracticeImprintAfterCeremony({
        completed: true,
        shouldAutoReveal: resolved.shouldAutoReveal
      }),
      true
    );
  });

  it('formats season phrase per locale without streak copy', () => {
    const date = new Date('2026-07-10');
    assert.equal(formatPracticeImprintSeasonPhrase(date, 'zh'), '始于 2026 年夏');
    assert.equal(formatPracticeImprintSeasonPhrase(date, 'ja'), '2026年夏より');
    assert.match(formatPracticeImprintSeasonPhrase(date, 'en'), /summer 2026/);
  });

  it('clear resets storage', () => {
    const storage = memoryStorage();
    syncPracticeImprintAwards(storage, { lifetimeMinutes: 700 });
    clearPracticeImprintState(storage);
    assert.deepEqual(readPracticeImprintState(storage).awardedIds, []);
  });
});
