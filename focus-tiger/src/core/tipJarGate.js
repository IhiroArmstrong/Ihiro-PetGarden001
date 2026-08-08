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

/** Quiet local trail of tip moments (Tea Log). */
export const TIP_LOG_MAX_ENTRIES = 30;

/**
 * @typedef {{ at: string, n: number }} TipLogEntry
 * @typedef {{
 *   tipped: boolean,
 *   tipCount: number,
 *   lastTippedAt: string | null,
 *   email: string | null,
 *   source: 'checkout-return' | 'email-restore' | 'manual' | null,
 *   badgeIds: string[],
 *   tipLog: TipLogEntry[]
 * }} TipJarStatus
 */

/**
 * @param {unknown} raw
 * @returns {TipLogEntry[]}
 */
export function normalizeTipLog(raw) {
  if (!Array.isArray(raw)) return [];
  /** @type {TipLogEntry[]} */
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = /** @type {Record<string, unknown>} */ (row);
    const at = typeof o.at === 'string' && o.at ? o.at : null;
    const n = Number(o.n);
    if (!at || !Number.isFinite(n) || n < 1) continue;
    out.push({ at, n: Math.floor(n) });
  }
  return out.slice(-TIP_LOG_MAX_ENTRIES);
}

/**
 * Local calendar date YYYY-MM-DD from an ISO timestamp.
 * @param {string} iso
 * @returns {string}
 */
export function tipLogDateKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || '').slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
      badgeIds: [],
      tipLog: []
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
  const count =
    Number.isFinite(tipCount) && tipCount > 0 ? Math.floor(tipCount) : 0;
  let tipLog = normalizeTipLog(o.tipLog);
  if (
    Boolean(o.tipped) &&
    tipLog.length === 0 &&
    typeof o.lastTippedAt === 'string' &&
    o.lastTippedAt
  ) {
    tipLog = [{ at: o.lastTippedAt, n: Math.max(1, count) }];
  }
  return {
    tipped: Boolean(o.tipped),
    tipCount: count,
    lastTippedAt:
      typeof o.lastTippedAt === 'string' && o.lastTippedAt
        ? o.lastTippedAt
        : null,
    email: typeof o.email === 'string' && o.email ? o.email : null,
    source,
    badgeIds: normalizeTipBadgeIds(o.badgeIds),
    tipLog
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
        badgeIds: normalized.badgeIds,
        tipLog: normalized.tipLog
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
 * Increments tipCount + awards kindness badges + appends Tea Log.
 * NOT for Sanctuary content unlock.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {string | null} [opts.email]
 * @param {() => Date} [opts.now]
 * @returns {{ newlyAddedIds: string[], tipCount: number, isRepeatTip: boolean }}
 */
export function markTipFromCheckoutReturn(
  storage,
  { email = null, now = () => new Date() } = {}
) {
  const prev = readTipStatus(storage);
  const at = now().toISOString();
  const isRepeatTip = prev.tipCount > 0;
  const tipCount = Math.max(0, prev.tipCount) + 1;
  const award = planTipBadgeAward(storage, prev.badgeIds);
  const tipLog = normalizeTipLog([...prev.tipLog, { at, n: tipCount }]);
  writeTipStatus(storage, {
    tipped: true,
    tipCount,
    lastTippedAt: at,
    email: email || prev.email,
    source: 'checkout-return',
    badgeIds: award.badgeIds,
    tipLog
  });
  return { newlyAddedIds: award.newlyAddedIds, tipCount, isRepeatTip };
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
 * @returns {{ newlyAddedIds: string[], tipCount: number, isRepeatTip: boolean }}
 */
export function markTipFromEmailRestore(
  storage,
  { email, tipCount = 1, lastTippedAt = null, now = () => new Date() }
) {
  const prev = readTipStatus(storage);
  const at = lastTippedAt || now().toISOString();
  const count = Number(tipCount);
  const nextCount =
    Number.isFinite(count) && count > 0 ? Math.floor(count) : 1;
  const isRepeatTip = prev.tipCount > 0 || nextCount > 1;
  const award = planTipBadgeAward(storage, prev.badgeIds);
  let tipLog = prev.tipLog;
  if (tipLog.length === 0) {
    tipLog = [{ at, n: nextCount }];
  }
  writeTipStatus(storage, {
    tipped: true,
    tipCount: nextCount,
    lastTippedAt: at,
    email: String(email || '').trim().toLowerCase() || null,
    source: 'email-restore',
    badgeIds: award.badgeIds,
    tipLog
  });
  return {
    newlyAddedIds: award.newlyAddedIds,
    tipCount: nextCount,
    isRepeatTip
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearTipStatus(storage) {
  writeTipStatus(storage, normalizeTipStatus(null));
}

/**
 * Backfill badges for devices that tipped before badgeIds existed.
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
 * @returns {{ consumed: boolean, outcome: 'success' | 'cancel' | null, newlyAddedIds: string[], tipCount: number, isRepeatTip: boolean }}
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
    return {
      consumed: false,
      outcome: null,
      newlyAddedIds: [],
      tipCount: 0,
      isRepeatTip: false
    };
  }

  const outcome =
    flag === 'cancel' ? 'cancel' : /** @type {'success'} */ ('success');

  /** @type {string[]} */
  let newlyAddedIds = [];
  let tipCount = 0;
  let isRepeatTip = false;
  if (outcome === 'success') {
    const marked = markTipFromCheckoutReturn(storage, { now });
    newlyAddedIds = marked.newlyAddedIds;
    tipCount = marked.tipCount;
    isRepeatTip = marked.isRepeatTip;
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

  return { consumed: true, outcome, newlyAddedIds, tipCount, isRepeatTip };
}

/** Re-export shared Cloud helpers (no tip state). */
export { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
