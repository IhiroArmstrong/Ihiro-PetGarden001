/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T23: Confide may redirect a product how-to only when Help Center ask-cards exist.
 * Hidden panel still counts — T22 mounts the ask box with the Help Center UI.
 *
 * @param {Document | { querySelector?: Function } | null | undefined} [doc]
 * @returns {boolean}
 */
export function isHelpCenterAskDestinationReachable(doc = globalThis.document) {
  if (!doc || typeof doc.querySelector !== 'function') return false;
  const panel = doc.querySelector('#help-center');
  if (!panel) return false;
  return Boolean(doc.querySelector('[data-testid="help-center-ask-input"]'));
}
