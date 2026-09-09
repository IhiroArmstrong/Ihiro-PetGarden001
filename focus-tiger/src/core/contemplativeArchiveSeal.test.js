/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LOTUS_POND_STORAGE_KEY } from './LotusPondStore.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import {
  clearContemplativeArchiveSealState,
  markContemplativeArchiveSealRevealed,
  readContemplativeArchiveSealState,
  resolveContemplativeArchiveSeal,
  shouldOfferContemplativeArchiveSealAfterCeremony
} from './contemplativeArchiveSeal.js';

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

function seedPracticeAndLotus(storage, dayCount, minutesPerDay) {
  const days = [];
  for (let i = 1; i <= dayCount; i += 1) {
    days.push({
      date: `2026-07-${String(i).padStart(2, '0')}`,
      totalMinutes: minutesPerDay
    });
  }
  storage.setItem(
    PRACTICE_DAYS_STORAGE_KEY,
    JSON.stringify({ days })
  );
  storage.setItem(
    LOTUS_POND_STORAGE_KEY,
    JSON.stringify({
      lifetimeMinutes: dayCount * minutesPerDay
    })
  );
}

describe('contemplativeArchiveSeal', () => {
  it('offers CA-01 at score 30 after mustard queue is done', () => {
    const storage = memoryStorage();
    seedPracticeAndLotus(storage, 15, 60);
    const resolved = resolveContemplativeArchiveSeal(storage);
    assert.equal(resolved.score, 30);
    assert.equal(resolved.nextEntry?.id, 'ca-01-old-pond');
    assert.equal(
      shouldOfferContemplativeArchiveSealAfterCeremony({
        completed: true,
        shouldAutoReveal: resolved.shouldAutoReveal
      }),
      true
    );
    assert.equal(resolved.menuEntries.length, 1);
    assert.equal(
      resolved.menuEntries[0].proxy,
      'contemplative-archive-seal:ca-01-old-pond'
    );
  });

  it('lists all twelve CA menu entries once score meets each threshold', () => {
    const storage = memoryStorage();
    seedPracticeAndLotus(storage, 30, 60);
    const resolved = resolveContemplativeArchiveSeal(storage);
    assert.equal(resolved.score, 60);
    assert.equal(resolved.menuEntries.length, 12);
    assert.equal(resolved.nextEntry?.id, 'ca-01-old-pond');
  });

  it('does not auto-offer below score 30', () => {
    const storage = memoryStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: [{ date: '2026-08-01', totalMinutes: 25 }]
      })
    });
    const resolved = resolveContemplativeArchiveSeal(storage);
    assert.equal(resolved.nextEntry, null);
    assert.equal(resolved.shouldAutoReveal, false);
    assert.equal(resolved.menuEntries.length, 0);
  });

  it('reveals once and clears state', () => {
    const storage = memoryStorage();
    markContemplativeArchiveSealRevealed(storage, 'ca-01-old-pond');
    assert.deepEqual(readContemplativeArchiveSealState(storage).revealedEntryIds, [
      'ca-01-old-pond'
    ]);
    const after = resolveContemplativeArchiveSeal(storage);
    assert.equal(after.nextEntry, null);
    clearContemplativeArchiveSealState(storage);
    assert.deepEqual(readContemplativeArchiveSealState(storage).revealedEntryIds, []);
  });

  it('uses lotus lifetime for score, not 90-day minutes sum alone', () => {
    const storage = memoryStorage();
    storage.setItem(
      PRACTICE_DAYS_STORAGE_KEY,
      JSON.stringify({
        days: [{ date: '2026-08-01', totalMinutes: 10 }]
      })
    );
    storage.setItem(
      LOTUS_POND_STORAGE_KEY,
      JSON.stringify({ lifetimeMinutes: 3600 })
    );

    const resolved = resolveContemplativeArchiveSeal(storage);
    assert.equal(resolved.summary.lifetimeMinutes, 3600);
    assert.ok(resolved.score >= 30);
  });
});
