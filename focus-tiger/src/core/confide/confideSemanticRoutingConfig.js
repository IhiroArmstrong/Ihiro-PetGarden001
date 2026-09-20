/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Tunable parameters for Confide semantic coarse routing.
 * Mode: live = Stage 2 production override; shadow = Stage 1 log-only.
 */

export const DEFAULT_CONFIDE_SEMANTIC_GRAY_MARGIN = 0.08;
export const DEFAULT_CONFIDE_SEMANTIC_TOP_K = 3;

export const CONFIDE_SEMANTIC_ROUTING_MODE = Object.freeze({
  SHADOW: 'shadow',
  LIVE: 'live'
});

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {'shadow' | 'live'}
 */
export function resolveConfideSemanticRoutingMode(env = process.env) {
  const raw = String(env.FT_CONFIDE_SEMANTIC_ROUTING || 'live')
    .trim()
    .toLowerCase();
  if (raw === 'shadow' || raw === 'off' || raw === 'stage1') {
    return CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW;
  }
  return CONFIDE_SEMANTIC_ROUTING_MODE.LIVE;
}

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
