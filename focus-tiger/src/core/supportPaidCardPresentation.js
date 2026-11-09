/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Support modal paid-card visibility and settled (faded) presentation.
 * Lifetime and the Lifetime AI add-on stay on the grid after purchase.
 */

/** Plan A option 1: stop new Pro / companion add-on checkout (reversible). */
export const PLAN_A_OPTION1_STOP_NEW_CHECKOUT = true;

/**
 * @param {object} [opts]
 * @param {boolean} [opts.lifetimeActive]
 * @param {boolean} [opts.addonActive]
 * @param {boolean} [opts.proActive]
 * @param {boolean} [opts.membershipActive]
 * @param {boolean} [opts.companionEntitled]
 * @param {boolean} [opts.isDesktopShell]
 * @returns {{
 *   sanctuarySettled: boolean,
 *   membershipSettled: boolean,
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
  membershipActive = false,
  companionEntitled = false,
  isDesktopShell = false
} = {}) {
  const sanctuarySettled = lifetimeActive === true;
  const membershipSettled = membershipActive === true;
  let showPro =
    lifetimeActive !== true &&
    proActive !== true &&
    companionEntitled !== true;
  let showAddon = lifetimeActive === true && proActive !== true;
  if (PLAN_A_OPTION1_STOP_NEW_CHECKOUT) {
    showPro = false;
    showAddon =
      lifetimeActive === true && proActive !== true && addonActive === true;
  }
  const addonSettled = showAddon && addonActive === true;
  const showWebLocalAiNote =
    isDesktopShell !== true && (showPro === true || showAddon === true);
  return {
    sanctuarySettled,
    membershipSettled,
    showPro,
    showAddon,
    addonSettled,
    showWebLocalAiNote
  };
}
