/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Slice A lotus pond — cumulative lifetime minutes → visible blooms.
 *
 * Replaces the 2026-07-15 calendar pond (5/10 practice-day blooms).
 * Both first-bloom minutes and ring capacity are tunable constants;
 * do not hard-code the spiral / store around a frozen 25 / 12.
 *
 * Honest cap: bloom count never exceeds RING_CAPACITY (no crowding, no
 * shrinking). Extra minutes still accrue. Crystallized gold ring = Slice B.
 */

/** First bloom aligns with 一炷香 / default sit length. */
export const LOTUS_POND_FIRST_BLOOM_MINUTES = 25;
/** Approximate flowers in the first spiral ring. */
export const LOTUS_POND_RING_CAPACITY = 12;
/** Step between blooms 2…EARLY_BLOOM_LAST. */
export const LOTUS_POND_EARLY_STEP_MINUTES = 25;
/** Last bloom that still uses the early (incense-sized) step. */
export const LOTUS_POND_EARLY_BLOOM_LAST = 5;
/** Step between later blooms through the ring cap. */
export const LOTUS_POND_LATER_STEP_MINUTES = 45;

/** Vogel / sunflower packing angle (degrees). */
export const LOTUS_POND_GOLDEN_ANGLE_DEG = 137.5;

/**
 * Spiral layout inside `#sprite-overlay` (percent of overlay).
 * Tunable — Yin is not screen-centered; keep inner radius off the face
 * and outer radius inside HUD / Sit chrome.
 *
 * Narrow (≤479): overlay is zoomed and Yin fills the stage, so a tighter
 * golden-angle spiral (Vogel packing, **not** 12 equally spaced clock hours)
 * keeps one ring of up to {@link LOTUS_POND_RING_CAPACITY} around the cushion.
 *
 * Wide (≥480): same packing, larger inner/outer radius so blooms sit farther
 * from Yin (wide screens made the default 17–34% ring look glued to the robe).
 */
export const LOTUS_POND_SPIRAL = Object.freeze({
  originLeftPct: 50,
  originBottomPct: 28,
  rInnerPct: 17,
  rOuterPct: 34,
  yScale: 0.68,
  /** Index 0 points downward (pool at the cushion, not over the face). */
  angleOffsetDeg: -90,
  bloomWidthCss: 'min(12vw, 96px)',
  leftMinPct: 8,
  leftMaxPct: 92,
  bottomMinPct: 10,
  bottomMaxPct: 48
});

/** Wide overlay: push the ring outward so Yin does not sit on the pond. */
export const LOTUS_POND_SPIRAL_WIDE = Object.freeze({
  originLeftPct: 50,
  originBottomPct: 22,
  rInnerPct: 26,
  rOuterPct: 46,
  yScale: 0.72,
  angleOffsetDeg: -90,
  bloomWidthCss: 'min(7.5vw, 80px)',
  leftMinPct: 6,
  leftMaxPct: 94,
  bottomMinPct: 6,
  bottomMaxPct: 46
});

/** Product wide/narrow home breakpoint (see RESPONSIVE_LAYOUT.md). */
export const LOTUS_POND_WIDE_MIN_PX = 480;

/**
 * @param {number} widthPx overlay or viewport width
 * @returns {typeof LOTUS_POND_SPIRAL}
 */
export function spiralForViewportWidth(widthPx) {
  const w = Number(widthPx);
  if (Number.isFinite(w) && w >= LOTUS_POND_WIDE_MIN_PX) {
    return LOTUS_POND_SPIRAL_WIDE;
  }
  return LOTUS_POND_SPIRAL;
}

/**
 * Minutes needed to earn bloom `n` (1-based). `n < 1` → 0.
 * Values above the ring cap still return the cap threshold (Slice A has
 * no 13th flower).
 * @param {number} n
 * @returns {number}
 */
export function thresholdMinutesForBloom(n) {
  const i = Math.floor(Number(n));
  if (!Number.isFinite(i) || i < 1) return 0;
  const capped = Math.min(i, LOTUS_POND_RING_CAPACITY);
  if (capped <= LOTUS_POND_EARLY_BLOOM_LAST) {
    return (
      LOTUS_POND_FIRST_BLOOM_MINUTES +
      (capped - 1) * LOTUS_POND_EARLY_STEP_MINUTES
    );
  }
  const earlyLastMinutes =
    LOTUS_POND_FIRST_BLOOM_MINUTES +
    (LOTUS_POND_EARLY_BLOOM_LAST - 1) * LOTUS_POND_EARLY_STEP_MINUTES;
  return (
    earlyLastMinutes +
    (capped - LOTUS_POND_EARLY_BLOOM_LAST) * LOTUS_POND_LATER_STEP_MINUTES
  );
}

/**
 * Visible blooms for a lifetime minute total. Never exceeds the ring cap.
 * @param {number} minutes
 * @returns {number}
 */
export function bloomCountForMinutes(minutes) {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m < LOTUS_POND_FIRST_BLOOM_MINUTES) return 0;
  let count = 0;
  for (let n = 1; n <= LOTUS_POND_RING_CAPACITY; n += 1) {
    if (m >= thresholdMinutesForBloom(n)) count = n;
    else break;
  }
  return count;
}

/**
 * 0-based indices of newly earned blooms when the visible count rises.
 * @param {number} previousCount
 * @param {number} nextCount
 * @returns {number[]}
 */
export function newBloomIndices(previousCount, nextCount) {
  const from = Math.max(0, Math.floor(Number(previousCount)) || 0);
  const to = Math.min(
    LOTUS_POND_RING_CAPACITY,
    Math.max(from, Math.floor(Number(nextCount)) || 0)
  );
  /** @type {number[]} */
  const out = [];
  for (let i = from; i < to; i += 1) out.push(i);
  return out;
}

/**
 * QA seed: `N` flowers showing, and a 1-minute sit can birth `N+1`
 * (except `N === cap`, which sits exactly on the last threshold).
 * @param {number} bloomCount
 * @returns {number}
 */
export function minutesToSeedQaBloomCount(bloomCount) {
  const n = Math.floor(Number(bloomCount));
  if (!Number.isFinite(n) || n <= 0) {
    return Math.max(0, thresholdMinutesForBloom(1) - 1);
  }
  if (n >= LOTUS_POND_RING_CAPACITY) {
    return thresholdMinutesForBloom(LOTUS_POND_RING_CAPACITY);
  }
  return Math.max(0, thresholdMinutesForBloom(n + 1) - 1);
}

/**
 * @param {{
 *   originLeftPct: number,
 *   originBottomPct: number,
 *   rInnerPct: number,
 *   rOuterPct: number,
 *   yScale: number,
 *   angleOffsetDeg: number,
 *   bloomWidthCss: string,
 *   leftMinPct: number,
 *   leftMaxPct: number,
 *   bottomMinPct: number,
 *   bottomMaxPct: number
 * }} [spiral]
 * @param {number} index 0-based bloom index
 */
export function spiralSlotForBloomIndex(index, spiral = LOTUS_POND_SPIRAL) {
  const i = Math.max(0, Math.floor(Number(index)) || 0);
  const last = Math.max(1, LOTUS_POND_RING_CAPACITY - 1);
  const t = Math.min(i, last) / last;
  const r =
    spiral.rInnerPct + (spiral.rOuterPct - spiral.rInnerPct) * Math.sqrt(t);
  const rad =
    ((spiral.angleOffsetDeg + i * LOTUS_POND_GOLDEN_ANGLE_DEG) * Math.PI) /
    180;
  return {
    index: i,
    leftPct: clamp(spiral.originLeftPct + r * Math.cos(rad), spiral.leftMinPct, spiral.leftMaxPct),
    bottomPct: clamp(
      spiral.originBottomPct + r * spiral.yScale * Math.sin(rad),
      spiral.bottomMinPct,
      spiral.bottomMaxPct
    ),
    widthCss: spiral.bloomWidthCss
  };
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
