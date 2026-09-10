/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { LotusPondStore } from './LotusPondStore.js';
import { PracticeDaysStore, PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import {
  deriveComeBackDatesFromPracticeDays,
  journeyPracticeMemoryLocaleKey,
  readJourneyLogExtended,
  reconcileJourneyPracticeMemoriesFromHistory,
  syncJourneyPracticeMemories
} from './journeyPracticeMemory.js';
import {
  appendJourneyLogEntry,
  JOURNEY_LOG_STORAGE_KEY
} from './journeyLogGate.js';

function createStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

function seedPracticeDays(storage, dayKeys) {
  storage.setItem(
    PRACTICE_DAYS_STORAGE_KEY,
    JSON.stringify({
      days: dayKeys.map((date) => ({ date, totalMinutes: 25 }))
    })
  );
}

describe('journeyPracticeMemory', () => {
  it('deriveComeBackDatesFromPracticeDays finds gaps', () => {
    const result = deriveComeBackDatesFromPracticeDays([
      '2026-09-01',
      '2026-09-02',
      '2026-09-10'
    ]);
    assert.deepEqual(result.comeBackDates, ['2026-09-10']);
    assert.equal(result.firstReturnDate, '2026-09-10');
  });

  it('syncJourneyPracticeMemories records first practice', () => {
    const storage = createStorage();
    const now = () => new Date(2026, 8, 10, 12, 0, 0);
    const practiceDaysStore = new PracticeDaysStore({ storage, now });
    practiceDaysStore.markToday(25);

    syncJourneyPracticeMemories(storage, {
      sourceId: 'sit-timed',
      practiceDaysStore,
      lotusPondStore: new LotusPondStore({ storage, now }),
      now
    });

    const state = readJourneyLogExtended(storage);
    assert.equal(
      state.memories?.some((m) => m.id === 'first-practice'),
      true
    );
    assert.deepEqual(state.sourcesSeen, ['sit-timed']);
  });

  it('syncJourneyPracticeMemories records come-back after a gap', () => {
    const storage = createStorage();
    const now = () => new Date(2026, 8, 10, 12, 0, 0);
    seedPracticeDays(storage, ['2026-09-01', '2026-09-02']);
    const practiceDaysStore = new PracticeDaysStore({ storage, now });
    practiceDaysStore.markToday(25);

    syncJourneyPracticeMemories(storage, {
      sourceId: 'sit-timed',
      practiceDaysStore,
      lotusPondStore: new LotusPondStore({ storage, now }),
      now
    });

    const state = readJourneyLogExtended(storage);
    assert.equal(
      state.memories?.some((m) => m.kind === 'come-back'),
      true
    );
    assert.equal(
      state.memories?.some((m) => m.id === 'first-return'),
      true
    );
  });

  it('syncJourneyPracticeMemories unlocks streak-7 on seventh consecutive day', () => {
    const storage = createStorage();
    const now = () => new Date(2026, 8, 10, 12, 0, 0);
    seedPracticeDays(storage, [
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
      '2026-09-07',
      '2026-09-08',
      '2026-09-09'
    ]);
    const practiceDaysStore = new PracticeDaysStore({ storage, now });
    practiceDaysStore.markToday(25);

    syncJourneyPracticeMemories(storage, {
      sourceId: 'honesty-checkin',
      practiceDaysStore,
      lotusPondStore: new LotusPondStore({ storage, now }),
      now
    });

    const state = readJourneyLogExtended(storage);
    assert.equal(
      state.memories?.some((m) => m.id === 'streak-7'),
      true
    );
  });

  it('syncJourneyPracticeMemories unlocks practice-variety on second source', () => {
    const storage = createStorage();
    const now = () => new Date(2026, 8, 10, 12, 0, 0);
    const practiceDaysStore = new PracticeDaysStore({ storage, now });
    practiceDaysStore.markToday(25);

    syncJourneyPracticeMemories(storage, {
      sourceId: 'sit-timed',
      practiceDaysStore,
      lotusPondStore: new LotusPondStore({ storage, now }),
      now
    });

    syncJourneyPracticeMemories(storage, {
      sourceId: 'breath-micro-ritual',
      practiceDaysStore,
      lotusPondStore: new LotusPondStore({ storage, now }),
      now
    });

    const state = readJourneyLogExtended(storage);
    assert.equal(
      state.memories?.some((m) => m.id === 'practice-variety'),
      true
    );
    assert.deepEqual(state.sourcesSeen, [
      'sit-timed',
      'breath-micro-ritual'
    ]);
  });

  it('reconcileJourneyPracticeMemoriesFromHistory backfills existing users', () => {
    const storage = createStorage();
    const now = () => new Date(2026, 8, 10, 12, 0, 0);
    seedPracticeDays(storage, ['2026-09-01', '2026-09-02', '2026-09-10']);
    const lotus = new LotusPondStore({ storage, now });
    lotus.addMinutes(25);

    const reconciled = reconcileJourneyPracticeMemoriesFromHistory(
      { entries: [], memories: [], sourcesSeen: [] },
      {
        practiceDaysStore: new PracticeDaysStore({ storage, now }),
        lotusPondStore: lotus,
        now
      }
    );

    const ids = reconciled.memories?.map((m) => m.id) ?? [];
    assert.equal(ids.includes('first-practice'), true);
    assert.equal(ids.includes('first-return'), true);
    assert.equal(ids.includes('first-lotus'), true);
    assert.equal(
      reconciled.memories?.some((m) => m.kind === 'come-back'),
      true
    );
  });

  it('journeyPracticeMemoryLocaleKey maps ids to locale keys', () => {
    assert.equal(
      journeyPracticeMemoryLocaleKey({ kind: 'come-back', id: 'come-back' }),
      'JOURNEY_MEMORY_COME_BACK'
    );
    assert.equal(
      journeyPracticeMemoryLocaleKey({ kind: 'milestone', id: 'streak-7' }),
      'JOURNEY_MEMORY_STREAK_7'
    );
  });
});

describe('journeyLogGate memories preservation', () => {
  it('appendJourneyLogEntry keeps memories and sourcesSeen', () => {
    const storage = createStorage({
      [JOURNEY_LOG_STORAGE_KEY]: JSON.stringify({
        entries: [],
        memories: [
          {
            kind: 'milestone',
            id: 'first-practice',
            at: '2026-09-01T12:00:00.000Z'
          }
        ],
        sourcesSeen: ['sit-timed']
      })
    });

    appendJourneyLogEntry(storage, {
      at: '2026-09-10T12:00:00.000Z',
      minutes: 25,
      arrive: true,
      reflect: false
    });

    const raw = JSON.parse(storage.getItem(JOURNEY_LOG_STORAGE_KEY) ?? '{}');
    assert.equal(raw.entries.length, 1);
    assert.equal(raw.memories.length, 1);
    assert.deepEqual(raw.sourcesSeen, ['sit-timed']);
  });
});
