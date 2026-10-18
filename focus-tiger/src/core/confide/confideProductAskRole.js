/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Closed ask-shape axis for KB near-match (CR-49 slice 3; CR-51 why-compare).
 * Brief: task-confide-fact-key-ask-role.md · task-confide-ask-shape-axis.md
 */

import { normalizeConfideIntentText } from './confideBoundaryRespect.js';

/** @typedef {'where' | 'how' | 'whether-required' | 'what-is' | 'why-compare' | 'none'} ConfideProductAskRole */

const MOTIVATION_ASK_SHAPE_RE =
  /\bwhy\s+(?:should|do|would|can't|cannot|not)\b|\bwhat(?:'s|\s+is)\s+(?:the\s+)?(?:point|purpose|reason|benefit|meaning|use)\b|为什么|为何|干嘛要|有什么意义|有什么好处|有什么用/i;

const ACTIVITY_WHAT_IS_RE =
  /\bwhat(?:'s|\s+is)\s+(?:some\s+)?(?:(?:focus|breathing)\s+)?(?:practice|practicing|meditation|meditat(?:e|ing|ion)|focus(?:ing)?|breathing)\b|(?:练习|冥想|专注|呼吸).{0,8}是什么|是什么.{0,8}(?:练习|冥想|专注|呼吸)/i;

const WHETHER_ASK_SHAPE_RE =
  /\b(?:do\s+i\s+have\s+to|must\s+i|do\s+i\s+need\s+to|is\s+it\s+required|is\s+it\s+optional|am\s+i\s+required\s+to)\b/i;

const WHETHER_REQUIRED_OPTIONAL_FRAME_RE =
  /\b(?:is|are)\s+.+\s+(?:required|optional)\b/i;

const WHETHER_PRODUCT_OBJECT_RE =
  /\b(?:honesty\s*check[- ]?in|check[- ]?in|daily\s+streak|streak|reminder)\b/i;

const WHETHER_MUST_WHY_RE = /(?:为什么|为何).{0,12}必须/;

const ACTIVITY_VERB_RE =
  /\b(?:meditat(?:e|ing|ion)?|practice|practicing|focus(?:ing)?)\b/i;

/** Named product path — not gerunds like "focus practicing". */
const PRODUCT_PATH_OBJECT_RE =
  /\b(?:sit(?:ting)?\s+with\s+yin|focus\s+sit|focus\s+practice|mindfulness)\b/i;

const COMPARE_CLOSED_OBJECT_RE =
  /\b(?:sit(?:ting)?\s+with\s+yin|focus\s+sit|focus\s+practice|mindfulness|meditation)\b/i;

const COMPARE_ASK_SHAPE_RE =
  /\b(?:the\s+)?same(?:\s+thing)?\b|\bvs\.?\b|\bversus\b|\bdiffer(?:ent|ence)?\b|\bidentical\b|\balike\b/i;

const WHERE_ASK_SHAPE_RE =
  /\bwhere\s+(?:is|are|do|can)\b/i;

const HOW_ASK_SHAPE_RE = Object.freeze([
  /\bhow\s+(?:do|can|to)\b/i,
  /\bhow\s+long\b/i,
  /\bwhich\s+button\b/i,
  /\bcan\s+i\s+turn\s+off\b/i,
  /\bwon'?t\s+stop\b/i,
  /\bdoes(?:n'?t|\s+not)\s+work\b/i,
  /\b(?:can(?:no)?t|can't)\s+find\b/i,
  /\bis\s+missing\b/i,
  /怎么|如何|在哪|哪里|从哪|怎么办|如何关|关不掉|找不到|坏了|多久/
]);

const WHAT_IS_ASK_SHAPE_RE = Object.freeze([
  /\bwhat(?:'s|\s+is)\s+(?:the\s+)?(?:observation\s+wing|ground(?:ing)?(?:\s+exercise)?|sit(?:ting)?(?:\s+button)?|help\s+center|quiet\s+line|reminder|backup|export|menu|drawer|sanctuary|membership|subscription)\b/i,
  /\bwhat(?:'s|\s+is)\s+the\s+(?!(?:point|purpose|reason|weather|meaning|use|benefit)\b)/i,
  /\bwhat\s+does\b/i,
  /\bwhat(?:'s|\s+is)\s+(?:in|inside)\b/i,
  /是什么|什么意思|有什么区别/
]);

const LEGACY_CATALOG_ASK_ROLES = Object.freeze(['where', 'how', 'what-is']);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasConfideWhetherRequiredProductObject(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  const spaced = raw.replace(/\s+/g, ' ').trim();
  const compact = spaced.replace(/\s+/g, '');
  if (WHETHER_PRODUCT_OBJECT_RE.test(spaced) || WHETHER_PRODUCT_OBJECT_RE.test(compact)) {
    return true;
  }
  return /诚实|打卡|签到|连续|提醒/.test(spaced);
}

function hasCompareAskFrame(spaced) {
  return COMPARE_ASK_SHAPE_RE.test(spaced) || /一样|一回事|同一|不同|区别|是不是一回事/.test(spaced);
}

function hasCompareClosedObject(spaced) {
  return COMPARE_CLOSED_OBJECT_RE.test(spaced) || /和寅坐|坐和寅|专注练习|正念|冥想/.test(spaced);
}

function hasProductPathObject(spaced) {
  return PRODUCT_PATH_OBJECT_RE.test(spaced) || /和寅坐|坐和寅|专注练习|正念/.test(spaced);
}

function isShouldActivityMotivation(spaced) {
  return (
    /\bwhy\s+should\b/i.test(spaced) &&
    ACTIVITY_VERB_RE.test(spaced) &&
    !hasProductPathObject(spaced) &&
    !hasCompareAskFrame(spaced)
  );
}

function isWhyCompareAsk(spaced) {
  if (isShouldActivityMotivation(spaced)) return false;
  if (hasCompareAskFrame(spaced) && hasCompareClosedObject(spaced)) return true;
  const whyBenefit =
    MOTIVATION_ASK_SHAPE_RE.test(spaced) && hasCompareClosedObject(spaced);
  return whyBenefit;
}

/**
 * @param {string} text
 * @returns {ConfideProductAskRole}
 */
export function classifyConfideProductAskRole(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return 'none';
  const spaced = raw.replace(/\s+/g, ' ').trim();
  const compact = spaced.replace(/\s+/g, '');
  const testBoth = (re) => re.test(spaced) || (compact !== spaced && re.test(compact));

  const whetherFrame =
    testBoth(WHETHER_ASK_SHAPE_RE) ||
    testBoth(WHETHER_REQUIRED_OPTIONAL_FRAME_RE) ||
    WHETHER_MUST_WHY_RE.test(spaced) ||
    /要不要|必须吗|是不是可选|是否必须|非得/.test(spaced);
  if (whetherFrame) {
    if (!hasConfideWhetherRequiredProductObject(text)) return 'none';
    if (
      (ACTIVITY_VERB_RE.test(spaced) || ACTIVITY_VERB_RE.test(compact)) &&
      !/\b(?:honesty\s*check[- ]?in|check[- ]?in|streak|reminder)\b/i.test(spaced)
    ) {
      return 'none';
    }
    return 'whether-required';
  }

  if (isWhyCompareAsk(spaced)) {
    return 'why-compare';
  }

  if (MOTIVATION_ASK_SHAPE_RE.test(spaced) || MOTIVATION_ASK_SHAPE_RE.test(compact)) {
    return 'none';
  }
  if (ACTIVITY_WHAT_IS_RE.test(spaced) || ACTIVITY_WHAT_IS_RE.test(compact)) {
    return 'none';
  }

  if (testBoth(WHERE_ASK_SHAPE_RE) || /在哪|哪里|从哪/.test(spaced)) {
    return 'where';
  }

  if (HOW_ASK_SHAPE_RE.some((re) => testBoth(re))) {
    return 'how';
  }

  if (WHAT_IS_ASK_SHAPE_RE.some((re) => testBoth(re))) {
    return 'what-is';
  }

  return 'none';
}

/**
 * @param {{ askRoleShapes?: readonly string[] }} entry
 * @param {ConfideProductAskRole} role
 * @returns {boolean}
 */
export function catalogEntryEligibleForAskRole(entry, role) {
  if (!role || role === 'none') return false;
  const shapes = entry?.askRoleShapes;
  if (Array.isArray(shapes) && shapes.length > 0) {
    return shapes.includes(role);
  }
  return LEGACY_CATALOG_ASK_ROLES.includes(role);
}

/**
 * @param {readonly { id: string, entry: object, vector: number[] }[]} rows
 * @param {number[]} userVector
 * @param {(a: number[], b: number[]) => number} scoreFn
 * @param {ConfideProductAskRole} askRole
 * @returns {{
 *   nearestId: string | null,
 *   nearestScore: number | null,
 *   leadMargin: number | null,
 *   askRole: ConfideProductAskRole
 * }}
 */
export function pickNearestCatalogEmbeddingMatch(rows, userVector, scoreFn, askRole) {
  const role = askRole || 'none';
  if (role === 'none') {
    return { nearestId: null, nearestScore: null, leadMargin: null, askRole: role };
  }
  /** @type {Map<string, number>} */
  const bestByCard = new Map();
  for (const row of rows) {
    if (!catalogEntryEligibleForAskRole(row.entry, role)) continue;
    const score = scoreFn(userVector, row.vector);
    const prev = bestByCard.get(row.id);
    if (prev == null || score > prev) bestByCard.set(row.id, score);
  }
  const ranked = [...bestByCard.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0] || null;
  const second = ranked[1] || null;
  return {
    nearestId: top ? top[0] : null,
    nearestScore: top ? top[1] : null,
    leadMargin: top && second ? top[1] - second[1] : null,
    askRole: role
  };
}
