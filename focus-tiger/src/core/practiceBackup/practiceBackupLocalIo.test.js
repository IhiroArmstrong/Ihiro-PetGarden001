/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildPracticeExportFilename,
  createPracticeExportPayload,
  validatePracticeImportPayload,
  countPracticeStoreEntries,
  importPracticeSnapshotAtomic,
  hasLocalPracticeData,
  importHasDataLossRisk,
  importHasDataGain,
  comparePracticeImportCounts,
  subscribePracticeDataImported,
  dispatchPracticeDataImported,
  formatPracticeImportSavedAt
} from './practiceBackupLocalIo.js';
import { PRACTICE_BACKUP_SCHEMA_VERSION } from './practiceBackupSnapshot.js';

function memStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('practiceBackupLocalIo', () => {
  it('builds export filename with timestamp', () => {
    const name = buildPracticeExportFilename(new Date('2026-08-28T15:04:05'));
    assert.match(name, /^focus-tiger-backup-2026-08-28-150405\.json$/);
  });

  it('exports empty whitelist without error', async () => {
    const storage = memStorage();
    const payload = await createPracticeExportPayload(
      storage,
      () => new Date('2026-01-01T00:00:00Z')
    );
    assert.equal(payload.snapshot.schemaVersion, PRACTICE_BACKUP_SCHEMA_VERSION);
    assert.ok(payload.json.includes('"stores"'));
  });

  it('migrates v1 import payloads to v2', () => {
    const v1 = {
      schemaVersion: 1,
      savedAt: '2026-01-01T00:00:00.000Z',
      stores: {
        'focus-tiger.journey-log.v1': { entries: [] },
        'focus-tiger.practice-days.v1': { days: [] },
        'focus-tiger.milestone-glow.v1': { played: [] },
        'focus-tiger.entitlement-ownership.v1': { owned: {} },
        'focus-tiger.ritual-completions.v1': { entries: [] },
        'focus-tiger.mustard-seed-seal.v1': { revealed: false }
      }
    };
    const validated = validatePracticeImportPayload(JSON.stringify(v1));
    assert.equal(validated.ok, true);
    if (validated.ok) {
      assert.equal(validated.snapshot.schemaVersion, 2);
      assert.ok('focus-tiger.presence-signals.v1' in validated.snapshot.stores);
    }
  });

  it('rejects invalid JSON and future schema versions', () => {
    const bad = validatePracticeImportPayload('{not json');
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.equal(bad.messageKey, 'LOCAL_DATA_IMPORT_ERR_JSON');

    const future = validatePracticeImportPayload(
      JSON.stringify({
        schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION + 1,
        savedAt: '2026-01-01T00:00:00.000Z',
        stores: {}
      })
    );
    assert.equal(future.ok, false);
    if (!future.ok) assert.equal(future.messageKey, 'LOCAL_DATA_IMPORT_ERR_VERSION_NEW');
  });

  it('counts store entries for arrays and objects', () => {
    assert.equal(
      countPracticeStoreEntries('focus-tiger.journey-log.v1', {
        entries: [{}, {}]
      }),
      2
    );
    assert.equal(
      countPracticeStoreEntries('focus-tiger.entitlement-ownership.v1', {
        owned: { a: true, b: true }
      }),
      2
    );
    assert.equal(
      countPracticeStoreEntries('focus-tiger.mustard-seed-seal.v1', {
        revealed: true
      }),
      1
    );
  });

  it('imports atomically and rolls back on write failure', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [
          {
            at: '2026-01-01T00:00:00.000Z',
            minutes: 5,
            arrive: false,
            reflect: false
          }
        ]
      })
    });
    const snapshot = (await createPracticeExportPayload(storage)).snapshot;
    snapshot.stores['focus-tiger.journey-log.v1'] = {
      entries: [
        {
          at: '2026-02-01T00:00:00.000Z',
          minutes: 20,
          arrive: true,
          reflect: true
        }
      ]
    };

    const originalSet = storage.setItem.bind(storage);
    storage.setItem = (k, v) => {
      if (k === 'focus-tiger.journey-log.v1') {
        throw new Error('quota');
      }
      originalSet(k, v);
    };

    const failed = await importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(failed.ok, false);
    assert.ok(storage.getItem('focus-tiger.journey-log.v1')?.includes('"minutes":5'));

    storage.setItem = originalSet;
    const ok = await importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(ok.ok, true);
    assert.ok(storage.getItem('focus-tiger.journey-log.v1')?.includes('"minutes":20'));
  });

  it('rolls back all keys when write fails on the third whitelist key', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [
          {
            at: '2026-01-01T00:00:00.000Z',
            minutes: 5,
            arrive: false,
            reflect: false
          }
        ]
      }),
      'focus-tiger.practice-days.v1': JSON.stringify({
        days: [{ date: '2026-01-01', totalMinutes: 25 }]
      }),
      'focus-tiger.milestone-glow.v1': JSON.stringify({ played: ['streak-7'] })
    });
    const beforeJourney = storage.getItem('focus-tiger.journey-log.v1');
    const beforeDays = storage.getItem('focus-tiger.practice-days.v1');
    const beforeMilestone = storage.getItem('focus-tiger.milestone-glow.v1');

    const snapshot = (await createPracticeExportPayload(storage)).snapshot;
    snapshot.stores['focus-tiger.journey-log.v1'] = {
      entries: [
        {
          at: '2026-02-01T00:00:00.000Z',
          minutes: 99,
          arrive: true,
          reflect: true
        }
      ]
    };
    snapshot.stores['focus-tiger.practice-days.v1'] = {
      days: [{ date: '2026-02-01', totalMinutes: 99 }]
    };
    snapshot.stores['focus-tiger.milestone-glow.v1'] = { played: ['streak-14'] };

    const originalSet = storage.setItem.bind(storage);
    storage.setItem = (k, v) => {
      if (k === 'focus-tiger.milestone-glow.v1') {
        throw new Error('quota');
      }
      originalSet(k, v);
    };

    const failed = await importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(failed.ok, false);
    assert.equal(storage.getItem('focus-tiger.journey-log.v1'), beforeJourney);
    assert.equal(storage.getItem('focus-tiger.practice-days.v1'), beforeDays);
    assert.equal(storage.getItem('focus-tiger.milestone-glow.v1'), beforeMilestone);
  });

  it('detects data-loss risk when import has fewer rows', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{}, {}, {}]
      })
    });
    const snapshot = (await createPracticeExportPayload(storage)).snapshot;
    snapshot.stores['focus-tiger.journey-log.v1'] = { entries: [{}] };
    assert.equal(hasLocalPracticeData(storage), true);
    assert.equal(importHasDataLossRisk(storage, snapshot), true);
    const rows = comparePracticeImportCounts(storage, snapshot);
    assert.equal(rows[0].localCount, 3);
    assert.equal(rows[0].importCount, 1);
  });

  it('detects data-gain when import has more rows', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{}]
      })
    });
    const snapshot = (await createPracticeExportPayload(storage)).snapshot;
    snapshot.stores['focus-tiger.journey-log.v1'] = { entries: [{}, {}, {}] };
    assert.equal(importHasDataGain(storage, snapshot), true);
    assert.equal(importHasDataLossRisk(storage, snapshot), false);
  });

  it('formats savedAt as today or calendar datetime', () => {
    const now = () => new Date(2026, 7, 31, 18, 0, 0);
    const todayIso = new Date(2026, 7, 31, 9, 14, 0).toISOString();
    assert.equal(
      formatPracticeImportSavedAt(todayIso, now, (k) =>
        k === 'LOCAL_DATA_IMPORT_SAVED_TODAY' ? '今天 {time}' : k
      ),
      '今天 09:14'
    );
    const earlier = new Date(2026, 7, 28, 9, 14, 0).toISOString();
    assert.match(
      formatPracticeImportSavedAt(earlier, now),
      /^2026-08-28 09:14$/
    );
  });

  it('subscribePracticeDataImported fires then unsubscribes', () => {
    const target = new EventTarget();
    let n = 0;
    const off = subscribePracticeDataImported(() => {
      n += 1;
    }, target);
    dispatchPracticeDataImported(target);
    assert.equal(n, 1);
    off();
    dispatchPracticeDataImported(target);
    assert.equal(n, 1);
  });

  it('import refresh subscriber re-reads storage on dispatch', () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({ entries: [{}] })
    });
    let reads = 0;
    const origGet = storage.getItem.bind(storage);
    storage.getItem = (k) => {
      reads += 1;
      return origGet(k);
    };
    const target = new EventTarget();
    const off = subscribePracticeDataImported(() => {
      storage.getItem('focus-tiger.journey-log.v1');
    }, target);
    const before = reads;
    dispatchPracticeDataImported(target);
    assert.ok(reads > before);
    off();
  });
});
