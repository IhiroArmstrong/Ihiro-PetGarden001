/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * turns.jsonl row for the KB product gate (mood veto stage one, shadow only).
 * Brief: task-confide-kb-gate-mood-veto.md. Never changes the gate action.
 * Strings and hash stay in this file so packaged companion JS does not import src/.
 * Hash must agree with src/core/confide/confidePrivacy.js (sync test).
 */

export const KB_PRODUCT_GATE_SHADOW_KIND = 'kb_product_gate_shadow';

/**
 * @param {string} value
 * @returns {string}
 */
export function hashKbGateShadowText(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function finiteOrNull(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Carries no user free text (same rule as kb_retrieval_miss · Issue #1037).
 * @param {{
 *   text: string,
 *   result: {
 *     isProduct?: boolean,
 *     score?: number,
 *     minScore?: number,
 *     lifeScore?: number | null,
 *     lifeOutranksProduct?: boolean,
 *     moodScore?: number | null,
 *     moodOutranksProduct?: boolean,
 *     nearestId?: string | null,
 *     nearestScore?: number | null,
 *     embedMs?: number
 *   },
 *   timing?: { wallMs?: number }
 * }} payload
 * @returns {object}
 */
export function buildKbProductGateShadowTurnLogRecord({ text, result, timing }) {
  const raw = typeof text === 'string' ? text.trim() : '';
  const moodScore = finiteOrNull(result.moodScore);
  return {
    at: new Date().toISOString(),
    kind: KB_PRODUCT_GATE_SHADOW_KIND,
    queryHash: hashKbGateShadowText(raw),
    textLength: raw.length,
    isProduct: Boolean(result.isProduct),
    score: finiteOrNull(result.score),
    minScore: finiteOrNull(result.minScore),
    lifeScore: finiteOrNull(result.lifeScore),
    lifeOutranksProduct: Boolean(result.lifeOutranksProduct),
    kbMoodScore: moodScore,
    kbMoodOutranks: moodScore === null ? null : Boolean(result.moodOutranksProduct),
    nearestId: typeof result.nearestId === 'string' ? result.nearestId : null,
    nearestScore: finiteOrNull(result.nearestScore),
    timing: {
      wallMs: finiteOrNull(timing?.wallMs),
      embedMs: finiteOrNull(result.embedMs)
    }
  };
}
