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
 * Renderer-safe env. Electron Confide UI has no Node `process`; a default
 * parameter `env = process.env` throws ReferenceError before the body runs.
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @param {object} [globals]
 * @returns {NodeJS.ProcessEnv | Record<string, never>}
 */
export function confideBrowserSafeEnv(env, globals = globalThis) {
  if (env && typeof env === 'object') return env;
  try {
    const proc = globals.process;
    if (proc && proc.env) return proc.env;
  } catch {
    /* process is not defined (Chromium renderer) */
  }
  return {};
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {'shadow' | 'live'}
 */
export function resolveConfideSemanticRoutingMode(env) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_SEMANTIC_ROUTING || 'live')
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
export function resolveConfideSemanticRoutingConfig(env) {
  const resolved = confideBrowserSafeEnv(env);
  const grayRaw = Number(resolved.FT_CONFIDE_SEMANTIC_GRAY_MARGIN);
  const topKRaw = Number(resolved.FT_CONFIDE_SEMANTIC_TOP_K);
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
