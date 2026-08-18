/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICE_BACKUP_STORE_KEYS } from './practiceBackup/practiceBackupSnapshot.js';
import { COMPANION_MODE_STAY } from './FocusSession.js';
import { PracticeDaysStore, shiftLocalDateKey } from './PracticeDaysStore.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { GRANT_KIND } from './focusCoinsLedger.js';
import {
  FOCUS_COINS_AWARD_ENABLED,
  isFocusCoinsAwardEnabled
} from './focusCoinsAwardGate.js';
import {
  FOCUS_COINS_STORAGE_KEY,
  FocusCoinsStore
} from './focusCoinsStore.js';
import {
  applyFocusCoinsGrant,
  maybeResetFocusCoinsSession
} from './focusCoinsAward.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
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

describe('focusCoinsAward L1', () => {
  it('query ?focusCoins=0 turns award off even when default is on', () => {
    assert.equal(FOCUS_COINS_AWARD_ENABLED, true);
    assert.equal(
      isFocusCoinsAwardEnabled({ search: '?focusCoins=0' }),
      false
    );
    assert.equal(
      isFocusCoinsAwardEnabled({ search: '?focusCoins=1', awardEnabled: false }),
      true
    );
  });

  it('flag off resetSession helper writes nothing', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const did = maybeResetFocusCoinsSession({
      store,
      search: '?focusCoins=0'
    });
    assert.equal(did, false);
    assert.equal(storage.getItem(FOCUS_COINS_STORAGE_KEY), null);
  });

  it('flag off writes nothing; Stay 25 still 0', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    const result = applyFocusCoinsGrant({
      event: {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      store,
      practiceDaysStore: practice,
      enabled: false
    });
    assert.equal(result.applied, false);
    assert.equal(result.reason, 'flag-off');
    assert.equal(result.points, 0);
    assert.equal(store.getBalance(), 0);
    assert.equal(storage.getItem(FOCUS_COINS_STORAGE_KEY), null);
  });

  it('incomplete timed session does not increase balance', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    applyFocusCoinsGrant({
      event: {
        kind: GRANT_KIND.TIMED,
        reachedTarget: false,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      store,
      practiceDaysStore: practice,
      enabled: true
    });
    assert.equal(store.getBalance(), 0);
    assert.equal(storage.getItem(FOCUS_COINS_STORAGE_KEY), null);
  });

  it('Stay 25 min increases balance by 5', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    const result = applyFocusCoinsGrant({
      event: {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      store,
      practiceDaysStore: practice,
      enabled: true
    });
    assert.equal(result.applied, true);
    assert.equal(result.points, 5);
    assert.equal(store.getBalance(), 5);
  });

  it('Honesty 30 then same-day second Honesty: +3 then +0; store still records first', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    const first = applyFocusCoinsGrant({
      event: { kind: GRANT_KIND.HONESTY, durationMinutes: 30 },
      store,
      practiceDaysStore: practice,
      enabled: true
    });
    assert.equal(first.points, 3);
    const second = applyFocusCoinsGrant({
      event: { kind: GRANT_KIND.HONESTY, durationMinutes: 30 },
      store,
      practiceDaysStore: practice,
      enabled: true
    });
    assert.equal(second.points, 0);
    assert.equal(second.reason, 'honesty-already-minted');
    assert.equal(store.getBalance(), 3);
  });

  it('yesterday practiced adds +3 echo on first qualifying grant', () => {
    const storage = memoryStorage();
    const now = () => new Date(2026, 7, 18, 12, 0, 0);
    const yesterday = shiftLocalDateKey(getLocalDateKey(now()), -1);
    storage.setItem(
      'focus-tiger.practice-days.v1',
      JSON.stringify({ days: [{ date: yesterday, totalMinutes: 25 }] })
    );
    const practice2 = new PracticeDaysStore({ storage, now });
    const store = new FocusCoinsStore({ storage, now });
    const result = applyFocusCoinsGrant({
      event: {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      store,
      practiceDaysStore: practice2,
      now,
      enabled: true
    });
    assert.equal(result.points, 8);
    assert.equal(store.getBalance(), 8);
  });

  it('active Recover grant sets lifetimeMarks.activeRecover', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    applyFocusCoinsGrant({
      event: { kind: GRANT_KIND.ACTIVE_RECOVER },
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      enabled: true
    });
    assert.equal(store.getSnapshot().lifetimeMarks.activeRecover, true);
  });

  it('wallet key is on L-01 path and must not enter practice-backup 6 keys', () => {
    assert.equal(FOCUS_COINS_STORAGE_KEY, 'focus-tiger.focus-coins.v1');
    assert.equal(
      PRACTICE_BACKUP_STORE_KEYS.includes(FOCUS_COINS_STORAGE_KEY),
      false
    );
    assert.equal(PRACTICE_BACKUP_STORE_KEYS.length, 6);
  });
});
