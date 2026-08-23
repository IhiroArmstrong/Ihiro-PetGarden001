/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRACTICE_BACKUP_STORE_KEYS,
  serializePracticeBackupSnapshot,
  parsePracticeBackupSnapshotClient,
  isPracticeBackupWhitelistCompletelyEmpty,
  isPracticeBackupStoreEmpty,
  writePracticeBackupStoresRaw
} from './practiceBackupSnapshot.js';

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

describe('practiceBackupSnapshot', () => {
  it('serialize includes exactly whitelist keys (no tip-jar / entitlement-cache)', () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{ at: '2026-01-01T00:00:00.000Z', minutes: 10, arrive: true, reflect: false }]
      }),
      'focus-tiger.tip-jar.v1': JSON.stringify({ tipped: true }),
      'focus-tiger.entitlement-cache.v1': JSON.stringify({ lifetime: true })
    });
    const snap = serializePracticeBackupSnapshot(storage, () => new Date('2026-08-12T00:00:00.000Z'));
    assert.equal(snap.schemaVersion, 1);
    assert.deepEqual(Object.keys(snap.stores).sort(), [...PRACTICE_BACKUP_STORE_KEYS].sort());
    assert.equal('focus-tiger.tip-jar.v1' in snap.stores, false);
    assert.ok(snap.stores['focus-tiger.journey-log.v1']);
    const parsed = parsePracticeBackupSnapshotClient(snap);
    assert.equal(parsed.ok, true);
  });

  it('parse rejects extra keys', () => {
    const bad = {
      schemaVersion: 1,
      savedAt: '2026-08-12T00:00:00.000Z',
      stores: {
        ...Object.fromEntries(PRACTICE_BACKUP_STORE_KEYS.map((k) => [k, null])),
        'focus-tiger.tip-jar.v1': { tipped: true }
      }
    };
    // extra key → key_count fails
    assert.equal(parsePracticeBackupSnapshotClient(bad).ok, false);
  });

  it('whitelist empty only when all six stores empty', () => {
    const empty = memStorage();
    assert.equal(isPracticeBackupWhitelistCompletelyEmpty(empty), true);

    const withJourney = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [{ at: '2026-01-01T00:00:00.000Z', minutes: 5, arrive: false, reflect: false }]
      })
    });
    assert.equal(isPracticeBackupWhitelistCompletelyEmpty(withJourney), false);
    assert.equal(
      isPracticeBackupStoreEmpty(withJourney, 'focus-tiger.journey-log.v1'),
      false
    );
  });

  it('mustard-seed revealed counts as non-empty', () => {
    const storage = memStorage({
      'focus-tiger.mustard-seed-seal.v1': JSON.stringify({
        revealed: true,
        revealedAt: '2026-01-01T00:00:00.000Z',
        scoreAtReveal: 21
      })
    });
    assert.equal(
      isPracticeBackupStoreEmpty(storage, 'focus-tiger.mustard-seed-seal.v1'),
      false
    );
    assert.equal(isPracticeBackupWhitelistCompletelyEmpty(storage), false);
  });

  it('skips setItem when store JSON is unchanged', () => {
    const journey = JSON.stringify({
      entries: [
        {
          at: '2026-01-01T00:00:00.000Z',
          minutes: 5,
          arrive: false,
          reflect: false
        }
      ]
    });
    const storage = memStorage({
      'focus-tiger.journey-log.v1': journey
    });
    let sets = 0;
    const origSet = storage.setItem;
    storage.setItem = (k, v) => {
      sets += 1;
      origSet(k, v);
    };
    const snap = serializePracticeBackupSnapshot(
      storage,
      () => new Date('2026-08-12T00:00:00.000Z')
    );
    const first = writePracticeBackupStoresRaw(storage, snap);
    assert.equal(first.skipped, PRACTICE_BACKUP_STORE_KEYS.length);
    assert.equal(sets, 0);
    const second = writePracticeBackupStoresRaw(storage, {
      ...snap,
      savedAt: '2026-08-13T00:00:00.000Z'
    });
    assert.equal(second.skipped, PRACTICE_BACKUP_STORE_KEYS.length);
    assert.equal(sets, 0);
  });
});
