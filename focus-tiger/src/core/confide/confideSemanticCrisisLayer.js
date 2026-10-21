/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide semantic crisis layer (CR-44 · S1).
 * Runs only after the literal safety / aggression classifiers miss.
 * Embedding not ready / Japanese / Web·narrow → keep the literal route.
 */

import { hashConfidePrivateText } from './confidePrivacy.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { cosineSimilarity } from './confideSemanticRouting.js';
import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { CONFIDE_SEMANTIC_CRISIS_PROTOTYPES } from './confideSemanticCrisisExamples.js';
import {
  RHETORICAL_CRISIS_CONFIRM,
  confirmRhetoricalCrisisUse
} from './confideRhetoricalCrisisConfirm.js';

export const CONFIDE_SEMANTIC_CRISIS_KIND = 'semantic_crisis_layer';

export const CONFIDE_SEMANTIC_CRISIS_MODE = Object.freeze({
  LIVE: 'live',
  SHADOW: 'shadow',
  OFF: 'off'
});

export const CONFIDE_SEMANTIC_CRISIS_OVERRIDE = 'semantic_crisis';

/**
 * Recall-oriented cosine vs the human-reviewed bank.
 * Locked in the implementation PR from step-1 miss distribution; override
 * with FT_CONFIDE_SEMANTIC_CRISIS_COSINE. Do not lower it just to pass.
 */
export const DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE = 0.78;

/**
 * @param {string} text
 * @returns {boolean}
 */
export function looksLikeJapaneseConfideText(text) {
  return /[\u3040-\u30ff]/.test(String(text || ''));
}

/**
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {'live' | 'shadow' | 'off'}
 */
export function resolveConfideSemanticCrisisMode(env) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_SEMANTIC_CRISIS || 'live')
    .trim()
    .toLowerCase();
  if (raw === 'off' || raw === '0' || raw === 'false') {
    return CONFIDE_SEMANTIC_CRISIS_MODE.OFF;
  }
  if (raw === 'shadow') return CONFIDE_SEMANTIC_CRISIS_MODE.SHADOW;
  return CONFIDE_SEMANTIC_CRISIS_MODE.LIVE;
}

/**
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {number}
 */
export function resolveConfideSemanticCrisisCosine(env) {
  const raw = Number(confideBrowserSafeEnv(env).FT_CONFIDE_SEMANTIC_CRISIS_COSINE);
  if (Number.isFinite(raw) && raw > 0.5 && raw < 0.99) return raw;
  return DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE;
}

/**
 * @param {number} score
 * @returns {string}
 */
export function semanticCrisisScoreBucket(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 'lt_60';
  if (n >= 0.9) return 'ge_90';
  if (n >= 0.8) return 'ge_80';
  if (n >= 0.7) return 'ge_70';
  if (n >= 0.6) return 'ge_60';
  return 'lt_60';
}

/**
 * @param {{
 *   literalRoute?: string | null,
 *   text?: string | null,
 *   wideViewport?: boolean,
 *   mode?: string | null,
 *   env?: NodeJS.ProcessEnv | null
 * }} [opts]
 * @returns {boolean}
 */
export function shouldAttemptConfideSemanticCrisis({
  literalRoute = null,
  text = '',
  wideViewport = false,
  mode = null,
  env
} = {}) {
  const resolvedMode =
    mode === CONFIDE_SEMANTIC_CRISIS_MODE.LIVE ||
    mode === CONFIDE_SEMANTIC_CRISIS_MODE.SHADOW ||
    mode === CONFIDE_SEMANTIC_CRISIS_MODE.OFF
      ? mode
      : resolveConfideSemanticCrisisMode(env);
  if (resolvedMode === CONFIDE_SEMANTIC_CRISIS_MODE.OFF) return false;
  if (!wideViewport) return false;
  if (!literalRoute) return false;
  if (
    literalRoute === CONFIDE_ROUTE.SAFETY_REDIRECT ||
    literalRoute === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS ||
    literalRoute === CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN
  ) {
    return false;
  }
  if (looksLikeJapaneseConfideText(text)) return false;
  return true;
}

/**
 * @param {number[]} userVector
 * @param {{ id: string, vector: number[] }[]} protoVectors
 * @returns {{ score: number, protoId: string | null }}
 */
export function scoreSemanticCrisisVectors(userVector, protoVectors) {
  if (!Array.isArray(protoVectors) || protoVectors.length === 0) {
    return { score: 0, protoId: null };
  }
  let score = 0;
  let protoId = null;
  for (const row of protoVectors) {
    const sim = cosineSimilarity(userVector, row.vector);
    if (sim > score) {
      score = sim;
      protoId = row.id;
    }
  }
  return { score, protoId };
}

/**
 * @param {{
 *   literalRoute?: string | null,
 *   score?: number,
 *   threshold?: number,
 *   mode?: string | null,
 *   embeddingOk?: boolean,
 *   text?: string | null
 * }} [opts]
 * @returns {{
 *   route: string | null,
 *   applied: boolean,
 *   wouldApply: boolean,
 *   override: string | null
 * }}
 */
export function applyConfideSemanticCrisis({
  literalRoute = null,
  score = 0,
  threshold = DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE,
  mode = CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
  embeddingOk = false,
  text = ''
} = {}) {
  const route = typeof literalRoute === 'string' ? literalRoute : null;
  const wouldApply = Boolean(embeddingOk) && Number(score) >= Number(threshold);
  if (!route) {
    return { route: null, applied: false, wouldApply: false, override: null };
  }
  if (
    route === CONFIDE_ROUTE.SAFETY_REDIRECT ||
    route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  ) {
    return { route, applied: false, wouldApply: false, override: null };
  }
  if (!wouldApply || mode !== CONFIDE_SEMANTIC_CRISIS_MODE.LIVE) {
    return { route, applied: false, wouldApply, override: null };
  }
  if (confirmRhetoricalCrisisUse(text) === RHETORICAL_CRISIS_CONFIRM.RHETORICAL) {
    return { route, applied: false, wouldApply: true, override: null };
  }
  return {
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    applied: true,
    wouldApply: true,
    override: CONFIDE_SEMANTIC_CRISIS_OVERRIDE
  };
}

/**
 * Privacy-safe local audit row. Never includes the original utterance.
 * @param {{
 *   text: string,
 *   protoId?: string | null,
 *   score?: number,
 *   applied?: boolean,
 *   wouldApply?: boolean,
 *   mode?: string,
 *   reason?: string,
 *   now?: () => Date
 * }} payload
 * @returns {object}
 */
export function buildSemanticCrisisTurnLog({
  text,
  protoId = null,
  score = 0,
  applied = false,
  wouldApply = false,
  mode = CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
  reason = 'ok',
  now = () => new Date()
}) {
  return {
    at: now().toISOString(),
    kind: CONFIDE_SEMANTIC_CRISIS_KIND,
    queryHash: hashConfidePrivateText(text),
    textLength: String(text || '').length,
    protoId: typeof protoId === 'string' ? protoId : null,
    scoreBucket: semanticCrisisScoreBucket(score),
    applied: Boolean(applied),
    wouldApply: Boolean(wouldApply),
    mode,
    reason
  };
}

export { CONFIDE_SEMANTIC_CRISIS_PROTOTYPES };
