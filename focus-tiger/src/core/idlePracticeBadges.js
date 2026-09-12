/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle chrome badge pack (beside Yin).
 *
 * Prestigious B-track marks (lifetime ∪ subscription) take priority;
 * otherwise Tea / free practice marks. Display orchestration — not a
 * content unlock gate.
 *
 * This module may read both Sanctuary and tip storage. The two payment
 * gates must not import each other.
 */

import { getEntitlementState } from './entitlement/entitlementGate.js';
import {
  readSanctuaryEntitlement,
  syncSanctuaryBadgesFromPractice
} from './sanctuaryEntitlementGate.js';
import {
  readTipStatus,
  syncTipBadgesFromPractice
} from './tipJarGate.js';

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {boolean}
 */
export function isPrestigiousBadgeEntitled({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date()
} = {}) {
  const state = getEntitlementState({ storage, now });
  return Boolean(state.lifetimeActive || state.subscription.entitled);
}

/**
 * Backup v3 restores `sanctuary-entitlement.badgeIds` but not
 * `entitlement-cache` (subscription verify). On import receivers without
 * live B-track cache, still honor restored prestigious marks when they carry
 * at least as many badges as the Tea/free pack would show.
 *
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldShowSanctuaryIdleBadges(storage) {
  if (isPrestigiousBadgeEntitled({ storage })) return true;
  const sanctuaryIds = readSanctuaryEntitlement(storage).badgeIds;
  if (sanctuaryIds.length <= 0) return false;
  const tipIds = readTipStatus(storage).badgeIds;
  return sanctuaryIds.length >= tipIds.length;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ kind: 'sanctuary' | 'tip' | 'practice', ids: string[] }}
 */
export function syncAndReadIdleBadgePack(storage) {
  if (shouldShowSanctuaryIdleBadges(storage)) {
    syncSanctuaryBadgesFromPractice(storage, {
      entitled: isPrestigiousBadgeEntitled({ storage })
    });
    return {
      kind: 'sanctuary',
      ids: readSanctuaryEntitlement(storage).badgeIds
    };
  }
  syncTipBadgesFromPractice(storage);
  const status = readTipStatus(storage);
  return {
    kind: status.tipped ? 'tip' : 'practice',
    ids: status.badgeIds
  };
}
