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
import { readTipStatus, syncTipBadgesFromPractice } from './tipJarGate.js';

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
 * @param {Storage | null | undefined} storage
 * @returns {{ kind: 'sanctuary' | 'tip' | 'practice', ids: string[] }}
 */
export function syncAndReadIdleBadgePack(storage) {
  if (isPrestigiousBadgeEntitled({ storage })) {
    syncSanctuaryBadgesFromPractice(storage, { entitled: true });
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
