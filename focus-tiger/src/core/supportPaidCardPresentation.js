/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Support modal paid-card visibility and settled (faded) presentation.
 * Lifetime and the Lifetime AI add-on stay on the grid after purchase.
 */

/**
 * @param {object} [opts]
 * @param {boolean} [opts.lifetimeActive]
 * @param {boolean} [opts.addonActive]
 * @param {boolean} [opts.proActive]
 * @param {boolean} [opts.companionEntitled]
 * @param {boolean} [opts.isDesktopShell]
 * @returns {{
 *   sanctuarySettled: boolean,
 *   showPro: boolean,
 *   showAddon: boolean,
 *   addonSettled: boolean,
 *   showWebLocalAiNote: boolean
 * }}
 */
export function supportPaidCardPresentation({
  lifetimeActive = false,
  addonActive = false,
  proActive = false,
  companionEntitled = false,
  isDesktopShell = false
} = {}) {
  const sanctuarySettled = lifetimeActive === true;
  const showPro =
    lifetimeActive !== true &&
    proActive !== true &&
    companionEntitled !== true;
  const showAddon = lifetimeActive === true && proActive !== true;
  const addonSettled = showAddon && addonActive === true;
  const showWebLocalAiNote =
    isDesktopShell !== true && (showPro === true || showAddon === true);
  return {
    sanctuarySettled,
    showPro,
    showAddon,
    addonSettled,
    showWebLocalAiNote
  };
}
