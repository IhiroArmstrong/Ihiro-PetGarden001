/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide evaluation gate (R-0).
 * Frozen lab lines used for tuning are regression-only.
 * Live / cutover needs frozen no-regression AND a sealed blind pass.
 */

/**
 * @param {{ frozenNoRegress: boolean, blindMet: boolean }} args
 * @returns {boolean}
 */
export function confideLiveEvalGate({ frozenNoRegress, blindMet }) {
  return frozenNoRegress === true && blindMet === true;
}

/**
 * @param {{ usedForTuning: boolean }} args
 * @returns {'regression_only' | 'may_tune'}
 */
export function confideFrozenSetRole({ usedForTuning }) {
  return usedForTuning === true ? 'regression_only' : 'may_tune';
}
