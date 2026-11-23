/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MENU_FAVORITES_MAX,
  MENU_FAVORITES_STORAGE_KEY,
  defaultMenuFavoritesState,
  normalizeMenuFavoritesState,
  readMenuFavoritesState,
  writeMenuFavoritesState,
  toggleMenuFavorite,
  isMenuFavorite,
  resolveMenuFavoriteEntries,
  injectMenuFavoritesSection
} from './menuFavoritesStore.js';

function mockStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return /** @type {Storage} */ ({
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = v;
    },
    removeItem: (k) => {
      delete map[k];
    },
    clear: () => {
      for (const k of Object.keys(map)) delete map[k];
    },
    key: (i) => Object.keys(map)[i] ?? null,
    get length() {
      return Object.keys(map).length;
    }
  });
}

describe('menuFavoritesStore', () => {
  it('normalize dedupes and caps at MENU_FAVORITES_MAX', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `p-${i}`);
    const state = normalizeMenuFavoritesState({
      itemIds: ['a', 'a', ...ids]
    });
    assert.equal(state.itemIds.length, MENU_FAVORITES_MAX);
    assert.equal(state.itemIds[0], 'a');
  });

  it('toggle add/remove and respects full cap', () => {
    const storage = mockStorage();
    assert.equal(toggleMenuFavorite('daily-quote', storage).added, true);
    assert.equal(isMenuFavorite('daily-quote', storage), true);
    assert.equal(toggleMenuFavorite('daily-quote', storage).removed, true);
    assert.equal(isMenuFavorite('daily-quote', storage), false);

    for (let i = 0; i < MENU_FAVORITES_MAX; i++) {
      toggleMenuFavorite(`item-${i}`, storage);
    }
    const full = toggleMenuFavorite('one-more', storage);
    assert.equal(full.full, true);
    assert.equal(isMenuFavorite('one-more', storage), false);
  });

  it('backup round-trip via storage JSON', () => {
    const storage = mockStorage();
    writeMenuFavoritesState({ itemIds: ['companion', 'zen-cinema'] }, storage);
    const raw = storage.getItem(MENU_FAVORITES_STORAGE_KEY);
    assert.ok(raw);
    storage.clear();
    storage.setItem(MENU_FAVORITES_STORAGE_KEY, raw);
    assert.deepEqual(readMenuFavoritesState(storage).itemIds, [
      'companion',
      'zen-cinema'
    ]);
  });

  it('resolveMenuFavoriteEntries keeps order and skips missing', () => {
    const entries = [
      { proxy: 'b', labelKey: 'B' },
      { proxy: 'a', labelKey: 'A' }
    ];
    const fav = resolveMenuFavoriteEntries(entries, ['a', 'missing', 'b']);
    assert.equal(fav.length, 2);
    assert.equal(fav[0].proxy, 'a');
    assert.equal(fav[1].proxy, 'b');
  });

  it('default state is empty', () => {
    assert.deepEqual(defaultMenuFavoritesState(), { itemIds: [] });
    assert.deepEqual(readMenuFavoritesState(mockStorage()), { itemIds: [] });
  });
});

describe('injectMenuFavoritesSection', () => {
  const base = [
    { kind: 'group-label', labelKey: 'MENU_GROUP_PRACTICE' },
    { proxy: 'companion', labelKey: 'X' },
    { proxy: 'daily-quote', labelKey: 'Y' }
  ];

  it('no-op when favorites empty', () => {
    const storage = mockStorage();
    assert.equal(injectMenuFavoritesSection(base, storage), base);
  });

  it('prepends group and favorite rows', () => {
    const storage = mockStorage();
    writeMenuFavoritesState({ itemIds: ['daily-quote'] }, storage);
    const out = injectMenuFavoritesSection(base, storage);
    assert.equal(out[0].labelKey, 'MENU_GROUP_MY_FAVORITES');
    assert.equal(out[1].proxy, 'daily-quote');
    assert.equal(out[2].labelKey, 'MENU_GROUP_PRACTICE');
  });
});