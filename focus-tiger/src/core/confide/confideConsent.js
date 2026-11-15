/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * First-use Chat with Yin clickwrap — local only. Not practice-backup export.
 */

import { hashConfidePrivateText } from './confidePrivacy.js';
import consentSlice from '../../locales/slices/confide-consent.json' with { type: 'json' };

export const CONFIDE_CONSENT_STORAGE_KEY = 'focus-tiger.confide-consent.v1';
export const CONFIDE_CONSENT_VERSION = 'confide_consent_v1';
export const CONFIDE_CONSENT_REQUIRED = 'CONSENT_REQUIRED';
export const CONFIDE_CONSENT_INCOMPLETE = 'CONSENT_INCOMPLETE';

const CONSENT_COPY_KEYS = Object.freeze([
  'CONFIDE_CONSENT_ITEM1',
  'CONFIDE_CONSENT_ITEM2',
  'CONFIDE_CONSENT_AGE'
]);

/**
 * @param {unknown} storage
 * @returns {Storage | null}
 */
function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {string} [locale]
 * @returns {'en' | 'zh' | 'ja'}
 */
export function resolveConfideConsentLocale(locale) {
  const id = String(locale || 'en').toLowerCase();
  if (id.startsWith('zh')) return 'zh';
  if (id.startsWith('ja')) return 'ja';
  return 'en';
}

/**
 * Canonical displayed statements for a locale + version (not DOM text).
 * @param {string} [locale]
 * @param {string} [version]
 */
export function canonicalConfideConsentText(
  locale,
  version = CONFIDE_CONSENT_VERSION
) {
  const loc = resolveConfideConsentLocale(locale);
  const pack = consentSlice[loc] || consentSlice.en;
  return [version, loc, ...CONSENT_COPY_KEYS.map((key) => pack[key] || '')].join(
    '\n'
  );
}

/**
 * @param {string} [locale]
 * @param {string} [version]
 */
export function hashCanonicalConfideConsentText(locale, version) {
  return hashConfidePrivateText(canonicalConfideConsentText(locale, version));
}

/**
 * @param {unknown} raw
 */
export function normalizeConfideConsent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    consentVersion:
      typeof o.consentVersion === 'string' && o.consentVersion
        ? o.consentVersion
        : '',
    item1Accepted: o.item1Accepted === true,
    item2Accepted: o.item2Accepted === true,
    ageConfirmed: o.ageConfirmed === true,
    locale: resolveConfideConsentLocale(
      typeof o.locale === 'string' ? o.locale : 'en'
    ),
    textHash: typeof o.textHash === 'string' ? o.textHash : '',
    appVersion: typeof o.appVersion === 'string' ? o.appVersion : '',
    platform: typeof o.platform === 'string' ? o.platform : '',
    acceptedAt:
      typeof o.acceptedAt === 'string' && o.acceptedAt ? o.acceptedAt : null,
    revokedAt:
      typeof o.revokedAt === 'string' && o.revokedAt ? o.revokedAt : null
  };
}

/**
 * @param {unknown} [storage]
 */
export function readConfideConsent(storage) {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(CONFIDE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return normalizeConfideConsent(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * @param {unknown} [storage]
 * @param {string} [version]
 */
export function hasValidConfideConsent(
  storage,
  version = CONFIDE_CONSENT_VERSION
) {
  const row = readConfideConsent(storage);
  return Boolean(
    row &&
      row.consentVersion === version &&
      row.item1Accepted &&
      row.item2Accepted &&
      row.ageConfirmed &&
      !row.revokedAt
  );
}

/**
 * @param {{
 *   item1?: boolean,
 *   item2?: boolean,
 *   age?: boolean,
 *   locale?: string,
 *   appVersion?: string,
 *   platform?: string,
 *   now?: Date,
 *   storage?: unknown
 * }} [opts]
 */
export function recordConfideConsent(opts = {}) {
  const item1 = opts.item1 === true;
  const item2 = opts.item2 === true;
  const age = opts.age === true;
  if (!item1 || !item2 || !age) {
    return { ok: false, code: CONFIDE_CONSENT_INCOMPLETE };
  }
  const store = resolveStorage(opts.storage);
  if (!store) {
    return { ok: false, code: 'CONSENT_SAVE_FAILED' };
  }
  const locale = resolveConfideConsentLocale(opts.locale);
  const now = opts.now instanceof Date ? opts.now : new Date();
  const row = {
    consentVersion: CONFIDE_CONSENT_VERSION,
    item1Accepted: true,
    item2Accepted: true,
    ageConfirmed: true,
    locale,
    textHash: hashCanonicalConfideConsentText(locale),
    appVersion: typeof opts.appVersion === 'string' ? opts.appVersion : '',
    platform: typeof opts.platform === 'string' ? opts.platform : '',
    acceptedAt: now.toISOString(),
    revokedAt: null
  };
  try {
    store.setItem(CONFIDE_CONSENT_STORAGE_KEY, JSON.stringify(row));
  } catch {
    return { ok: false, code: 'CONSENT_SAVE_FAILED' };
  }
  return { ok: true, record: row };
}

/**
 * @param {unknown} [storage]
 */
export function revokeConfideConsent(storage) {
  const store = resolveStorage(storage);
  const row = readConfideConsent(store);
  if (!store || !row) return { ok: true };
  try {
    store.setItem(
      CONFIDE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        ...row,
        revokedAt: new Date().toISOString()
      })
    );
  } catch {
    return { ok: false, code: 'CONSENT_SAVE_FAILED' };
  }
  return { ok: true };
}

/**
 * @param {unknown} [storage]
 * @param {string} [version]
 */
export function requireConfideConsent(
  storage,
  version = CONFIDE_CONSENT_VERSION
) {
  if (hasValidConfideConsent(storage, version)) return { ok: true };
  return { ok: false, code: CONFIDE_CONSENT_REQUIRED };
}
