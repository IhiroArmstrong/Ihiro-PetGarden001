/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stage 2b shadow (gray → functional). Log-only: never changes the route or
 * reply. A turn counts only when Yin talked (generate / corpus) although the
 * embedding says the user asked a functional question. Live cutover is gated
 * by task-confide-stage2-semantic-cutover.md (Stage 2b section).
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

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

export const CONFIDE_STAGE2B_REASON = Object.freeze({
  GRAY_TO_FUNCTIONAL: 'gray_to_functional',
  PROTECTED_ROUTE: 'protected_route',
  LITERAL_NOT_GRAY: 'literal_not_gray',
  SEMANTIC_MISSING: 'semantic_missing',
  SEMANTIC_NOT_FUNCTIONAL: 'semantic_not_functional',
  ALREADY_HANDLED: 'already_handled'
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
 *   semanticCoarse?: string | null
 * }} [ctx]
 * @returns {{ wouldPromote: boolean, reason: string }}
 */
export function decideConfideStage2bShadow({
  route = null,
  source = null,
  literalCoarse = null,
  semanticCoarse = null
} = {}) {
  const no = (reason) => ({ wouldPromote: false, reason });
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
  return { wouldPromote: true, reason: CONFIDE_STAGE2B_REASON.GRAY_TO_FUNCTIONAL };
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
