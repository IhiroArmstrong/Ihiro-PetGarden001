import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  JOURNEY_LOG_MAX_ENTRIES,
  JOURNEY_LOG_STORAGE_KEY,
  appendJourneyLogEntry,
  journeyLogDateKey,
  journeyLogLineKind,
  normalizeJourneyLogEntries,
  readJourneyLog,
  resolveJourneyMinutes
} from './journeyLogGate.js';

const here = dirname(fileURLToPath(import.meta.url));

function createMapStorage(seed = {}) {
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

describe('journeyLogGate', () => {
  it('appends entries with arrive/reflect flags', () => {
    const storage = createMapStorage();
    const row = appendJourneyLogEntry(storage, {
      at: '2026-08-09T12:00:00.000Z',
      minutes: 25,
      arrive: true,
      reflect: true
    });
    assert.deepEqual(row, {
      at: '2026-08-09T12:00:00.000Z',
      minutes: 25,
      arrive: true,
      reflect: true
    });
    assert.equal(readJourneyLog(storage).entries.length, 1);
    assert.equal(storage.getItem(JOURNEY_LOG_STORAGE_KEY)?.includes('25'), true);
  });

  it('caps at JOURNEY_LOG_MAX_ENTRIES (drops oldest)', () => {
    const storage = createMapStorage();
    for (let i = 0; i < JOURNEY_LOG_MAX_ENTRIES + 5; i += 1) {
      appendJourneyLogEntry(storage, {
        at: `2026-01-01T00:00:${String(i).padStart(2, '0')}.000Z`,
        minutes: i + 1,
        arrive: false,
        reflect: false
      });
    }
    const entries = readJourneyLog(storage).entries;
    assert.equal(entries.length, JOURNEY_LOG_MAX_ENTRIES);
    assert.equal(entries[0].minutes, 6);
    assert.equal(entries[entries.length - 1].minutes, JOURNEY_LOG_MAX_ENTRIES + 5);
  });

  it('rejects invalid minutes', () => {
    const storage = createMapStorage();
    assert.equal(appendJourneyLogEntry(storage, { minutes: 0 }), null);
    assert.equal(readJourneyLog(storage).entries.length, 0);
  });

  it('normalizeJourneyLogEntries drops garbage', () => {
    assert.deepEqual(
      normalizeJourneyLogEntries([
        null,
        { at: 'x', minutes: 'nope' },
        { at: '2026-08-09T00:00:00.000Z', minutes: 15, arrive: 1, reflect: 0 }
      ]),
      [
        {
          at: '2026-08-09T00:00:00.000Z',
          minutes: 15,
          arrive: true,
          reflect: false
        }
      ]
    );
  });

  it('resolveJourneyMinutes: completed uses target; early rise uses wall clock', () => {
    assert.equal(
      resolveJourneyMinutes({ completed: true, targetMinutes: 25, elapsedSeconds: 10 }),
      25
    );
    assert.equal(
      resolveJourneyMinutes({ completed: false, targetMinutes: 25, elapsedSeconds: 90 }),
      2
    );
    assert.equal(
      resolveJourneyMinutes({ completed: false, targetMinutes: 25, elapsedSeconds: 10 }),
      1
    );
  });

  it('journeyLogLineKind + date key', () => {
    assert.equal(journeyLogLineKind({ arrive: true, reflect: true }), 'FULL');
    assert.equal(journeyLogLineKind({ arrive: true, reflect: false }), 'ARRIVE');
    assert.equal(journeyLogLineKind({ arrive: false, reflect: true }), 'REFLECT');
    assert.equal(journeyLogLineKind({ arrive: false, reflect: false }), 'FOCUS');
    assert.equal(journeyLogDateKey('2026-08-09T15:30:00.000Z').length, 10);
  });

  it('must not import tipJarGate (zero coupling)', () => {
    const src = readFileSync(join(here, 'journeyLogGate.js'), 'utf8');
    assert.equal(
      /from\s+['"].*tipJarGate/.test(src) || /require\(['"].*tipJar/.test(src),
      false,
      'journeyLogGate.js must not import tipJarGate'
    );
  });
});
