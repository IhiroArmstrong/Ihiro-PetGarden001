/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS,
  COLLECTIONS_SCARCITY_NAME_KEYS,
  formatCollectionsScarcityExplanation,
  listCollectionsBehavioralScarcityRows
} from './collectionsBehavioralScarcity.js';
import { LOTUS_POND_STORAGE_KEY, LotusPondStore } from './LotusPondStore.js';
import {
  PRACTICE_DAYS_STORAGE_KEY,
  PracticeDaysStore
} from './PracticeDaysStore.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import { MUSTARD_SEED_SEAL_SCORE_THRESHOLD } from './mustardSeedSeal.js';

const LOOKUP = {
  COLLECTIONS_SCARCITY_NAME_SCORE_21: 'Mustard gate',
  COLLECTIONS_SCARCITY_NAME_IMPRINT_600: '600m imprint',
  COLLECTIONS_SCARCITY_NAME_IMPRINT_3000: '3000m imprint',
  COLLECTIONS_SCARCITY_NAME_IMPRINT_10800: '10800m imprint',
  COLLECTIONS_SCARCITY_EXPLAIN_SCORE: 'Score {score} on this device.',
  COLLECTIONS_SCARCITY_EXPLAIN_MINUTES: '{minutes} minutes on this device.',
  COLLECTIONS_SCARCITY_LOCKED: 'Not reached on this path yet.'
};

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

function seedPracticeDays(storage, dayKeys, minutes = 0) {
  storage.setItem(
    PRACTICE_DAYS_STORAGE_KEY,
    JSON.stringify({
      days: dayKeys.map((date) => ({ date, totalMinutes: minutes }))
    })
  );
}

function consecutiveDayKeys(startKey, count) {
  const keys = [];
  let cursor = startKey;
  for (let i = 0; i < count; i += 1) {
    keys.push(cursor);
    const [y, m, d] = cursor.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + 1);
    cursor = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
  return keys;
}

function makeDeps({ lifetimeMinutes = 0, practiceDayCount = 0 } = {}) {
  const storage = memoryStorage();
  const now = () => new Date('2026-09-20T12:00:00');
  if (lifetimeMinutes > 0) {
    storage.setItem(
      LOTUS_POND_STORAGE_KEY,
      JSON.stringify({
        lifetimeMinutes,
        scoreEligibleLifetimeMinutes: lifetimeMinutes
      })
    );
  }
  if (practiceDayCount > 0) {
    seedPracticeDays(
      storage,
      consecutiveDayKeys('2026-09-01', practiceDayCount),
      0
    );
  }
  return {
    storage,
    now,
    lotusPondStore: new LotusPondStore({ storage, now }),
    practiceDaysStore: new PracticeDaysStore({ storage, now }),
    dailyCompletionStore: new DailyCompletionStore({ storage, now })
  };
}

test('catalog ids are SSOT — no parallel threshold literals in module', () => {
  assert.deepEqual(COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS, [
    'practice-score-21',
    'imprint-minutes-600',
    'imprint-minutes-3000',
    'imprint-minutes-10800'
  ]);
  for (const id of COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS) {
    assert.equal(typeof COLLECTIONS_SCARCITY_NAME_KEYS[id], 'string');
  }
});

test('fresh profile — all memorial rows locked', () => {
  const rows = listCollectionsBehavioralScarcityRows(makeDeps());
  assert.equal(rows.length, 4);
  assert.equal(rows.every((row) => row.unlocked === false), true);
});

test('score gate unlocks mustard row at catalog threshold', () => {
  const deps = makeDeps({ lifetimeMinutes: 21 * 60, practiceDayCount: 21 });
  const rows = listCollectionsBehavioralScarcityRows(deps);
  const scoreRow = rows.find((row) => row.catalogId === 'practice-score-21');
  assert.ok(scoreRow);
  assert.equal(scoreRow.unlocked, true);
  assert.equal(scoreRow.explainKind, 'score');
  assert.ok(
    (scoreRow.explainParams.score ?? 0) >= MUSTARD_SEED_SEAL_SCORE_THRESHOLD
  );
  const explain = formatCollectionsScarcityExplanation(scoreRow, (k) => LOOKUP[k]);
  assert.match(explain, /Score \d+ on this device/);
  assert.ok((scoreRow.explainParams.score ?? 0) >= MUSTARD_SEED_SEAL_SCORE_THRESHOLD);
});

test('lifetime minutes unlock imprint tiers independently', () => {
  const deps = makeDeps({ lifetimeMinutes: 650, practiceDayCount: 1 });
  const rows = listCollectionsBehavioralScarcityRows(deps);
  const byId = Object.fromEntries(rows.map((row) => [row.catalogId, row]));
  assert.equal(byId['imprint-minutes-600'].unlocked, true);
  assert.equal(byId['imprint-minutes-3000'].unlocked, false);
  assert.equal(byId['imprint-minutes-10800'].unlocked, false);
});

test('locked rows use observation copy, not gap math', () => {
  const rows = listCollectionsBehavioralScarcityRows(makeDeps());
  const locked = rows.find((row) => !row.unlocked);
  assert.ok(locked);
  assert.equal(
    formatCollectionsScarcityExplanation(locked, (k) => LOOKUP[k]),
    LOOKUP.COLLECTIONS_SCARCITY_LOCKED
  );
});
