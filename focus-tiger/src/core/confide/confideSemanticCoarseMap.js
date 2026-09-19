/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Map existing Confide routing outcomes to coarse buckets for shadow comparison.
 * Does not alter production routing.
 */

import {
  CONFIDE_EMOTION_BUCKETS,
  CONFIDE_ROUTE
} from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

/** @type {ReadonlySet<string>} */
const FUNCTIONAL_REPLY_SOURCES = Object.freeze(
  new Set([
    'practice_facts',
    'presence_facts',
    'memory_list',
    'reflective_honesty'
  ])
);

/**
 * @param {{ route?: string | null, source?: string | null }} ctx
 * @returns {string | null}
 */
export function resolveConfideLiteralCoarseBucket({ route = null, source = null } = {}) {
  const routeId = typeof route === 'string' ? route : '';
  const sourceId = typeof source === 'string' ? source : '';

  if (
    routeId === CONFIDE_ROUTE.SAFETY_REDIRECT ||
    routeId === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  ) {
    return null;
  }

  if (FUNCTIONAL_REPLY_SOURCES.has(sourceId)) {
    return CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL;
  }

  if (CONFIDE_EMOTION_BUCKETS.includes(routeId)) {
    return CONFIDE_SEMANTIC_BUCKET.EMOTIONAL;
  }

  return CONFIDE_SEMANTIC_BUCKET.GRAY;
}

/**
 * @param {{ route?: string | null }} ctx
 * @returns {boolean}
 */
export function shouldRunConfideSemanticShadow({ route = null } = {}) {
  const routeId = typeof route === 'string' ? route : '';
  if (!routeId) return false;
  if (routeId === CONFIDE_ROUTE.SAFETY_REDIRECT) return false;
  if (routeId === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) return false;
  return true;
}

/**
 * Build a turns.jsonl row for semantic shadow logging.
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
 *   timing?: { wallMs?: number, embedMs?: number }
 * }} payload
 * @returns {object}
 */
export function buildConfideSemanticShadowLogRecord(payload) {
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
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
    ok: Boolean(payload.ok),
    reason: payload.reason,
    timing: payload.timing || undefined
  };
}
