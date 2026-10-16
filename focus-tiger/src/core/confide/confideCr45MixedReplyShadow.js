/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CR-45 shadow: mixed utterance «emotion line + product short answer / honesty».
 * Not on the send path. Brief: task-confide-mixed-emotion-then-product.md §2–§4.
 *
 * **「合并对」判据（影子口令 · 结构检查，非语义裁判）**
 * 1. 已触发 §2 混合形状（分句后产品半边与情绪半边同时成立，且非纯产品 / 非 AE 锚）。
 * 2. 第一段：`pickConfideLine` 从允许池抽出的一条 `review=ok` 情绪路由句，id 不在禁止池，且过 §4.1 长度上限。
 * 3. 第二段：catalog 真命中 → 目录短答正文与 `retrieveProductKnowledge` 一字相同；否则诚实空态 → 与
 *    `formatConfideProductKnowledgeHonestyReply` 现句一字相同（零改写）。
 */

import { confideClassify } from './confideClassify.js';
import {
  CONFIDE_CORPUS,
  CONFIDE_GENERATE_FAILURE_CORPUS_EXCLUDE_IDS,
  confideLineText,
  pickConfideLine
} from './confideCorpus.js';
import { CONFIDE_EMOTION_BUCKETS, CONFIDE_ROUTE } from './confideRoutes.js';
import {
  PRODUCT_MINUS_MOOD_MARGIN,
  splitUtteranceByPunctuation
} from './confideRoutingArbitrationShadow.js';
import { emotionHalfMayMerge } from './confideRoutingIntentFeasibility.js';
import { retrieveProductKnowledge } from './confideProductKnowledge.js';
import { formatConfideProductKnowledgeHonestyReply } from './confideProductKnowledgeHonesty.js';

/** Tentative mood-floor for emotion half (Brief §2.8 · n=38 devset). */
export const CR45_MOOD_SCORE_FLOOR = 0.5;

export const CR45_FORBIDDEN_FIRST_SEGMENT_PREFIXES = Object.freeze(['aggression-']);

export const CR45_FORBIDDEN_FIRST_SEGMENT_IDS = Object.freeze([
  'safety-01',
  'fallback-01',
  'fallback-03',
  ...CONFIDE_GENERATE_FAILURE_CORPUS_EXCLUDE_IDS
]);

export const CR45_FIRST_SEGMENT_MAX_VISIBLE = Object.freeze({
  en: 72,
  zh: 40,
  ja: 40
});

export const CR45_BAND_A_CLASS_IDS = Object.freeze([
  'mixed',
  'product-over-emotion',
  'mixed-emotion-dominant'
]);

export const CR45_AE_ANCHOR_ITEM_IDS = Object.freeze(['ae-ground', 'ae-quiet-line']);

const TERMINAL_PUNCT = /[.!?。！？]/g;

/**
 * @param {string} id
 */
export function isCr45ForbiddenFirstSegmentId(id) {
  const raw = String(id || '').trim();
  if (!raw) return true;
  if (CR45_FORBIDDEN_FIRST_SEGMENT_IDS.includes(raw)) return true;
  return CR45_FORBIDDEN_FIRST_SEGMENT_PREFIXES.some((prefix) => raw.startsWith(prefix));
}

/**
 * @param {unknown} item
 */
export function isCr45AeAnchorHoldoutItem(item) {
  const row = item && typeof item === 'object' ? item : {};
  const id = String(row.id || row.item_id || '').trim();
  if (CR45_AE_ANCHOR_ITEM_IDS.includes(id)) return true;
  return row.ae_anchor === true || row.aeAnchor === true;
}

/**
 * @param {string} locale
 * @param {string} text
 */
export function cr45VisibleLength(locale, text) {
  const raw = String(text || '').trim();
  if (!raw) return 0;
  if (locale === 'zh' || locale === 'ja') {
    return raw.replace(/\s+/g, '').length;
  }
  return raw.length;
}

/**
 * @param {string} locale
 * @param {string} text
 */
export function cr45SegmentWithinLengthLimit(locale, text) {
  const loc = locale === 'zh' || locale === 'ja' ? locale : 'en';
  const max = CR45_FIRST_SEGMENT_MAX_VISIBLE[loc];
  if (cr45VisibleLength(loc, text) > max) return false;
  const segments = String(text || '')
    .split(TERMINAL_PUNCT)
    .map((part) => part.trim())
    .filter(Boolean);
  return segments.length <= 2;
}

/**
 * @param {string} lineId
 * @param {string} locale
 */
export function isAllowedCr45FirstSegmentLine(lineId, locale = 'en') {
  if (isCr45ForbiddenFirstSegmentId(lineId)) return false;
  const line = CONFIDE_CORPUS.find((row) => row.id === lineId);
  if (!line || line.review !== 'ok') return false;
  if (!CONFIDE_EMOTION_BUCKETS.includes(line.route)) return false;
  const visible = confideLineText(line, locale);
  return cr45SegmentWithinLengthLimit(locale, visible);
}

/**
 * @param {readonly { productScore?: number, moodScore?: number }[]} clauses
 */
export function cr45MixedShapeFromClauses(clauses) {
  const list = Array.isArray(clauses) ? clauses : [];
  if (list.length < 2) return { mixed: false, productIdx: -1, moodIdx: -1 };
  let productIdx = -1;
  let moodIdx = -1;
  for (let i = 0; i < list.length; i += 1) {
    const product = Number(list[i].productScore);
    const mood = Number(list[i].moodScore);
    if (!Number.isFinite(product) || !Number.isFinite(mood)) continue;
    const delta = product - mood;
    if (delta > PRODUCT_MINUS_MOOD_MARGIN && productIdx < 0) productIdx = i;
    if (delta <= PRODUCT_MINUS_MOOD_MARGIN && moodIdx < 0) moodIdx = i;
  }
  const mixed = productIdx >= 0 && moodIdx >= 0 && productIdx !== moodIdx;
  return { mixed, productIdx, moodIdx };
}

/**
 * @param {string} clauseText
 * @param {number} moodScore
 */
export function cr45EmotionHalfEligible(clauseText, moodScore) {
  const route = confideClassify(clauseText);
  const bucket =
    route && CONFIDE_EMOTION_BUCKETS.includes(route) ? route : null;
  return emotionHalfMayMerge({
    moodScore,
    emotionBucket: bucket,
    moodFloor: CR45_MOOD_SCORE_FLOOR,
    emotionBuckets: CONFIDE_EMOTION_BUCKETS
  });
}

/**
 * @param {{
 *   moodClauseText: string,
 *   moodScore: number,
 *   locale?: string,
 *   salt?: number
 * }} input
 */
export function pickCr45ShadowFirstSegment(input) {
  const text = String(input.moodClauseText || '').trim();
  if (!text) return null;
  if (!cr45EmotionHalfEligible(text, Number(input.moodScore))) return null;
  const route = confideClassify(text) ?? CONFIDE_ROUTE.FALLBACK;
  if (!CONFIDE_EMOTION_BUCKETS.includes(route)) return null;
  const locale = input.locale === 'zh' || input.locale === 'ja' ? input.locale : 'en';
  const line = pickConfideLine({
    route,
    locale,
    salt: Number(input.salt) || 0,
    hardExcludeIds: [
      ...CR45_FORBIDDEN_FIRST_SEGMENT_IDS,
      ...CONFIDE_GENERATE_FAILURE_CORPUS_EXCLUDE_IDS
    ]
  });
  if (!line) return null;
  if (!isAllowedCr45FirstSegmentLine(line.id, locale)) return null;
  return { id: line.id, route: line.route };
}

/**
 * @param {{
 *   firstSegmentId: string | null,
 *   secondKind: 'hit' | 'honesty' | null,
 *   secondText: string,
 *   canonicalSecondText: string,
 *   mergeTriggered: boolean
 * }} input
 * @returns {boolean}
 */
export function isCr45MergeStructurallyCorrect(input) {
  if (!input.mergeTriggered) return false;
  if (!input.firstSegmentId || !isAllowedCr45FirstSegmentLine(input.firstSegmentId)) {
    return false;
  }
  if (input.secondKind !== 'hit' && input.secondKind !== 'honesty') return false;
  const got = String(input.secondText || '').trim();
  const want = String(input.canonicalSecondText || '').trim();
  if (!got || !want) return false;
  return got === want;
}

/**
 * @param {string} productClauseText
 * @param {(key: string) => string} [tFn]
 */
export function resolveCr45ShadowSecondSegment(productClauseText, tFn = (key) => key) {
  const hit = retrieveProductKnowledge(productClauseText);
  if (hit.hit && hit.text) {
    const text = String(hit.text).trim();
    return { kind: 'hit', canonicalSecondText: text, actualSecondText: text };
  }
  const honesty = formatConfideProductKnowledgeHonestyReply(tFn).trim();
  return { kind: 'honesty', canonicalSecondText: honesty, actualSecondText: honesty };
}

/**
 * @param {string} id
 */
export function cr45SaltFromHoldoutItemId(id) {
  let hash = 0;
  const raw = String(id || '');
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * @param {{
 *   text: string,
 *   clauses: readonly { text?: string, productScore?: number, moodScore?: number }[],
 *   locale?: string,
 *   salt?: number,
 *   aeAnchor?: boolean,
 *   classId?: string,
 *   secondKind: 'hit' | 'honesty' | 'skip' | null,
 *   canonicalSecondText: string,
 *   actualSecondText: string
 * }} input
 */
export function evaluateCr45ShadowMergeOutcome(input) {
  const parts =
    Array.isArray(input.clauses) && input.clauses.length
      ? input.clauses
      : splitUtteranceByPunctuation(input.text).map((part) => ({
          text: part,
          productScore: 0,
          moodScore: 0
        }));
  const { mixed, moodIdx } = cr45MixedShapeFromClauses(parts);
  const skipClass = new Set(['life-emotion', 'chitchat', 'badge-yin-coin']);
  const classId = String(input.classId || '').trim();
  if (input.aeAnchor || skipClass.has(classId)) {
    return {
      mergeTriggered: false,
      mergeStructurallyCorrect: false,
      firstSegmentId: null,
      secondKind: null
    };
  }
  if (!mixed) {
    return {
      mergeTriggered: false,
      mergeStructurallyCorrect: false,
      firstSegmentId: null,
      secondKind: null
    };
  }
  const moodClause = parts[moodIdx] || {};
  const moodText = String(moodClause.text || '').trim();
  const picked = pickCr45ShadowFirstSegment({
    moodClauseText: moodText,
    moodScore: Number(moodClause.moodScore),
    locale: input.locale,
    salt: input.salt
  });
  const secondKind =
    input.secondKind === 'hit' || input.secondKind === 'honesty' ? input.secondKind : null;
  const mergeStructurallyCorrect = isCr45MergeStructurallyCorrect({
    firstSegmentId: picked?.id ?? null,
    secondKind,
    secondText: input.actualSecondText,
    canonicalSecondText: input.canonicalSecondText,
    mergeTriggered: true
  });
  return {
    mergeTriggered: true,
    mergeStructurallyCorrect,
    firstSegmentId: picked?.id ?? null,
    secondKind
  };
}
