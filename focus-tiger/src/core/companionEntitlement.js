/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Desktop on-device companion purchase gate (separate from FEATURE_CATALOG).
 * Pro subscription OR Lifetime add-on unlocks generate; Base / Membership alone does not.
 *
 * @see companionAddonSku.js · task-desktop-on-device-companion.md
 */

import { getEntitlementState } from './entitlement/entitlementGate.js';
import { readEntitlementCache } from './entitlement/entitlementState.js';
import {
  COMPANION_ADDON_LIFETIME_ITEM_ID,
  COMPANION_ADDON_LIFETIME_SKU
} from './entitlement/companionAddonSku.js';

export const COMPANION_ENTITLEMENT_STORAGE_KEY =
  'focus-tiger.companion-entitlement.v1';

/** Stripe / Worker plan id for Focus Tiger Pro (B-track + companion). */
export const FOCUS_TIGER_PRO_PLAN_ID = 'focus-tiger-pro';

/** Display-only USD for Support cards. */
export const FOCUS_TIGER_PRO_PRICE_DISPLAY = '12.99';

/**
 * @param {unknown} raw
 * @returns {{ active: boolean, itemId: string | null, unlockedAt: string | null, via: string | null }}
 */
export function normalizeCompanionEntitlementCache(raw) {
  if (!raw || typeof raw !== 'object') {
    return { active: false, itemId: null, unlockedAt: null, via: null };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    active: o.active === true,
    itemId:
      typeof o.itemId === 'string' && o.itemId.trim() ? o.itemId.trim() : null,
    unlockedAt:
      typeof o.unlockedAt === 'string' && o.unlockedAt.trim()
        ? o.unlockedAt.trim()
        : null,
    via:
      o.via === 'payment' || o.via === 'preview' || o.via === 'mock'
        ? o.via
        : null
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {ReturnType<typeof normalizeCompanionEntitlementCache>}
 */
export function readCompanionEntitlementCache(storage) {
  if (!storage) return normalizeCompanionEntitlementCache(null);
  try {
    const raw = storage.getItem(COMPANION_ENTITLEMENT_STORAGE_KEY);
    if (!raw) return normalizeCompanionEntitlementCache(null);
    return normalizeCompanionEntitlementCache(JSON.parse(raw));
  } catch {
    return normalizeCompanionEntitlementCache(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Partial<ReturnType<typeof normalizeCompanionEntitlementCache>>} patch
 * @param {() => Date} [now]
 */
export function writeCompanionEntitlementCache(storage, patch, now = () => new Date()) {
  if (!storage) return readCompanionEntitlementCache(null);
  const prev = readCompanionEntitlementCache(storage);
  const next = normalizeCompanionEntitlementCache({
    ...prev,
    ...patch,
    unlockedAt:
      patch.active === true && !patch.unlockedAt
        ? now().toISOString()
        : patch.unlockedAt ?? prev.unlockedAt,
    itemId:
      patch.itemId ??
      (patch.active === true ? COMPANION_ADDON_LIFETIME_ITEM_ID : prev.itemId)
  });
  storage.setItem(COMPANION_ENTITLEMENT_STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * QA harness: `?companionEntitled=1` (Electron desktop:dev may append).
 *
 * @param {string} [search]
 * @returns {boolean}
 */
export function isCompanionEntitledHarness(search = '') {
  return /(?:^|[?&])companionEntitled=1(?:&|$)/.test(String(search || ''));
}

/**
 * @param {string} [search]
 * @returns {boolean}
 */
export function isCompanionEntitledMockSearch(search = '') {
  return /(?:^|[?&])entitlementMock=pro(?:&|$)/.test(String(search || ''));
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {string} [opts.search]
 * @returns {boolean}
 */
export function isProSubscriptionActive({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date(),
  search = typeof location !== 'undefined' ? location.search : ''
} = {}) {
  if (isCompanionEntitledMockSearch(search)) return true;
  const sub = getEntitlementState({ storage, now }).subscription;
  const planId = readEntitlementCache(storage).subscription.planId;
  return sub.entitled === true && planId === FOCUS_TIGER_PRO_PLAN_ID;
}

/**
 * Lifetime add-on one-time purchase (not FEATURE_CATALOG).
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 */
export function isCompanionAddonActive({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  const cache = readCompanionEntitlementCache(storage);
  return (
    cache.active === true &&
    (cache.itemId === COMPANION_ADDON_LIFETIME_ITEM_ID ||
      cache.itemId === COMPANION_ADDON_LIFETIME_SKU)
  );
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {string} [opts.search]
 * @returns {boolean}
 */
export function isCompanionEntitled({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date(),
  search = typeof location !== 'undefined' ? location.search : ''
} = {}) {
  if (isCompanionEntitledHarness(search)) return true;
  if (isCompanionEntitledMockSearch(search)) return true;
  return isProSubscriptionActive({ storage, now, search }) || isCompanionAddonActive({ storage });
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {boolean}
 */
export function isLifetimeActiveForAddonOffer({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date()
} = {}) {
  return getEntitlementState({ storage, now }).lifetimeActive === true;
}
