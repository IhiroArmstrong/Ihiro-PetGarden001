/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L1 product-entry capability. Low-spec hides the companion preload key.
 * Force flags are for tests / lab only — not a user-facing override.
 */

import { isLowSpecDesktopMemory } from './l0Config.js';

/**
 * @param {{
 *   totalMemBytes?: number,
 *   env?: NodeJS.ProcessEnv
 * }} [opts]
 * @returns {boolean}
 */
export function isCompanionL1Allowed(opts = {}) {
  const env = opts.env || {};
  if (env.FT_COMPANION_L1_FORCE_OFF === '1') return false;
  if (env.FT_COMPANION_L1_FORCE_ON === '1') return true;
  return !isLowSpecDesktopMemory(opts.totalMemBytes);
}
