/**
 * Sanctuary Enso Mark — prestige identity chrome (lifetime ∪ subscription).
 *
 * Zero tip coupling. Display math is pure so unit tests can lock layout
 * without DOM. 2026-08-15: viewport bottom-left (not cushion inlay).
 */

import { getEntitlementState } from './entitlement/entitlementGate.js';

export const SANCTUARY_ENSO_MARK_SRC =
  '/ui/support/sanctuary-enso/sanctuary-enso-mark.png';

/** Matches `HOME_CHROME_NARROW_MQ` (max-width 479px). */
export const ENSO_NARROW_MQ_MAX_PX = 479;

/** Wide corner medallion — chrome scale, not cushion-scale. */
export const ENSO_CORNER_SIZE_WIDE_PX = 52;

/** Narrow floor so 375 still reads as a mark (matches prior Brief ≥ ~44). */
export const ENSO_CORNER_SIZE_NARROW_PX = 44;

export const ENSO_CORNER_LEFT_WIDE_PX = 16;
export const ENSO_CORNER_LEFT_NARROW_PX = 12;
export const ENSO_CORNER_BOTTOM_WIDE_PX = 20;

/**
 * Matches `homeChromeClearance` home-ball band so 375 Enso sits above
 * Quick / Sit / Honesty (`NARROW_HOME_CTA_BOTTOM_PX` + `NARROW_HOME_SIT_PX`).
 */
export const ENSO_HOME_BALLS_BOTTOM_PX = 64;
export const ENSO_HOME_SIT_PX = 83;
export const ENSO_CORNER_GAP_ABOVE_BALLS_PX = 12;

export const ENSO_CORNER_BOTTOM_NARROW_PX =
  ENSO_HOME_BALLS_BOTTOM_PX +
  ENSO_HOME_SIT_PX +
  ENSO_CORNER_GAP_ABOVE_BALLS_PX;

export const ENSO_OPACITY_IDLE = 0.84;
export const ENSO_OPACITY_FOCUSING = 0.5;
export const ENSO_OPACITY_HOVER = 1;

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {boolean}
 */
export function shouldShowSanctuaryEnsoMark({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date()
} = {}) {
  const state = getEntitlementState({ storage, now });
  return Boolean(state.lifetimeActive || state.subscription.entitled);
}

/**
 * Viewport-fixed bottom-left box. Independent of sprite / cushion.
 *
 * Wide: true page corner (dock is centered; heatmap sits higher).
 * Narrow (≤479): lift above home balls so Quick Start is not covered.
 *
 * @param {{
 *   viewportWidth?: number,
 *   safeAreaLeft?: number,
 *   safeAreaBottom?: number
 * } | null | undefined} viewport
 * @returns {{ left: number, bottom: number, size: number } | null}
 */
export function layoutSanctuaryEnsoMark(viewport) {
  const vw = viewport?.viewportWidth;
  if (!(vw > 0) || !Number.isFinite(vw)) return null;

  const safeLeft = Number.isFinite(viewport.safeAreaLeft)
    ? viewport.safeAreaLeft
    : 0;
  const safeBottom = Number.isFinite(viewport.safeAreaBottom)
    ? viewport.safeAreaBottom
    : 0;
  const narrow = vw <= ENSO_NARROW_MQ_MAX_PX;
  const size = narrow
    ? ENSO_CORNER_SIZE_NARROW_PX
    : ENSO_CORNER_SIZE_WIDE_PX;
  const left = Math.max(
    narrow ? ENSO_CORNER_LEFT_NARROW_PX : ENSO_CORNER_LEFT_WIDE_PX,
    safeLeft
  );
  const bottom = narrow
    ? Math.max(ENSO_HOME_BALLS_BOTTOM_PX, safeBottom) +
      ENSO_HOME_SIT_PX +
      ENSO_CORNER_GAP_ABOVE_BALLS_PX
    : Math.max(ENSO_CORNER_BOTTOM_WIDE_PX, safeBottom);
  return { left, bottom, size };
}

/**
 * @param {boolean} focusing
 * @param {boolean} [hover]
 * @returns {number}
 */
export function sanctuaryEnsoOpacity(focusing, hover = false) {
  if (hover && !focusing) return ENSO_OPACITY_HOVER;
  return focusing ? ENSO_OPACITY_FOCUSING : ENSO_OPACITY_IDLE;
}
