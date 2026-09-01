/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  applyBreathPracticeFocusCoinsGrant,
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

  it('Breath 1 min: ritual +1 only (duration below Stay rate)', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const short = applyBreathPracticeFocusCoinsGrant({
      durationMinutes: 1,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      enabled: true
    });
    assert.equal(short.timed.points, 0);
    assert.equal(short.ritual.points, 1);
    assert.equal(short.points, 1);
    assert.equal(store.getSnapshot().balance, 1);
  });

  it('Breath 10 min first of day: Stay-rate +2 plus ritual +1', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const long = applyBreathPracticeFocusCoinsGrant({
      durationMinutes: 10,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      enabled: true
    });
    assert.equal(long.timed.points, 2);
    assert.equal(long.ritual.points, 1);
    assert.equal(long.points, 3);
    assert.equal(store.getSnapshot().balance, 3);
  });

  it('Breath Leave path is not this helper: flag off writes nothing', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const result = applyBreathPracticeFocusCoinsGrant({
      durationMinutes: 20,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      enabled: false
    });
    assert.equal(result.points, 0);
    assert.equal(store.getSnapshot().balance, 0);
  });

  it('wallet key is on L-01 path and must not enter practice-backup 6 keys', () => {
    assert.equal(FOCUS_COINS_STORAGE_KEY, 'focus-tiger.focus-coins.v1');
    assert.equal(
      PRACTICE_BACKUP_STORE_KEYS.includes(FOCUS_COINS_STORAGE_KEY),
      false
    );
    assert.equal(PRACTICE_BACKUP_STORE_KEYS.length, 14);
  });

  it('main.js completeMicroRitual awards breath coins; Leave does not', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, '../main.js'), 'utf8');
    const start = src.indexOf('function completeMicroRitual()');
    const end = src.indexOf('function leaveMicroRitualQuietly()');
    assert.ok(start >= 0 && end > start);
    const complete = src.slice(start, end);
    const leave = src.slice(end, src.indexOf('const reflectionOpen'));
    assert.ok(complete.includes('applyBreathPracticeFocusCoinsGrant'));
    assert.equal(leave.includes('applyBreathPracticeFocusCoinsGrant'), false);
    assert.equal(leave.includes('awardFocusCoins'), false);
  });
});
