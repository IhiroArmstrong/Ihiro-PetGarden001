/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Wide ⋯ radial index geometry (knife 3).
 * SSOT for height degenerate rules — keep in sync with
 * `docs/task-briefs/task-wide-menu-radial-index.md` and T25
 * `docs/task-briefs/task-wide-more-five-icon-show.md`.
 */

import { WIDE_HOME_CTA_BOTTOM_PX, WIDE_HOME_SIT_PX } from '../ui/homeChromeClearance.js';

/** Five menu groups (Rituals stay inside Practice list). */
export const WIDE_MENU_RADIAL_GROUP_KEYS = Object.freeze([
  'MENU_GROUP_PRACTICE',
  'MENU_GROUP_RECORDS',
  'MENU_GROUP_INSPIRATION',
  'MENU_GROUP_NOT_ALONE',
  'MENU_GROUP_PREFERENCES'
]);

/** Wide ⋯ / radial index; matches `WIDE_MQ` in `WideIdleMoreMenu`. */
export const WIDE_MENU_MIN_VIEWPORT_WIDTH_PX = 480;

/**
 * @param {number} innerWidth
 * @param {boolean} [mqMinWidth480Matches]
 * @returns {boolean}
 */
export function isWideMenuViewport(innerWidth, mqMinWidth480Matches = false) {
  if (Number.isFinite(innerWidth)) {
    return innerWidth >= WIDE_MENU_MIN_VIEWPORT_WIDTH_PX;
  }
  return mqMinWidth480Matches;
}

/** Measured 2026-10-16: below this, fan icons crowd dock + safe inset. */
export const WIDE_MENU_RADIAL_MIN_INNER_HEIGHT_PX = 520;

/** Arc radius from `#ft-wide-more-btn` center (px). */
export const WIDE_MENU_RADIAL_RADIUS_PX = 96;

/** Round group icon diameter (px). */
export const WIDE_MENU_RADIAL_ICON_PX = 44;

/** Degrees from +X; icons fan up-left above ⋯. */
export const WIDE_MENU_RADIAL_ANGLES_DEG = Object.freeze([
  95, 115, 135, 155, 175
]);

const ICON_PAD_PX = 8;
const VIEWPORT_TOP_SAFE_PX = 12;

/**
 * @param {number} anchorX
 * @param {number} anchorY
 * @returns {ReadonlyArray<{ groupKey: string, cx: number, cy: number }>}
 */
export function layoutWideMenuRadialIcons(anchorX, anchorY) {
  const out = [];
  for (let i = 0; i < WIDE_MENU_RADIAL_GROUP_KEYS.length; i++) {
    const deg = WIDE_MENU_RADIAL_ANGLES_DEG[i];
    const rad = (deg * Math.PI) / 180;
    const cx = anchorX + Math.cos(rad) * WIDE_MENU_RADIAL_RADIUS_PX;
    const cy = anchorY - Math.sin(rad) * WIDE_MENU_RADIAL_RADIUS_PX;
    out.push(
      Object.freeze({
        groupKey: WIDE_MENU_RADIAL_GROUP_KEYS[i],
        cx,
        cy
      })
    );
  }
  return out;
}

/**
 * @param {{ cx: number, cy: number }} spot
 * @returns {{ left: number, top: number, right: number, bottom: number }}
 */
export function wideMenuRadialIconBBox(spot) {
  const half = WIDE_MENU_RADIAL_ICON_PX / 2;
  return {
    left: spot.cx - half - ICON_PAD_PX,
    top: spot.cy - half - ICON_PAD_PX,
    right: spot.cx + half + ICON_PAD_PX,
    bottom: spot.cy + half + ICON_PAD_PX
  };
}

/**
 * Estimate ⋯ anchor when layout has not painted yet.
 * @param {number} innerWidth
 * @param {number} innerHeight
 * @returns {{ x: number, y: number }}
 */
export function estimateWideMoreBtnAnchor(innerWidth, innerHeight) {
  const dockHalf = 200;
  const x = innerWidth / 2 + dockHalf - 22;
  const y =
    innerHeight -
    Math.max(WIDE_HOME_CTA_BOTTOM_PX, 28) -
    WIDE_HOME_SIT_PX / 2;
  return { x, y };
}

/**
 * @param {Window | { innerHeight?: number, document?: Document }} win
 * @param {{ x: number, y: number }} anchor
 * @returns {boolean}
 */
export function shouldDegenerateWideMenuRadial(win, anchor) {
  const h = win.innerHeight ?? 0;
  if (h > 0 && h < WIDE_MENU_RADIAL_MIN_INNER_HEIGHT_PX) return true;
  const spots = layoutWideMenuRadialIcons(anchor.x, anchor.y);
  for (const spot of spots) {
    const box = wideMenuRadialIconBBox(spot);
    if (box.top < VIEWPORT_TOP_SAFE_PX) return true;
  }
  return false;
}

/**
 * @param {HTMLElement | null | undefined} moreBtn
 * @param {Window} [win]
 * @returns {boolean}
 */
/** @type {Readonly<Record<string, string>>} */
export const WIDE_MORE_PROXY_MENU_GROUP = Object.freeze({
  'sanctuary-nav': 'MENU_GROUP_PRACTICE',
  companion: 'MENU_GROUP_PRACTICE',
  'ground-exercise': 'MENU_GROUP_PRACTICE',
  'five-moments': 'MENU_GROUP_PRACTICE',
  honesty: 'MENU_GROUP_PRACTICE',
  confide: 'MENU_GROUP_PRACTICE',
  'journey-log': 'MENU_GROUP_RECORDS',
  'presence-signals': 'MENU_GROUP_RECORDS',
  'yin-coin': 'MENU_GROUP_RECORDS',
  'daily-quote': 'MENU_GROUP_INSPIRATION',
  'zen-cinema': 'MENU_GROUP_INSPIRATION',
  'mustard-seed-seal': 'MENU_GROUP_INSPIRATION',
  wallpapers: 'MENU_GROUP_INSPIRATION',
  'art-collection': 'MENU_GROUP_INSPIRATION',
  'quiet-together': 'MENU_GROUP_NOT_ALONE',
  'focus-circle': 'MENU_GROUP_NOT_ALONE',
  community: 'MENU_GROUP_NOT_ALONE',
  reminder: 'MENU_GROUP_PREFERENCES',
  'work-end': 'MENU_GROUP_PREFERENCES',
  language: 'MENU_GROUP_PREFERENCES',
  sound: 'MENU_GROUP_PREFERENCES',
  'always-on-top': 'MENU_GROUP_PREFERENCES',
  'input-rhythm': 'MENU_GROUP_PREFERENCES',
  'mindflow-nebula': 'MENU_GROUP_PREFERENCES',
  'today-direction': 'MENU_GROUP_PREFERENCES',
  newsletter: 'MENU_GROUP_PREFERENCES',
  account: 'MENU_GROUP_PREFERENCES',
  'help-center': 'MENU_GROUP_PREFERENCES',
  'local-backup': 'MENU_GROUP_PREFERENCES',
  membership: 'MENU_GROUP_PREFERENCES'
});

/**
 * @param {string | null | undefined} proxy
 * @returns {string | null}
 */
export function wideMoreMenuGroupForProxy(proxy) {
  const key = String(proxy || '');
  if (!key) return null;
  if (key.startsWith('ritual-')) return 'MENU_GROUP_PRACTICE';
  return WIDE_MORE_PROXY_MENU_GROUP[key] ?? null;
}

export function shouldDegenerateWideMenuRadialForButton(moreBtn, win = globalThis) {
  const rect = moreBtn?.getBoundingClientRect?.();
  if (rect && rect.width >= 8 && rect.height >= 8) {
    return shouldDegenerateWideMenuRadial(win, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
  }
  return shouldDegenerateWideMenuRadial(
    win,
    estimateWideMoreBtnAnchor(win.innerWidth ?? 1280, win.innerHeight ?? 720)
  );
}
