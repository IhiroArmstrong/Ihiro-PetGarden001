/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Stage 2 live coarse override. Safety / aggression never move.
 * Only production change: semantic functional + literal emotion → fallback
 * so practice_facts / hybrid / honesty can run. Emotional gray still generates
 * (observe wing). Embed not-ready / failure keeps the literal route; live
 * must not wait for cold load.
 */

import {
  CONFIDE_EMOTION_BUCKETS,
  CONFIDE_ROUTE
} from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_ROUTING_MODE,
  resolveConfideSemanticRoutingMode
} from './confideSemanticRoutingConfig.js';

export const CONFIDE_STAGE2_OVERRIDE = Object.freeze({
  EMOTION_FALSE_POSITIVE: 'emotion_false_positive'
});

/**
 * Live classify may run only when the embedding gate is already ready.
 * unknown / loading / error → fail-open to the literal route (no wait).
 * @param {string | null | undefined} gateState
 * @returns {boolean}
 */
export function shouldAwaitConfideSemanticLiveClassify(gateState) {
  return gateState === 'ready';
}

/**
 * @param {{
 *   literalRoute?: string | null,
 *   semanticCoarse?: string | null,
 *   mode?: string | null,
 *   env?: NodeJS.ProcessEnv
 * }} [opts]
 * @returns {{ route: string | null, override: string | null }}
 */
export function applyConfideStage2Route({
  literalRoute = null,
  semanticCoarse = null,
  mode = null,
  env = process.env
} = {}) {
  const route = typeof literalRoute === 'string' ? literalRoute : null;
  const resolvedMode =
    mode === CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW ||
    mode === CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
      ? mode
      : resolveConfideSemanticRoutingMode(env);

  if (!route) return { route: null, override: null };
  if (resolvedMode !== CONFIDE_SEMANTIC_ROUTING_MODE.LIVE) {
    return { route, override: null };
  }
  if (
    route === CONFIDE_ROUTE.SAFETY_REDIRECT ||
    route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  ) {
    return { route, override: null };
  }
  if (
    semanticCoarse === CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL &&
    CONFIDE_EMOTION_BUCKETS.includes(route)
  ) {
    return {
      route: CONFIDE_ROUTE.FALLBACK,
      override: CONFIDE_STAGE2_OVERRIDE.EMOTION_FALSE_POSITIVE
    };
  }
  return { route, override: null };
}
