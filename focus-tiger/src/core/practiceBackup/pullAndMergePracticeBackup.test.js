/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import {
  enablePracticeBackupOptIn,
  pullAndMergePracticeBackup,
  resetPracticeBackupSyncForTests
} from './practiceBackupSync.js';
import { serializePracticeBackupCloudSnapshot } from './practiceBackupSnapshot.js';
import { setPracticeBackupCloudEnabledForTests } from './practiceBackupCloudEnabled.js';

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

describe('pullAndMergePracticeBackup · T93 D3', () => {
  beforeEach(() => {
    resetPracticeBackupSyncForTests();
    setPracticeBackupCloudEnabledForTests(true);
  });

  it('pulls a cloud snapshot even when local whitelist is not empty', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{ id: 'local-1', at: '2026-01-01T00:00:00.000Z', minutes: 1 }]
      })
    });
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    const cloudStorage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{ id: 'cloud-1', at: '2026-01-02T00:00:00.000Z', minutes: 2 }]
      })
    });
    const pulled = await pullAndMergePracticeBackup({
      storage,
      postJson: async () => ({
        ok: true,
        snapshot: serializePracticeBackupCloudSnapshot(cloudStorage)
      })
    });
    assert.equal(pulled.ok, true);
    assert.equal(pulled.merged, true);
  });
});
