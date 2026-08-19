/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unified entitlement gate — foundation for paid features.
 *
 * - Lifetime ∪ subscription **mutually** cover any paid tier (global default).
 *   B-track only — not `companion.addon.lifetime` (see companionAddonSku.js).
 * - Sanctuary: thin read of `isSanctuaryUnlocked()` as a lifetime.active signal
 *   (does not migrate or write sanctuaryEntitlementGate).
 * - Tip jar: zero coupling (must not import tipJarGate).
 * - Subscribe style matches i18n `onLocaleChange` (returns unsubscribe).
 */

import { isSanctuaryUnlocked } from '../sanctuaryEntitlementGate.js';
import {
  getFeatureEntry,
  isKnownFeatureKey
} from './entitlementRegistry.js';
import {
  claimOwned as claimOwnedInStore,
  hasOwned as hasOwnedInStore
} from './entitlementOwnership.js';
import { getEntitlementProvider } from './entitlementProvider.js';
import {
  ENTITLEMENT_GRACE_MS,
  mergeEntitlementCache,
  normalizeEntitlementCache,
  readEntitlementCache,
  writeEntitlementCache
} from './entitlementState.js';

export {
  FEATURE_CATALOG,
  getFeatureEntry,
  isKnownFeatureKey,
  listFeatureKeys
} from './entitlementRegistry.js';
export {
  ENTITLEMENT_CACHE_STORAGE_KEY,
  ENTITLEMENT_GRACE_MS,
  clearEntitlementCache,
  normalizeEntitlementCache,
  readEntitlementCache,
  writeEntitlementCache
} from './entitlementState.js';
export {
  ENTITLEMENT_OWNERSHIP_STORAGE_KEY,
  clearOwnershipState,
  claimOwned,
  hasOwned,
  readOwnershipState
} from './entitlementOwnership.js';
export {
  getEntitlementProvider,
  setEntitlementProvider
} from './entitlementProvider.js';
export {
  ENTITLEMENT_MOCK_STORAGE_KEY,
  createMockEntitlementProvider,
  parseEntitlementMockSearch,
  readEntitlementMockConfig,
  writeEntitlementMockConfig
} from './mockEntitlementProvider.js';

/**
 * @typedef {import('./entitlementState.js').EntitlementCache} EntitlementCache
 * @typedef {'free' | 'lifetime' | 'subscription'} EntitlementSource
 * @typedef {'free' | 'lifetime' | 'subscription' | 'owned' | 'denied'} FeatureAccessVia
 *
 * @typedef {{
 *   offline: boolean,
 *   postExpiry: boolean
 * }} EntitlementGraceFlags
 *
 * @typedef {{
 *   source: EntitlementSource,
 *   lifetimeActive: boolean,
 *   subscription: {
 *     entitled: boolean,
 *     periodEndsAt: string | null,
 *     grace: EntitlementGraceFlags,
 *     lastVerifiedAt: string | null
 *   }
 * }} EntitlementStateView
 *
 * @typedef {{
 *   allowed: boolean,
 *   via: FeatureAccessVia,
 *   featureType: 'persistent' | 'ongoing' | null,
 *   entitlement: EntitlementStateView
 * }} FeatureAccess
 */

/** @type {Set<(state: EntitlementStateView) => void>} */
const entitlementListeners = new Set();

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @returns {boolean}
 */
export function resolveLifetimeActive({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  const cache = readEntitlementCache(storage);
  if (cache.lifetime.active) return true;
  // Thin adapter: Sanctuary Lifetime unlock is a lifetime signal only.
  return isSanctuaryUnlocked({ storage }) === true;
}

/**
 * Subscription entitled? Includes post-expiry grace + offline/stale-verify grace.
 *
 * @param {EntitlementCache} cache
 * @param {Date | number} [now]
 * @returns {{ entitled: boolean, grace: EntitlementGraceFlags }}
 */
export function resolveSubscriptionEntitled(cache, now = Date.now()) {
  const n = normalizeEntitlementCache(cache);
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  const grace = { offline: false, postExpiry: false };

  if (Number.isNaN(nowMs)) {
    return { entitled: false, grace };
  }

  if (n.subscription.periodEndsAt) {
    const ends = Date.parse(n.subscription.periodEndsAt);
    if (!Number.isNaN(ends)) {
      if (nowMs < ends) {
        return { entitled: true, grace };
      }
      if (nowMs < ends + ENTITLEMENT_GRACE_MS) {
        return { entitled: true, grace: { offline: false, postExpiry: true } };
      }
    }
  }

  // Offline / verify-failure: trust last known active within grace of lastVerifiedAt.
  if (n.subscription.active && n.subscription.lastVerifiedAt) {
    const verified = Date.parse(n.subscription.lastVerifiedAt);
    if (
      !Number.isNaN(verified) &&
      nowMs < verified + ENTITLEMENT_GRACE_MS
    ) {
      return { entitled: true, grace: { offline: true, postExpiry: false } };
    }
  }

  return { entitled: false, grace };
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {EntitlementStateView}
 */
export function getEntitlementState({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date()
} = {}) {
  const cache = readEntitlementCache(storage);
  const lifetimeActive = resolveLifetimeActive({ storage });
  const sub = resolveSubscriptionEntitled(cache, now());
  /** @type {EntitlementSource} */
  let source = 'free';
  if (lifetimeActive) source = 'lifetime';
  else if (sub.entitled) source = 'subscription';

  return {
    source,
    lifetimeActive,
    subscription: {
      entitled: sub.entitled,
      periodEndsAt: cache.subscription.periodEndsAt,
      grace: sub.grace,
      lastVerifiedAt: cache.subscription.lastVerifiedAt
    }
  };
}

/**
 * Global paid unlock rule: lifetime ∪ subscription cover each other.
 * Free is always satisfied. Unknown tiers → false.
 *
 * @param {import('./entitlementRegistry.js').EntitlementTier} requiredTier
 * @param {EntitlementStateView} state
 * @returns {boolean}
 */
export function meetsRequiredTier(requiredTier, state) {
  if (requiredTier === 'free') return true;
  if (requiredTier === 'lifetime' || requiredTier === 'subscription') {
    return Boolean(state.lifetimeActive || state.subscription.entitled);
  }
  return false;
}

/**
 * Live entitlement for ongoing use / first-create of gated content.
 * Unknown keys → false (safe default).
 *
 * Global rule: lifetime ∪ subscription mutually cover any paid tier
 * (no per-key exceptions).
 *
 * @param {string} featureKey
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {boolean}
 */
export function isEntitled(
  featureKey,
  {
    storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
    now = () => new Date()
  } = {}
) {
  const entry = getFeatureEntry(featureKey);
  if (!entry) {
    console.warn(`[entitlement] unknown featureKey "${featureKey}"`);
    return false;
  }
  return meetsRequiredTier(
    entry.requiredTier,
    getEntitlementState({ storage, now })
  );
}

/**
 * Unified access for UI: persistent owned content bypasses live entitlement.
 *
 * @param {string} featureKey
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {FeatureAccess}
 */
export function getFeatureAccess(
  featureKey,
  {
    storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
    now = () => new Date()
  } = {}
) {
  const entitlement = getEntitlementState({ storage, now });
  const entry = getFeatureEntry(featureKey);
  if (!entry) {
    console.warn(`[entitlement] unknown featureKey "${featureKey}"`);
    return {
      allowed: false,
      via: 'denied',
      featureType: null,
      entitlement
    };
  }

  if (entry.type === 'persistent' && hasOwnedInStore(storage, featureKey)) {
    return {
      allowed: true,
      via: 'owned',
      featureType: 'persistent',
      entitlement
    };
  }

  if (entry.requiredTier === 'free') {
    return {
      allowed: true,
      via: 'free',
      featureType: entry.type,
      entitlement
    };
  }

  if (!isEntitled(featureKey, { storage, now })) {
    return {
      allowed: false,
      via: 'denied',
      featureType: entry.type,
      entitlement
    };
  }

  /** @type {FeatureAccessVia} */
  const via = entitlement.lifetimeActive ? 'lifetime' : 'subscription';
  return {
    allowed: true,
    via,
    featureType: entry.type,
    entitlement
  };
}

/**
 * @param {(state: EntitlementStateView) => void} fn
 * @returns {() => void}
 */
export function onEntitlementChange(fn) {
  entitlementListeners.add(fn);
  return () => entitlementListeners.delete(fn);
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 */
function notifyEntitlementListeners(opts = {}) {
  const state = getEntitlementState(opts);
  entitlementListeners.forEach((cb) => {
    try {
      cb(state);
    } catch {
      // listener errors must not break gate
    }
  });
}

/**
 * Apply a provider patch to local cache and notify subscribers.
 *
 * @param {import('./entitlementProvider.js').EntitlementProviderPatch | null | undefined} patch
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.markVerified]
 * @param {boolean} [opts.notify] default true
 * @returns {EntitlementCache}
 */
export function applyEntitlementPatch(patch, opts = {}) {
  const storage =
    opts.storage !== undefined
      ? opts.storage
      : typeof globalThis !== 'undefined'
        ? globalThis.localStorage
        : null;
  const now = opts.now || (() => new Date());
  const prev = readEntitlementCache(storage);
  const next = mergeEntitlementCache(prev, patch, {
    now,
    markVerified: opts.markVerified
  });
  writeEntitlementCache(storage, next);
  if (opts.notify !== false) {
    notifyEntitlementListeners({ storage, now });
  }
  return next;
}

/**
 * Refresh from active provider. On failure → leave cache (offline grace path).
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {import('./entitlementProvider.js').EntitlementProvider | null} [opts.provider]
 * @returns {Promise<'ok' | 'grace' | 'expired' | 'error' | 'noop'>}
 */
export async function refreshEntitlement({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date(),
  provider = getEntitlementProvider()
} = {}) {
  if (!provider || typeof provider.fetchEntitlement !== 'function') {
    return 'noop';
  }
  try {
    const patch = await provider.fetchEntitlement();
    applyEntitlementPatch(patch, { storage, now, markVerified: true });
    const state = getEntitlementState({ storage, now });
    if (state.lifetimeActive || state.subscription.entitled) return 'ok';
    return 'expired';
  } catch {
    // Availability-first: keep last known cache; offline grace may still entitle.
    notifyEntitlementListeners({ storage, now });
    const state = getEntitlementState({ storage, now });
    if (state.subscription.entitled || state.lifetimeActive) return 'grace';
    return 'error';
  }
}

/**
 * Convenience re-export shape for claim after ritual complete.
 * Prefer importing claimOwned from ownership; this wraps + notifies only when new.
 *
 * @param {string} featureKey
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.at]
 * @param {Record<string, unknown> | null} [opts.meta]
 * @param {() => Date} [opts.now]
 * @returns {boolean}
 */
export function claimFeatureOwned(featureKey, opts = {}) {
  const storage =
    opts.storage !== undefined
      ? opts.storage
      : typeof globalThis !== 'undefined'
        ? globalThis.localStorage
        : null;
  return claimOwnedInStore(storage, featureKey, opts);
}
