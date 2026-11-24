/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createPracticeExportPayload,
  validatePracticeImportPayload,
  importPracticeSnapshotAtomic
} from './practiceBackupLocalIo.js';
import {
  practiceBackupCloudEnabled,
  setPracticeBackupCloudEnabledForTests
} from './practiceBackupCloudEnabled.js';

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

describe('local export/import with cloud gate off (invite DMG)', () => {
  it('round-trips journey minutes while cloud restore is off', async () => {
    const prior = practiceBackupCloudEnabled;
    setPracticeBackupCloudEnabledForTests(false);
    try {
      const source = memStorage({
        'focus-tiger.journey-log.v1': JSON.stringify({
          entries: [{ id: 'sit-1', minutes: 25, at: '2026-11-24T00:00:00.000Z' }]
        })
      });
      const payload = await createPracticeExportPayload(
        source,
        () => new Date('2026-11-24T12:00:00Z')
      );
      assert.equal(practiceBackupCloudEnabled, false);
      assert.match(payload.json, /"minutes":\s*25/);

      const validated = validatePracticeImportPayload(payload.json);
      assert.equal(validated.ok, true);
      if (!validated.ok) return;

      const dest = memStorage();
      const imported = await importPracticeSnapshotAtomic(dest, validated.snapshot);
      assert.equal(imported.ok, true);
      assert.match(String(dest.getItem('focus-tiger.journey-log.v1')), /"minutes":\s*25/);
    } finally {
      setPracticeBackupCloudEnabledForTests(prior);
    }
  });
});
