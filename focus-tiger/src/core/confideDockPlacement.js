/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T41 / T42 · where wide Idle glass cards sit so Yin’s face stays clear.
 */

export const CONFIDE_NARROW_MAX_PX = 479;
export const CONFIDE_WIDE_RAIL_MIN_PX = 900;

/**
 * @param {number} widthPx
 * @returns {'center' | 'bottom' | 'right'}
 */
export function confideDockPlacement(widthPx) {
  const w = Number(widthPx);
  if (!Number.isFinite(w) || w <= CONFIDE_NARROW_MAX_PX) return 'center';
  if (w < CONFIDE_WIDE_RAIL_MIN_PX) return 'bottom';
  return 'right';
}

/**
 * @param {'center' | 'bottom' | 'right'} placement
 * @returns {boolean}
 */
export function confideDockLeavesMidlineClear(placement) {
  return placement === 'right' || placement === 'bottom';
}
