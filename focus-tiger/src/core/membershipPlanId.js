/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Client read-layer for membership planId (must match cloud membershipPlanId.ts).
 * Entitlement still uses isEntitled (lifetime ∪ subscription); this only labels SKU.
 */

export const MEMBERSHIP_PLAN_ID_LEGACY = 'yin-membership';
export const MEMBERSHIP_PLAN_ID = MEMBERSHIP_PLAN_ID_LEGACY;
export const MEMBERSHIP_PLAN_ID_MONTHLY = 'yin-membership-monthly';
export const MEMBERSHIP_PLAN_ID_YEARLY = 'yin-membership-yearly';

/**
 * @param {unknown} raw
 * @returns {typeof MEMBERSHIP_PLAN_ID_MONTHLY | typeof MEMBERSHIP_PLAN_ID_YEARLY}
 */
export function normalizeMembershipPlanId(raw) {
  if (typeof raw !== 'string') return MEMBERSHIP_PLAN_ID_MONTHLY;
  const id = raw.trim().toLowerCase();
  if (!id) return MEMBERSHIP_PLAN_ID_MONTHLY;
  if (id === MEMBERSHIP_PLAN_ID_YEARLY || id === 'yearly' || id === 'year') {
    return MEMBERSHIP_PLAN_ID_YEARLY;
  }
  return MEMBERSHIP_PLAN_ID_MONTHLY;
}
