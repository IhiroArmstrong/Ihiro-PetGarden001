/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide product knowledge retrieval — retrieve-not-generate short answers.
 * SSOT: docs/product-knowledge-base.md + task-confide-kb-retrieval-wiring.md
 * Only indexes catalog entries pre-filtered to yin_may_retrieve ∧ 审核已通过.
 */

import catalog from './productKnowledgeCatalog.json' with { type: 'json' };
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { shouldAnswerWithPracticeFacts } from './confidePracticeFacts.js';
import { shouldAnswerWithPresenceFacts } from './confidePresenceFacts.js';
import { shouldAnswerWithMemoryList } from './confideMemoryList.js';

/** Minimum keyword score to treat as a hit (high bar). */
export const CONFIDE_KB_RETRIEVAL_MIN_SCORE = 2;

/** Winner must beat runner-up by at least this margin when score < 3. */
export const CONFIDE_KB_RETRIEVAL_MIN_MARGIN = 1;

/**
 * @type {readonly RegExp[]}
 */
const PRODUCT_KNOWLEDGE_QUESTION_RES = Object.freeze([
  /\bhow\s+(?:do|can|to)\b/i,
  /\bwhere\s+(?:is|are|do|can)\b/i,
  /\bwhat\s+is\b/i,
  /\bwhat\s+does\b/i,
  /\bwhich\s+(?:button|menu)\b/i,
  /\bdifference\s+between\b/i,
  /怎么|如何|在哪|从哪|哪里|是什么|什么意思|有什么区别|区别|从哪看|从哪里|能不能|可不可以/,
  /どう|どこ|何|とは|違い/
]);

/**
 * Step-detail asks still get pointer-only answers (semi-hit).
 * @type {readonly RegExp[]}
 */
const STEP_DETAIL_RES = Object.freeze([
  /\bsteps?\b/i,
  /\bwalk\s+me\s+through\b/i,
  /\bguide\s+me\b/i,
  /步骤|怎么做|引导语|一步一步|念出来|朗读/
]);

const FORBIDDEN_REPLY_MARKERS = Object.freeze([
  'RESET_GROUND_',
  'RESET_LOOK_',
  'RESET_BREATH_',
  'BREATH_PHASE_'
]);

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {boolean}
 */
export function isConfideKbRetrievalEnabled(env) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_KB_RETRIEVAL ?? 'on')
    .trim()
    .toLowerCase();
  return raw !== 'off' && raw !== '0' && raw !== 'false';
}

/**
 * @returns {readonly { id: string, shortAnswerEn: string, keywords: string[] }[]}
 */
export function listRetrievableProductKnowledgeEntries() {
  return catalog.entries;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isProductKnowledgeQuestion(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  return PRODUCT_KNOWLEDGE_QUESTION_RES.some((re) => re.test(raw));
}

/**
 * @param {string | null | undefined} route
 * @param {string} text
 * @param {{ hasMemoryBridge?: boolean }} [opts]
 * @returns {boolean}
 */
export function isConfideKbRetrievalCandidate(route, text, opts = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  if (!isProductKnowledgeQuestion(text)) return false;
  if (shouldAnswerWithPracticeFacts(route, text)) return false;
  if (shouldAnswerWithPresenceFacts(route, text)) return false;
  if (shouldAnswerWithMemoryList(route, text, Boolean(opts.hasMemoryBridge))) {
    return false;
  }
  return true;
}

/**
 * @param {{
 *   route?: string | null,
 *   text?: string,
 *   wideViewport?: boolean,
 *   hasBridge?: boolean,
 *   hasMemoryBridge?: boolean,
 *   enabled?: boolean
 * }} [opts]
 * @returns {boolean}
 */
export function mayTryConfideProductKnowledge({
  route = null,
  text = '',
  wideViewport = false,
  hasBridge = false,
  hasMemoryBridge = false,
  enabled = isConfideKbRetrievalEnabled()
} = {}) {
  if (!enabled) return false;
  if (!wideViewport || !hasBridge) return false;
  return isConfideKbRetrievalCandidate(route, text, { hasMemoryBridge });
}

/**
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
function keywordMatches(haystack, needle) {
  const n = String(needle || '').trim();
  if (!n) return false;
  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(n)) {
    return haystack.includes(n);
  }
  return haystack.toLowerCase().includes(n.toLowerCase());
}

/**
 * @param {string} text
 * @param {readonly { id: string, shortAnswerEn: string, keywords: string[] }[]} entries
 * @returns {{ id: string, score: number, shortAnswerEn: string }[]}
 */
export function scoreProductKnowledgeEntries(text, entries = listRetrievableProductKnowledgeEntries()) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return [];
  /** @type {{ id: string, score: number, shortAnswerEn: string }[]} */
  const scored = [];
  for (const entry of entries) {
    let score = 0;
    for (const kw of entry.keywords || []) {
      if (keywordMatches(raw, kw)) score += 1;
    }
    if (score > 0) {
      scored.push({ id: entry.id, score, shortAnswerEn: entry.shortAnswerEn });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * @param {string} text
 * @param {readonly { id: string, score: number, shortAnswerEn: string }[]} ranked
 * @returns {{ id: string, shortAnswerEn: string } | null}
 */
export function pickProductKnowledgeHit(text, ranked) {
  if (!ranked.length) return null;
  const top = ranked[0];
  const runner = ranked[1];
  if (top.score < CONFIDE_KB_RETRIEVAL_MIN_SCORE) {
    if (top.score < 1) return null;
    if (runner && top.score - runner.score < CONFIDE_KB_RETRIEVAL_MIN_MARGIN) {
      return null;
    }
  } else if (runner && top.score === runner.score) {
    return null;
  }
  return { id: top.id, shortAnswerEn: top.shortAnswerEn };
}

/**
 * @param {string} shortAnswerEn
 * @returns {boolean}
 */
export function productKnowledgeReplyPassesGuard(shortAnswerEn) {
  const body = String(shortAnswerEn || '');
  return !FORBIDDEN_REPLY_MARKERS.some((marker) => body.includes(marker));
}

/**
 * @param {string} text
 * @returns {{
 *   attempted: boolean,
 *   hit: boolean,
 *   id?: string,
 *   text?: string,
 *   reason?: string,
 *   semiHit?: boolean
 * }}
 */
export function retrieveProductKnowledge(text) {
  if (!isProductKnowledgeQuestion(text)) {
    return { attempted: false, hit: false, reason: 'not_product_question' };
  }
  const ranked = scoreProductKnowledgeEntries(text);
  const picked = pickProductKnowledgeHit(text, ranked);
  if (!picked) {
    return {
      attempted: true,
      hit: false,
      reason: ranked.length ? 'below_threshold' : 'no_keyword_match'
    };
  }
  if (!productKnowledgeReplyPassesGuard(picked.shortAnswerEn)) {
    return { attempted: true, hit: false, reason: 'forbidden_marker' };
  }
  const semiHit = STEP_DETAIL_RES.some((re) => re.test(normalizeConfideIntentText(text)));
  return {
    attempted: true,
    hit: true,
    id: picked.id,
    text: picked.shortAnswerEn,
    semiHit
  };
}

/**
 * turns.jsonl / observation miss row (no user free text beyond query hash).
 * @param {{ text: string, reason: string, locale?: string }} payload
 * @returns {object}
 */
export function buildKbRetrievalMissTurnLog({ text, reason, locale = 'en' }) {
  return {
    at: new Date().toISOString(),
    kind: 'kb_retrieval_miss',
    locale,
    text: String(text || '').slice(0, 200),
    reason,
    catalogSchemaVersion: catalog.schemaVersion
  };
}
