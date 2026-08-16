/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Locale catalog · SSOT for which languages exist and which may appear in the picker.
 * Policy: show only `ready` locales (审完再露). Draft slots may keep dictionaries in-repo.
 *
 * v1.0.0 ship claim = English + Japanese (对外). zh/es/de/fr stay draft until claimed.
 * Engineering keeps N-locale slots + Language UI.
 *
 * @see docs/COVERAGE_GAP_AUDIT.md §9.6
 */

/** @typedef {'ready' | 'draft'} LocaleStatus */
/** @typedef {'en' | 'zh' | 'es' | 'ja' | 'de' | 'fr'} LocaleId */

/**
 * @typedef {object} LocaleCatalogEntry
 * @property {LocaleStatus} status
 * @property {string} nativeLabel  Shown in the picker (not via t() — findable in any UI language)
 */

/** @type {Readonly<Record<LocaleId, LocaleCatalogEntry>>} */
export const LOCALE_CATALOG = Object.freeze({
  en: { status: 'ready', nativeLabel: 'English' },
  zh: { status: 'draft', nativeLabel: '中文' },
  es: { status: 'draft', nativeLabel: 'Español' },
  ja: { status: 'ready', nativeLabel: '日本語' },
  de: { status: 'draft', nativeLabel: 'Deutsch' },
  fr: { status: 'draft', nativeLabel: 'Français' }
});

/** Default product locale (overseas). */
export const DEFAULT_LOCALE = /** @type {LocaleId} */ ('en');

/**
 * @returns {LocaleId[]}
 */
export function listReadyLocaleIds() {
  return /** @type {LocaleId[]} */ (
    Object.keys(LOCALE_CATALOG).filter(
      (id) => LOCALE_CATALOG[/** @type {LocaleId} */ (id)].status === 'ready'
    )
  );
}

/**
 * @param {string} locale
 * @returns {locale is LocaleId}
 */
export function isKnownLocaleId(locale) {
  return Object.prototype.hasOwnProperty.call(LOCALE_CATALOG, locale);
}

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function isReadyLocale(locale) {
  return isKnownLocaleId(locale) && LOCALE_CATALOG[locale].status === 'ready';
}
