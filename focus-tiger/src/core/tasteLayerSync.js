/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Non-blocking taste-layer fetch. Failure / timeout / unknown schema → local tables.
 * Never gates Sit / Rise.
 *
 * Overlay-on Arrival CapCut flash (RB-20260820-L330): do not race sprite preload;
 * do not retain a freeze-identical copy; defer retaining a *different* table while
 * Arrival / Honesty / Reflection chrome is open.
 */

import { DAILY_WISDOM_EN, DAILY_WISDOM_JA } from '../content/daily-wisdom/index.js';
import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { getLocale, tInLocale } from '../locales/i18n.js';
import {
  HONESTY_LONG_MIN_MINUTES,
  LIGHT_COMPLETE_POOL,
  RISE_INTERRUPT_POOL,
  WELCOME_POOL
} from './sceneAnimationDispatcher.js';
import {
  getTasteWeightOverlay,
  isTasteDailyWisdomCloudConfirmed,
  isTasteQuietLineCloudConfirmed,
  isTasteWeightCloudConfirmed,
  markTasteDailyWisdomCloudOk,
  markTasteQuietLineCloudOk,
  markTasteWeightCloudOk,
  parseDailyMessageOverlay,
  parseEmotionWeightOverlay,
  parseQuietLineOverlay,
  setTasteDailyWisdomOverlay,
  setTasteQuietLineOverlay,
  setTasteWeightOverlay,
  TASTE_LAYER_SCHEMA_VERSION
} from './tasteLayerOverlay.js';

export const TASTE_LAYER_FETCH_TIMEOUT_MS = 2500;
export const TASTE_LAYER_QUERY_PARAM = 'tasteLayer';
/** How long to wait for Arrival/Honesty chrome to close before fetching. Sit never awaits this. */
export const TASTE_LAYER_WAIT_APPLY_MS = 20000;

/**
 * @param {string} [search]
 * @returns {'1' | '0' | null}
 */
export function readTasteLayerQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(TASTE_LAYER_QUERY_PARAM);
    if (value === '1' || value === 'true') return '1';
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, cloudBaseUrl?: string }} [opts]
 * @returns {boolean}
 */
export function isTasteLayerFetchEnabled({
  search = '',
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  const query = readTasteLayerQueryFlag(search);
  if (query === '0') return false;
  if (query === '1') return Boolean(cloudBaseUrl);
  return Boolean(cloudBaseUrl);
}

/**
 * @param {Promise<unknown>} promise
 * @param {number} ms
 * @returns {Promise<unknown>}
 */
function withTimeout(promise, ms) {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = /** @type {any} */ (
      setTimeout(() => reject(new Error('taste_layer_timeout')), ms)
    );
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * @param {ReadonlyArray<{ key: string, weight: number }>} a
 * @param {ReadonlyArray<{ key: string, weight: number }>} b
 */
export function tasteWeightPoolsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  const map = new Map(b.map((e) => [e.key, e.weight]));
  return a.every((e) => map.get(e.key) === e.weight);
}

/**
 * @param {import('./tasteLayerOverlay.js').TasteWeightOverlay} parsed
 */
export function tasteWeightOverlayMatchesLocalFreeze(parsed) {
  if (!parsed) return false;
  return (
    parsed.honestyLongMinMinutes === HONESTY_LONG_MIN_MINUTES &&
    tasteWeightPoolsEqual(parsed.riseInterruptPool, RISE_INTERRUPT_POOL) &&
    tasteWeightPoolsEqual(parsed.welcomePool, WELCOME_POOL) &&
    tasteWeightPoolsEqual(parsed.lightCompletePool, LIGHT_COMPLETE_POOL)
  );
}

/**
 * @param {import('./tasteLayerOverlay.js').TasteDailyWisdomOverlay} parsed
 * @param {string} [locale]
 */
export function tasteDailyOverlayMatchesLocalFreeze(parsed, locale) {
  if (!parsed) return false;
  const want = locale === 'ja' || parsed.locale === 'ja' ? 'ja' : 'en';
  if (parsed.locale !== want) return false;
  const local = want === 'ja' ? DAILY_WISDOM_JA : DAILY_WISDOM_EN;
  if (parsed.pool.length !== local.length) return false;
  const byId = new Map(local.map((e) => [e.id, e]));
  return parsed.pool.every((e) => {
    const row = byId.get(e.id);
    if (!row) return false;
    const localText = String(row.text || '').trim();
    const localAttr = String(row.attribution || '').trim();
    const nextAttr = String(e.attribution || '').trim();
    return localText === e.text && localAttr === nextAttr;
  });
}

/**
 * @param {import('./tasteLayerOverlay.js').TasteQuietLineOverlay} parsed
 * @param {string} [locale]
 */
export function tasteQuietLineOverlayMatchesLocalFreeze(parsed, locale) {
  if (!parsed) return false;
  const want = locale === 'ja' || parsed.locale === 'ja' ? 'ja' : 'en';
  if (parsed.locale !== want) return false;
  return parsed.pool.every((e) => {
    const localText = String(tInLocale(want, e.key) || '').trim();
    return localText === e.text;
  });
}

/** @type {import('./tasteLayerOverlay.js').TasteWeightOverlay | null} */
let pendingWeight = null;
/** @type {import('./tasteLayerOverlay.js').TasteDailyWisdomOverlay | null} */
let pendingDaily = null;
/** @type {import('./tasteLayerOverlay.js').TasteQuietLineOverlay | null} */
let pendingQuietLine = null;
/** @type {ReturnType<typeof setTimeout> | 0} */
let flushTimer = 0;

/**
 * @param {() => boolean} [canApply]
 * @returns {boolean} whether anything was applied
 */
export function flushPendingTasteLayerApply(canApply = () => true) {
  if (!canApply()) return false;
  let applied = false;
  if (pendingWeight) {
    setTasteWeightOverlay(pendingWeight);
    pendingWeight = null;
    applied = true;
  }
  if (pendingDaily) {
    setTasteDailyWisdomOverlay(pendingDaily);
    pendingDaily = null;
    applied = true;
  }
  if (pendingQuietLine) {
    setTasteQuietLineOverlay(pendingQuietLine);
    pendingQuietLine = null;
    applied = true;
  }
  return applied;
}

/**
 * @param {() => boolean} canApply
 */
function schedulePendingFlush(canApply) {
  if (flushTimer) return;
  const tick = () => {
    flushTimer = 0;
    if (!pendingWeight && !pendingDaily && !pendingQuietLine) return;
    if (canApply()) {
      flushPendingTasteLayerApply(canApply);
      return;
    }
    flushTimer = setTimeout(tick, 400);
  };
  flushTimer = setTimeout(tick, 400);
}

/**
 * @param {() => boolean} canApply
 * @param {number} waitApplyMs
 */
async function waitUntilCanApply(canApply, waitApplyMs) {
  if (typeof canApply !== 'function' || canApply()) return;
  const ms = Math.max(0, Number(waitApplyMs) || 0);
  if (ms === 0) return;
  const deadline = Date.now() + ms;
  while (!canApply() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

/**
 * @returns {{
 *   weights: boolean,
 *   dailyWisdom: boolean,
 *   quietLine: boolean,
 *   honestyLongMinMinutes: number | null
 * }}
 */
export function getTasteLayerStatus() {
  const weights = isTasteWeightCloudConfirmed();
  const dailyWisdom = isTasteDailyWisdomCloudConfirmed();
  const quietLine = isTasteQuietLineCloudConfirmed();
  return {
    weights,
    dailyWisdom,
    quietLine,
    honestyLongMinMinutes:
      getTasteWeightOverlay()?.honestyLongMinMinutes ??
      (weights ? HONESTY_LONG_MIN_MINUTES : null)
  };
}

export function resetTasteLayerSyncForTests() {
  pendingWeight = null;
  pendingDaily = null;
  pendingQuietLine = null;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = 0;
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {string} [opts.locale]
 * @param {string} [opts.localDate]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {number} [opts.timeoutMs]
 * @param {string} [opts.cloudBaseUrl]
 * @param {() => boolean} [opts.canApply]
 * @param {number} [opts.waitApplyMs]
 * @returns {Promise<{ weights: boolean, dailyWisdom: boolean, quietLine: boolean }>}
 */
export async function prefetchTasteLayer(opts = {}) {
  const search =
    opts.search ??
    (typeof location !== 'undefined' ? String(location.search || '') : '');
  const cloudBaseUrl = opts.cloudBaseUrl ?? getCloudApiBaseUrl();
  if (!isTasteLayerFetchEnabled({ search, cloudBaseUrl })) {
    return { weights: false, dailyWisdom: false, quietLine: false };
  }

  const canApply = opts.canApply ?? (() => true);
  await waitUntilCanApply(canApply, opts.waitApplyMs ?? TASTE_LAYER_WAIT_APPLY_MS);

  const postJson = opts.postJson ?? postCloudJson;
  const timeoutMs = opts.timeoutMs ?? TASTE_LAYER_FETCH_TIMEOUT_MS;
  const locale = opts.locale || getLocale() || 'en';
  const localDate = opts.localDate || getLocalDateKey(new Date());

  const [weightResult, dailyResult, quietLineResult] = await Promise.allSettled([
    withTimeout(
      postJson('/api/emotion-weight', {
        body: JSON.stringify({
          emotionKey: 'Idle',
          sessionPhase: 'arrive',
          clientSchema: TASTE_LAYER_SCHEMA_VERSION
        })
      }),
      timeoutMs
    ),
    withTimeout(
      postJson('/api/daily-message', {
        body: JSON.stringify({ locale, localDate })
      }),
      timeoutMs
    ),
    withTimeout(
      postJson('/api/quiet-line', {
        body: JSON.stringify({ locale, localDate })
      }),
      timeoutMs
    )
  ]);

  let weights = false;
  let dailyWisdom = false;
  let quietLine = false;

  if (weightResult.status === 'fulfilled') {
    const parsed = parseEmotionWeightOverlay(weightResult.value);
    if (parsed) {
      weights = true;
      if (tasteWeightOverlayMatchesLocalFreeze(parsed)) {
        markTasteWeightCloudOk();
      } else if (canApply()) {
        setTasteWeightOverlay(parsed);
        markTasteWeightCloudOk();
      } else {
        pendingWeight = parsed;
        schedulePendingFlush(canApply);
      }
    }
  }

  if (dailyResult.status === 'fulfilled') {
    const parsed = parseDailyMessageOverlay(dailyResult.value, locale);
    if (parsed) {
      dailyWisdom = true;
      if (tasteDailyOverlayMatchesLocalFreeze(parsed, locale)) {
        markTasteDailyWisdomCloudOk();
      } else if (canApply()) {
        setTasteDailyWisdomOverlay(parsed);
        markTasteDailyWisdomCloudOk();
      } else {
        pendingDaily = parsed;
        schedulePendingFlush(canApply);
      }
    }
  }

  if (quietLineResult.status === 'fulfilled') {
    const parsed = parseQuietLineOverlay(quietLineResult.value, locale);
    if (parsed) {
      quietLine = true;
      if (tasteQuietLineOverlayMatchesLocalFreeze(parsed, locale)) {
        markTasteQuietLineCloudOk();
      } else if (canApply()) {
        setTasteQuietLineOverlay(parsed);
        markTasteQuietLineCloudOk();
      } else {
        pendingQuietLine = parsed;
        schedulePendingFlush(canApply);
      }
    }
  }

  return { weights, dailyWisdom, quietLine };
}
