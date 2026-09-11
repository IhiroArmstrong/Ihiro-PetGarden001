/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local file import gate for subscription-tier persistent ownership marks
 * (`focus-tiger.entitlement-ownership.v1`).
 *
 * Fields gated (12 keys — ritual history / memento / copy / sfx per ritual):
 * `ritual.*.history|memento|copy-unlocked|sfx-unlocked` (see RITUAL_PERSISTENT_FEATURE_KEYS).
 *
 * Not gated on import: free persistent keys (`journey.log`, `milestone.glow.played`).
 * Cloud OTP restore does not use this module (identity-verified same-user path).
 */

import {
  FEATURE_CATALOG,
  getFeatureEntry,
  isKnownFeatureKey
} from '../entitlement/entitlementRegistry.js';
import { getEntitlementState } from '../entitlement/entitlementGate.js';
import { normalizeOwnershipState } from '../entitlement/entitlementOwnership.js';

/** @type {readonly string[]} */
export const IMPORT_GATED_OWNERSHIP_FEATURE_KEYS = Object.freeze(
  Object.entries(FEATURE_CATALOG)
    .filter(([, entry]) => entry.type === 'persistent' && entry.requiredTier === 'subscription')
    .map(([key]) => key)
);

/**
 * @param {string} featureKey
 * @returns {boolean}
 */
export function isImportGatedOwnershipFeatureKey(featureKey) {
  if (!isKnownFeatureKey(featureKey)) return false;
  const entry = getFeatureEntry(featureKey);
  return entry?.type === 'persistent' && entry.requiredTier === 'subscription';
}

/**
 * Receiver has server-backed paid entitlement on this device (lifetime ∪ subscription).
 *
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export function hasImportRecipientVerifiedPaid(
  storage,
  now = () => new Date()
) {
  return getEntitlementState({ storage, now }).source !== 'free';
}

/**
 * Strip subscription persistent ownership when local import recipient is unpaid.
 *
 * @param {unknown} rawOwnership
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export function filterOwnershipForLocalImport(
  rawOwnership,
  storage,
  now = () => new Date()
) {
  const normalized = normalizeOwnershipState(rawOwnership);
  if (hasImportRecipientVerifiedPaid(storage, now)) {
    return normalized;
  }
  /** @type {Record<string, import('../entitlement/entitlementOwnership.js').OwnershipRecord>} */
  const owned = {};
  for (const [key, record] of Object.entries(normalized.owned)) {
    if (!isImportGatedOwnershipFeatureKey(key)) {
      owned[key] = record;
    }
  }
  return { owned };
}
