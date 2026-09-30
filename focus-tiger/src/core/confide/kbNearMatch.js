/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One similarity ruler for the product-knowledge gate and the catalog entry.
 * Brief: task-confide-kb-embedding-near-match.md
 * Close enough → that entry. Far from every entry → generate.
 * In between → labeled honesty. The product gate keeps that label only when
 * Library C says it is a product question; life chat in this band generates.
 */

/**
 * Calibrated 2026-09-30 on per-phrase cosine.
 * 0.80 sits above the wrong-neighbor scores (结束练习 → 0033 at 0.79,
 * 放弃冥想 → EDU-0003 at 0.69) and still reaches Journey log / What Yin remembers.
 * Override with FT_CONFIDE_KB_NEAR_HIT_MIN.
 */
export const DEFAULT_KB_NEAR_HIT_MIN = 0.8;

/** Unused by the live path. Live miss still uses the existing product gate. */
export const DEFAULT_KB_NEAR_FAR_MAX = 0.62;

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ hitMin: number, farMax: number }}
 */
export function resolveKbNearMatchThresholds(env = {}) {
  const hitRaw = Number(env.FT_CONFIDE_KB_NEAR_HIT_MIN);
  const farRaw = Number(env.FT_CONFIDE_KB_NEAR_FAR_MAX);
  const hitMin =
    Number.isFinite(hitRaw) && hitRaw > 0.2 && hitRaw < 0.98
      ? hitRaw
      : DEFAULT_KB_NEAR_HIT_MIN;
  let farMax =
    Number.isFinite(farRaw) && farRaw > 0.2 && farRaw < 0.98
      ? farRaw
      : DEFAULT_KB_NEAR_FAR_MAX;
  if (farMax >= hitMin) farMax = hitMin - 0.01;
  return { hitMin, farMax };
}

/**
 * @param {{ keywords?: readonly string[] }} entry
 * @returns {string}
 */
export function catalogEntryEmbeddingText(entry) {
  const parts = Array.isArray(entry?.keywords)
    ? entry.keywords.map((kw) => String(kw || '').trim()).filter(Boolean)
    : [];
  return parts.join('\n');
}

/**
 * @param {{
 *   nearestScore?: number | null,
 *   nearestId?: string | null,
 *   hitMin?: number,
 *   farMax?: number
 * }} row
 * @returns {{ action: 'hit' | 'honesty' | 'skip', id: string | null, score: number | null }}
 */
export function decideKbNearMatch(row) {
  const score = Number(row.nearestScore);
  const id = typeof row.nearestId === 'string' ? row.nearestId : '';
  const { hitMin, farMax } = resolveKbNearMatchThresholds({
    FT_CONFIDE_KB_NEAR_HIT_MIN: row.hitMin,
    FT_CONFIDE_KB_NEAR_FAR_MAX: row.farMax
  });
  if (!id || !Number.isFinite(score)) {
    return { action: 'skip', id: null, score: null };
  }
  if (score >= hitMin) return { action: 'hit', id, score };
  if (score >= farMax) return { action: 'honesty', id: null, score };
  return { action: 'skip', id: null, score };
}
