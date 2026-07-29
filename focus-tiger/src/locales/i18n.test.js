/**
 * i18n unit · Task A — key parity, setLocale notify, fallback, ready-only.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  t,
  setLocale,
  getLocale,
  onLocaleChange,
  bootLocaleFromPreference,
  listLoadedDictionaryKeys
} from './i18n.js';
import { listReadyLocaleIds, isReadyLocale } from './localeRegistry.js';
import {
  LOCALE_PREFERENCE_STORAGE_KEY,
  normalizeLocalePreference,
  readLocalePreference,
  writeLocalePreference,
  listPickerLocales
} from './localePreference.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    _map: map
  };
}

test('ready locales have identical dictionary key sets', () => {
  const loaded = listLoadedDictionaryKeys();
  const ready = listReadyLocaleIds();
  assert.ok(ready.includes('en'));
  assert.ok(ready.includes('zh'));
  for (const id of ready) {
    assert.ok(loaded[id], `missing loaded dictionary for ready locale ${id}`);
  }
  const enKeys = loaded.en;
  for (const id of ready) {
    assert.deepEqual(
      loaded[id],
      enKeys,
      `locale ${id} keys must match en (parity)`
    );
  }
});

test('picker lists only ready locales with native labels', () => {
  const picker = listPickerLocales();
  assert.deepEqual(
    picker.map((p) => p.id),
    listReadyLocaleIds()
  );
  assert.ok(!picker.some((p) => p.id === 'es'));
  assert.equal(picker.find((p) => p.id === 'zh')?.nativeLabel, '中文');
});

test('draft locales are not ready and normalize rejects them', () => {
  assert.equal(isReadyLocale('es'), false);
  assert.equal(normalizeLocalePreference('es'), null);
  assert.equal(normalizeLocalePreference('zh'), 'zh');
});

test('setLocale notifies listeners and persists preference', () => {
  const storage = memoryStorage();
  bootLocaleFromPreference(storage);
  assert.equal(getLocale(), 'en');

  const seen = [];
  const unsub = onLocaleChange((locale) => seen.push(locale));
  setLocale('zh', { persist: true, storage });
  assert.equal(getLocale(), 'zh');
  assert.deepEqual(seen, ['zh']);
  assert.equal(storage.getItem(LOCALE_PREFERENCE_STORAGE_KEY), 'zh');
  assert.equal(t('BTN_FOCUS_START'), '与阿寅同坐');

  setLocale('en', { persist: true, storage });
  assert.equal(getLocale(), 'en');
  assert.equal(t('BTN_FOCUS_START'), 'Sit with Yin');
  unsub();
});

test('setLocale ignores unknown / draft locales', () => {
  const storage = memoryStorage({ [LOCALE_PREFERENCE_STORAGE_KEY]: 'en' });
  bootLocaleFromPreference(storage);
  setLocale('ja', { persist: true, storage });
  assert.equal(getLocale(), 'en');
  assert.equal(storage.getItem(LOCALE_PREFERENCE_STORAGE_KEY), 'en');
});

test('bootLocaleFromPreference restores stored ready locale', () => {
  const storage = memoryStorage({ [LOCALE_PREFERENCE_STORAGE_KEY]: 'zh' });
  assert.equal(bootLocaleFromPreference(storage), 'zh');
  assert.equal(getLocale(), 'zh');
});

test('read/write locale preference round-trip', () => {
  const storage = memoryStorage();
  assert.equal(writeLocalePreference('zh', storage), true);
  assert.equal(readLocalePreference(storage), 'zh');
  assert.equal(writeLocalePreference('es', storage), false);
});

test('t falls back to en then key id', () => {
  const storage = memoryStorage();
  bootLocaleFromPreference(storage);
  setLocale('zh', { persist: false, storage });
  // existing key
  assert.ok(t('APP_TITLE').length > 0);
  // missing key → warn + return key
  assert.equal(t('___NO_SUCH_I18N_KEY___'), '___NO_SUCH_I18N_KEY___');
  setLocale('en', { persist: false, storage });
});

// Reset module locale so later smoke files see default en
test('reset locale to en after suite mutations', () => {
  setLocale('en', { persist: false, storage: memoryStorage() });
  assert.equal(getLocale(), 'en');
});
