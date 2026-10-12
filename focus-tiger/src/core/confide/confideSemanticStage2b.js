/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stage 2b (gray → functional). Shadow logs wouldPromote; live apply is gated
 * by FT_CONFIDE_STAGE2B_ROUTING=live plus the master semantic rope.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import { evaluateConfideStage2bTextConstraints } from './confideStage2bTextConstraints.js';
import {
  CONFIDE_SEMANTIC_ROUTING_MODE,
  CONFIDE_STAGE2B_ROUTING_MODE,
  confideBrowserSafeEnv,
  resolveConfideSemanticRoutingMode,
  resolveConfideStage2bRoutingMode
} from './confideSemanticRoutingConfig.js';

export const CONFIDE_STAGE2B_SEED_SOURCE = Object.freeze({
  LAB_SEEDED: 'lab_seeded',
  /** Legacy alias. New rows write `lab_seeded`; audit still counts both. */
  PO_SEEDED: 'po_seeded',
  NATURAL: 'natural'
});

/**
 * Lab / seeded rows as opposed to natural chat. `po_seeded` is a legacy alias.
 * @param {unknown} source
 * @returns {boolean}
 */
export function isConfideStage2bLabSeeded(source) {
  return (
    source === CONFIDE_STAGE2B_SEED_SOURCE.LAB_SEEDED ||
    source === CONFIDE_STAGE2B_SEED_SOURCE.PO_SEEDED
  );
}

export const CONFIDE_STAGE2B_OVERRIDE = Object.freeze({
  GRAY_TO_FUNCTIONAL: 'gray_to_functional'
});

export const CONFIDE_STAGE2B_REASON = Object.freeze({
  GRAY_TO_FUNCTIONAL: 'gray_to_functional',
  PROTECTED_ROUTE: 'protected_route',
  LITERAL_NOT_GRAY: 'literal_not_gray',
  SEMANTIC_MISSING: 'semantic_missing',
  SEMANTIC_NOT_FUNCTIONAL: 'semantic_not_functional',
  ALREADY_HANDLED: 'already_handled',
  PAST_RECALL_WITHOUT_FUNCTION_WORD: 'past_recall_without_function_word',
  NEGATIVE_CONTROL: 'negative_control',
  ROUTING_OFF: 'routing_off'
});

/** Reply sources where Yin talked instead of answering. */
const STAGE2B_PROMOTABLE_SOURCES = Object.freeze(new Set(['generate', 'corpus']));

/**
 * Only the Electron main process may mark a session as lab-seeded.
 * `FT_CONFIDE_SEED_SOURCE=po_seeded` is a legacy alias and writes `lab_seeded`.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined> | null | undefined} env
 * @returns {string}
 */
export function resolveConfideStage2bSeedSource(env) {
  const raw = String(env?.FT_CONFIDE_SEED_SOURCE || '')
    .trim()
    .toLowerCase();
  return isConfideStage2bLabSeeded(raw)
    ? CONFIDE_STAGE2B_SEED_SOURCE.LAB_SEEDED
    : CONFIDE_STAGE2B_SEED_SOURCE.NATURAL;
}

/**
 * @param {{
 *   route?: string | null,
 *   source?: string | null,
 *   literalCoarse?: string | null,
 *   semanticCoarse?: string | null,
 *   text?: string | null,
 *   stage2bMode?: string | null
 * }} [ctx]
 * @returns {{ wouldPromote: boolean, reason: string }}
 */
export function decideConfideStage2bShadow({
  route = null,
  source = null,
  literalCoarse = null,
  semanticCoarse = null,
  text = null,
  stage2bMode = null
} = {}) {
  const no = (reason) => ({ wouldPromote: false, reason });
  if (stage2bMode === CONFIDE_STAGE2B_ROUTING_MODE.OFF) {
    return no(CONFIDE_STAGE2B_REASON.ROUTING_OFF);
  }
  if (
    route === CONFIDE_ROUTE.SAFETY_REDIRECT ||
    route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  ) {
    return no(CONFIDE_STAGE2B_REASON.PROTECTED_ROUTE);
  }
  if (literalCoarse !== CONFIDE_SEMANTIC_BUCKET.GRAY) {
    return no(CONFIDE_STAGE2B_REASON.LITERAL_NOT_GRAY);
  }
  if (typeof semanticCoarse !== 'string' || !semanticCoarse) {
    return no(CONFIDE_STAGE2B_REASON.SEMANTIC_MISSING);
  }
  if (semanticCoarse !== CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL) {
    return no(CONFIDE_STAGE2B_REASON.SEMANTIC_NOT_FUNCTIONAL);
  }
  if (!STAGE2B_PROMOTABLE_SOURCES.has(String(source || ''))) {
    return no(CONFIDE_STAGE2B_REASON.ALREADY_HANDLED);
  }
  const gated = evaluateConfideStage2bTextConstraints(text);
  if (!gated.ok) return no(gated.reason);
  return { wouldPromote: true, reason: CONFIDE_STAGE2B_REASON.GRAY_TO_FUNCTIONAL };
}

/**
 * Live gray→functional. Default env is shadow: does not change the reply.
 * Master rope FT_CONFIDE_SEMANTIC_ROUTING=shadow also blocks Stage 2b live.
 * @param {{
 *   text?: string | null,
 *   route?: string | null,
 *   source?: string | null,
 *   literalCoarse?: string | null,
 *   semanticCoarse?: string | null,
 *   semanticMode?: string | null,
 *   stage2bMode?: string | null,
 *   env?: NodeJS.ProcessEnv
 * }} [opts]
 * @returns {{
 *   route: string | null,
 *   promote: boolean,
 *   override: string | null,
 *   reason: string
 * }}
 */
export function applyConfideStage2bLive({
  text = null,
  route = null,
  source = 'generate',
  literalCoarse = null,
  semanticCoarse = null,
  semanticMode = null,
  stage2bMode = null,
  env
} = {}) {
  const safeEnv = confideBrowserSafeEnv(env);
  const resolvedSemantic =
    semanticMode === CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW ||
    semanticMode === CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
      ? semanticMode
      : resolveConfideSemanticRoutingMode(safeEnv);
  const resolved2b =
    stage2bMode === CONFIDE_STAGE2B_ROUTING_MODE.LIVE ||
    stage2bMode === CONFIDE_STAGE2B_ROUTING_MODE.SHADOW ||
    stage2bMode === CONFIDE_STAGE2B_ROUTING_MODE.OFF
      ? stage2bMode
      : resolveConfideStage2bRoutingMode(safeEnv);
  const decided = decideConfideStage2bShadow({
    route,
    source,
    literalCoarse,
    semanticCoarse,
    text,
    stage2bMode: resolved2b
  });
  if (resolvedSemantic !== CONFIDE_SEMANTIC_ROUTING_MODE.LIVE) {
    return { route, promote: false, override: null, reason: decided.reason };
  }
  if (resolved2b !== CONFIDE_STAGE2B_ROUTING_MODE.LIVE || !decided.wouldPromote) {
    return { route, promote: false, override: null, reason: decided.reason };
  }
  return {
    route,
    promote: true,
    override: CONFIDE_STAGE2B_OVERRIDE.GRAY_TO_FUNCTIONAL,
    reason: decided.reason
  };
}

/**
 * Extra fields for semantic_shadow_classify rows.
 * @param {{
 *   route?: string | null,
 *   source?: string | null,
 *   literalCoarse?: string | null,
 *   semanticCoarse?: string | null,
 *   seedSource?: string | null
 * }} ctx
 * @returns {{ stage2bWouldPromote: boolean, stage2bReason: string, seedSource: string }}
 */
export function buildConfideStage2bShadowFields(ctx) {
  const decided = decideConfideStage2bShadow(ctx);
  return {
    stage2bWouldPromote: decided.wouldPromote,
    stage2bReason: decided.reason,
    seedSource: isConfideStage2bLabSeeded(ctx?.seedSource)
      ? CONFIDE_STAGE2B_SEED_SOURCE.LAB_SEEDED
      : CONFIDE_STAGE2B_SEED_SOURCE.NATURAL
  };
}
