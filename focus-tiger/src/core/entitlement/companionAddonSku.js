/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Desktop on-device companion · Lifetime one-time add-on SKU (Plan A).
 *
 * Sanctuary Lifetime (`yin-sanctuary-lifetime`) covers B-track only.
 * Lifetime holders unlock Electron local AI via this DLC — not via
 * `isEntitled` / FEATURE_CATALOG. Putting this id in the catalog would let
 * the global lifetime ∪ subscription union grant companion without the add-on.
 *
 * Non-Lifetime / Membership users still unlock companion via Focus Tiger Pro
 * (US$12.99/mo). Stripe Price is recorded; Checkout is not wired.
 *
 * @see docs/FREE_PAID_MATRIX.md A6
 * @see docs/task-briefs/task-desktop-on-device-companion.md
 */

/** Catalog-isolated commerce SKU — never a FEATURE_CATALOG featureKey. */
export const COMPANION_ADDON_LIFETIME_SKU = 'companion.addon.lifetime';

/** Stored itemId when Checkout exists; must stay ≠ SANCTUARY_LIFETIME_ITEM_ID. */
export const COMPANION_ADDON_LIFETIME_ITEM_ID = COMPANION_ADDON_LIFETIME_SKU;

/** Policy display USD (one-time). Matches Stripe Default price. */
export const COMPANION_ADDON_LIFETIME_PRICE_USD = 29.99;

/**
 * Dashboard Price for product「Focus Tiger: AI Companion Add-on」.
 * Reserved — Checkout / Worker vars not wired. Not a secret; still not `VITE_*`.
 */
export const COMPANION_ADDON_LIFETIME_STRIPE_PRICE_ID =
  'price_1U6GnXFuIhgJPGLiNlXs0IKe';

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isCompanionAddonLifetimeSku(value) {
  return value === COMPANION_ADDON_LIFETIME_SKU;
}

/**
 * Isolation lock: this SKU must not live in FEATURE_CATALOG.
 *
 * @param {Record<string, unknown> | null | undefined} catalog
 * @returns {boolean}
 */
export function companionAddonIsCatalogIsolated(catalog) {
  if (!catalog || typeof catalog !== 'object') return true;
  return !Object.prototype.hasOwnProperty.call(
    catalog,
    COMPANION_ADDON_LIFETIME_SKU
  );
}

/**
 * Who may be offered the one-time add-on once Checkout exists:
 * already-active Sanctuary Lifetime only. Membership-only / free → Pro.
 *
 * @param {{ lifetimeActive?: boolean }} [opts]
 * @returns {boolean}
 */
export function mayOfferCompanionLifetimeAddon({ lifetimeActive } = {}) {
  return lifetimeActive === true;
}
