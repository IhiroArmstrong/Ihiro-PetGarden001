/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { CONFIDE_NARROW_MAX_PX } from '../confideDockPlacement.js';
import { isConfideLocaleAllowed } from '../confide/confideUserVisibilityGate.js';

/**
 * Freeze switch for the Leave button. 12/4 red or freeze-week red → keep false.
 * Flip only after data-plane tests are green.
 */
export const INNER_MIRROR_LEAVE_MOUNTED = false;

export const INNER_MIRROR_LEAVE_ENV = 'FT_INNER_MIRROR_LEAVE';

function envMountOn(env) {
  const raw = env?.[INNER_MIRROR_LEAVE_ENV];
  return raw === '1' || raw === 'on' || raw === 'true';
}

/**
 * @param {{ mountEnabled?: boolean, env?: Record<string, string | undefined> }} [opts]
 */
export function isInnerMirrorLeaveMounted(opts = {}) {
  if (opts.mountEnabled === true) return true;
  if (opts.mountEnabled === false) return false;
  if (envMountOn(opts.env || (typeof process !== 'undefined' ? process.env : undefined))) {
    return true;
  }
  return INNER_MIRROR_LEAVE_MOUNTED;
}

/**
 * Leave chrome: mounted + wide desktop + non-ja + not crisis.
 * @param {{
 *   mountEnabled?: boolean,
 *   locale?: string,
 *   widthPx?: number,
 *   crisis?: boolean
 * }} opts
 */
export function shouldShowInnerMirrorLeave(opts = {}) {
  if (opts.crisis === true) return false;
  if (!isInnerMirrorLeaveMounted(opts)) return false;
  if (!isConfideLocaleAllowed(opts.locale)) return false;
  const width = Number(opts.widthPx);
  if (!Number.isFinite(width) || width <= CONFIDE_NARROW_MAX_PX) return false;
  return true;
}
