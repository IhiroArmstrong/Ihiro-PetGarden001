/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Persist last chosen locale (`focus-tiger.locale.v1`).
 * Cold start: stored ready locale → else DEFAULT_LOCALE (en). No silent draft enable.
 */

import {
  DEFAULT_LOCALE,
  LOCALE_CATALOG,
  isReadyLocale,
  listReadyLocaleIds
} from './localeRegistry.js';

export const LOCALE_PREFERENCE_STORAGE_KEY = 'focus-tiger.locale.v1';

/**
 * @param {unknown} raw
 * @returns {import('./localeRegistry.js').LocaleId | null}
 */
export function normalizeLocalePreference(raw) {
  if (typeof raw !== 'string') return null;
  const id = raw.trim();
  if (!isReadyLocale(id)) return null;
  return /** @type {import('./localeRegistry.js').LocaleId} */ (id);
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./localeRegistry.js').LocaleId}
 */
export function readLocalePreference(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(LOCALE_PREFERENCE_STORAGE_KEY);
    return normalizeLocalePreference(raw) ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * @param {import('./localeRegistry.js').LocaleId} locale
 * @param {Storage | null | undefined} [storage]
 * @returns {boolean} true if written
 */
export function writeLocalePreference(
  locale,
  storage = globalThis.localStorage
) {
  const id = normalizeLocalePreference(locale);
  if (!id) return false;
  try {
    storage?.setItem?.(LOCALE_PREFERENCE_STORAGE_KEY, id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ready locales for picker radios (catalog key order).
 * @returns {{ id: import('./localeRegistry.js').LocaleId, nativeLabel: string }[]}
 */
export function listPickerLocales() {
  return listReadyLocaleIds().map((id) => ({
    id,
    nativeLabel: LOCALE_CATALOG[id].nativeLabel
  }));
}

/**
 * Offer Language chrome only when switching is meaningful (≥2 ready locales).
 * v1.0.0: only `en` ready → hide menu; later flip zh/es/… to ready → row reappears.
 * @returns {boolean}
 */
export function shouldOfferLanguagePicker() {
  return listReadyLocaleIds().length >= 2;
}
