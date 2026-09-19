/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * turns.jsonl row builder for semantic shadow classify (desktop runtime only).
 * Schema kept in sync with confideSemanticCoarseMap.js unit tests.
 */

/**
 * @param {{
 *   text: string,
 *   route: string,
 *   source: string,
 *   literalCoarse: string | null,
 *   semanticResult?: {
 *     bucket: string,
 *     scoreA: number,
 *     scoreB: number,
 *     grayMargin: number
 *   } | null,
 *   ok: boolean,
 *   reason: string,
 *   timing?: { wallMs?: number, embedMs?: number },
 *   hadPriorTurn?: boolean,
 *   contextualText?: string | null,
 *   semanticResultWithPrior?: {
 *     bucket: string,
 *     scoreA: number,
 *     scoreB: number,
 *     grayMargin: number
 *   } | null
 * }} payload
 * @returns {object}
 */
export function buildSemanticShadowTurnLogRecord(payload) {
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  const contextual =
    typeof payload.contextualText === 'string' ? payload.contextualText.trim() : '';
  const withPrior = payload.semanticResultWithPrior;
  return {
    at: new Date().toISOString(),
    kind: 'semantic_shadow_classify',
    text: text.slice(0, 400),
    route: payload.route,
    source: payload.source,
    literalCoarse: payload.literalCoarse,
    semanticCoarse: payload.semanticResult?.bucket ?? null,
    scoreA: payload.semanticResult?.scoreA ?? null,
    scoreB: payload.semanticResult?.scoreB ?? null,
    grayMargin: payload.semanticResult?.grayMargin ?? null,
    hadPriorTurn: Boolean(payload.hadPriorTurn),
    contextualText: contextual ? contextual.slice(0, 400) : null,
    semanticCoarseWithPrior: withPrior?.bucket ?? null,
    scoreAWithPrior: withPrior?.scoreA ?? null,
    scoreBWithPrior: withPrior?.scoreB ?? null,
    ok: Boolean(payload.ok),
    reason: payload.reason,
    timing: payload.timing || undefined
  };
}
