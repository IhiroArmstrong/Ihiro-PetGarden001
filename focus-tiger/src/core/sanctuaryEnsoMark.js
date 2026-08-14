/**
 * Sanctuary Enso Mark — prestige cushion inlay (lifetime ∪ subscription).
 *
 * Zero tip coupling. Display math is pure so unit tests can lock layout
 * without DOM / sprite player.
 */

import { getEntitlementState } from './entitlement/entitlementGate.js';

export const SANCTUARY_ENSO_MARK_SRC =
  '/ui/support/sanctuary-enso/sanctuary-enso-mark.png';

/**
 * Natural-pixel anchors on idle-breathing `frame_001` (1056×864).
 *
 * Measured 2026-08-12: cushion mass center ≈ (552, 730); camera-facing
 * cushion face (visible orange in front of crossed legs) ≈ (552, 770).
 * We pin to the **visible face** so the inlay stays inside the cushion
 * (about 25% of cushion diameter) without covering the shawl or face.
 */
export const ENSO_CUSHION_ANCHOR_NATURAL = Object.freeze({
  frameWidth: 1056,
  frameHeight: 864,
  /** Horizontal center of cushion bbox */
  x: 552,
  /** Camera-facing cushion face (not mass center under hips) */
  y: 770,
  /** Visible cushion width (bbox) used as diameter for sizing */
  cushionDiameter: 553
});

/** Target share of cushion visible diameter (~40% smaller than the 0.42 first pass). */
export const ENSO_DIAMETER_FRAC = 0.25;

/** Floor so 375 CSS px still reads as “可辨” (Brief ≥ ~44 CSS px). */
export const ENSO_MIN_CSS_PX = 44;

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
 * Map sprite `getDisplayRect()` → fixed CSS box for the Enso mark.
 *
 * Fractions are taken from the idle reference frame so other sequences
 * with different natural sizes still land near the cushion.
 *
 * @param {{
 *   left: number,
 *   top: number,
 *   width: number,
 *   height: number,
 *   naturalWidth?: number,
 *   naturalHeight?: number
 * } | null | undefined} displayRect
 * @returns {{ left: number, top: number, size: number } | null}
 */
export function layoutSanctuaryEnsoMark(displayRect) {
  if (
    !displayRect ||
    !(displayRect.width > 0) ||
    !(displayRect.height > 0) ||
    !Number.isFinite(displayRect.left) ||
    !Number.isFinite(displayRect.top)
  ) {
    return null;
  }

  const ref = ENSO_CUSHION_ANCHOR_NATURAL;
  const fx = ref.x / ref.frameWidth;
  const fy = ref.y / ref.frameHeight;
  const cushionFrac = ref.cushionDiameter / ref.frameWidth;
  const size = Math.max(
    ENSO_MIN_CSS_PX,
    cushionFrac * displayRect.width * ENSO_DIAMETER_FRAC
  );
  const cx = displayRect.left + fx * displayRect.width;
  const cy = displayRect.top + fy * displayRect.height;
  return {
    left: cx - size / 2,
    top: cy - size / 2,
    size
  };
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
