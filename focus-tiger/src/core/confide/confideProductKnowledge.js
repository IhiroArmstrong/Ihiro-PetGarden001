/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide product knowledge retrieval — retrieve-not-generate short answers.
 * SSOT: docs/product-knowledge-base.md + task-confide-kb-routing-gate.md
 * Only indexes catalog entries pre-filtered to yin_may_retrieve ∧ 审核已通过.
 */

import catalog from './productKnowledgeCatalog.json' with { type: 'json' };
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { shouldAnswerWithPracticeFacts } from './confidePracticeFacts.js';
import { shouldAnswerWithPresenceFacts } from './confidePresenceFacts.js';
import { shouldAnswerWithMemoryList } from './confideMemoryList.js';
import { isProductKnowledgeColdStartProbe } from './confideProductKnowledgeSemantic.js';

/** Minimum keyword score to treat as a hit (high bar). */
export const CONFIDE_KB_RETRIEVAL_MIN_SCORE = 2;

/** Winner must beat runner-up by at least this margin when score < 3. */
export const CONFIDE_KB_RETRIEVAL_MIN_MARGIN = 1;

/** Content/scope of backup vs "where is Backup & restore". */
const BACKUP_CONTENT_ASK_RE =
  /装了什么|里面有什么|包不包含|包含哪些|哪些数据|明文|加密|json file|plain json|unencrypted|what(?:'s| is) (?:in|inside)|(?:does|will).{0,24}include/i;

/** Concept asks (KB-EDU-*) vs menu pointers (KB-FUNC-*) when keyword scores tie. */
const CONCEPT_ASK_RE =
  /what is|what's|meaning|原理|是什么|什么意思|有什么区别|一样吗|vs\b|versus|difference|我这是在冥想吗/i;

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
 * Lab fixture alias — cold-start probe only; not the live semantic gate.
 * @param {string} text
 * @returns {boolean}
 */
export function isProductKnowledgeQuestion(text) {
  return isProductKnowledgeColdStartProbe(text);
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isBackupContentQuestion(text) {
  const raw = normalizeConfideIntentText(text).replace(/\s+/g, ' ').trim();
  if (!raw) return false;
  const compact = raw.replace(/\s+/g, '');
  return BACKUP_CONTENT_ASK_RE.test(raw) || BACKUP_CONTENT_ASK_RE.test(compact);
}

/**
 * Structural eligibility for the KB path (excludes personal-fact tools).
 * @param {string | null | undefined} route
 * @param {string} text
 * @param {{ hasMemoryBridge?: boolean }} [opts]
 * @returns {boolean}
 */
export function isConfideKbPathEligible(route, text, opts = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  if (shouldAnswerWithPracticeFacts(route, text)) return false;
  if (shouldAnswerWithPresenceFacts(route, text)) return false;
  if (shouldAnswerWithMemoryList(route, text, Boolean(opts.hasMemoryBridge))) {
    return false;
  }
  return true;
}

/**
 * @deprecated Use isConfideKbPathEligible + semantic gate.
 * @param {string | null | undefined} route
 * @param {string} text
 * @param {{ hasMemoryBridge?: boolean }} [opts]
 * @returns {boolean}
 */
export function isConfideKbRetrievalCandidate(route, text, opts = {}) {
  return isConfideKbPathEligible(route, text, opts);
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
  return isConfideKbPathEligible(route, text, { hasMemoryBridge });
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
 * @param {{ id: string, score: number, shortAnswerEn: string }} top
 * @param {{ id: string, score: number, shortAnswerEn: string } | undefined} runner
 * @returns {{ id: string, shortAnswerEn: string } | null}
 */
function pickConceptKbOnFuncTie(text, top, runner) {
  if (!runner || top.score !== runner.score) return null;
  const topIsEdu = top.id.startsWith('KB-EDU-');
  const runnerIsEdu = runner.id.startsWith('KB-EDU-');
  if (topIsEdu === runnerIsEdu) return null;
  if (!CONCEPT_ASK_RE.test(normalizeConfideIntentText(text))) return null;
  return topIsEdu ? top : runner;
}

/**
 * @param {string} text
 * @param {readonly { id: string, score: number, shortAnswerEn: string }[]} ranked
 * @returns {{ id: string, shortAnswerEn: string } | null}
 */
export function pickProductKnowledgeHit(text, ranked) {
  if (!ranked.length) return null;
  if (isBackupContentQuestion(text)) {
    const content = ranked.find((row) => row.id === 'KB-FUNC-0015');
    if (content && content.score >= 1) {
      return { id: content.id, shortAnswerEn: content.shortAnswerEn };
    }
  }
  const top = ranked[0];
  const runner = ranked[1];
  if (top.score < CONFIDE_KB_RETRIEVAL_MIN_SCORE) {
    if (top.score < 1) return null;
    if (runner && top.score - runner.score < CONFIDE_KB_RETRIEVAL_MIN_MARGIN) {
      const conceptPick = pickConceptKbOnFuncTie(text, top, runner);
      if (conceptPick) {
        return { id: conceptPick.id, shortAnswerEn: conceptPick.shortAnswerEn };
      }
      return null;
    }
  } else if (runner && top.score === runner.score) {
    const conceptPick = pickConceptKbOnFuncTie(text, top, runner);
    if (conceptPick) {
      return { id: conceptPick.id, shortAnswerEn: conceptPick.shortAnswerEn };
    }
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
 * Catalog keyword retrieval without the semantic gate.
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
export function probeProductKnowledgeCatalog(text) {
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
 * @param {string} text
 * @param {{ requireSemanticProduct?: boolean }} [opts]
 * @returns {ReturnType<typeof probeProductKnowledgeCatalog>}
 */
export function retrieveProductKnowledge(text, opts = {}) {
  if (opts.requireSemanticProduct && !isProductKnowledgeColdStartProbe(text)) {
    return { attempted: false, hit: false, reason: 'not_product_question' };
  }
  return probeProductKnowledgeCatalog(text);
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
