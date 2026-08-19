/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICE_BACKUP_STORE_KEYS } from './practiceBackup/practiceBackupSnapshot.js';
import { PracticeDaysStore } from './PracticeDaysStore.js';
import { LotusPondStore } from './LotusPondStore.js';
import { isEntitled } from './entitlement/entitlementGate.js';
import { SUMERU_BUNDLE_ID } from './focusCoinsLedger.js';
import { TIP_JAR_STORAGE_KEY } from './tipJarGate.js';
import { SANCTUARY_STORAGE_KEY } from './sanctuaryEntitlementGate.js';
import { FOCUS_COINS_STORAGE_KEY, FocusCoinsStore } from './focusCoinsStore.js';
import {
  applyFocusCoinsRedeem,
  applyFocusCoinsEquipTitle,
  titleToEquipAfterRedeem
} from './focusCoinsRedeem.js';
import {
  applyFocusCoinsCosmetics,
  focusCoinsCosmeticState,
  LOTUS_DEW_CLASS,
  LOTUS_DEW_OWNED_ID,
  RARE_PEBBLE_OWNED_ID
} from './focusCoinsCosmetics.js';

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

function seedPracticeDays(storage, count) {
  const days = [];
  for (let i = count; i >= 1; i -= 1) {
    days.push({ date: `2026-08-${String(18 - i).padStart(2, '0')}`, totalMinutes: 25 });
  }
  storage.setItem(
    'focus-tiger.practice-days.v1',
    JSON.stringify({ days })
  );
}

describe('focusCoinsRedeem L2', () => {
  it('flag off writes nothing', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    store.commitGrant({ points: 80 });
    const result = applyFocusCoinsRedeem({
      skuId: RARE_PEBBLE_OWNED_ID,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      lotusPondStore: new LotusPondStore({ storage }),
      enabled: false
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'flag-off');
    assert.equal(store.getBalance(), 80);
    assert.deepEqual(store.getSnapshot().ownedIds, []);
  });

  it('retired overlay SKUs cannot redeem even with a bloom', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    store.commitGrant({ points: 48 });
    const lotus = new LotusPondStore({ storage });
    lotus.addMinutes(25);
    assert.equal(lotus.getVisibleBloomCount(), 1);
    const blocked = applyFocusCoinsRedeem({
      skuId: LOTUS_DEW_OWNED_ID,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      lotusPondStore: lotus,
      enabled: true
    });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, 'retired-overlay');
    assert.equal(store.getBalance(), 48);
    assert.equal(store.getSnapshot().ownedIds.includes(LOTUS_DEW_OWNED_ID), false);
  });

  it('rare pebble does not write Tea or Sanctuary badgeIds', () => {
    const storage = memoryStorage();
    storage.setItem(
      TIP_JAR_STORAGE_KEY,
      JSON.stringify({ tipped: false, tipCount: 0, badgeIds: ['tea-a'] })
    );
    storage.setItem(
      SANCTUARY_STORAGE_KEY,
      JSON.stringify({ unlocked: false, badgeIds: ['sanctuary-a'] })
    );
    const tipBefore = storage.getItem(TIP_JAR_STORAGE_KEY);
    const sanctuaryBefore = storage.getItem(SANCTUARY_STORAGE_KEY);
    const store = new FocusCoinsStore({ storage });
    store.commitGrant({ points: 72 });
    const result = applyFocusCoinsRedeem({
      skuId: RARE_PEBBLE_OWNED_ID,
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      lotusPondStore: new LotusPondStore({ storage }),
      enabled: true
    });
    assert.equal(result.ok, true);
    assert.ok(store.getSnapshot().ownedIds.includes(RARE_PEBBLE_OWNED_ID));
    assert.equal(storage.getItem(TIP_JAR_STORAGE_KEY), tipBefore);
    assert.equal(storage.getItem(SANCTUARY_STORAGE_KEY), sanctuaryBefore);
    assert.equal(result.entitlementPatch, null);
    assert.equal(
      isEntitled('ambient.deep.play', { storage, now: () => new Date(0) }),
      false
    );
  });

  it('title redeem auto-equips when none equipped; owned ids only grow', () => {
    const storage = memoryStorage();
    seedPracticeDays(storage, 3);
    const store = new FocusCoinsStore({ storage });
    store.commitGrant({ points: 18 });
    const result = applyFocusCoinsRedeem({
      skuId: 'title.sits-with-yin',
      store,
      practiceDaysStore: new PracticeDaysStore({ storage }),
      lotusPondStore: new LotusPondStore({ storage }),
      enabled: true
    });
    assert.equal(result.ok, true);
    assert.equal(store.getSnapshot().equippedTitle, 'title.sits-with-yin');
    store.commitRedeem({
      balance: 0,
      ownedIds: ['title.sits-with-yin']
    });
    assert.ok(store.getSnapshot().ownedIds.includes('title.sits-with-yin'));
    assert.equal(store.getSnapshot().ownedIds.includes(RARE_PEBBLE_OWNED_ID), false);
  });

  it('equipTitle rejects unowned and flag-off', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    assert.equal(
      applyFocusCoinsEquipTitle({
        titleId: 'title.sits-with-yin',
        store,
        enabled: true
      }).reason,
      'not-owned'
    );
    store.commitRedeem({
      balance: 0,
      ownedIds: ['title.sits-with-yin'],
      equippedTitle: 'title.sits-with-yin'
    });
    const off = applyFocusCoinsEquipTitle({
      titleId: null,
      store,
      enabled: false
    });
    assert.equal(off.reason, 'flag-off');
    assert.equal(store.getSnapshot().equippedTitle, 'title.sits-with-yin');
  });

  it('sumeru bundle and cloak overlays are retired; porcelain stills redeem', () => {
    const storage = memoryStorage();
    const store = new FocusCoinsStore({ storage });
    const lotus = new LotusPondStore({ storage });
    const practice = new PracticeDaysStore({ storage });
    store.commitGrant({ points: 360 });
    const sumeru = applyFocusCoinsRedeem({
      skuId: SUMERU_BUNDLE_ID,
      store,
      practiceDaysStore: practice,
      lotusPondStore: lotus,
      enabled: true
    });
    assert.equal(sumeru.ok, false);
    assert.equal(sumeru.reason, 'retired-overlay');
    assert.equal(store.getBalance(), 360);

    const cloakBlocked = applyFocusCoinsRedeem({
      skuId: 'yin-accent.folded-cloak',
      store,
      practiceDaysStore: practice,
      lotusPondStore: lotus,
      enabled: true
    });
    assert.equal(cloakBlocked.reason, 'retired-overlay');

    const vase = applyFocusCoinsRedeem({
      skuId: 'collection.porcelain.qing-vase',
      store,
      practiceDaysStore: practice,
      lotusPondStore: lotus,
      enabled: true
    });
    assert.equal(vase.ok, true);
    assert.ok(store.getSnapshot().ownedIds.includes('collection.porcelain.qing-vase'));
    assert.equal(store.getBalance(), 320);
  });

  it('titleToEquipAfterRedeem keeps current title', () => {
    assert.equal(
      titleToEquipAfterRedeem(['title.long-sitter'], 'title.sits-with-yin'),
      undefined
    );
    assert.equal(
      titleToEquipAfterRedeem(['title.long-sitter'], null),
      'title.long-sitter'
    );
  });

  it('cosmetics never overlay dew or cushion; titles stay data-only', () => {
    const pond = { classList: { on: false, toggle(name, force) { this.on = Boolean(force); this.name = name; } } };
    const dataset = {};
    const documentElement = { dataset };
    applyFocusCoinsCosmetics(
      { ownedIds: [LOTUS_DEW_OWNED_ID, RARE_PEBBLE_OWNED_ID], equippedTitle: 'title.sits-with-yin' },
      { pondEl: pond, documentElement, enabled: true }
    );
    assert.equal(pond.classList.on, false);
    assert.equal(pond.classList.name, LOTUS_DEW_CLASS);
    assert.equal(dataset.focusCoinsTitle, 'title.sits-with-yin');
    assert.equal(dataset.focusCoinsRare, 'quiet-pebble');
    applyFocusCoinsCosmetics({}, { pondEl: pond, documentElement, enabled: false });
    assert.equal(pond.classList.on, false);
    assert.equal(dataset.focusCoinsTitle, undefined);
    assert.equal(
      PRACTICE_BACKUP_STORE_KEYS.includes(FOCUS_COINS_STORAGE_KEY),
      false
    );
    assert.equal(PRACTICE_BACKUP_STORE_KEYS.length, 6);
    assert.deepEqual(focusCoinsCosmeticState({ ownedIds: [LOTUS_DEW_OWNED_ID] }).lotusDew, false);
  });
});
