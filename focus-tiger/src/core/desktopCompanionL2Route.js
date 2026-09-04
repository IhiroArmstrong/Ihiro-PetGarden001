/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L2 Confide layer-3 gate (pure). Llama stays in desktop/; this file only
 * decides whether Share may call companion.generate.
 * Product call sites go through `ypeMayUseCompanionGenerate` (YPE L0 wrap).
 *
 * Layers:
 *   0 safety_redirect → never generate
 *   0b aggression_toward_others → corpus retrieve, never generate (not crisis line)
 *   1 product rituals (Whisper / Recover / …) → never call this helper
 *   2 emotion buckets → corpus retrieve, never generate
 *   2b CI whitelist / memory_suppress / boundary / companion presence / preference honesty → templates, never generate
 *   3 fallback + desktop ready → short generate; fail → corpus fallback
 */

import {
  CONFIDE_EMOTION_BUCKETS,
  CONFIDE_ROUTE
} from './confide/confideRoutes.js';

/**
 * @param {{
 *   route?: string | null,
 *   generateEnabled?: boolean,
 *   generateLayerOpen?: boolean,
 *   hasGenerateFn?: boolean
 * }} [opts]
 * @returns {boolean}
 */
export function shouldUseDesktopCompanionGenerate({
  route = null,
  generateEnabled = false,
  generateLayerOpen = false,
  hasGenerateFn = false
} = {}) {
  if (!generateEnabled || !generateLayerOpen || !hasGenerateFn) return false;
  if (!route || route === CONFIDE_ROUTE.SAFETY_REDIRECT) return false;
  if (route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) return false;
  if (CONFIDE_EMOTION_BUCKETS.includes(route)) return false;
  return route === CONFIDE_ROUTE.FALLBACK;
}

/**
 * Snapshot overlay: generate is allowed only when the hold is ready and idle.
 * @param {{ phase?: string, focusing?: boolean } | null | undefined} status
 * @param {boolean} allowed
 * @returns {boolean}
 */
export function companionGenerateEnabled(status, allowed) {
  return Boolean(allowed) && status?.phase === 'ready' && !status?.focusing;
}
