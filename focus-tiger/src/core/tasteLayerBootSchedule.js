/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** After sprite preload, still wait out the first Idle breath before boot fetches. */
export const TASTE_BOOT_PREFETCH_DELAY_MS = 12000;

/** Arrival / Honesty / Reflection dissolve still up — try again shortly. */
export const TASTE_BOOT_PREFETCH_RETRY_MS = 1000;

/**
 * @param {{ overlayBusy: boolean, firstWaitDone: boolean }} input
 * @returns {number} ms until the next attempt. 0 means fetch now.
 */
export function nextBootNetworkDelayMs({ overlayBusy, firstWaitDone }) {
  if (overlayBusy) return TASTE_BOOT_PREFETCH_RETRY_MS;
  if (!firstWaitDone) return TASTE_BOOT_PREFETCH_DELAY_MS;
  return 0;
}
