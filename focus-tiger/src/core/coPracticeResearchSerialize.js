/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Single serializer for consent preview JSON and weekly POST body (S4(e)).
 */

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function sortDeep(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortDeep);
  const record = /** @type {Record<string, unknown>} */ (value);
  const keys = Object.keys(record).sort();
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const key of keys) {
    out[key] = sortDeep(record[key]);
  }
  return out;
}

/**
 * @param {unknown} payload
 */
export function serializeCoPracticeResearchPayload(payload) {
  return JSON.stringify(sortDeep(payload));
}

/**
 * @param {unknown} a
 * @param {unknown} b
 */
export function coPracticeResearchPayloadEqual(a, b) {
  return serializeCoPracticeResearchPayload(a) === serializeCoPracticeResearchPayload(b);
}
