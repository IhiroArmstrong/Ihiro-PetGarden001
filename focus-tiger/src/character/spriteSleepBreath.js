/**
 * Sleep-pose back breath helpers (pure).
 * Base sprite stays still; a clipped back region is vertically scaled each frame.
 */

/** Fraction of the displayed sprite box (object-fit content rect).
 * Tuned to the cloak **back hump** only (user screenshot 2026-08-04):
 * head stays left/outside; small ellipse on the mound crest.
 */
export const SLEEP_BREATH_BACK = Object.freeze({
  /** Right of the head, center of the back mound under the cloak. */
  cx: 0.63,
  /** Crest of the back hump (higher on the sprite). */
  cy: 0.43,
  /** Small horizontal radius — excludes head. */
  rx: 0.13,
  /** Small vertical radius — just the mound. */
  ry: 0.09
});

export const SLEEP_BREATH_PERIOD_MS = 3400;
/** ~10% vertical swell on the back mound only. */
export const SLEEP_BREATH_SCALE_Y_PEAK = 1.1;

/**
 * @param {number} nowMs
 * @param {number} [periodMs]
 * @param {number} [peak]
 * @returns {number} scaleY ≥ 1
 */
export function sleepBreathScaleYAt(
  nowMs,
  periodMs = SLEEP_BREATH_PERIOD_MS,
  peak = SLEEP_BREATH_SCALE_Y_PEAK
) {
  if (!Number.isFinite(nowMs) || periodMs <= 0) return 1;
  const phase = ((nowMs % periodMs) + periodMs) % periodMs;
  const t = (phase / periodMs) * Math.PI * 2;
  // t=0 → 1 (rest); mid-cycle → peak; ease with cosine
  const u = (1 - Math.cos(t)) / 2;
  return 1 + (peak - 1) * u;
}

/**
 * Ellipse in overlay-local CSS pixels covering the back mound.
 * @param {{ left: number, top: number, width: number, height: number }} displayRect overlay-local
 * @param {{ cx?: number, cy?: number, rx?: number, ry?: number }} [region]
 */
export function sleepBreathEllipseInDisplayRect(
  displayRect,
  region = SLEEP_BREATH_BACK
) {
  const w = displayRect.width;
  const h = displayRect.height;
  const cx = displayRect.left + w * (region.cx ?? SLEEP_BREATH_BACK.cx);
  const cy = displayRect.top + h * (region.cy ?? SLEEP_BREATH_BACK.cy);
  const rx = w * (region.rx ?? SLEEP_BREATH_BACK.rx);
  const ry = h * (region.ry ?? SLEEP_BREATH_BACK.ry);
  return { cx, cy, rx, ry };
}
