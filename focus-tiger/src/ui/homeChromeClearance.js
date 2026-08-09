/**
 * Shared clearance above Idle/Dormant home balls for bottom-anchored copy.
 *
 * Narrow `#ft-narrow-home-ctas`: bottom ≈ 64px, Sit ≈ 83px → top ≈ 147px.
 * Soft toasts / light panels that sit in the lower third must clear that band
 * (plus a small gap). Do not invent a second magic `bottom:NNpx` per surface.
 *
 * Top-anchored copy (e.g. flower welcome bubble) must clear the narrow ActionBar
 * (time / Calm pill) — same formula as FocusHUD under focusing chrome.
 *
 * @see NarrowIdleShell.js `.ft-narrow-home-ctas` / `.ft-narrow-action-bar`
 * @see MindfulAcknowledgeToast.js bottom placement
 */

export const HOME_CHROME_NARROW_MQ = '(max-width: 479px)';

/** Matches NarrowIdleShell ActionBar `top: max(10px, safe-area)`. */
export const NARROW_ACTION_BAR_TOP_PAD_PX = 10;

/** Matches NarrowIdleShell `.ft-narrow-action-bar { height: 48px }`. */
export const NARROW_ACTION_BAR_HEIGHT_PX = 48;

/** Air between ActionBar bottom and top-anchored copy. */
export const NARROW_COPY_BELOW_ACTION_BAR_GAP_PX = 8;

/** Matches NarrowIdleShell home CTA `bottom: max(64px, …)`. */
export const NARROW_HOME_CTA_BOTTOM_PX = 64;

/** Matches NarrowIdleShell `HOME_SIT_PX` (72 × 1.155). */
export const NARROW_HOME_SIT_PX = Math.round(72 * 1.155);

/** Air between Sit ball top and copy bottom edge. */
export const NARROW_COPY_ABOVE_HOME_GAP_PX = 16;

/** Wide / default bottom toast offset (pre–three-ball era baseline). */
export const WIDE_COPY_BOTTOM_PX = 104;

/**
 * @returns {number} CSS px for `bottom` on narrow when home balls are visible
 */
export function narrowHomeCopyClearanceBottomPx() {
  return (
    NARROW_HOME_CTA_BOTTOM_PX +
    NARROW_HOME_SIT_PX +
    NARROW_COPY_ABOVE_HOME_GAP_PX
  );
}

/**
 * @param {Window | { matchMedia?: Function }} [win]
 * @returns {boolean}
 */
export function isNarrowHomeChromeViewport(win = globalThis) {
  return (
    typeof win?.matchMedia === 'function' &&
    win.matchMedia(HOME_CHROME_NARROW_MQ).matches
  );
}

/**
 * CSS `bottom` value for soft bottom-anchored copy above home balls.
 * @param {Window | { matchMedia?: Function }} [win]
 * @returns {string}
 */
export function homeClearanceBottomCss(win = globalThis) {
  if (isNarrowHomeChromeViewport(win)) {
    const px = narrowHomeCopyClearanceBottomPx();
    return `max(${px}px, calc(${NARROW_HOME_CTA_BOTTOM_PX}px + ${NARROW_HOME_SIT_PX}px + ${NARROW_COPY_ABOVE_HOME_GAP_PX}px + env(safe-area-inset-bottom, 0px)))`;
  }
  return `${WIDE_COPY_BOTTOM_PX}px`;
}

/**
 * Fallback px when safe-area is 0 (matches FocusHUD narrow focusing top).
 * @returns {number}
 */
export function narrowActionBarCopyClearanceTopPx() {
  return (
    NARROW_ACTION_BAR_TOP_PAD_PX +
    NARROW_ACTION_BAR_HEIGHT_PX +
    NARROW_COPY_BELOW_ACTION_BAR_GAP_PX
  );
}

/**
 * CSS `top` for top-anchored copy below narrow ActionBar (time / Calm).
 * Wide: light safe-area pad only (no ActionBar pill).
 * @param {Window | { matchMedia?: Function }} [win]
 * @returns {string}
 */
export function homeClearanceTopCss(win = globalThis) {
  if (isNarrowHomeChromeViewport(win)) {
    const px = narrowActionBarCopyClearanceTopPx();
    return `max(${px}px, calc(${NARROW_ACTION_BAR_TOP_PAD_PX}px + env(safe-area-inset-top, 0px) + ${NARROW_ACTION_BAR_HEIGHT_PX}px + ${NARROW_COPY_BELOW_ACTION_BAR_GAP_PX}px))`;
  }
  return 'max(12px, calc(env(safe-area-inset-top, 0px) + 10px))';
}

/**
 * Inventory of bottom-anchored copy surfaces that must clear home balls
 * (or hide balls) on narrow Idle/Dormant. Keep in sync when adding toasts.
 * Used by unit tests + docs — not a runtime scanner.
 */
export const BOTTOM_COPY_CLEARANCE_SURFACES = Object.freeze([
  {
    id: 'mindful-acknowledge-toast-bottom',
    selector: '#mindful-acknowledge-toast[data-placement="bottom"]',
    owner: 'MindfulAcknowledgeToast.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'WELLNESS_LATE_NIGHT_REST / morning wake / blocked / lost — default bottom'
  },
  {
    id: 'honesty-bridge-cta',
    selector: '#honesty-bridge-cta',
    owner: 'HonestyBridgeCtaUI.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'narrow CSS belt lifts bottom; home balls should also suppress while bridge visible'
  },
  {
    id: 'arrival-practice-panel',
    selector: '#arrival-practice',
    owner: 'ArrivalPracticeUI.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'Arrival keepQuickStart hides Sit/Honesty; belt still clears Quick ball'
  },
  {
    id: 'honesty-check-in-panel',
    selector: '#honesty-check-in',
    owner: 'HonestyCheckInUI.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'busy chrome path; belt replaces fragile per-panel bottom magic'
  },
  {
    id: 'micro-ritual-panel',
    selector: '#micro-ritual',
    owner: 'MicroRitualUI.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'Sit unavailable while open; belt clears remaining Quick ball'
  },
  {
    id: 'ritual-flow-panel',
    selector: '#ritual-flow',
    owner: 'RitualFlowUI.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'advanced RitualFlow overlay; mutual exclusion with MicroRitual'
  },
  {
    id: 'tiger-reflection-moment',
    selector: '#tiger-reflection-moment',
    owner: 'TigerReflectionMoment.js + NarrowIdleShell clearance belt',
    usesSharedClearance: true,
    notes: 'post-session copy; belt clears home balls on Idle return'
  }
]);
