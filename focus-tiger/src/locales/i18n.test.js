/**
 * i18n unit · Task A — key parity, setLocale notify, fallback, ready-only.
 * v1.0.0 ship: `en` + `ja` ready; zh stays loaded as draft (Chinese deferred).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  JA_MAY_MATCH_EN,
  listJaEqualToEn,
  listJaMissingJapaneseScript
} from './jaCopyGuards.js';
import {
  LOCALE_PREFERENCE_STORAGE_KEY,
  normalizeLocalePreference,
  readLocalePreference,
  writeLocalePreference,
  listPickerLocales,
  shouldOfferLanguagePicker
} from './localePreference.js';

const here = dirname(fileURLToPath(import.meta.url));
const enDict = JSON.parse(readFileSync(join(here, 'en.json'), 'utf8'));
const jaDict = JSON.parse(readFileSync(join(here, 'ja.json'), 'utf8'));

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

test('v1.0.0 ready set is English + Japanese', () => {
  assert.deepEqual(listReadyLocaleIds(), ['en', 'ja']);
  assert.equal(isReadyLocale('ja'), true);
  assert.equal(isReadyLocale('zh'), false);
  assert.equal(shouldOfferLanguagePicker(), true);
});

test('ready locales have identical dictionary key sets', () => {
  const loaded = listLoadedDictionaryKeys();
  const ready = listReadyLocaleIds();
  assert.ok(ready.includes('en'));
  assert.ok(ready.includes('ja'));
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

/**
 * Proper nouns / titles that may stay identical across en and ja.
 * New product UI must not land here as an English placeholder — translate ja.json.
 * Allowlist SSOT: jaCopyGuards.js
 */
test('ja values are translated (not English placeholders), except proper-noun allowlist', () => {
  assert.ok(JA_MAY_MATCH_EN.has('APP_TITLE'));
  assert.deepEqual(
    listJaEqualToEn(enDict, jaDict),
    [],
    'ja.json still copies en — translate or extend JA_MAY_MATCH_EN in jaCopyGuards.js'
  );
});

test('ja values include Japanese script (kana or kanji), except proper-noun allowlist', () => {
  // Intentionally NOT “must contain kana”: kanji-only labels (到着/回復/言語) are valid JP.
  assert.deepEqual(
    listJaMissingJapaneseScript(jaDict),
    [],
    'ja.json has Latin-only values — translate or allowlist in jaCopyGuards.js'
  );
});

test('staged zh dictionary stays loaded and key-parity with en (future flip)', () => {
  const loaded = listLoadedDictionaryKeys();
  assert.ok(loaded.zh, 'zh.json must stay in DICTIONARIES for later ready flip');
  assert.deepEqual(loaded.zh, loaded.en);
});

test('picker lists only ready locales; draft zh/es hidden', () => {
  const picker = listPickerLocales();
  assert.deepEqual(
    picker.map((p) => p.id),
    listReadyLocaleIds()
  );
  assert.ok(!picker.some((p) => p.id === 'zh'));
  assert.ok(!picker.some((p) => p.id === 'es'));
  assert.equal(picker.find((p) => p.id === 'en')?.nativeLabel, 'English');
  assert.equal(picker.find((p) => p.id === 'ja')?.nativeLabel, '日本語');
});

test('draft locales are not ready and normalize rejects them', () => {
  assert.equal(isReadyLocale('es'), false);
  assert.equal(isReadyLocale('zh'), false);
  assert.equal(normalizeLocalePreference('es'), null);
  assert.equal(normalizeLocalePreference('zh'), null);
  assert.equal(normalizeLocalePreference('en'), 'en');
  assert.equal(normalizeLocalePreference('ja'), 'ja');
});

test('setLocale notifies listeners and persists preference', () => {
  const storage = memoryStorage();
  bootLocaleFromPreference(storage);
  assert.equal(getLocale(), 'en');

  const seen = [];
  const unsub = onLocaleChange((locale) => seen.push(locale));
  setLocale('ja', { persist: true, storage });
  assert.equal(getLocale(), 'ja');
  assert.deepEqual(seen, ['ja']);
  assert.equal(storage.getItem(LOCALE_PREFERENCE_STORAGE_KEY), 'ja');
  assert.equal(t('BTN_FOCUS_START'), '阿寅と坐る');
  assert.equal(t('CHARACTER_NAME'), '阿寅');

  setLocale('en', { persist: true, storage });
  assert.equal(getLocale(), 'en');
  assert.equal(t('BTN_FOCUS_START'), 'Sit with Yin');
  unsub();
});

test('setLocale ignores unknown / draft locales (incl. zh while draft)', () => {
  const storage = memoryStorage({ [LOCALE_PREFERENCE_STORAGE_KEY]: 'en' });
  bootLocaleFromPreference(storage);
  setLocale('de', { persist: true, storage });
  assert.equal(getLocale(), 'en');
  setLocale('zh', { persist: true, storage });
  assert.equal(getLocale(), 'en');
  assert.equal(storage.getItem(LOCALE_PREFERENCE_STORAGE_KEY), 'en');
});

test('bootLocaleFromPreference restores stored ready locale (ja)', () => {
  const storage = memoryStorage({ [LOCALE_PREFERENCE_STORAGE_KEY]: 'ja' });
  assert.equal(bootLocaleFromPreference(storage), 'ja');
  assert.equal(getLocale(), 'ja');
});

test('bootLocaleFromPreference ignores stored draft locale', () => {
  const storage = memoryStorage({ [LOCALE_PREFERENCE_STORAGE_KEY]: 'zh' });
  assert.equal(bootLocaleFromPreference(storage), 'en');
  assert.equal(getLocale(), 'en');
});

test('read/write locale preference round-trip (ready only)', () => {
  const storage = memoryStorage();
  assert.equal(writeLocalePreference('en', storage), true);
  assert.equal(readLocalePreference(storage), 'en');
  assert.equal(writeLocalePreference('ja', storage), true);
  assert.equal(readLocalePreference(storage), 'ja');
  assert.equal(writeLocalePreference('zh', storage), false);
  assert.equal(writeLocalePreference('es', storage), false);
});

test('t falls back to en then key id', () => {
  const storage = memoryStorage();
  bootLocaleFromPreference(storage);
  assert.ok(t('APP_TITLE').length > 0);
  assert.equal(t('___NO_SUCH_I18N_KEY___'), '___NO_SUCH_I18N_KEY___');
});

// Reset module locale so later smoke files see default en
test('reset locale to en after suite mutations', () => {
  setLocale('en', { persist: false, storage: memoryStorage() });
  assert.equal(getLocale(), 'en');
});
