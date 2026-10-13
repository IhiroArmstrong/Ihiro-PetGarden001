/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Renderer may only ask Electron to append these turns.jsonl kinds.
 * Semantic shadow/live already write from the main process.
 * Kind strings must stay in this file so packaged companion JS does not import src/.
 */

export const CONFIDE_RENDERER_TURN_LOG_KINDS = Object.freeze([
  'kb_retrieval_miss',
  'crisis_paraphrase_shadow',
  'kb_catalog_near_review_shadow'
]);

const DROP_KEYS = Object.freeze(['text', 'raw', 'reply', 'prompt', 'contextualText']);

/**
 * @param {unknown} record
 * @returns {{ ok: true, record: object } | { ok: false, reason: string }}
 */
export function sanitizeRendererTurnLogRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { ok: false, reason: 'invalid_record' };
  }
  const kind = record.kind;
  if (typeof kind !== 'string' || !CONFIDE_RENDERER_TURN_LOG_KINDS.includes(kind)) {
    return { ok: false, reason: 'rejected_kind' };
  }
  /** @type {Record<string, string | number | boolean | null>} */
  const out = { kind };
  for (const [key, value] of Object.entries(record)) {
    if (key === 'kind') continue;
    if (DROP_KEYS.includes(key)) continue;
    if (value === undefined) continue;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      out[key] = value;
    }
  }
  return { ok: true, record: out };
}
