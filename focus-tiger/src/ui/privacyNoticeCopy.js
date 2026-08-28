/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * In-app Privacy sheet copy keys + guards (local-first; no iCloud promise).
 * Product SSOT narrative: docs/PRIVACY_NOTICE.md · Brief task-in-app-privacy-and-purpose-copy.
 */

/** Intro paragraph before numbered sections. */
export const PRIVACY_SHEET_INTRO_KEY = 'PRIVACY_SHEET_INTRO';

/** States that this sheet is the full in-app privacy notice. */
export const PRIVACY_SHEET_FULL_LEAD_KEY = 'PRIVACY_SHEET_FULL_LEAD';

/**
 * Numbered sections aligned with docs/PRIVACY_NOTICE.md §1–§5.
 * @type {readonly { id: string, titleKey: string, bodyKey: string, mountLocalData?: boolean }[]}
 */
export const PRIVACY_SHEET_SECTIONS = Object.freeze([
  {
    id: 'ai',
    titleKey: 'PRIVACY_SHEET_SEC_1_TITLE',
    bodyKey: 'PRIVACY_SHEET_AI_INFERENCE'
  },
  {
    id: 'storage',
    titleKey: 'PRIVACY_SHEET_SEC_2_TITLE',
    bodyKey: 'PRIVACY_SHEET_DEFAULT_STORAGE'
  },
  {
    id: 'export',
    titleKey: 'PRIVACY_SHEET_SEC_3_TITLE',
    bodyKey: 'PRIVACY_SHEET_EXPORT_IMPORT',
    mountLocalData: true
  },
  {
    id: 'cloud',
    titleKey: 'PRIVACY_SHEET_SEC_4_TITLE',
    bodyKey: 'PRIVACY_SHEET_CLOUD'
  },
  {
    id: 'rights',
    titleKey: 'PRIVACY_SHEET_SEC_5_TITLE',
    bodyKey: 'PRIVACY_SHEET_RIGHTS'
  }
]);

/** Optional consents + closing after the formal sections. */
export const PRIVACY_SHEET_TAIL_KEYS = Object.freeze([
  'PRIVACY_SHEET_NOT_DO',
  'PRIVACY_SHEET_CLOSING'
]);

/** @deprecated Use PRIVACY_SHEET_SECTIONS + tail keys */
export const PRIVACY_SHEET_BODY_KEYS = Object.freeze([
  PRIVACY_SHEET_INTRO_KEY,
  PRIVACY_SHEET_FULL_LEAD_KEY,
  ...PRIVACY_SHEET_SECTIONS.flatMap((s) => [s.titleKey, s.bodyKey]),
  ...PRIVACY_SHEET_TAIL_KEYS
]);

/** Locale keys for YPE L2 cloud personalization opt-in (Privacy sheet). */
export const PRIVACY_SHEET_YPE_OPT_IN_KEYS = Object.freeze([
  'PRIVACY_SHEET_YPE_OPT_IN_LABEL',
  'PRIVACY_SHEET_YPE_OPT_IN_HINT',
  'PRIVACY_SHEET_YPE_OPT_IN_DETAIL_TOGGLE',
  'PRIVACY_SHEET_YPE_OPT_IN_DETAIL_1',
  'PRIVACY_SHEET_YPE_OPT_IN_DETAIL_2',
  'PRIVACY_SHEET_YPE_OPT_IN_DETAIL_3',
  'PRIVACY_SHEET_YPE_OPT_IN_DETAIL_4',
  'PRIVACY_SHEET_YPE_OPT_IN_DETAIL_5'
]);

/** Forbidden substrings in YPE consent user copy (case-insensitive). */
export const YPE_CONSENT_FORBIDDEN_SUBSTRINGS = Object.freeze([
  'training',
  'train the model',
  '教模型',
  '云端大脑',
  'cloud brain',
  'anonymous',
  '匿名',
  'personality profile',
  'behavioral score',
  'ranking',
  'scoring',
  'intervention probability',
  'intervention',
  '干预'
]);

/**
 * @param {string} text
 * @returns {string[]}
 */
export function findYpeConsentForbiddenSubstrings(text) {
  const hay = String(text || '').toLowerCase();
  return YPE_CONSENT_FORBIDDEN_SUBSTRINGS.filter((needle) =>
    hay.includes(String(needle).toLowerCase())
  );
}

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
  keys = [
    ...PRIVACY_SHEET_BODY_KEYS,
    'HINT_APP_PURPOSE_BODY',
    'HINT_APP_PURPOSE_WELLNESS_TITLE',
    'HINT_APP_PURPOSE_WELLNESS_BODY',
    'HINT_APP_PURPOSE_DESKTOP_RAM_TITLE',
    'HINT_APP_PURPOSE_DESKTOP_RAM_BODY',
    'HINT_APP_PURPOSE_COLOPHON_MARK',
    'HINT_APP_PURPOSE_COLOPHON_BYLINE',
    'HINT_APP_PURPOSE_COLOPHON_COPYRIGHT',
    'PRIVACY_SHEET_WELLNESS_NOTE',
    'PRIVACY_SHEET_WELLNESS_LINK',
    'PRIVACY_SHEET_WELLNESS_LINK_ARIA',
    'PRIVACY_SHEET_TITLE'
  ]
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
