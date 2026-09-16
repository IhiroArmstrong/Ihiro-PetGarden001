/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * After practice backup import: seed entitlement cache from authoritative
 * local stores (sanctuary / ownership), then optionally refresh from provider.
 *
 * Does NOT export or import `entitlement-cache` — cache stays a pure function
 * of verified state + sanctuary lifetime signal.
 */

import {
  applyEntitlementPatch,
  refreshEntitlement
} from '../entitlement/entitlementGate.js';
import { readSanctuaryEntitlement } from '../sanctuaryEntitlementGate.js';

/**
 * Seed lifetime slice of entitlement cache from imported sanctuary entitlement.
 * Subscription remains empty until `refreshEntitlement` (cloud verify).
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {() => Date} [opts.now]
 * @returns {{ seeded: boolean, reason?: string }}
 */
export function reconcileEntitlementCacheAfterRestore(storage, opts = {}) {
  if (!storage) return { seeded: false, reason: 'no_storage' };
  const sanctuary = readSanctuaryEntitlement(storage);
  if (!sanctuary.unlocked) {
    return { seeded: false, reason: 'sanctuary_not_unlocked' };
  }
  applyEntitlementPatch(
    {
      lifetime: {
        active: true,
        unlockedAt: sanctuary.unlockedAt,
        itemId: sanctuary.itemId,
        via: sanctuary.unlockedVia ?? 'payment'
      }
    },
    {
      storage,
      now: opts.now,
      markVerified: false,
      notify: false
    }
  );
  return { seeded: true };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {() => Date} [opts.now]
 * @param {import('../entitlement/entitlementProvider.js').EntitlementProvider | null} [opts.provider]
 * @returns {Promise<{ seed: { seeded: boolean, reason?: string }, refresh: 'ok' | 'grace' | 'expired' | 'error' | 'noop' }>}
 */
export async function reconcileEntitlementAfterPracticeRestore(storage, opts = {}) {
  const seed = reconcileEntitlementCacheAfterRestore(storage, opts);
  const refresh = await refreshEntitlement({
    storage,
    now: opts.now,
    provider: opts.provider
  });
  return { seed, refresh };
}
