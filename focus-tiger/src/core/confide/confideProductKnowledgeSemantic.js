/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide product-knowledge semantic gate (Library C binary classifier).
 * SSOT: task-confide-kb-routing-gate.md · scheme B independent二分类.
 */

import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { classifyConfideProductAskRole } from './confideProductAskRole.js';
import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { scoreLibraryTopK } from './confideSemanticRouting.js';
import { DEFAULT_CONFIDE_SEMANTIC_TOP_K } from './confideSemanticRoutingConfig.js';

/** Conservative default — prefer missing the gate over misrouting emotion. */
export const DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE = 0.42;

/**
 * Lab / cold-start probe only — not the live classifier when embedding is ready.
 * Mood-veto labs still use this wider “looks like a question” set. The honesty
 * gate uses {@link isConfideOperationalProductAskShape} (CR-47).
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
 * Closed operational-ask shapes (CR-47). May grow shapes, not topics.
 * Motivation / “why practice” frames are not operational.
 * @type {readonly RegExp[]}
 */
const OPERATIONAL_PRODUCT_ASK_SHAPE_RES = Object.freeze([
  /\bhow\s+(?:do|can|to)\b/i,
  /\bhow\s+long\b/i,
  /\bwhere\s+(?:is|are|do|can)\b/i,
  /\bwhich\s+button\b/i,
  /\bcan\s+i\s+turn\s+off\b/i,
  /\bwon'?t\s+stop\b/i,
  /\bdoes(?:n'?t|\s+not)\s+work\b/i,
  /\b(?:can(?:no)?t|can't)\s+find\b/i,
  /\bis\s+missing\b/i,
  /\bwhat(?:'s|\s+is)\s+(?:the\s+)?(?:observation\s+wing|ground(?:ing)?(?:\s+exercise)?|sit(?:ting)?(?:\s+button)?|help\s+center|quiet\s+line|reminder|backup|export|menu|drawer|sanctuary|membership|subscription)\b/i,
  /\bwhat(?:'s|\s+is)\s+the\s+(?!(?:point|purpose|reason|weather|meaning|use|benefit)\b)/i,
  /\bwhat\s+does\b/i,
  /\bwhat(?:'s|\s+is)\s+(?:in|inside)\b/i,
  /怎么|如何|在哪|哪里|从哪|怎么办|如何关|关不掉|找不到|坏了|多久/,
  /是什么|什么意思|有什么区别/
]);

const MOTIVATION_ASK_SHAPE_RE =
  /\bwhy\s+(?:should|do|would|can't|cannot|not)\b|\bwhat(?:'s|\s+is)\s+(?:the\s+)?(?:point|purpose|reason|benefit|meaning|use)\b|为什么|为何|干嘛要|有什么意义|有什么好处|有什么用/i;

const ACTIVITY_WHAT_IS_RE =
  /\bwhat(?:'s|\s+is)\s+(?:some\s+)?(?:(?:focus|breathing)\s+)?(?:practice|practicing|meditation|meditat(?:e|ing|ion)|focus(?:ing)?|breathing)\b|(?:练习|冥想|专注|呼吸).{0,8}是什么|是什么.{0,8}(?:练习|冥想|专注|呼吸)/i;

const ACTIVITY_HOW_TO_RE =
  /\bhow\s+(?:do|can|to)\b.+\b(?:meditat(?:e|ing|ion)|practice|practicing|focus(?:ing)?|breath(?:e|ing))\b|\b(?:meditat(?:e|ing|ion)|practice|practicing)\b.+\bhow\s+(?:do|can|to)\b|怎么.{0,12}(?:练|坐|冥想)|如何.{0,12}(?:练|坐|冥想)/i;

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
 * Confirmed product-ask shape (CR-47): operational question, not motive/chat.
 * Activity how-to without a named product entry still counts (must not invent steps).
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideOperationalProductAskShape(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  const spaced = raw.replace(/\s+/g, ' ').trim();
  const compact = spaced.replace(/\s+/g, '');
  const askRole = classifyConfideProductAskRole(text);
  if (askRole !== 'none') {
    return true;
  }
  if (MOTIVATION_ASK_SHAPE_RE.test(spaced) || MOTIVATION_ASK_SHAPE_RE.test(compact)) {
    return false;
  }
  if (ACTIVITY_WHAT_IS_RE.test(spaced) || ACTIVITY_WHAT_IS_RE.test(compact)) {
    return false;
  }
  return OPERATIONAL_PRODUCT_ASK_SHAPE_RES.some(
    (re) => re.test(spaced) || (compact !== spaced && re.test(compact))
  );
}

/**
 * “How can I meditate?” class: operational how-to, no product entry named.
 * Catalog hits still short-answer first; otherwise honesty, never invented steps.
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideActivityHowToWithoutProductEntry(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  const spaced = raw.replace(/\s+/g, ' ').trim();
  return ACTIVITY_HOW_TO_RE.test(spaced);
}

/**
 * Locked matrix negatives (mood / not a product ask). Semantic "looks like
 * product" must not pull these into the honesty empty state.
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideMoodAsideFromProductKnowledge(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (/怎么|如何|在哪|哪里|提醒/.test(raw)) return false;
  if (/有点烦|有點煩|会不会好一点|會不會好一點/.test(raw)) return true;
  // 2026-10-13 families: any ask shape (records, duration, yes/no) stays a product ask.
  if (/记录|記錄|多久|吗|嗎|？|\?/.test(raw)) return false;
  return (
    /想起以前|想起過去|想起过去|怀念以前|懷念以前|以前的事/.test(raw) ||
    /想喝酒|喝一杯|不想练|不想練/.test(raw) ||
    /[练練](?:习|習)?(?:的|得)?太久|太累|好累|累了/.test(raw)
  );
}

/**
 * @param {number} productScore
 * @param {number} lifeScore
 * @returns {boolean}
 */
export function lifeChatOutranksProductLibrary(productScore, lifeScore) {
  const product = Number(productScore);
  const life = Number(lifeScore);
  if (!Number.isFinite(product) || !Number.isFinite(life)) return false;
  return life > product;
}

/** Live margin stays 0 (`task-confide-kb-gate-mood-veto.md`). */
export const DEFAULT_CONFIDE_KB_MOOD_VETO_MARGIN = 0;

/**
 * Utterance language for the live veto. Chinese ships first; English is next
 * and stays log-only; Japanese waits for a native review.
 * Kana marks Japanese even when kanji are present.
 * @param {string} text
 * @returns {'zh' | 'en' | 'ja' | 'other'}
 */
export function confideKbMoodVetoUtteranceLang(text) {
  const raw = String(text || '');
  if (/[\u3040-\u30ff]/.test(raw)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(raw)) return 'zh';
  if (/[A-Za-z]/.test(raw)) return 'en';
  return 'other';
}

/**
 * Live Chinese mood veto. Unset = off.
 * `FT_CONFIDE_KB_MOOD_VETO=live` is honored only for unpackaged local Electron.
 * `shadow` / `off` is the rollback (log only). Packaged and web stay off.
 * @param {NodeJS.ProcessEnv} [env]
 * @param {{ electronUnpackaged?: boolean }} [opts]
 * @returns {boolean}
 */
export function isConfideKbMoodVetoLive(env, opts = {}) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_KB_MOOD_VETO || '')
    .trim()
    .toLowerCase();
  if (raw === 'shadow' || raw === 'off' || raw === 'log') return false;
  if (opts.electronUnpackaged !== true) return false;
  return raw === 'live';
}

/**
 * @param {{
 *   text?: string,
 *   moodVetoLive?: boolean,
 *   moodOutranksProduct?: boolean | null
 * }} input
 * @returns {boolean}
 */
function moodVetoReleasesChineseToObserve(input) {
  if (input.moodVetoLive !== true) return false;
  if (input.moodOutranksProduct !== true) return false;
  return confideKbMoodVetoUtteranceLang(input.text) === 'zh';
}

/**
 * @param {number} productScore
 * @param {number} moodScore
 * @param {number} [margin]
 * @returns {boolean}
 */
export function moodAsideOutranksProductLibrary(
  productScore,
  moodScore,
  margin = DEFAULT_CONFIDE_KB_MOOD_VETO_MARGIN
) {
  const product = Number(productScore);
  const mood = Number(moodScore);
  const gap = Number(margin);
  if (!Number.isFinite(product) || !Number.isFinite(mood) || !Number.isFinite(gap)) {
    return false;
  }
  return mood > product + gap;
}

/**
 * @param {{
 *   text: string,
 *   embeddingState: 'ready' | 'not_ready' | 'error',
 *   semanticIsProduct?: boolean,
 *   catalogHit: boolean,
 *   catalogAttempted?: boolean,
 *   nearAction?: 'hit' | 'honesty' | 'skip' | null,
 *   lifeOutranksProduct?: boolean,
 *   moodOutranksProduct?: boolean | null,
 *   moodVetoLive?: boolean
 * }} input
 * @returns {'skip' | 'hit' | 'honesty'}
 */
export function resolveProductKnowledgeGateAction(input) {
  const { text, embeddingState, semanticIsProduct, catalogHit, nearAction, lifeOutranksProduct } =
    input;
  // catalogHit here means the card already passed the fact door (CR-50).
  if (catalogHit) return 'hit';
  if (isConfideMoodAsideFromProductKnowledge(text)) return 'skip';

  const operational = isConfideOperationalProductAskShape(text);
  const activityHowTo = isConfideActivityHowToWithoutProductEntry(text);
  const lifeOrMoodSkip =
    lifeOutranksProduct || moodVetoReleasesChineseToObserve(input);

  if (embeddingState === 'ready') {
    // Vector “looks like product” is not enough (CR-47). Honesty only after an
    // operational ask shape. Life chat / live Chinese mood veto still generate.
    if (nearAction === 'honesty') {
      if (lifeOrMoodSkip) return 'skip';
      if (!operational) return 'skip';
      return 'honesty';
    }
    if (semanticIsProduct) {
      if (lifeOrMoodSkip) return 'skip';
      return operational ? 'honesty' : 'skip';
    }
    if (activityHowTo) return 'honesty';
    return 'skip';
  }

  if (operational || activityHowTo) {
    return 'honesty';
  }
  return 'skip';
}
