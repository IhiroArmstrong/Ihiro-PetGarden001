/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide product-knowledge semantic gate (Library C binary classifier).
 * SSOT: task-confide-kb-routing-gate.md · scheme B independent二分类.
 */

import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { scoreLibraryTopK } from './confideSemanticRouting.js';
import { DEFAULT_CONFIDE_SEMANTIC_TOP_K } from './confideSemanticRoutingConfig.js';

/** Conservative default — prefer missing the gate over misrouting emotion. */
export const DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE = 0.42;

/**
 * Lab / cold-start probe only — not the live classifier when embedding is ready.
 * Brief §6: may block generate when embedding is not ready; never substitutes
 * for semantic classification on the ready path.
 * @type {readonly RegExp[]}
 */
export const PRODUCT_KNOWLEDGE_COLD_START_PROBE_RES = Object.freeze([
  /\bhow\s+(?:do|can|to)\b/i,
  /\bwhere\s+(?:is|are|do|can)\b/i,
  /\bwhat\s+is\b/i,
  /\bwhat\s+does\b/i,
  /\bwhich\s+(?:button|menu|ones?|items?|fields?|data)\b/i,
  /\bwhat(?:'s| is) (?:in|inside)\b/i,
  /\b(?:does|will) (?:it|the (?:backup|export|file)) include\b/i,
  /\bdifference\s+between\b/i,
  /怎么|如何|在哪|从哪|哪里|是什么|什么意思|有什么区别|区别|从哪看|从哪里|能不能|可不可以/,
  /哪些|包不包含|包含哪些|装了什么|里面有什么/,
  /会不会(?:包含|备份|导出|加密|明文)/,
  /どう|どこ|何|とは|違い/
]);

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ minScore: number, topK: number }}
 */
export function resolveConfideProductKnowledgeSemanticConfig(env) {
  const resolved = confideBrowserSafeEnv(env);
  const minRaw = Number(resolved.FT_CONFIDE_KB_SEMANTIC_MIN_SCORE);
  const topKRaw = Number(resolved.FT_CONFIDE_KB_SEMANTIC_TOP_K);
  return {
    minScore:
      Number.isFinite(minRaw) && minRaw > 0.2 && minRaw < 0.95
        ? minRaw
        : DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE,
    topK:
      Number.isFinite(topKRaw) && topKRaw >= 1 && topKRaw <= 10
        ? Math.floor(topKRaw)
        : DEFAULT_CONFIDE_SEMANTIC_TOP_K
  };
}

/**
 * @param {number[]} userVector
 * @param {number[][]} libraryC
 * @param {{ minScore?: number, topK?: number }} [opts]
 * @returns {{ isProduct: boolean, score: number, minScore: number, topK: number }}
 */
export function classifyProductKnowledgeSemantic(userVector, libraryC, opts = {}) {
  const { minScore, topK } = resolveConfideProductKnowledgeSemanticConfig(opts.env);
  const score = scoreLibraryTopK(userVector, libraryC, opts.topK ?? topK);
  return {
    isProduct: score >= (opts.minScore ?? minScore),
    score,
    minScore: opts.minScore ?? minScore,
    topK: opts.topK ?? topK
  };
}

/**
 * Cold-start conservative probe (Brief §6). Not the live semantic classifier.
 * @param {string} text
 * @returns {boolean}
 */
export function isProductKnowledgeColdStartProbe(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  const spaced = raw.replace(/\s+/g, ' ').trim();
  const compact = spaced.replace(/\s+/g, '');
  return PRODUCT_KNOWLEDGE_COLD_START_PROBE_RES.some(
    (re) => re.test(spaced) || (compact !== spaced && re.test(compact))
  );
}

/**
 * @param {{
 *   text: string,
 *   embeddingState: 'ready' | 'not_ready' | 'error',
 *   semanticIsProduct?: boolean,
 *   catalogHit: boolean,
 *   catalogAttempted?: boolean
 * }} input
 * @returns {'skip' | 'hit' | 'honesty'}
 */
export function resolveProductKnowledgeGateAction(input) {
  const { text, embeddingState, semanticIsProduct, catalogHit } = input;
  if (catalogHit) return 'hit';

  if (embeddingState === 'ready') {
    if (!semanticIsProduct) return 'skip';
    return 'honesty';
  }

  if (isProductKnowledgeColdStartProbe(text)) {
    return 'honesty';
  }
  return 'skip';
}
