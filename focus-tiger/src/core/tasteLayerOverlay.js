/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Optional cloud taste-layer overlay (weights + daily-wisdom pool).
 * Unknown schemaVersion / malformed payload → keep local freeze tables.
 * Duration banding overlay is applied in sceneAnimationDispatcher only
 * (do not edit HonestyCheckInController for this slice).
 */

import { DAILY_WISDOM_EN } from '../content/daily-wisdom/index.js';
import { COPY_POOLS, getLocale } from '../locales/i18n.js';

export const TASTE_LAYER_SCHEMA_VERSION = 1;

const RISE_KEYS = new Set(['riseStretchCasual', 'teaDrinking', 'bookReading']);
const WELCOME_KEYS = new Set(['magicBookReading', 'nodGreeting']);
const LIGHT_KEYS = new Set([
  'sessionComplete',
  'mindfulAcknowledge',
  'parrotEarVisit'
]);
const DAILY_WISDOM_IDS = Object.freeze(DAILY_WISDOM_EN.map((e) => e.id));
const QUIET_LINE_KEYS = new Set([
  ...COPY_POOLS.DAILY_ZEN_QUOTE,
  ...COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT
]);
export const CONFIDE_COPY_TEMPLATE_KEYS = Object.freeze([
  'CONFIDE_BOUNDARY_RESPECT',
  'CONFIDE_COMPANION_PRESENCE',
  'CONFIDE_PREFERENCE_HONESTY',
  'CONFIDE_OBSERVATION_HONESTY'
]);
export const CONFIDE_COPY_CORPUS_IDS = Object.freeze([
  'safety-01',
  'fallback-01',
  'fallback-02',
  'fallback-03',
  'anxious-01',
  'anxious-02',
  'anxious-03',
  'tired-01',
  'tired-02',
  'tired-03',
  'stuck-01',
  'stuck-02',
  'stuck-03',
  'sad-01',
  'sad-02',
  'sad-03',
  'scattered-01',
  'scattered-02',
  'scattered-03'
]);
const CONFIDE_TEMPLATE_KEY_SET = new Set(CONFIDE_COPY_TEMPLATE_KEYS);
const CONFIDE_CORPUS_ID_SET = new Set(CONFIDE_COPY_CORPUS_IDS);

/** @typedef {{ key: string, weight: number }} WeightedEntry */
/** @typedef {{ id: string, text: string, attribution?: string }} DailyWisdomEntry */

/**
 * @typedef {{
 *   riseInterruptPool: ReadonlyArray<WeightedEntry>,
 *   welcomePool: ReadonlyArray<WeightedEntry>,
 *   lightCompletePool: ReadonlyArray<WeightedEntry>,
 *   honestyLongMinMinutes: number
 * }} TasteWeightOverlay
 */

/**
 * @typedef {{
 *   locale: string,
 *   pool: ReadonlyArray<DailyWisdomEntry>
 * }} TasteDailyWisdomOverlay
 */

/** @typedef {{ key: string, text: string }} QuietLineEntry */

/**
 * @typedef {{
 *   locale: string,
 *   pool: ReadonlyArray<QuietLineEntry>
 * }} TasteQuietLineOverlay
 */

/** @typedef {{ key: string, text: string }} ConfideCopyTemplateEntry */
/** @typedef {{ id: string, text: string }} ConfideCopyCorpusEntry */

/**
 * @typedef {{
 *   locale: string,
 *   templates: ReadonlyArray<ConfideCopyTemplateEntry>,
 *   corpus: ReadonlyArray<ConfideCopyCorpusEntry>
 * }} TasteConfideCopyOverlay
 */

/** @type {TasteWeightOverlay | null} */
let weightOverlay = null;
/** @type {TasteDailyWisdomOverlay | null} */
let dailyWisdomOverlay = null;
/** @type {TasteQuietLineOverlay | null} */
let quietLineOverlay = null;
/** @type {TasteConfideCopyOverlay | null} */
let confideCopyOverlay = null;
/** Cloud v1 validated even when we skip retaining a freeze-identical copy. */
let weightCloudOk = false;
let dailyCloudOk = false;
let quietLineCloudOk = false;
let confideCopyCloudOk = false;

/**
 * @param {unknown} raw
 * @param {ReadonlySet<string>} allowed
 * @returns {WeightedEntry[] | null}
 */
export function parseWeightedPool(raw, allowed) {
  if (!Array.isArray(raw) || raw.length !== allowed.size) return null;
  /** @type {WeightedEntry[]} */
  const out = [];
  const seen = new Set();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return null;
    const key = /** @type {{ key?: unknown }} */ (entry).key;
    const weight = /** @type {{ weight?: unknown }} */ (entry).weight;
    if (typeof key !== 'string' || !allowed.has(key) || seen.has(key)) return null;
    if (!Number.isFinite(weight) || Number(weight) < 0) return null;
    seen.add(key);
    out.push({ key, weight: Number(weight) });
  }
  if (seen.size !== allowed.size) return null;
  const total = out.reduce((sum, e) => sum + e.weight, 0);
  if (total <= 0) return null;
  if (out.some((e) => /celebrat/i.test(e.key))) return null;
  return out;
}

/**
 * @param {unknown} body
 * @returns {TasteWeightOverlay | null}
 */
export function parseEmotionWeightOverlay(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const o = /** @type {Record<string, unknown>} */ (body);
  if (o.schemaVersion !== TASTE_LAYER_SCHEMA_VERSION) return null;
  const riseInterruptPool = parseWeightedPool(o.riseInterruptPool, RISE_KEYS);
  const welcomePool = parseWeightedPool(o.welcomePool, WELCOME_KEYS);
  const lightCompletePool = parseWeightedPool(o.lightCompletePool, LIGHT_KEYS);
  const honestyLongMinMinutes = o.honestyLongMinMinutes;
  if (!riseInterruptPool || !welcomePool || !lightCompletePool) return null;
  if (
    !Number.isFinite(honestyLongMinMinutes) ||
    Number(honestyLongMinMinutes) < 1 ||
    Number(honestyLongMinMinutes) > 180
  ) {
    return null;
  }
  return {
    riseInterruptPool: Object.freeze(riseInterruptPool.map((e) => Object.freeze({ ...e }))),
    welcomePool: Object.freeze(welcomePool.map((e) => Object.freeze({ ...e }))),
    lightCompletePool: Object.freeze(
      lightCompletePool.map((e) => Object.freeze({ ...e }))
    ),
    honestyLongMinMinutes: Number(honestyLongMinMinutes)
  };
}

/**
 * @param {unknown} body
 * @param {string} [expectedLocale]
 * @returns {TasteDailyWisdomOverlay | null}
 */
export function parseDailyMessageOverlay(body, expectedLocale) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const o = /** @type {Record<string, unknown>} */ (body);
  if (o.schemaVersion !== TASTE_LAYER_SCHEMA_VERSION) return null;
  const rawLocale = typeof o.locale === 'string' ? o.locale.trim() : '';
  if (!rawLocale) return null;
  const have = rawLocale === 'ja' ? 'ja' : 'en';
  if (expectedLocale) {
    const want = expectedLocale === 'ja' ? 'ja' : 'en';
    if (have !== want) return null;
  }
  const poolRaw = o.pool;
  if (!Array.isArray(poolRaw) || poolRaw.length !== DAILY_WISDOM_IDS.length) {
    return null;
  }
  /** @type {DailyWisdomEntry[]} */
  const pool = [];
  const seen = new Set();
  for (const entry of poolRaw) {
    if (!entry || typeof entry !== 'object') return null;
    const id = /** @type {{ id?: unknown }} */ (entry).id;
    const text = /** @type {{ text?: unknown }} */ (entry).text;
    const attribution = /** @type {{ attribution?: unknown }} */ (entry).attribution;
    if (typeof id !== 'string' || !DAILY_WISDOM_IDS.includes(id) || seen.has(id)) {
      return null;
    }
    if (typeof text !== 'string' || !text.trim()) return null;
    if (attribution != null && typeof attribution !== 'string') return null;
    seen.add(id);
    /** @type {DailyWisdomEntry} */
    const next = { id, text: text.trim() };
    if (typeof attribution === 'string' && attribution.trim()) {
      next.attribution = attribution.trim();
    }
    pool.push(next);
  }
  if (seen.size !== DAILY_WISDOM_IDS.length) return null;
  return {
    locale: have,
    pool: Object.freeze(pool.map((e) => Object.freeze({ ...e })))
  };
}

/**
 * @param {unknown} body
 * @param {string} [expectedLocale]
 * @returns {TasteQuietLineOverlay | null}
 */
export function parseQuietLineOverlay(body, expectedLocale) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const o = /** @type {Record<string, unknown>} */ (body);
  if (o.schemaVersion !== TASTE_LAYER_SCHEMA_VERSION) return null;
  const rawLocale = typeof o.locale === 'string' ? o.locale.trim() : '';
  if (!rawLocale) return null;
  const have = rawLocale === 'ja' ? 'ja' : 'en';
  if (expectedLocale) {
    const want = expectedLocale === 'ja' ? 'ja' : 'en';
    if (have !== want) return null;
  }
  const poolRaw = o.pool;
  if (!Array.isArray(poolRaw) || poolRaw.length !== QUIET_LINE_KEYS.size) {
    return null;
  }
  /** @type {QuietLineEntry[]} */
  const pool = [];
  const seen = new Set();
  for (const entry of poolRaw) {
    if (!entry || typeof entry !== 'object') return null;
    const key = /** @type {{ key?: unknown }} */ (entry).key;
    const text = /** @type {{ text?: unknown }} */ (entry).text;
    if (typeof key !== 'string' || !QUIET_LINE_KEYS.has(key) || seen.has(key)) {
      return null;
    }
    if (typeof text !== 'string' || !text.trim()) return null;
    seen.add(key);
    pool.push({ key, text: text.trim() });
  }
  if (seen.size !== QUIET_LINE_KEYS.size) return null;
  return {
    locale: have,
    pool: Object.freeze(pool.map((e) => Object.freeze({ ...e })))
  };
}

/**
 * @param {string} [raw]
 * @returns {'en' | 'ja' | 'zh'}
 */
export function confideCopyOverlayLocale(raw) {
  if (raw === 'ja') return 'ja';
  if (raw === 'zh') return 'zh';
  return 'en';
}

/**
 * @param {unknown} body
 * @param {string} [expectedLocale]
 * @returns {TasteConfideCopyOverlay | null}
 */
export function parseConfideCopyOverlay(body, expectedLocale) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const o = /** @type {Record<string, unknown>} */ (body);
  if (o.schemaVersion !== TASTE_LAYER_SCHEMA_VERSION) return null;
  const have = confideCopyOverlayLocale(
    typeof o.locale === 'string' ? o.locale.trim() : ''
  );
  if (expectedLocale) {
    if (have !== confideCopyOverlayLocale(expectedLocale)) return null;
  }
  const templatesRaw = o.templates;
  const corpusRaw = o.corpus;
  if (
    !Array.isArray(templatesRaw) ||
    templatesRaw.length !== CONFIDE_COPY_TEMPLATE_KEYS.length
  ) {
    return null;
  }
  if (
    !Array.isArray(corpusRaw) ||
    corpusRaw.length !== CONFIDE_COPY_CORPUS_IDS.length
  ) {
    return null;
  }
  /** @type {ConfideCopyTemplateEntry[]} */
  const templates = [];
  const seenKeys = new Set();
  for (const entry of templatesRaw) {
    if (!entry || typeof entry !== 'object') return null;
    const key = /** @type {{ key?: unknown }} */ (entry).key;
    const text = /** @type {{ text?: unknown }} */ (entry).text;
    if (
      typeof key !== 'string' ||
      !CONFIDE_TEMPLATE_KEY_SET.has(key) ||
      seenKeys.has(key)
    ) {
      return null;
    }
    if (typeof text !== 'string' || !text.trim()) return null;
    seenKeys.add(key);
    templates.push({ key, text: text.trim() });
  }
  if (seenKeys.size !== CONFIDE_COPY_TEMPLATE_KEYS.length) return null;

  /** @type {ConfideCopyCorpusEntry[]} */
  const corpus = [];
  const seenIds = new Set();
  for (const entry of corpusRaw) {
    if (!entry || typeof entry !== 'object') return null;
    const id = /** @type {{ id?: unknown }} */ (entry).id;
    const text = /** @type {{ text?: unknown }} */ (entry).text;
    if (
      typeof id !== 'string' ||
      !CONFIDE_CORPUS_ID_SET.has(id) ||
      seenIds.has(id)
    ) {
      return null;
    }
    if (typeof text !== 'string' || !text.trim()) return null;
    seenIds.add(id);
    corpus.push({ id, text: text.trim() });
  }
  if (seenIds.size !== CONFIDE_COPY_CORPUS_IDS.length) return null;
  return {
    locale: have,
    templates: Object.freeze(templates.map((e) => Object.freeze({ ...e }))),
    corpus: Object.freeze(corpus.map((e) => Object.freeze({ ...e })))
  };
}

/** @returns {TasteWeightOverlay | null} */
export function getTasteWeightOverlay() {
  return weightOverlay;
}

/** @returns {TasteDailyWisdomOverlay | null} */
export function getTasteDailyWisdomOverlay() {
  return dailyWisdomOverlay;
}

/** @returns {TasteQuietLineOverlay | null} */
export function getTasteQuietLineOverlay() {
  return quietLineOverlay;
}

/** @returns {TasteConfideCopyOverlay | null} */
export function getTasteConfideCopyOverlay() {
  return confideCopyOverlay;
}

/** @param {TasteWeightOverlay | null} next */
export function setTasteWeightOverlay(next) {
  weightOverlay = next;
}

/** @param {TasteDailyWisdomOverlay | null} next */
export function setTasteDailyWisdomOverlay(next) {
  dailyWisdomOverlay = next;
}

/** @param {TasteQuietLineOverlay | null} next */
export function setTasteQuietLineOverlay(next) {
  quietLineOverlay = next;
}

/** @param {TasteConfideCopyOverlay | null} next */
export function setTasteConfideCopyOverlay(next) {
  confideCopyOverlay = next;
}

/** Mark cloud weights as schemaVersion 1 OK without retaining a duplicate freeze copy. */
export function markTasteWeightCloudOk() {
  weightCloudOk = true;
}

/** Mark cloud daily-wisdom as schemaVersion 1 OK without retaining a duplicate freeze copy. */
export function markTasteDailyWisdomCloudOk() {
  dailyCloudOk = true;
}

/** Mark cloud quiet-line as schemaVersion 1 OK without retaining a duplicate freeze copy. */
export function markTasteQuietLineCloudOk() {
  quietLineCloudOk = true;
}

/** Mark cloud Confide copy as schemaVersion 1 OK without retaining a duplicate freeze copy. */
export function markTasteConfideCopyCloudOk() {
  confideCopyCloudOk = true;
}

/** @returns {boolean} */
export function isTasteWeightCloudConfirmed() {
  return weightCloudOk || Boolean(weightOverlay);
}

/** @returns {boolean} */
export function isTasteDailyWisdomCloudConfirmed() {
  return dailyCloudOk || Boolean(dailyWisdomOverlay);
}

/** @returns {boolean} */
export function isTasteQuietLineCloudConfirmed() {
  return quietLineCloudOk || Boolean(quietLineOverlay);
}

/** @returns {boolean} */
export function isTasteConfideCopyCloudConfirmed() {
  return confideCopyCloudOk || Boolean(confideCopyOverlay);
}

export function resetTasteLayerOverlayForTests() {
  weightOverlay = null;
  dailyWisdomOverlay = null;
  quietLineOverlay = null;
  confideCopyOverlay = null;
  weightCloudOk = false;
  dailyCloudOk = false;
  quietLineCloudOk = false;
  confideCopyCloudOk = false;
}

/**
 * @param {string} [locale]
 * @returns {ReadonlyArray<DailyWisdomEntry> | null}
 */
export function overlayDailyWisdomPoolForLocale(locale) {
  if (!dailyWisdomOverlay) return null;
  const want = locale === 'ja' ? 'ja' : 'en';
  if (dailyWisdomOverlay.locale !== want) return null;
  return dailyWisdomOverlay.pool;
}

/**
 * @param {string} key
 * @param {string} [locale]
 * @returns {string | null}
 */
export function overlayQuietLineTextForKey(key, locale) {
  if (!quietLineOverlay || !key) return null;
  const want = locale === 'ja' ? 'ja' : 'en';
  if (quietLineOverlay.locale !== want) return null;
  const row = quietLineOverlay.pool.find((e) => e.key === key);
  return row?.text || null;
}

/**
 * @param {string} key
 * @param {string} [locale]
 * @returns {string | null}
 */
export function overlayConfideTemplateTextForKey(key, locale) {
  if (!confideCopyOverlay || !key) return null;
  const want = confideCopyOverlayLocale(locale || getLocale());
  if (confideCopyOverlay.locale !== want) return null;
  const row = confideCopyOverlay.templates.find((e) => e.key === key);
  return row?.text || null;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {string | null}
 */
export function overlayConfideCorpusTextForId(id, locale) {
  if (!confideCopyOverlay || !id) return null;
  const want = confideCopyOverlayLocale(locale || getLocale());
  if (confideCopyOverlay.locale !== want) return null;
  const row = confideCopyOverlay.corpus.find((e) => e.id === id);
  return row?.text || null;
}

export { DAILY_WISDOM_IDS as TASTE_LAYER_DAILY_WISDOM_IDS };
export { QUIET_LINE_KEYS as TASTE_LAYER_QUIET_LINE_KEYS };
