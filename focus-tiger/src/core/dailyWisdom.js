/**
 * Resolve today’s Yin daily-wisdom line (free; not Quiet Line / not Sanctuary).
 * Entitlement: `content.daily-wisdom` (free / ongoing) — registry SSOT; check is posture, not a paywall.
 */

import {
  findDailyWisdomAttribution,
  findDailyWisdomText,
  getDailyWisdomPool
} from '../content/daily-wisdom/index.js';
import { getLocale } from '../locales/i18n.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { isEntitled } from './entitlement/entitlementGate.js';
import { DailyWisdomStore } from './DailyWisdomStore.js';

/** @type {import('./entitlement/entitlementRegistry.js').FeatureKey} */
export const DAILY_WISDOM_FEATURE_KEY = 'content.daily-wisdom';

/**
 * @param {{
 *   date?: Date,
 *   locale?: string,
 *   storage?: Storage | null,
 *   store?: DailyWisdomStore,
 *   pool?: readonly { id: string, text?: string, attribution?: string }[],
 *   skipEntitlementCheck?: boolean
 * }} [opts]
 * @returns {{
 *   dateKey: string,
 *   id: string,
 *   text: string,
 *   attribution: string,
 *   locale: string
 * } | null}
 */
export function resolveTodayWisdom(opts = {}) {
  const storage =
    opts.storage === undefined
      ? typeof globalThis !== 'undefined'
        ? globalThis.localStorage
        : null
      : opts.storage;

  if (
    !opts.skipEntitlementCheck &&
    !isEntitled(DAILY_WISDOM_FEATURE_KEY, { storage })
  ) {
    return null;
  }

  const dateKey = getLocalDateKey(opts.date ?? new Date());
  const locale = opts.locale || getLocale() || 'en';
  const pool = opts.pool ?? getDailyWisdomPool(locale);
  const store =
    opts.store ??
    new DailyWisdomStore({
      storage
    });

  const id = store.resolveQuoteId(dateKey, pool);
  if (!id) return null;

  const fromPool = pool.find((e) => e.id === id);
  const text =
    (fromPool && typeof fromPool.text === 'string' && fromPool.text) ||
    findDailyWisdomText(id, locale);
  const attribution =
    (fromPool &&
      typeof fromPool.attribution === 'string' &&
      fromPool.attribution) ||
    findDailyWisdomAttribution(id, locale) ||
    '';

  return { dateKey, id, text, attribution, locale };
}

export {
  DAILY_WISDOM_RECENT_WINDOW,
  DAILY_WISDOM_STORAGE_KEY,
  DailyWisdomStore,
  hashDateKey,
  pickDailyWisdomId,
  selectWisdomId
} from './DailyWisdomStore.js';
