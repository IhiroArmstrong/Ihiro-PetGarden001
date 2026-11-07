/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice Study upload gate — mirrors T54 lab query discipline.
 */

export const CO_PRACTICE_RESEARCH_INGEST_PATH =
  '/api/co-practice-research-ingest';

export const CO_PRACTICE_RESEARCH_LAB_UPLOAD_QUERY = 'coPracticeResearchUpload';

/**
 * Debug query only. Must not upload without consent.
 *
 * @param {string} [search]
 */
export function isCoPracticeResearchLabUploadQuery(search = '') {
  try {
    const q = new URLSearchParams(String(search).replace(/^\?/, ''));
    return q.get(CO_PRACTICE_RESEARCH_LAB_UPLOAD_QUERY) === '1';
  } catch {
    return false;
  }
}

/**
 * Upload only when Practice Study consent is granted and receive is configured.
 * Lab query is debug-only and must never bypass missing consent.
 *
 * @param {{
 *   consented?: boolean,
 *   receiveConfigured?: boolean,
 *   labUploadEnabled?: boolean
 * }} opts
 */
export function canUploadCoPracticeResearchPayload({
  consented = false,
  receiveConfigured = false,
  labUploadEnabled = false
} = {}) {
  void labUploadEnabled;
  return Boolean(consented) && Boolean(receiveConfigured);
}
