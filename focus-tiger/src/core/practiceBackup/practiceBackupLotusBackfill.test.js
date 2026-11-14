/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  backfillLotusPondStoreForImport,
  inferLifetimeMinutesFromPracticeDays,
  buildBackfilledLotusPondValue
} from './practiceBackupLotusBackfill.js';
import { normalizeSnapshotStoresForApply } from './practiceBackupSync.js';
import { validatePracticeImportPayload } from './practiceBackupLocalIo.js';
import { parseLotusPondLifetimeMinutes } from '../LotusPondStore.js';
import { importPracticeSnapshotAtomic } from './practiceBackupLocalIo.js';

const here = dirname(fileURLToPath(import.meta.url));

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

describe('practiceBackupLotusBackfill', () => {
  it('prefers practice-days totalMinutes sum over journey log', () => {
    const stores = {
      'focus-tiger.practice-days.v1': {
        days: [{ date: '2026-09-01', totalMinutes: 25 }]
      },
      'focus-tiger.journey-log.v1': { entries: [{ minutes: 3 }] }
    };
    assert.equal(inferLifetimeMinutesFromPracticeDays(stores['focus-tiger.practice-days.v1']), 25);
    assert.equal(buildBackfilledLotusPondValue(stores).lifetimeMinutes, 25);
  });

  it('does not lower explicit lotus minutes on import', () => {
    const stores = {
      'focus-tiger.lotus-pond.v1': { lifetimeMinutes: 120 },
      'focus-tiger.practice-days.v1': { days: [{ date: '2026-09-01', totalMinutes: 25 }] }
    };
    const out = backfillLotusPondStoreForImport(stores);
    assert.equal(parseLotusPondLifetimeMinutes(out['focus-tiger.lotus-pond.v1']), 120);
  });

  it('schema v2 fixture without lotus backfills 405 minutes on apply', () => {
    const fixturePath = join(
      here,
      '../../../test-fixtures/legacy-backup-schema-v2-2026-09-11.json'
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const validated = validatePracticeImportPayload(raw);
    assert.equal(validated.ok, true);
    if (!validated.ok) return;
    const normalized = normalizeSnapshotStoresForApply(validated.snapshot, {
      filterOwnershipForLocalImport: true,
      storage: memStorage()
    });
    const lotus = normalized.stores['focus-tiger.lotus-pond.v1'];
    assert.equal(parseLotusPondLifetimeMinutes(lotus), 405);
  });

  it('atomic import writes lotus after legacy v2 restore', async () => {
    const fixturePath = join(
      here,
      '../../../test-fixtures/legacy-backup-schema-v2-2026-09-11.json'
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const validated = validatePracticeImportPayload(raw);
    assert.equal(validated.ok, true);
    if (!validated.ok) return;
    const storage = memStorage();
    const result = await importPracticeSnapshotAtomic(storage, validated.snapshot);
    assert.equal(result.ok, true);
    const lotus = JSON.parse(storage.getItem('focus-tiger.lotus-pond.v1') || 'null');
    assert.equal(lotus.lifetimeMinutes, 405);
  });
});