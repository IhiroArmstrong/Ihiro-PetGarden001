/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local entitlement cache (availability-first; not anti-piracy).
 * Browser × origin via localStorage — no device UUID.
 */

export const ENTITLEMENT_CACHE_STORAGE_KEY = 'focus-tiger.entitlement-cache.v1';

/**
 * Offline verify-failure grace + post-expiry grace share this window.
 * @type {number}
 */
export const ENTITLEMENT_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @typedef {'payment' | 'preview' | 'mock' | null} EntitlementVia
 *
 * @typedef {{
 *   active: boolean,
 *   unlockedAt: string | null,
 *   itemId: string | null,
 *   via: EntitlementVia
 * }} LifetimeCache
 *
 * @typedef {{
 *   active: boolean,
 *   periodEndsAt: string | null,
 *   lastVerifiedAt: string | null,
 *   planId: string | null,
 *   via: EntitlementVia
 * }} SubscriptionCache
 *
 * @typedef {{
 *   lifetime: LifetimeCache,
 *   subscription: SubscriptionCache
 * }} EntitlementCache
 */

/**
 * @param {unknown} via
 * @returns {EntitlementVia}
 */
function normalizeVia(via) {
  if (via === 'payment' || via === 'preview' || via === 'mock') return via;
  return null;
}

/**
 * @param {unknown} raw
 * @returns {EntitlementCache}
 */
export function normalizeEntitlementCache(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      lifetime: {
        active: false,
        unlockedAt: null,
        itemId: null,
        via: null
      },
      subscription: {
        active: false,
        periodEndsAt: null,
        lastVerifiedAt: null,
        planId: null,
        via: null
      }
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const life =
    o.lifetime && typeof o.lifetime === 'object'
      ? /** @type {Record<string, unknown>} */ (o.lifetime)
      : {};
  const sub =
    o.subscription && typeof o.subscription === 'object'
      ? /** @type {Record<string, unknown>} */ (o.subscription)
      : {};
  return {
    lifetime: {
      active: Boolean(life.active),
      unlockedAt:
        typeof life.unlockedAt === 'string' && life.unlockedAt
          ? life.unlockedAt
          : null,
      itemId:
        typeof life.itemId === 'string' && life.itemId ? life.itemId : null,
      via: normalizeVia(life.via)
    },
    subscription: {
      active: Boolean(sub.active),
      periodEndsAt:
        typeof sub.periodEndsAt === 'string' && sub.periodEndsAt
          ? sub.periodEndsAt
          : null,
      lastVerifiedAt:
        typeof sub.lastVerifiedAt === 'string' && sub.lastVerifiedAt
          ? sub.lastVerifiedAt
          : null,
      planId:
        typeof sub.planId === 'string' && sub.planId ? sub.planId : null,
      via: normalizeVia(sub.via)
    }
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {EntitlementCache}
 */
export function readEntitlementCache(storage) {
  if (!storage) return normalizeEntitlementCache(null);
  try {
    const raw = storage.getItem(ENTITLEMENT_CACHE_STORAGE_KEY);
    if (!raw) return normalizeEntitlementCache(null);
    return normalizeEntitlementCache(JSON.parse(raw));
  } catch {
    return normalizeEntitlementCache(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {EntitlementCache} cache
 */
export function writeEntitlementCache(storage, cache) {
  if (!storage) return;
  try {
    const n = normalizeEntitlementCache(cache);
    storage.setItem(
      ENTITLEMENT_CACHE_STORAGE_KEY,
      JSON.stringify({
        lifetime: {
          active: Boolean(n.lifetime.active),
          unlockedAt: n.lifetime.unlockedAt,
          itemId: n.lifetime.itemId,
          via: n.lifetime.via
        },
        subscription: {
          active: Boolean(n.subscription.active),
          periodEndsAt: n.subscription.periodEndsAt,
          lastVerifiedAt: n.subscription.lastVerifiedAt,
          planId: n.subscription.planId,
          via: n.subscription.via
        }
      })
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearEntitlementCache(storage) {
  writeEntitlementCache(storage, normalizeEntitlementCache(null));
}

/**
 * Merge a partial provider payload into an existing cache.
 * Successful verify should bump `subscription.lastVerifiedAt` via opts.now.
 *
 * @param {EntitlementCache} prev
 * @param {Partial<{ lifetime: Partial<LifetimeCache>, subscription: Partial<SubscriptionCache> }> | null | undefined} patch
 * @param {object} [opts]
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.markVerified] default true when patch includes subscription fields
 * @returns {EntitlementCache}
 */
export function mergeEntitlementCache(prev, patch, opts = {}) {
  const now = opts.now || (() => new Date());
  const base = normalizeEntitlementCache(prev);
  if (!patch || typeof patch !== 'object') return base;

  const next = {
    lifetime: { ...base.lifetime },
    subscription: { ...base.subscription }
  };

  if (patch.lifetime && typeof patch.lifetime === 'object') {
    const L = patch.lifetime;
    if (typeof L.active === 'boolean') next.lifetime.active = L.active;
    if ('unlockedAt' in L) {
      next.lifetime.unlockedAt =
        typeof L.unlockedAt === 'string' && L.unlockedAt ? L.unlockedAt : null;
    }
    if ('itemId' in L) {
      next.lifetime.itemId =
        typeof L.itemId === 'string' && L.itemId ? L.itemId : null;
    }
    if ('via' in L) next.lifetime.via = normalizeVia(L.via);
  }

  if (patch.subscription && typeof patch.subscription === 'object') {
    const S = patch.subscription;
    if (typeof S.active === 'boolean') next.subscription.active = S.active;
    if ('periodEndsAt' in S) {
      next.subscription.periodEndsAt =
        typeof S.periodEndsAt === 'string' && S.periodEndsAt
          ? S.periodEndsAt
          : null;
    }
    if ('planId' in S) {
      next.subscription.planId =
        typeof S.planId === 'string' && S.planId ? S.planId : null;
    }
    if ('via' in S) next.subscription.via = normalizeVia(S.via);
    if ('lastVerifiedAt' in S) {
      next.subscription.lastVerifiedAt =
        typeof S.lastVerifiedAt === 'string' && S.lastVerifiedAt
          ? S.lastVerifiedAt
          : null;
    } else if (opts.markVerified !== false) {
      next.subscription.lastVerifiedAt = now().toISOString();
    }
  }

  return normalizeEntitlementCache(next);
}
