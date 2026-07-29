/**
 * Locale catalog · SSOT for which languages exist and which may appear in the picker.
 * Policy: show only `ready` locales (审完再露). Draft slots may exist without dictionaries.
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
  zh: { status: 'ready', nativeLabel: '中文' },
  es: { status: 'draft', nativeLabel: 'Español' },
  ja: { status: 'draft', nativeLabel: '日本語' },
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
