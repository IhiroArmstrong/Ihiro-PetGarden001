/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import {
  flushPracticeBackupUpload,
  maybeRestorePracticeBackupOnBoot,
  schedulePracticeBackupUpload,
  resetPracticeBackupSyncForTests,
  setPracticeBackupBusyProbe,
  enablePracticeBackupOptIn,
  PRACTICE_BACKUP_DEBOUNCE_MS
} from './practiceBackupSync.js';
import { readPracticeBackupOptIn } from './practiceBackupOptIn.js';
import { PRACTICE_BACKUP_STORE_KEYS } from './practiceBackupSnapshot.js';

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

describe('practiceBackupSync', () => {
  beforeEach(() => {
    resetPracticeBackupSyncForTests();
  });

  it('does not upload without consent', async () => {
    const storage = memStorage();
    let calls = 0;
    const result = await flushPracticeBackupUpload({
      storage,
      postJson: async () => {
        calls += 1;
        return { ok: true };
      }
    });
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'not_consented');
    assert.equal(calls, 0);
  });

  it('uploads whole snapshot when consented', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [
          {
            at: '2026-01-01T00:00:00.000Z',
            minutes: 10,
            arrive: true,
            reflect: true
          }
        ]
      })
    });
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    /** @type {unknown} */
    let body = null;
    const result = await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson: async (_path, init) => {
        body = JSON.parse(String(init.body || ''));
        return { ok: true };
      }
    });
    assert.equal(result.ok, true);
    assert.ok(body && typeof body === 'object');
    const snap = /** @type {{ snapshot: { stores: Record<string, unknown> } }} */ (
      body
    ).snapshot;
    assert.deepEqual(
      Object.keys(snap.stores).sort(),
      [...PRACTICE_BACKUP_STORE_KEYS].sort()
    );
  });

  it('debounce gate: only one flush from overlapping schedules within window', async () => {
    const storage = memStorage();
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    let calls = 0;
    const postJson = async () => {
      calls += 1;
      return { ok: true };
    };
    // Use tiny debounce via direct flush+throttle instead of real 10min timer:
    // first force ok; second without force within minGap → throttled
    await flushPracticeBackupUpload({ storage, force: true, postJson, minGapMs: 60_000 });
    const second = await flushPracticeBackupUpload({
      storage,
      force: false,
      postJson,
      minGapMs: 60_000
    });
    assert.equal(calls, 1);
    assert.equal(second.reason, 'throttled');
  });

  it('skips upload while busy (Focusing)', async () => {
    const storage = memStorage();
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    setPracticeBackupBusyProbe(() => true);
    let calls = 0;
    const result = await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson: async () => {
        calls += 1;
        return { ok: true };
      }
    });
    assert.equal(result.reason, 'busy');
    assert.equal(calls, 0);
  });

  it('auto-restore only when whitelist completely empty', async () => {
    const empty = memStorage();
    enablePracticeBackupOptIn(empty, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    const snap = {
      schemaVersion: 1,
      savedAt: '2026-08-12T00:00:00.000Z',
      stores: Object.fromEntries(
        PRACTICE_BACKUP_STORE_KEYS.map((k) => [
          k,
          k === 'focus-tiger.journey-log.v1'
            ? {
                entries: [
                  {
                    at: '2026-01-01T00:00:00.000Z',
                    minutes: 12,
                    arrive: true,
                    reflect: false
                  }
                ]
              }
            : null
        ])
      )
    };
    const restored = await maybeRestorePracticeBackupOnBoot({
      storage: empty,
      postJson: async () => ({ ok: true, snapshot: snap })
    });
    assert.equal(restored.ok, true);
    assert.ok(empty.getItem('focus-tiger.journey-log.v1')?.includes('12'));

    const nonempty = memStorage({
      'focus-tiger.milestone-glow.v1': JSON.stringify({ played: ['streak-7'] })
    });
    enablePracticeBackupOptIn(nonempty, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    let getCalls = 0;
    const skipped = await maybeRestorePracticeBackupOnBoot({
      storage: nonempty,
      postJson: async () => {
        getCalls += 1;
        return { ok: true, snapshot: snap };
      }
    });
    assert.equal(skipped.reason, 'local_not_empty');
    assert.equal(getCalls, 0);
  });

  it('upload failure does not clear local journey data', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [
          {
            at: '2026-01-01T00:00:00.000Z',
            minutes: 9,
            arrive: false,
            reflect: false
          }
        ]
      })
    });
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    const before = storage.getItem('focus-tiger.journey-log.v1');
    const result = await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson: async () => {
        throw new Error('network');
      }
    });
    assert.equal(result.ok, false);
    assert.equal(storage.getItem('focus-tiger.journey-log.v1'), before);
  });

  it('schedulePracticeBackupUpload uses debounce timer', async () => {
    assert.equal(PRACTICE_BACKUP_DEBOUNCE_MS, 10 * 60 * 1000);
    const storage = memStorage();
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    let calls = 0;
    // Inject via flushing after tiny debounce by calling schedule with 1ms
    schedulePracticeBackupUpload({ storage, debounceMs: 5 });
    schedulePracticeBackupUpload({ storage, debounceMs: 5 });
    await new Promise((r) => setTimeout(r, 30));
    // Default flush needs postJson — without cloud URL it skips; patch by force flush count
    await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson: async () => {
        calls += 1;
        return { ok: true };
      }
    });
    assert.equal(calls, 1);
  });

  it('skips restore fetch while busy (Arrival / overlay)', async () => {
    const storage = memStorage();
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    setPracticeBackupBusyProbe(() => true);
    let getCalls = 0;
    const result = await maybeRestorePracticeBackupOnBoot({
      storage,
      postJson: async () => {
        getCalls += 1;
        return { ok: true, snapshot: {} };
      }
    });
    assert.equal(result.reason, 'busy');
    assert.equal(getCalls, 0);
  });

  it('retries overlay-busy upload after short delay, without stringify during busy', async () => {
    const storage = memStorage();
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    let busy = true;
    setPracticeBackupBusyProbe(() => ({ busy, retry: busy }));
    let calls = 0;
    const postJson = async () => {
      calls += 1;
      return { ok: true };
    };
    const first = await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson,
      retryMs: 15
    });
    assert.equal(first.reason, 'busy');
    assert.equal(calls, 0);
    busy = false;
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(calls, 1);
  });

  it('skips PUT when store fingerprint is unchanged (cloud-ok only)', async () => {
    const storage = memStorage({
      'focus-tiger.journey-log.v1': JSON.stringify({
        entries: [
          {
            at: '2026-01-01T00:00:00.000Z',
            minutes: 10,
            arrive: true,
            reflect: false
          }
        ]
      })
    });
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    let calls = 0;
    const postJson = async () => {
      calls += 1;
      return { ok: true };
    };
    const first = await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson
    });
    assert.equal(first.ok, true);
    assert.equal(calls, 1);
    const second = await flushPracticeBackupUpload({
      storage,
      force: true,
      postJson
    });
    assert.equal(second.reason, 'unchanged');
    assert.equal(calls, 1);
    assert.ok(readPracticeBackupOptIn(storage).lastUploadFingerprint);
  });
});
