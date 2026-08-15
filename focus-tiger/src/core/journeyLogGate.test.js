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
  microRitualJourneyDraft,
  normalizeJourneyLogEntries,
  readJourneyLog,
  resolveJourneyMinutes,
  stampJourneyLogInsightSparkForDate
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

  it('microRitualJourneyDraft uses chip minutes and never Arrival', () => {
    assert.deepEqual(microRitualJourneyDraft(1), {
      minutes: 1,
      arrive: false
    });
    assert.deepEqual(microRitualJourneyDraft(20), {
      minutes: 20,
      arrive: false
    });
    assert.equal(microRitualJourneyDraft(0), null);
    assert.equal(microRitualJourneyDraft(Number.NaN), null);
  });

  it('main.js stashes micro-ritual draft before Reflection handoff', () => {
    const src = readFileSync(join(here, '../main.js'), 'utf8');
    const start = src.indexOf('function completeMicroRitual()');
    const end = src.indexOf('function leaveMicroRitualQuietly()');
    assert.ok(start >= 0 && end > start, 'completeMicroRitual body not found');
    const body = src.slice(start, end);
    const stashAt = body.indexOf('microRitualJourneyDraft(');
    const assignAt = body.indexOf('pendingJourneyDraft = draft');
    const handoffAt = body.indexOf('sessionEndFlow.onSessionEnded');
    assert.ok(stashAt >= 0, 'completeMicroRitual must call microRitualJourneyDraft');
    assert.ok(assignAt > stashAt, 'completeMicroRitual must assign pendingJourneyDraft');
    assert.ok(
      handoffAt > assignAt,
      'stash must precede Reflection handoff so Skip still logs'
    );
    const leaveBody = src.slice(end, src.indexOf('const reflectionOpen'));
    assert.equal(
      leaveBody.includes('microRitualJourneyDraft'),
      false,
      'Leave must not stash a Journey Log draft'
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
    assert.equal(
      /from\s+['"].*(sanctuaryEntitlement|practiceBadgeAward)/.test(src),
      false,
      'journeyLogGate.js must not import sanctuary or practiceBadgeAward'
    );
  });

  it('writes insightSpark when true and degrades when missing', () => {
    const storage = createMapStorage();
    const marked = appendJourneyLogEntry(storage, {
      at: '2026-08-14T04:00:00.000Z',
      minutes: 15,
      arrive: true,
      reflect: false,
      insightSpark: true
    });
    assert.equal(marked?.insightSpark, true);
    const plain = appendJourneyLogEntry(storage, {
      at: '2026-08-14T05:00:00.000Z',
      minutes: 10,
      arrive: false,
      reflect: false
    });
    assert.equal(plain?.insightSpark, undefined);
    const reread = readJourneyLog(storage).entries;
    assert.equal(reread[0].insightSpark, true);
    assert.equal(reread[1].insightSpark, undefined);
    assert.deepEqual(
      normalizeJourneyLogEntries([
        { at: '2026-08-14T06:00:00.000Z', minutes: 12 }
      ]),
      [
        {
          at: '2026-08-14T06:00:00.000Z',
          minutes: 12,
          arrive: false,
          reflect: false
        }
      ]
    );
  });

  it('stampJourneyLogInsightSparkForDate marks same-day rows only', () => {
    const storage = createMapStorage();
    const dayA = new Date(2026, 7, 13, 12, 0, 0);
    const dayB = new Date(2026, 7, 14, 12, 0, 0);
    appendJourneyLogEntry(storage, {
      at: dayA.toISOString(),
      minutes: 20,
      arrive: true,
      reflect: true
    });
    appendJourneyLogEntry(storage, {
      at: dayB.toISOString(),
      minutes: 25,
      arrive: true,
      reflect: true
    });
    const today = journeyLogDateKey(dayB.toISOString());
    assert.equal(stampJourneyLogInsightSparkForDate(storage, today), true);
    const entries = readJourneyLog(storage).entries;
    assert.equal(entries[0].insightSpark, undefined);
    assert.equal(entries[1].insightSpark, true);
    assert.equal(stampJourneyLogInsightSparkForDate(storage, today), false);
    assert.equal(readJourneyLog(storage).entries[1].insightSpark, true);
  });
});
