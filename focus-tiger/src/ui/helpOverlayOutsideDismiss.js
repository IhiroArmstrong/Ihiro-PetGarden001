/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Outside-dismiss for ? help surfaces. Privacy is a sibling of the purpose
 * card (purpose is hidden while Privacy is open) — never key off purposeOpen
 * alone.
 */

export const HELP_OUTSIDE_DISMISS = Object.freeze({
  IGNORE: 'ignore',
  CLOSE_WELLNESS_FIRST: 'close-wellness-first',
  CLOSE_WELLNESS_DETAIL: 'close-wellness-detail',
  CLOSE_PRIVACY: 'close-privacy',
  CLOSE_PURPOSE: 'close-purpose'
});

/**
 * @param {object} opts
 * @param {boolean} opts.wellnessFirstOpen
 * @param {boolean} opts.wellnessFirstContains
 * @param {boolean} opts.wellnessDetailOpen
 * @param {boolean} opts.wellnessDetailContains
 * @param {boolean} opts.privacyOpen
 * @param {boolean} opts.privacyContains
 * @param {boolean} opts.purposeOpen
 * @param {boolean} opts.purposeContains
 * @param {boolean} opts.helpContains
 * @returns {string} `HELP_OUTSIDE_DISMISS.*`
 */
export function resolveHelpOutsideDismissAction(opts) {
  if (opts.wellnessFirstOpen) {
    return opts.wellnessFirstContains
      ? HELP_OUTSIDE_DISMISS.IGNORE
      : HELP_OUTSIDE_DISMISS.CLOSE_WELLNESS_FIRST;
  }
  if (opts.wellnessDetailOpen) {
    return opts.wellnessDetailContains
      ? HELP_OUTSIDE_DISMISS.IGNORE
      : HELP_OUTSIDE_DISMISS.CLOSE_WELLNESS_DETAIL;
  }
  if (opts.privacyOpen) {
    return opts.privacyContains
      ? HELP_OUTSIDE_DISMISS.IGNORE
      : HELP_OUTSIDE_DISMISS.CLOSE_PRIVACY;
  }
  if (!opts.purposeOpen) return HELP_OUTSIDE_DISMISS.IGNORE;
  if (opts.helpContains || opts.purposeContains) {
    return HELP_OUTSIDE_DISMISS.IGNORE;
  }
  return HELP_OUTSIDE_DISMISS.CLOSE_PURPOSE;
}
