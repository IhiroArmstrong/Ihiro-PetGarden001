/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGlowClaimProvenanceMeta,
  catalogComputePracticeScore,
  catalogDeriveComeBackDates,
  catalogJourneyMilestoneFirstHitDate,
  catalogJourneyMilestoneMetOnSync,
  catalogResolveGlowNodeId,
  catalogStreakEndingOn,
  getMilestoneCatalogEntryByLegacyId,
  isCatalogMilestoneMet,
  MILESTONE_CATALOG,
} from './MILESTONE_CATALOG.js';
import { MILESTONE_GLOW_STREAK_NODES, resolveMilestoneGlowNodeId } from './MilestoneGlowStore.js';
import {
  countRecentPracticeStreak,
  PRACTICE_DAYS_STORAGE_KEY
} from './PracticeDaysStore.js';
import { LOTUS_POND_STORAGE_KEY } from './LotusPondStore.js';
import {
  isMustardSeedSealScoreMet,
  MUSTARD_SEED_SEAL_SCORE_THRESHOLD,
  resolveMustardSeedSeal
} from './mustardSeedSeal.js';
import { resolvePracticeAggregate } from './practiceAggregate.js';
import { computePracticeScore } from './practiceBadgeAward.js';
import {
  deriveComeBackDatesFromPracticeDays,
  JOURNEY_PRACTICE_MILESTONE_IDS,
  reconcileJourneyPracticeMemoriesFromHistory
} from './journeyPracticeMemory.js';
import { PracticeDaysStore } from './PracticeDaysStore.js';
import { LotusPondStore } from './LotusPondStore.js';
import { bloomCountForMinutes } from './lotusPondMath.js';

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

function seedPracticeDays(storage, dayKeys, minutes = 25) {
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

describe('MILESTONE_CATALOG static rows', () => {
  it('maps glow legacy ids to consecutive-practice-days catalog ids', () => {
    for (const node of MILESTONE_GLOW_STREAK_NODES) {
      const entry = getMilestoneCatalogEntryByLegacyId('glow', node.id);
      assert.ok(entry, `missing catalog row for glow ${node.id}`);
      assert.equal(entry.predicate.type, 'consecutive-practice-days');
      assert.equal(entry.predicate.days, node.streakDays);
      assert.ok(entry.surfaces.includes('glow'));
      assert.ok(entry.surfaces.includes('journey'));
    }
  });

  it('mustard score gate references the same threshold constant', () => {
    const entry = getMilestoneCatalogEntryByLegacyId(
      'mustard-seal',
      'mustard-seed-sumeru'
    );
    assert.equal(entry?.id, 'practice-score-21');
    assert.equal(entry?.predicate.score, MUSTARD_SEED_SEAL_SCORE_THRESHOLD);
    assert.equal(MUSTARD_SEED_SEAL_SCORE_THRESHOLD, 21);
  });
});

describe('MILESTONE_CATALOG parity · mustard score gate', () => {
  const fixtures = [
    { practiceDayCount: 20, scoreEligibleLifetimeMinutes: 0 },
    { practiceDayCount: 21, scoreEligibleLifetimeMinutes: 0 },
    { practiceDayCount: 10, scoreEligibleLifetimeMinutes: 11 * 60 },
    { practiceDayCount: 1, scoreEligibleLifetimeMinutes: 3600 }
  ];

  for (const summary of fixtures) {
    it(`mustard gate matches for days=${summary.practiceDayCount} minutes=${summary.scoreEligibleLifetimeMinutes}`, () => {
      const production = isMustardSeedSealScoreMet(summary);
      const catalog = isCatalogMilestoneMet('practice-score-21', {
        ...summary,
        lifetimeMinutes: summary.scoreEligibleLifetimeMinutes
      });
      assert.equal(catalog, production);
    });
  }

  it('resolveMustardSeedSeal unlocked matches catalog score gate from storage', () => {
    const storage = memoryStorage();
    seedPracticeDays(storage, consecutiveDayKeys('2026-08-01', 21), 0);
    const resolved = resolveMustardSeedSeal(storage);
    const aggregate = resolvePracticeAggregate({ storage });
    assert.equal(
      isCatalogMilestoneMet('practice-score-21', aggregate),
      resolved.unlocked
    );
  });
});

describe('MILESTONE_CATALOG parity · score formula (90-day window + eligible minutes)', () => {
  it('catalogComputePracticeScore matches computePracticeScore', () => {
    const samples = [
      { practiceDayCount: 0, lifetimeMinutes: 0, scoreEligibleLifetimeMinutes: 0 },
      { practiceDayCount: 3, lifetimeMinutes: 500, scoreEligibleLifetimeMinutes: 180 },
      { practiceDayCount: 90, lifetimeMinutes: 7200, scoreEligibleLifetimeMinutes: 5400 }
    ];
    for (const summary of samples) {
      assert.equal(
        catalogComputePracticeScore(summary),
        computePracticeScore(summary)
      );
    }
  });

  it('resolvePracticeAggregate score matches catalog from seeded storage', () => {
    const storage = memoryStorage();
    seedPracticeDays(storage, consecutiveDayKeys('2026-06-01', 5));
    storage.setItem(
      LOTUS_POND_STORAGE_KEY,
      JSON.stringify({
        lifetimeMinutes: 3600,
        scoreEligibleLifetimeMinutes: 900
      })
    );
    const aggregate = resolvePracticeAggregate({ storage });
    assert.equal(catalogComputePracticeScore(aggregate), aggregate.score);
    assert.equal(aggregate.practiceDayCount, 5);
    assert.equal(aggregate.scoreEligibleLifetimeMinutes, 900);
    assert.equal(aggregate.lifetimeMinutes, 3600);
  });
});

describe('MILESTONE_CATALOG · Glow claim provenance (scheme D)', () => {
  it('buildGlowClaimProvenanceMeta maps legacy glow ids to catalog fields', () => {
    assert.deepEqual(buildGlowClaimProvenanceMeta('streak-7'), {
      rarity_basis: 'consecutive-practice-days-7',
      origin: 'consecutive-practice-days',
      journey_id: 'streak-7'
    });
    assert.deepEqual(buildGlowClaimProvenanceMeta('streak-21'), {
      rarity_basis: 'consecutive-practice-days-21',
      origin: 'consecutive-practice-days',
      journey_id: 'streak-21'
    });
    assert.deepEqual(buildGlowClaimProvenanceMeta('unknown-node'), {});
  });
});

describe('MILESTONE_CATALOG parity · Glow consecutive 7/21/100', () => {
  const playedSets = [[], ['streak-7'], ['streak-7', 'streak-21']];
  const streakSamples = [0, 1, 6, 7, 8, 20, 21, 22, 99, 100, 150];

  for (const played of playedSets) {
    for (const streak of streakSamples) {
      it(`glow offer streak=${streak} played=${played.join(',') || 'none'}`, () => {
        const production = resolveMilestoneGlowNodeId(streak, played);
        const catalog = catalogResolveGlowNodeId(streak, played);
        assert.equal(catalog, production);
      });
    }
  }
});

describe('MILESTONE_CATALOG parity · Journey six milestone predicates', () => {
  const streakMilestones = ['streak-7', 'streak-21', 'streak-100'];
  const oneOffMilestones = [
    'first-practice',
    'first-return',
    'practice-variety',
    'first-lotus'
  ];

  it('deriveComeBackDates matches production helper', () => {
    const keys = ['2026-09-01', '2026-09-02', '2026-09-10', '2026-09-11'];
    assert.deepEqual(
      catalogDeriveComeBackDates(keys),
      deriveComeBackDatesFromPracticeDays(keys)
    );
  });

  it('catalogStreakEndingOn matches journey backfill streak walk', () => {
    const keys = consecutiveDayKeys('2026-09-01', 10);
    for (const key of keys) {
      assert.equal(
        catalogStreakEndingOn(keys, key),
        (() => {
          const set = new Set(keys);
          if (!set.has(key)) return 0;
          let streak = 0;
          let cursor = key;
          while (set.has(cursor)) {
            streak += 1;
            const [y, m, d] = cursor.split('-').map(Number);
            const dt = new Date(y, m - 1, d);
            dt.setDate(dt.getDate() - 1);
            cursor = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
          }
          return streak;
        })()
      );
    }
  });

  for (const legacyId of streakMilestones) {
    it(`journey sync streak milestone ${legacyId} matches countRecentPracticeStreak gate`, () => {
      const entry = getMilestoneCatalogEntryByLegacyId('journey', legacyId);
      const need = entry?.predicate.days ?? 0;
      const keys = consecutiveDayKeys('2026-07-25', need);
      const todayKey = keys[keys.length - 1];
      const streak = countRecentPracticeStreak(keys, todayKey);
      const productionMet = streak >= need;
      const catalogMet = catalogJourneyMilestoneMetOnSync(legacyId, {
        practiceDayKeys: keys,
        todayKey
      });
      assert.equal(catalogMet, productionMet);
    });
  }

  for (const legacyId of [...streakMilestones, ...oneOffMilestones]) {
    it(`journey backfill first-hit date for ${legacyId} matches reconcile`, () => {
      const storage = memoryStorage();
      const now = () => new Date(2026, 8, 30, 12, 0, 0);
      const practiceDaysStore = new PracticeDaysStore({ storage, now });

      let dayKeys = consecutiveDayKeys('2026-08-01', 8);
      if (legacyId === 'first-return' || legacyId === 'come-back') {
        dayKeys = ['2026-08-01', '2026-08-02', '2026-08-10'];
      }
      if (legacyId === 'practice-variety') {
        dayKeys = ['2026-08-01'];
      }
      if (legacyId === 'first-lotus') {
        dayKeys = ['2026-08-01'];
        storage.setItem(
          LOTUS_POND_STORAGE_KEY,
          JSON.stringify({ lifetimeMinutes: 30, scoreEligibleLifetimeMinutes: 30 })
        );
      } else {
        seedPracticeDays(storage, dayKeys);
      }

      const lotusPondStore = new LotusPondStore({ storage, now });
      const reconciled = reconcileJourneyPracticeMemoriesFromHistory(
        { entries: [], memories: [], sourcesSeen: [] },
        { practiceDaysStore, lotusPondStore, now }
      );

      const sorted = practiceDaysStore.getPracticedDateKeys().slice().sort();
      const catalogHit = catalogJourneyMilestoneFirstHitDate(legacyId, sorted);
      const productionHit = reconciled.memories?.find(
        (m) => m.kind === 'milestone' && m.id === legacyId
      );

      if (legacyId === 'practice-variety') {
        assert.equal(catalogHit, null);
        assert.equal(productionHit, undefined);
        return;
      }

      if (legacyId === 'come-back') {
        const dates = catalogDeriveComeBackDates(sorted).comeBackDates;
        assert.equal(catalogHit, dates[0] ?? null);
        return;
      }

      if (legacyId === 'first-lotus') {
        const catalogMet = isCatalogMilestoneMet('first-lotus', {
          lifetimeMinutes: lotusPondStore.getLifetimeMinutes()
        });
        assert.equal(catalogMet, Boolean(productionHit));
        return;
      }

      if (productionHit) {
        assert.ok(catalogHit);
        assert.equal(productionHit.dateKey ?? catalogHit, catalogHit);
      } else {
        assert.equal(catalogHit, null);
      }
    });
  }

  it('first-lotus catalog gate matches bloomCountForMinutes', () => {
    for (const minutes of [0, 10, 24, 25, 100]) {
      const production = bloomCountForMinutes(minutes) >= 1;
      const catalog = isCatalogMilestoneMet('first-lotus', { lifetimeMinutes: minutes });
      assert.equal(catalog, production);
    }
  });

  it('catalog covers all six one-time Journey milestone ids', () => {
    for (const legacyId of JOURNEY_PRACTICE_MILESTONE_IDS) {
      assert.ok(
        getMilestoneCatalogEntryByLegacyId('journey', legacyId),
        `missing journey catalog row for ${legacyId}`
      );
    }
  });
});

describe('MILESTONE_CATALOG registry hygiene', () => {
  it('every active row has stable id, origin, predicate, and surfaces', () => {
    for (const row of MILESTONE_CATALOG) {
      assert.match(row.id, /^[a-z0-9-]+$/);
      assert.ok(row.origin);
      assert.ok(row.predicate?.type);
      assert.ok(row.surfaces.length >= 1);
    }
  });
});

