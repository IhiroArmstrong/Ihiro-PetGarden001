/**
 * Entitlement provider interface (Stripe / Worker later; mock for now).
 */

/**
 * @typedef {import('./entitlementState.js').EntitlementCache} EntitlementCache
 * @typedef {import('./entitlementState.js').LifetimeCache} LifetimeCache
 * @typedef {import('./entitlementState.js').SubscriptionCache} SubscriptionCache
 *
 * @typedef {Partial<{
 *   lifetime: Partial<LifetimeCache>,
 *   subscription: Partial<SubscriptionCache>
 * }>} EntitlementProviderPatch
 *
 * @typedef {{
 *   id: string,
 *   fetchEntitlement: () => Promise<EntitlementProviderPatch | null>
 * }} EntitlementProvider
 */

/** @type {EntitlementProvider | null} */
let activeProvider = null;

/**
 * @param {EntitlementProvider | null} provider
 */
export function setEntitlementProvider(provider) {
  activeProvider = provider;
}

/** @returns {EntitlementProvider | null} */
export function getEntitlementProvider() {
  return activeProvider;
}
