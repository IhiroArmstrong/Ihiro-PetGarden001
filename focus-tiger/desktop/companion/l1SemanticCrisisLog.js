/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Packaged companion runtime cannot import renderer src/.
 * Keep numbers in sync with confideSemanticCrisisLayer.js.
 */

export const CONFIDE_SEMANTIC_CRISIS_KIND = 'semantic_crisis_layer';
export const DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE = 0.78;

function hashConfidePrivateText(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function scoreBucket(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 'lt_60';
  if (n >= 0.9) return 'ge_90';
  if (n >= 0.8) return 'ge_80';
  if (n >= 0.7) return 'ge_70';
  if (n >= 0.6) return 'ge_60';
  return 'lt_60';
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {'live' | 'shadow' | 'off'}
 */
export function resolveConfideSemanticCrisisMode(env) {
  const raw = String(env?.FT_CONFIDE_SEMANTIC_CRISIS || 'live')
    .trim()
    .toLowerCase();
  if (raw === 'off' || raw === '0' || raw === 'false') return 'off';
  if (raw === 'shadow') return 'shadow';
  return 'live';
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {number}
 */
export function resolveConfideSemanticCrisisCosine(env) {
  const raw = Number(env?.FT_CONFIDE_SEMANTIC_CRISIS_COSINE);
  if (Number.isFinite(raw) && raw > 0.5 && raw < 0.99) return raw;
  return DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE;
}

/**
 * @param {{
 *   text: string,
 *   protoId?: string | null,
 *   score?: number,
 *   applied?: boolean,
 *   wouldApply?: boolean,
 *   mode?: string,
 *   reason?: string
 * }} payload
 */
export function buildSemanticCrisisTurnLog({
  text,
  protoId = null,
  score = 0,
  applied = false,
  wouldApply = false,
  mode = 'live',
  reason = 'ok'
}) {
  return {
    at: new Date().toISOString(),
    kind: CONFIDE_SEMANTIC_CRISIS_KIND,
    queryHash: hashConfidePrivateText(text),
    textLength: String(text || '').length,
    protoId: typeof protoId === 'string' ? protoId : null,
    scoreBucket: scoreBucket(score),
    applied: Boolean(applied),
    wouldApply: Boolean(wouldApply),
    mode,
    reason
  };
}
