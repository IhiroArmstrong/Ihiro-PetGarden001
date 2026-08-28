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
  comparePracticeImportCounts
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

  it('exports empty whitelist without error', () => {
    const storage = memStorage();
    const payload = createPracticeExportPayload(storage, () => new Date('2026-01-01T00:00:00Z'));
    assert.equal(payload.snapshot.schemaVersion, PRACTICE_BACKUP_SCHEMA_VERSION);
    assert.ok(payload.json.includes('"stores"'));
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

  it('imports atomically and rolls back on write failure', () => {
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
    const snapshot = createPracticeExportPayload(storage).snapshot;
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

    const failed = importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(failed.ok, false);
    assert.ok(storage.getItem('focus-tiger.journey-log.v1')?.includes('"minutes":5'));

    storage.setItem = originalSet;
    const ok = importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(ok.ok, true);
    assert.ok(storage.getItem('focus-tiger.journey-log.v1')?.includes('"minutes":20'));
  });

  it('detects data-loss risk when import has fewer rows', () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{}, {}, {}]
      })
    });
    const snapshot = createPracticeExportPayload(storage).snapshot;
    snapshot.stores['focus-tiger.journey-log.v1'] = { entries: [{}] };
    assert.equal(hasLocalPracticeData(storage), true);
    assert.equal(importHasDataLossRisk(storage, snapshot), true);
    const rows = comparePracticeImportCounts(storage, snapshot);
    assert.equal(rows[0].localCount, 3);
    assert.equal(rows[0].importCount, 1);
  });
});
