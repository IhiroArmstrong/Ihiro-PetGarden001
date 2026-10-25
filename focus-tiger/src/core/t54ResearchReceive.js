/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T54 stage-2 receive whitelist (stage 1 §9.2).
 * Extra fields are dropped; never stored.
 */

export const T54_RESEARCH_INGEST_PATH = '/api/t54-research-ingest';

export const T54_RESEARCH_RECEIVE_FIELDS = Object.freeze([
  'studyId',
  'arm',
  'localResearchCode',
  'enrolledAt',
  'firstEligibleSilence',
  'observationStatus',
  'returnedWithin14d',
  'daysUntilReturn',
  'satWithin6h',
  'exited'
]);

const FIELD_SET = new Set(T54_RESEARCH_RECEIVE_FIELDS);

export const T54_OBSERVATION_STATUS = Object.freeze({
  OBSERVING: 'observing',
  RETURNED: 'returned',
  NO_RETURN_14D: 'no_return_14d'
});

/**
 * @param {unknown} body
 * @returns {{
 *   accepted: Record<string, unknown>,
 *   dropped: string[],
 *   ok: boolean,
 *   reason?: string
 * }}
 */
export function pickT54ResearchReceiveFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { accepted: {}, dropped: [], ok: false, reason: 'invalid_body' };
  }
  /** @type {Record<string, unknown>} */
  const accepted = {};
  /** @type {string[]} */
  const dropped = [];
  for (const key of Object.keys(body)) {
    if (FIELD_SET.has(key)) accepted[key] = /** @type {Record<string, unknown>} */ (body)[key];
    else dropped.push(key);
  }
  return { accepted, dropped, ok: true };
}

/**
 * Lab upload may run only when research consent is granted.
 * Default (unset) is not consented — never upload, never assign arm.
 *
 * @param {{ consented?: boolean, labUploadEnabled?: boolean }} opts
 */
export function canUploadT54ResearchPayload({
  consented = false,
  labUploadEnabled = false
} = {}) {
  return Boolean(consented) && Boolean(labUploadEnabled);
}
