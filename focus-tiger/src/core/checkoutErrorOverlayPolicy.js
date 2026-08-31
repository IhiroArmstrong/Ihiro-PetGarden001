/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * After a failed Checkout POST: never resurrect a card the user already closed
 * (tab-away / Not now). In-flight fetch completing later used to call open()
 * and looked like the overlay "jumped back".
 *
 * @param {{ overlayOpen?: boolean, userDismissed?: boolean }} [opts]
 * @returns {'show-on-open' | 'leave-closed'}
 */
export function resolveCheckoutErrorOverlay(opts = {}) {
  if (opts.userDismissed === true) return 'leave-closed';
  if (opts.overlayOpen === true) return 'show-on-open';
  return 'leave-closed';
}
