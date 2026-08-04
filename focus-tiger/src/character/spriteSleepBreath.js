/**
 * Sleep-pose back breath helpers (pure).
 * Base sprite stays still; a clipped back region is vertically scaled each frame.
 */

/** Fraction of the displayed sprite box (object-fit content rect). */
export const SLEEP_BREATH_BACK = Object.freeze({
  /** Ellipse center X within content rect (head left; cloak back mid-right). */
  cx: 0.56,
  /** Ellipse center Y within content rect. */
  cy: 0.5,
  /** Horizontal radius as fraction of content width. */
  rx: 0.3,
  /** Vertical radius as fraction of content height. */
  ry: 0.18
});

export const SLEEP_BREATH_PERIOD_MS = 3400;
/** Peak vertical swell — must be clearly visible on soft cloak fabric. */
export const SLEEP_BREATH_SCALE_Y_PEAK = 1.12;

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
