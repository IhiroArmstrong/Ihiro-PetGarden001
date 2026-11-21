/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Sanctuary compass first-use blue pulse — independent idle chrome (not HINTS_WIRING).
 * Resolves the live corner FAB each sync; wide/narrow home CTA refresh must not own this dot.
 */

import { isHomeSanctuaryNavEnabled } from './homeSanctuaryNavEnabled.js';
import {
  shouldShowHomeSanctuaryNavPulse,
  syncHomeSanctuaryNavPulse
} from './homeSanctuaryNavGate.js';

export const SANCTUARY_NAV_COMPASS_FAB_ID = 'ft-sanctuary-nav-compass-fab';

/** @returns {HTMLElement | null} */
export function resolveSanctuaryNavCompassFab() {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById(SANCTUARY_NAV_COMPASS_FAB_ID);
  if (!el) return null;
  if (el.hidden) return null;
  if (el.getAttribute('aria-hidden') === 'true') return null;
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return null;
  return /** @type {HTMLElement} */ (el);
}

/**
 * Remove pulse nodes not mounted on the corner FAB (legacy dock hosts, stale DOM).
 * @returns {void}
 */
export function removeOrphanSanctuaryNavPulses() {
  if (typeof document === 'undefined') return;
  for (const node of document.querySelectorAll('.ft-home-sanctuary-nav-pulse')) {
    const host = node.parentElement;
    if (host?.id === SANCTUARY_NAV_COMPASS_FAB_ID) continue;
    node.remove();
    host?.classList.remove('has-sanctuary-nav-pulse');
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function syncSanctuaryNavPulseChrome(storage) {
  removeOrphanSanctuaryNavPulses();
  const enabled = isHomeSanctuaryNavEnabled();
  const fab = resolveSanctuaryNavCompassFab();
  const show = enabled && shouldShowHomeSanctuaryNavPulse(storage) && Boolean(fab);
  if (fab) {
    syncHomeSanctuaryNavPulse(fab, show);
    return;
  }
  const hiddenFab =
    typeof document !== 'undefined'
      ? document.getElementById(SANCTUARY_NAV_COMPASS_FAB_ID)
      : null;
  if (hiddenFab) {
    syncHomeSanctuaryNavPulse(/** @type {HTMLElement} */ (hiddenFab), false);
  }
  if (!enabled) {
    removeOrphanSanctuaryNavPulses();
  }
}