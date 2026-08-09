import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  RitualCompletionStore,
  RITUAL_COMPLETION_STORAGE_KEY,
  normalizeRitualCompletionState
} from './RitualCompletionStore.js';

describe('RitualCompletionStore', () => {
  it('records only known ritual ids', () => {
    const mem = new Map();
    const storage = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => {
        mem.set(k, String(v));
      },
      removeItem: (k) => {
        mem.delete(k);
      }
    };
    const store = new RitualCompletionStore({
      storage,
      now: () => new Date('2026-08-10T04:00:00.000Z')
    });
    assert.equal(store.recordCompletion('nope'), null);
    const entry = store.recordCompletion('morning', {
      selections: { arrival: 'calm' }
    });
    assert.ok(entry);
    assert.equal(entry.ritualId, 'morning');
    assert.equal(entry.selections.arrival, 'calm');
    assert.equal(store.getEntriesFor('morning').length, 1);
    assert.equal(store.getEntriesFor('emotional-reset').length, 0);
  });

  it('trims to maxEntries from the front', () => {
    const store = new RitualCompletionStore({
      storage: null,
      maxEntries: 2,
      now: () => new Date('2026-08-10T04:00:00.000Z')
    });
    store.recordCompletion('morning');
    store.recordCompletion('emotional-reset');
    store.recordCompletion('work-transition');
    const ids = store.getEntries().map((e) => e.ritualId);
    assert.deepEqual(ids, ['emotional-reset', 'work-transition']);
  });

  it('normalize drops garbage rows', () => {
    const n = normalizeRitualCompletionState({
      entries: [
        { ritualId: 'morning', at: 't', selections: { a: '1' } },
        { ritualId: 'x', at: 't' },
        null
      ]
    });
    assert.equal(n.entries.length, 1);
    assert.equal(n.entries[0].ritualId, 'morning');
  });

  it('uses dedicated storage key', () => {
    assert.equal(
      RITUAL_COMPLETION_STORAGE_KEY,
      'focus-tiger.ritual-completions.v1'
    );
  });
});
