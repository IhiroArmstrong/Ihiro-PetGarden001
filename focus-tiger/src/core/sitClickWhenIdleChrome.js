/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shared Sit-from-Idle chrome (button, T44 space, practice deep link).
 * @param {object} opts
 * @param {boolean} opts.completionPending
 * @param {boolean} opts.arrivalOpen
 * @param {boolean} opts.isFocusing
 * @param {boolean} opts.microRitualOpen
 * @param {(ext: object) => 'ignore' | 'start-arrival' | string} opts.resolveSitClickWhenIdle
 * @param {() => void} opts.cancelPending
 * @param {() => void} opts.hideHonesty
 * @param {() => void} opts.startArrival
 * @param {() => void} opts.beginFocusWithSelectedMode
 * @returns {boolean} true when FocusInput should begin focusing immediately
 */
export function handleSitClickWhenIdleChrome(opts) {
  if (opts.completionPending) return false;
  opts.cancelPending();
  opts.hideHonesty();
  if (opts.arrivalOpen) return false;
  const sitAction = opts.resolveSitClickWhenIdle({
    isFocusing: opts.isFocusing,
    microRitualOpen: opts.microRitualOpen
  });
  if (sitAction === 'ignore') return false;
  if (sitAction === 'start-arrival') {
    opts.startArrival();
    return false;
  }
  opts.beginFocusWithSelectedMode();
  return true;
}
