/**
 * Buy Yin a Tea · Tip Jar · local tip status (badge / gratitude only).
 *
 * ---------------------------------------------------------------------------
 * VERIFICATION STRENGTH (read before extending)
 * ---------------------------------------------------------------------------
 * Badge-class only — no substantive content unlock.
 * Optimistic `?tip=1` is acceptable for tip/badge recognition (same restraint
 * class as flowerWelcomeGate). Do NOT use this gate for Sanctuary / paid content.
 *
 * ZERO COUPLING (Brief §2.6 · code-review gate):
 * B-track Lifetime entitlement / content unlock paths must NOT import or read
 * this module's tip state. No "prior tip ⇒ discount / bonus unlock" without a
 * separate Brief.
 * ---------------------------------------------------------------------------
 */

import { normalizeTipBadgeIds, planTipBadgeAward } from './tipKindnessBadges.js';

export const TIP_JAR_STORAGE_KEY = 'focus-tiger.tip-jar.v1';

/** Display price placeholder (USD). Stripe Price ID lives on the Worker. */
export const TIP_JAR_PRICE_USD = '9.99';

/**
 * @typedef {{
 *   tipped: boolean,
 *   tipCount: number,
 *   lastTippedAt: string | null,
 *   email: string | null,
 *   source: 'checkout-return' | 'email-restore' | 'manual' | null,
 *   badgeIds: string[]
 * }} TipJarStatus
 */

/**
 * @param {unknown} raw
 * @returns {TipJarStatus}
 */
export function normalizeTipStatus(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      tipped: false,
      tipCount: 0,
      lastTippedAt: null,
      email: null,
      source: null,
      badgeIds: []
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const source =
    o.source === 'checkout-return' ||
    o.source === 'email-restore' ||
    o.source === 'manual'
      ? o.source
      : null;
  const tipCount = Number(o.tipCount);
  return {
    tipped: Boolean(o.tipped),
    tipCount: Number.isFinite(tipCount) && tipCount > 0 ? Math.floor(tipCount) : 0,
    lastTippedAt:
      typeof o.lastTippedAt === 'string' && o.lastTippedAt
        ? o.lastTippedAt
        : null,
    email: typeof o.email === 'string' && o.email ? o.email : null,
    source,
    badgeIds: normalizeTipBadgeIds(o.badgeIds)
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {TipJarStatus}
 */
export function readTipStatus(storage) {
  if (!storage) return normalizeTipStatus(null);
  try {
    const raw = storage.getItem(TIP_JAR_STORAGE_KEY);
    if (!raw) return normalizeTipStatus(null);
    return normalizeTipStatus(JSON.parse(raw));
  } catch {
    return normalizeTipStatus(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {TipJarStatus} status
 */
export function writeTipStatus(storage, status) {
  if (!storage) return;
  try {
    const normalized = normalizeTipStatus(status);
    storage.setItem(
      TIP_JAR_STORAGE_KEY,
      JSON.stringify({
        tipped: Boolean(normalized.tipped),
        tipCount: normalized.tipCount,
        lastTippedAt: normalized.lastTippedAt,
        email: normalized.email,
        source: normalized.source,
        badgeIds: normalized.badgeIds
      })
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @returns {boolean}
 */
export function hasTipped({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  return readTipStatus(storage).tipped === true;
}

/**
 * Optimistic mark after Stripe success_url (`?tip=1`).
 * Increments tipCount + awards kindness badges from practice level.
 * NOT for Sanctuary content unlock.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {string | null} [opts.email]
 * @param {() => Date} [opts.now]
 * @returns {{ newlyAddedIds: string[] }}
 */
export function markTipFromCheckoutReturn(
  storage,
  { email = null, now = () => new Date() } = {}
) {
  const prev = readTipStatus(storage);
  const at = now().toISOString();
  const award = planTipBadgeAward(storage, prev.badgeIds);
  writeTipStatus(storage, {
    tipped: true,
    tipCount: Math.max(0, prev.tipCount) + 1,
    lastTippedAt: at,
    email: email || prev.email,
    source: 'checkout-return',
    badgeIds: award.badgeIds
  });
  return { newlyAddedIds: award.newlyAddedIds };
}

/**
 * After POST /api/verify-tip hits.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} opts
 * @param {string} opts.email
 * @param {number} [opts.tipCount]
 * @param {string | null} [opts.lastTippedAt]
 * @param {() => Date} [opts.now]
 * @returns {{ newlyAddedIds: string[] }}
 */
export function markTipFromEmailRestore(
  storage,
  { email, tipCount = 1, lastTippedAt = null, now = () => new Date() }
) {
  const prev = readTipStatus(storage);
  const at = lastTippedAt || now().toISOString();
  const count = Number(tipCount);
  const award = planTipBadgeAward(storage, prev.badgeIds);
  writeTipStatus(storage, {
    tipped: true,
    tipCount: Number.isFinite(count) && count > 0 ? Math.floor(count) : 1,
    lastTippedAt: at,
    email: String(email || '').trim().toLowerCase() || null,
    source: 'email-restore',
    badgeIds: award.badgeIds
  });
  return { newlyAddedIds: award.newlyAddedIds };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearTipStatus(storage) {
  writeTipStatus(storage, normalizeTipStatus(null));
}

/**
 * Backfill badges for devices that tipped before badgeIds existed.
 * Does nothing if not tipped, or if badges already present.
 *
 * @param {Storage | null | undefined} storage
 * @returns {{ newlyAddedIds: string[] }}
 */
export function ensureTipBadgesAwarded(storage) {
  const prev = readTipStatus(storage);
  if (!prev.tipped) return { newlyAddedIds: [] };
  if (prev.badgeIds.length > 0) return { newlyAddedIds: [] };
  const award = planTipBadgeAward(storage, []);
  writeTipStatus(storage, {
    ...prev,
    badgeIds: award.badgeIds
  });
  return { newlyAddedIds: award.newlyAddedIds };
}

/**
 * Consume `?tip=1` / `tip=cancel` (also accepts legacy `?tea=`).
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 * @param {(url: string) => void} [opts.replaceUrl]
 * @param {() => Date} [opts.now]
 * @returns {{ consumed: boolean, outcome: 'success' | 'cancel' | null, newlyAddedIds: string[] }}
 */
export function consumeTipReturnQuery({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  search = typeof location !== 'undefined' ? location.search : '',
  replaceUrl = (next) => {
    if (typeof history !== 'undefined' && typeof location !== 'undefined') {
      history.replaceState(null, '', next);
    }
  },
  now = () => new Date()
} = {}) {
  const params = new URLSearchParams(
    String(search || '').startsWith('?')
      ? String(search).slice(1)
      : String(search || '')
  );
  const flag = params.get('tip') ?? params.get('tea');
  if (flag !== '1' && flag !== 'success' && flag !== 'cancel') {
    return { consumed: false, outcome: null, newlyAddedIds: [] };
  }

  const outcome =
    flag === 'cancel' ? 'cancel' : /** @type {'success'} */ ('success');

  /** @type {string[]} */
  let newlyAddedIds = [];
  if (outcome === 'success') {
    newlyAddedIds = markTipFromCheckoutReturn(storage, { now }).newlyAddedIds;
  }

  params.delete('tip');
  params.delete('tea');
  const qs = params.toString();
  const path =
    typeof location !== 'undefined'
      ? `${location.pathname}${qs ? `?${qs}` : ''}${location.hash || ''}`
      : qs
        ? `?${qs}`
        : '/';
  try {
    replaceUrl(path);
  } catch {
    // ignore
  }

  return { consumed: true, outcome, newlyAddedIds };
}

/** Re-export shared Cloud helpers (no tip state). */
export { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
