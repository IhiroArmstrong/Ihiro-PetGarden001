/**
 * Entitlement feature catalog · SSOT for featureKey → tier + content type.
 *
 * Policy:
 * - `ongoing` → every use checks live entitlement (`isEntitled`)
 * - `persistent` → claim once via ownership; later access ignores subscription expiry
 * - Global unlock rule: lifetime ∪ subscription **mutually** cover any paid
 *   `requiredTier` (no per-key exceptions; free stays free)
 *
 * @see docs/MVP_PRODUCT_DEFINITION.md commercial red lines
 */

/** @typedef {'free' | 'lifetime' | 'subscription'} EntitlementTier */
/** @typedef {'persistent' | 'ongoing'} FeatureContentType */

/**
 * @typedef {object} FeatureCatalogEntry
 * @property {EntitlementTier} requiredTier
 * @property {FeatureContentType} type
 */

/**
 * @typedef {(
 *   | 'journey.log'
 *   | 'content.daily-wisdom'
 *   | 'ritual.morning.access'
 *   | 'ritual.emotional-reset.access'
 *   | 'ritual.work-transition.access'
 *   | 'ambient.deep.play'
 *   | 'emotion.premium.trigger'
 *   | 'content.advanced.daily-unlock'
 *   | 'ritual.morning.history'
 *   | 'ritual.emotional-reset.history'
 *   | 'ritual.work-transition.history'
 *   | 'ritual.morning.memento'
 *   | 'ritual.emotional-reset.memento'
 *   | 'ritual.work-transition.memento'
 *   | 'ritual.morning.copy-unlocked'
 *   | 'ritual.emotional-reset.copy-unlocked'
 *   | 'ritual.work-transition.copy-unlocked'
 *   | 'ritual.morning.sfx-unlocked'
 *   | 'ritual.emotional-reset.sfx-unlocked'
 *   | 'ritual.work-transition.sfx-unlocked'
 *   | 'milestone.glow.played'
 * )} FeatureKey
 */

/** @type {Readonly<Record<FeatureKey, FeatureCatalogEntry>>} */
export const FEATURE_CATALOG = Object.freeze({
  'journey.log': { requiredTier: 'free', type: 'persistent' },
  /** Free daily line — check on every show (not ownership / entitlementOwnership). */
  'content.daily-wisdom': { requiredTier: 'free', type: 'ongoing' },

  'ritual.morning.access': { requiredTier: 'subscription', type: 'ongoing' },
  'ritual.emotional-reset.access': {
    requiredTier: 'subscription',
    type: 'ongoing'
  },
  'ritual.work-transition.access': {
    requiredTier: 'subscription',
    type: 'ongoing'
  },
  'ambient.deep.play': { requiredTier: 'subscription', type: 'ongoing' },
  'emotion.premium.trigger': { requiredTier: 'subscription', type: 'ongoing' },
  'content.advanced.daily-unlock': {
    requiredTier: 'subscription',
    type: 'ongoing'
  },

  'ritual.morning.history': { requiredTier: 'subscription', type: 'persistent' },
  'ritual.emotional-reset.history': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.work-transition.history': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.morning.memento': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.emotional-reset.memento': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.work-transition.memento': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.morning.copy-unlocked': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.emotional-reset.copy-unlocked': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.work-transition.copy-unlocked': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.morning.sfx-unlocked': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.emotional-reset.sfx-unlocked': {
    requiredTier: 'subscription',
    type: 'persistent'
  },
  'ritual.work-transition.sfx-unlocked': {
    requiredTier: 'subscription',
    type: 'persistent'
  },

  'milestone.glow.played': { requiredTier: 'free', type: 'persistent' }
});

/**
 * @param {string} featureKey
 * @returns {featureKey is FeatureKey}
 */
export function isKnownFeatureKey(featureKey) {
  return Object.prototype.hasOwnProperty.call(FEATURE_CATALOG, featureKey);
}

/**
 * @param {string} featureKey
 * @returns {FeatureCatalogEntry | null}
 */
export function getFeatureEntry(featureKey) {
  if (!isKnownFeatureKey(featureKey)) return null;
  return FEATURE_CATALOG[featureKey];
}

/**
 * @returns {FeatureKey[]}
 */
export function listFeatureKeys() {
  return /** @type {FeatureKey[]} */ (Object.keys(FEATURE_CATALOG));
}
