/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Tunable parameters for Confide semantic coarse routing (Stage 1 shadow).
 */

export const DEFAULT_CONFIDE_SEMANTIC_GRAY_MARGIN = 0.08;
export const DEFAULT_CONFIDE_SEMANTIC_TOP_K = 3;

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ grayMargin: number, topK: number }}
 */
export function resolveConfideSemanticRoutingConfig(env = process.env) {
  const grayRaw = Number(env.FT_CONFIDE_SEMANTIC_GRAY_MARGIN);
  const topKRaw = Number(env.FT_CONFIDE_SEMANTIC_TOP_K);
  return {
    grayMargin:
      Number.isFinite(grayRaw) && grayRaw > 0 && grayRaw < 1
        ? grayRaw
        : DEFAULT_CONFIDE_SEMANTIC_GRAY_MARGIN,
    topK:
      Number.isFinite(topKRaw) && topKRaw >= 1 && topKRaw <= 20
        ? Math.floor(topKRaw)
        : DEFAULT_CONFIDE_SEMANTIC_TOP_K
  };
}
