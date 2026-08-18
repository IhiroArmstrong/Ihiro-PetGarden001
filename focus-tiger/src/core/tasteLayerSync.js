/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Non-blocking taste-layer fetch. Failure / timeout / unknown schema → local tables.
 * Never gates Sit / Rise.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { getLocale } from '../locales/i18n.js';
import {
  parseDailyMessageOverlay,
  parseEmotionWeightOverlay,
  setTasteDailyWisdomOverlay,
  setTasteWeightOverlay,
  TASTE_LAYER_SCHEMA_VERSION
} from './tasteLayerOverlay.js';

export const TASTE_LAYER_FETCH_TIMEOUT_MS = 2500;
export const TASTE_LAYER_QUERY_PARAM = 'tasteLayer';

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
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {string} [opts.locale]
 * @param {string} [opts.localDate]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {number} [opts.timeoutMs]
 * @param {string} [opts.cloudBaseUrl]
 * @returns {Promise<{ weights: boolean, dailyWisdom: boolean }>}
 */
export async function prefetchTasteLayer(opts = {}) {
  const search =
    opts.search ??
    (typeof location !== 'undefined' ? String(location.search || '') : '');
  const cloudBaseUrl = opts.cloudBaseUrl ?? getCloudApiBaseUrl();
  if (!isTasteLayerFetchEnabled({ search, cloudBaseUrl })) {
    return { weights: false, dailyWisdom: false };
  }

  const postJson = opts.postJson ?? postCloudJson;
  const timeoutMs = opts.timeoutMs ?? TASTE_LAYER_FETCH_TIMEOUT_MS;
  const locale = opts.locale || getLocale() || 'en';
  const localDate = opts.localDate || getLocalDateKey(new Date());

  const [weightResult, dailyResult] = await Promise.allSettled([
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
    )
  ]);

  let weights = false;
  let dailyWisdom = false;

  if (weightResult.status === 'fulfilled') {
    const parsed = parseEmotionWeightOverlay(weightResult.value);
    if (parsed) {
      setTasteWeightOverlay(parsed);
      weights = true;
    }
  }

  if (dailyResult.status === 'fulfilled') {
    const parsed = parseDailyMessageOverlay(dailyResult.value, locale);
    if (parsed) {
      setTasteDailyWisdomOverlay(parsed);
      dailyWisdom = true;
    }
  }

  return { weights, dailyWisdom };
}
