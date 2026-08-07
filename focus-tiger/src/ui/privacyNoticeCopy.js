/**
 * In-app Privacy sheet copy keys + guards (local-first; no iCloud promise).
 * Product SSOT narrative: docs/PRIVACY_NOTICE.md · Brief task-in-app-privacy-and-purpose-copy.
 */

/** Locale keys rendered as paragraphs in `#onboarding-privacy-sheet`. */
export const PRIVACY_SHEET_BODY_KEYS = Object.freeze([
  'PRIVACY_SHEET_INTRO',
  'PRIVACY_SHEET_ON_DEVICE',
  'PRIVACY_SHEET_NOT_DO',
  'PRIVACY_SHEET_CLOUD',
  'PRIVACY_SHEET_CLOSING'
]);

/**
 * Forbidden substrings in in-app privacy / purpose strings (case-insensitive).
 * iCloud must not appear as a product promise in v1.
 * @param {string} text
 * @returns {boolean}
 */
export function privacyCopyMentionsForbiddenCloudBrand(text) {
  return /\bicloud\b/i.test(String(text || ''));
}

/**
 * @param {Record<string, string>} localeMap en/ja (or zh draft) flat dict
 * @param {string[]} keys
 * @returns {string[]} offending keys
 */
export function findPrivacyKeysWithForbiddenCloudBrand(
  localeMap,
  keys = [...PRIVACY_SHEET_BODY_KEYS, 'HINT_APP_PURPOSE_BODY', 'PRIVACY_SHEET_TITLE']
) {
  const bad = [];
  for (const key of keys) {
    const v = localeMap?.[key];
    if (typeof v === 'string' && privacyCopyMentionsForbiddenCloudBrand(v)) {
      bad.push(key);
    }
  }
  return bad;
}
