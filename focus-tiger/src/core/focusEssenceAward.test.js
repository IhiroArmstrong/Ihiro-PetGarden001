/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { COMPANION_MODE_STAY } from './FocusSession.js';
import { PracticeDaysStore, shiftLocalDateKey } from './PracticeDaysStore.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { GRANT_KIND } from './focusEssenceLedger.js';
import {
  FOCUS_ESSENCE_AWARD_ENABLED,
  isFocusEssenceAwardEnabled
} from './focusEssenceAwardGate.js';
import {
  FOCUS_ESSENCE_STORAGE_KEY,
  FocusEssenceStore
} from './FocusEssenceStore.js';
import {
  applyFocusEssenceGrant,
  applyBreathPracticeFocusEssenceGrant,
  maybeResetFocusEssenceSession
} from './focusEssenceAward.js';
import {
  FOCUS_COINS_STORAGE_KEY,
  FocusCoinsStore
} from './focusCoinsStore.js';
import { isFocusCoinsAwardEnabled } from './focusCoinsAwardGate.js';

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

describe('focusEssenceAward L1', () => {
  it('query ?focusEssence=0 turns award off even when default is on', () => {
    assert.equal(FOCUS_ESSENCE_AWARD_ENABLED, true);
    assert.equal(
      isFocusEssenceAwardEnabled({ search: '?focusEssence=0' }),
      false
    );
    assert.equal(
      isFocusEssenceAwardEnabled({ search: '?focusEssence=1', awardEnabled: false }),
      true
    );
  });

  it('essence gate is independent from focusCoins gate', () => {
    assert.equal(
      isFocusEssenceAwardEnabled({ search: '?focusCoins=0' }),
      true
    );
    assert.equal(
      isFocusCoinsAwardEnabled({ search: '?focusEssence=0' }),
      true
    );
  });

  it('flag off resetSession helper writes nothing', () => {
    const storage = memoryStorage();
    const store = new FocusEssenceStore({ storage });
    const did = maybeResetFocusEssenceSession({
      store,
      search: '?focusEssence=0'
    });
    assert.equal(did, false);
    assert.equal(storage.getItem(FOCUS_ESSENCE_STORAGE_KEY), null);
  });

  it('flag off writes nothing; Stay 25 still 0', () => {
    const storage = memoryStorage();
    const store = new FocusEssenceStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    const result = applyFocusEssenceGrant({
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
    assert.equal(store.getTotal(), 0);
    assert.equal(storage.getItem(FOCUS_ESSENCE_STORAGE_KEY), null);
  });

  it('Stay 25 min increases essenceTotal by 5', () => {
    const storage = memoryStorage();
    const store = new FocusEssenceStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    const result = applyFocusEssenceGrant({
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
    assert.equal(store.getTotal(), 5);
    const snap = store.getSnapshot();
    assert.equal('balance' in snap, false);
    assert.equal('ownedIds' in snap, false);
    assert.equal('lifetimeMarks' in snap, false);
  });

  it('active Recover grant does not write coin lifetime marks', () => {
    const storage = memoryStorage();
    const essenceStore = new FocusEssenceStore({ storage });
    const coinStore = new FocusCoinsStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    applyFocusEssenceGrant({
      event: { kind: GRANT_KIND.ACTIVE_RECOVER },
      store: essenceStore,
      practiceDaysStore: practice,
      enabled: true
    });
    assert.equal(essenceStore.getTotal(), 1);
    assert.equal(coinStore.getSnapshot().lifetimeMarks.activeRecover, false);
  });

  it('yesterday practiced adds +3 echo on first qualifying grant', () => {
    const storage = memoryStorage();
    const now = () => new Date(2026, 7, 18, 12, 0, 0);
    const yesterday = shiftLocalDateKey(getLocalDateKey(now()), -1);
    storage.setItem(
      'focus-tiger.practice-days.v1',
      JSON.stringify({ days: [{ date: yesterday, totalMinutes: 25 }] })
    );
    const practice = new PracticeDaysStore({ storage, now });
    const store = new FocusEssenceStore({ storage, now });
    const result = applyFocusEssenceGrant({
      event: {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      store,
      practiceDaysStore: practice,
      now,
      enabled: true
    });
    assert.equal(result.points, 8);
    assert.equal(store.getTotal(), 8);
  });

  it('Breath 10 min first of day: Stay-rate +2 plus ritual +1', () => {
    const storage = memoryStorage();
    const store = new FocusEssenceStore({ storage });
    const long = applyBreathPracticeFocusEssenceGrant({
      durationMinutes: 10,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      enabled: true
    });
    assert.equal(long.timed.points, 2);
    assert.equal(long.ritual.points, 1);
    assert.equal(long.points, 3);
    assert.equal(store.getSnapshot().essenceTotal, 3);
  });

  it('storage key is distinct from focus coins', () => {
    assert.equal(FOCUS_ESSENCE_STORAGE_KEY, 'focus-tiger.focus-essence.v1');
    assert.notEqual(FOCUS_ESSENCE_STORAGE_KEY, FOCUS_COINS_STORAGE_KEY);
  });
});
