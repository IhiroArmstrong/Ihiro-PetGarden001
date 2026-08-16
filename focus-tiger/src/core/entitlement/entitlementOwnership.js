/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Persistent ownership marks — independent of live subscription state.
 * Once claimed, content stays viewable after expiry (commercial red line).
 */

import {
  getFeatureEntry,
  isKnownFeatureKey
} from './entitlementRegistry.js';

export const ENTITLEMENT_OWNERSHIP_STORAGE_KEY =
  'focus-tiger.entitlement-ownership.v1';

/**
 * @typedef {{ at: string, meta: Record<string, unknown> | null }} OwnershipRecord
 * @typedef {{ owned: Record<string, OwnershipRecord> }} OwnershipState
 */

/**
 * @param {unknown} raw
 * @returns {OwnershipState}
 */
export function normalizeOwnershipState(raw) {
  if (!raw || typeof raw !== 'object') return { owned: {} };
  const o = /** @type {Record<string, unknown>} */ (raw);
  const ownedRaw =
    o.owned && typeof o.owned === 'object'
      ? /** @type {Record<string, unknown>} */ (o.owned)
      : {};
  /** @type {Record<string, OwnershipRecord>} */
  const owned = {};
  for (const [key, val] of Object.entries(ownedRaw)) {
    if (!isKnownFeatureKey(key)) continue;
    const entry = getFeatureEntry(key);
    if (!entry || entry.type !== 'persistent') continue;
    if (val === true) {
      owned[key] = { at: '', meta: null };
      continue;
    }
    if (!val || typeof val !== 'object') continue;
    const row = /** @type {Record<string, unknown>} */ (val);
    owned[key] = {
      at: typeof row.at === 'string' && row.at ? row.at : '',
      meta:
        row.meta && typeof row.meta === 'object'
          ? /** @type {Record<string, unknown>} */ (row.meta)
          : null
    };
  }
  return { owned };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {OwnershipState}
 */
export function readOwnershipState(storage) {
  if (!storage) return normalizeOwnershipState(null);
  try {
    const raw = storage.getItem(ENTITLEMENT_OWNERSHIP_STORAGE_KEY);
    if (!raw) return normalizeOwnershipState(null);
    return normalizeOwnershipState(JSON.parse(raw));
  } catch {
    return normalizeOwnershipState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {OwnershipState} state
 */
export function writeOwnershipState(storage, state) {
  if (!storage) return;
  try {
    const n = normalizeOwnershipState(state);
    storage.setItem(
      ENTITLEMENT_OWNERSHIP_STORAGE_KEY,
      JSON.stringify({ owned: n.owned })
    );
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} featureKey
 * @returns {boolean}
 */
export function hasOwned(storage, featureKey) {
  if (!isKnownFeatureKey(featureKey)) return false;
  const entry = getFeatureEntry(featureKey);
  if (!entry || entry.type !== 'persistent') return false;
  return Object.prototype.hasOwnProperty.call(
    readOwnershipState(storage).owned,
    featureKey
  );
}

/**
 * Claim persistent ownership (idempotent; does not shrink).
 *
 * @param {Storage | null | undefined} storage
 * @param {string} featureKey
 * @param {object} [opts]
 * @param {string} [opts.at]
 * @param {Record<string, unknown> | null} [opts.meta]
 * @param {() => Date} [opts.now]
 * @returns {boolean} true if known persistent key was claimed
 */
export function claimOwned(storage, featureKey, opts = {}) {
  if (!isKnownFeatureKey(featureKey)) return false;
  const entry = getFeatureEntry(featureKey);
  if (!entry || entry.type !== 'persistent') return false;
  const prev = readOwnershipState(storage);
  if (Object.prototype.hasOwnProperty.call(prev.owned, featureKey)) {
    return true;
  }
  const now = opts.now || (() => new Date());
  const at =
    typeof opts.at === 'string' && opts.at ? opts.at : now().toISOString();
  const meta =
    opts.meta && typeof opts.meta === 'object' ? { ...opts.meta } : null;
  writeOwnershipState(storage, {
    owned: {
      ...prev.owned,
      [featureKey]: { at, meta }
    }
  });
  return true;
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearOwnershipState(storage) {
  writeOwnershipState(storage, { owned: {} });
}
