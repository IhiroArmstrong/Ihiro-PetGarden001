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

export const TASTE_LAYER_SCHEMA_VERSION = 1;

const RISE_KEYS = new Set(['riseStretchCasual', 'teaDrinking', 'bookReading']);
const WELCOME_KEYS = new Set(['magicBookReading', 'nodGreeting']);
const LIGHT_KEYS = new Set([
  'sessionComplete',
  'mindfulAcknowledge',
  'parrotEarVisit'
]);
const DAILY_WISDOM_IDS = Object.freeze(DAILY_WISDOM_EN.map((e) => e.id));

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

/** @type {TasteWeightOverlay | null} */
let weightOverlay = null;
/** @type {TasteDailyWisdomOverlay | null} */
let dailyWisdomOverlay = null;
/** Cloud v1 validated even when we skip retaining a freeze-identical copy. */
let weightCloudOk = false;
let dailyCloudOk = false;

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

/** @returns {TasteWeightOverlay | null} */
export function getTasteWeightOverlay() {
  return weightOverlay;
}

/** @returns {TasteDailyWisdomOverlay | null} */
export function getTasteDailyWisdomOverlay() {
  return dailyWisdomOverlay;
}

/** @param {TasteWeightOverlay | null} next */
export function setTasteWeightOverlay(next) {
  weightOverlay = next;
}

/** @param {TasteDailyWisdomOverlay | null} next */
export function setTasteDailyWisdomOverlay(next) {
  dailyWisdomOverlay = next;
}

/** Mark cloud weights as schemaVersion 1 OK without retaining a duplicate freeze copy. */
export function markTasteWeightCloudOk() {
  weightCloudOk = true;
}

/** Mark cloud daily-wisdom as schemaVersion 1 OK without retaining a duplicate freeze copy. */
export function markTasteDailyWisdomCloudOk() {
  dailyCloudOk = true;
}

/** @returns {boolean} */
export function isTasteWeightCloudConfirmed() {
  return weightCloudOk || Boolean(weightOverlay);
}

/** @returns {boolean} */
export function isTasteDailyWisdomCloudConfirmed() {
  return dailyCloudOk || Boolean(dailyWisdomOverlay);
}

export function resetTasteLayerOverlayForTests() {
  weightOverlay = null;
  dailyWisdomOverlay = null;
  weightCloudOk = false;
  dailyCloudOk = false;
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

export { DAILY_WISDOM_IDS as TASTE_LAYER_DAILY_WISDOM_IDS };
