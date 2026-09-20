/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared milestone catalog Batch 3 — Journey legacy ids + sync/reconcile parity.
 * Runtime still writes legacy memory ids; catalog is SSOT for predicates only.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  catalogJourneyMilestoneFirstHitDate,
  catalogJourneyMilestoneMetOnSync,
  getMilestoneCatalogEntryByLegacyId,
  isCatalogMilestoneMet,
} from './MILESTONE_CATALOG.js';
import { LotusPondStore } from './LotusPondStore.js';
import {
  PracticeDaysStore,
  PRACTICE_DAYS_STORAGE_KEY,
} from './PracticeDaysStore.js';
import { LOTUS_POND_STORAGE_KEY } from './LotusPondStore.js';
import {
  JOURNEY_COME_BACK_ID,
  JOURNEY_PRACTICE_MILESTONE_IDS,
  readJourneyLogExtended,
  reconcileJourneyPracticeMemoriesFromHistory,
  syncJourneyPracticeMemories,
} from './journeyPracticeMemory.js';
import { getLocalDateKey } from '../utils/localDate.js';

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
    },
  };
}

function seedPracticeDays(storage, dayKeys, minutes = 25) {
  storage.setItem(
    PRACTICE_DAYS_STORAGE_KEY,
    JSON.stringify({
      days: dayKeys.map((date) => ({ date, totalMinutes: minutes })),
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

/** @param {import('./journeyPracticeMemory.js').JourneyLogExtendedState} state */
function buildCatalogSyncContext(state, deps) {
  const dayKeys = deps.practiceDaysStore.getPracticedDateKeys();
  const todayKey = getLocalDateKey(deps.now());
  return {
    practiceDayKeys: dayKeys,
    todayKey,
    sourcesSeen: state.sourcesSeen ?? [],
    lifetimeMinutes: deps.lotusPondStore.getLifetimeMinutes(),
  };
}

describe('MILESTONE_CATALOG Batch 3 · Journey legacy id registry', () => {
  it('every one-time Journey milestone id maps to an active catalog row', () => {
    for (const legacyId of JOURNEY_PRACTICE_MILESTONE_IDS) {
      const entry = getMilestoneCatalogEntryByLegacyId('journey', legacyId);
      assert.ok(entry, `missing catalog row for journey ${legacyId}`);
      assert.ok(entry.surfaces.includes('journey'));
      assert.notEqual(entry.status, 'proposed');
    }
  });

  it('come-back maps to catalog row come-back', () => {
    const entry = getMilestoneCatalogEntryByLegacyId('journey', JOURNEY_COME_BACK_ID);
    assert.equal(entry?.id, 'come-back');
    assert.equal(entry?.predicate.type, 'come-back-on-gap');
  });

  it('streak legacy ids share catalog days with glow rows (J1-a)', () => {
    for (const legacyId of ['streak-7', 'streak-21', 'streak-100']) {
      const journey = getMilestoneCatalogEntryByLegacyId('journey', legacyId);
      const glow = getMilestoneCatalogEntryByLegacyId('glow', legacyId);
      assert.ok(journey && glow);
      assert.equal(journey.predicate.days, glow.predicate.days);
      assert.equal(journey.origin, glow.origin);
    }
  });

  it('streak memories persist legacy alias ids, not catalog primary keys', () => {
    for (const legacyId of ['streak-7', 'streak-21', 'streak-100']) {
      const entry = getMilestoneCatalogEntryByLegacyId('journey', legacyId);
      assert.ok(entry);
      assert.notEqual(
        entry.id,
        legacyId,
        `${legacyId} must stay alias, not ${entry.id}`
      );
    }
  });
});

describe('MILESTONE_CATALOG Batch 3 · Journey sync parity', () => {
  const syncScenarios = [
    {
      name: 'first practice day',
      seedDays: [],
      markToday: true,
      sourceId: 'sit-timed',
      expectIds: ['first-practice'],
    },
    {
      name: 'come-back after gap',
      seedDays: ['2026-09-01', '2026-09-02'],
      markToday: true,
      today: new Date(2026, 8, 10, 12, 0, 0),
      sourceId: 'sit-timed',
      expectIds: ['first-practice', 'first-return'],
      expectKinds: ['come-back'],
    },
    {
      name: 'streak-7 on seventh consecutive day',
      seedDays: consecutiveDayKeys('2026-09-04', 6),
      markToday: true,
      today: new Date(2026, 8, 10, 12, 0, 0),
      sourceId: 'honesty-checkin',
      expectIds: ['first-practice', 'streak-7'],
    },
    {
      name: 'practice-variety on second baseline source',
      seedDays: [],
      markToday: true,
      sourceId: 'breath-micro-ritual',
      preSync: (storage, deps) => {
        syncJourneyPracticeMemories(storage, {
          sourceId: 'sit-timed',
          ...deps,
        });
      },
      expectIds: ['first-practice', 'practice-variety'],
    },
    {
      name: 'first-lotus when lifetime minutes cross bloom threshold',
      seedDays: ['2026-09-01'],
      markToday: false,
      sourceId: 'sit-timed',
      lotusMinutes: 30,
      expectIds: ['first-practice', 'first-lotus'],
    },
  ];

  for (const scenario of syncScenarios) {
    it(`sync ${scenario.name} writes legacy ids matching catalog gates`, () => {
      const storage = memoryStorage();
      const now = () => scenario.today ?? new Date(2026, 8, 10, 12, 0, 0);
      if (scenario.seedDays?.length) {
        seedPracticeDays(storage, scenario.seedDays);
      }
      if (scenario.lotusMinutes != null) {
        storage.setItem(
          LOTUS_POND_STORAGE_KEY,
          JSON.stringify({
            lifetimeMinutes: scenario.lotusMinutes,
            scoreEligibleLifetimeMinutes: scenario.lotusMinutes,
          })
        );
      }

      const practiceDaysStore = new PracticeDaysStore({ storage, now });
      if (scenario.markToday) {
        practiceDaysStore.markToday(25);
      }
      const lotusPondStore = new LotusPondStore({ storage, now });
      const deps = { practiceDaysStore, lotusPondStore, now };

      if (scenario.preSync) {
        scenario.preSync(storage, deps);
      }

      syncJourneyPracticeMemories(storage, {
        sourceId: scenario.sourceId,
        ...deps,
      });

      const state = readJourneyLogExtended(storage);
      const context = buildCatalogSyncContext(state, deps);

      for (const legacyId of scenario.expectIds ?? []) {
        assert.equal(
          state.memories?.some((m) => m.kind === 'milestone' && m.id === legacyId),
          true,
          `expected milestone ${legacyId}`
        );
        assert.equal(
          catalogJourneyMilestoneMetOnSync(legacyId, context),
          true,
          `catalog should agree ${legacyId} is met on sync`
        );
      }

      for (const kind of scenario.expectKinds ?? []) {
        assert.equal(
          state.memories?.some((m) => m.kind === kind),
          true,
          `expected kind ${kind}`
        );
      }

      for (const mem of state.memories ?? []) {
        if (mem.kind !== 'milestone') continue;
        assert.equal(
          catalogJourneyMilestoneMetOnSync(mem.id, context),
          true,
          `unexpected milestone ${mem.id} without catalog gate`
        );
      }
    });
  }
});

describe('MILESTONE_CATALOG Batch 3 · Journey reconcile parity', () => {
  it('reconcile milestone rows match catalog first-hit dates', () => {
    const storage = memoryStorage();
    const now = () => new Date(2026, 8, 30, 12, 0, 0);
    seedPracticeDays(storage, consecutiveDayKeys('2026-08-01', 8));
    storage.setItem(
      LOTUS_POND_STORAGE_KEY,
      JSON.stringify({ lifetimeMinutes: 30, scoreEligibleLifetimeMinutes: 30 })
    );

    const practiceDaysStore = new PracticeDaysStore({ storage, now });
    const lotusPondStore = new LotusPondStore({ storage, now });
    const reconciled = reconcileJourneyPracticeMemoriesFromHistory(
      { entries: [], memories: [], sourcesSeen: [] },
      { practiceDaysStore, lotusPondStore, now }
    );

    const sorted = practiceDaysStore.getPracticedDateKeys().slice().sort();

    for (const mem of reconciled.memories ?? []) {
      if (mem.kind !== 'milestone') continue;
      if (mem.id === 'first-lotus') {
        assert.equal(
          isCatalogMilestoneMet('first-lotus', {
            lifetimeMinutes: lotusPondStore.getLifetimeMinutes(),
          }),
          true
        );
        continue;
      }
      const catalogHit = catalogJourneyMilestoneFirstHitDate(mem.id, sorted);
      assert.ok(catalogHit, `catalog has no first-hit for ${mem.id}`);
      assert.equal(mem.dateKey ?? catalogHit, catalogHit);
    }
  });
});
