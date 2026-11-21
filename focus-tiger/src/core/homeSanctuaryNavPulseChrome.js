/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Legacy D-family sanctuary nav pulse — orphan DOM cleanup only when nav is off (L2).
 * No new pulses; reopening nav requires hint registry wiring (see entry-signal Brief L2).
 */

import { isHomeSanctuaryNavEnabled } from './homeSanctuaryNavEnabled.js';

export const SANCTUARY_NAV_COMPASS_FAB_ID = 'ft-sanctuary-nav-compass-fab';

/** Legacy class token — query only for stale DOM removal (not allowlisted for new paint). */
const LEGACY_SANCTUARY_PULSE_CLASS = 'ft-home-sanctuary-nav-pulse';

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
  const sel = `.${LEGACY_SANCTUARY_PULSE_CLASS}`;
  for (const node of document.querySelectorAll(sel)) {
    const host = node.parentElement;
    if (host?.id === SANCTUARY_NAV_COMPASS_FAB_ID) continue;
    node.remove();
    host?.classList.remove('has-sanctuary-nav-pulse');
  }
}

/**
 * @param {Storage | null | undefined} _storage
 * @returns {void}
 */
export function syncSanctuaryNavPulseChrome(_storage) {
  void _storage;
  if (isHomeSanctuaryNavEnabled()) {
    // Future: mint via hint registry only — no independent chrome pulse.
    return;
  }
  removeOrphanSanctuaryNavPulses();
  const fab = document.getElementById?.(SANCTUARY_NAV_COMPASS_FAB_ID);
  if (!fab) return;
  for (const node of fab.querySelectorAll(`:scope > .${LEGACY_SANCTUARY_PULSE_CLASS}`)) {
    node.remove();
  }
  fab.classList.remove('has-sanctuary-nav-pulse');
}