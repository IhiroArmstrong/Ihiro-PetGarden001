/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T42 · shared wide-screen dock geometry (same breakpoints as T41 Confide).
 */

import {
  CONFIDE_NARROW_MAX_PX,
  CONFIDE_WIDE_RAIL_MIN_PX
} from './confideDockPlacement.js';

export {
  CONFIDE_NARROW_MAX_PX as WIDE_SECONDARY_NARROW_MAX_PX,
  CONFIDE_WIDE_RAIL_MIN_PX as WIDE_SECONDARY_RAIL_MIN_PX,
  confideDockLeavesMidlineClear as wideSecondaryDockLeavesMidlineClear,
  confideDockPlacement as wideSecondaryDockPlacement
} from './confideDockPlacement.js';

/**
 * @param {string} selector
 * @param {{ slide?: boolean }} [opts] Confide / Journey fade from a 10px offset
 * @returns {string}
 */
export function wideSecondaryDockCss(selector, opts = {}) {
  const slide = opts.slide === true;
  const bottomRest = slide ? 'translate(-50%, 10px)' : 'translate(-50%, 0)';
  const rightRest = slide ? 'translate(12px, -50%)' : 'translate(0, -50%)';
  const visibleRule = slide
    ? `${selector}.is-visible { transform: translate(-50%, 0); }`
    : '';
  const visibleRightRule = slide
    ? `${selector}.is-visible { transform: translate(0, -50%); }`
    : '';
  const minWide = CONFIDE_NARROW_MAX_PX + 1;
  const maxStrip = CONFIDE_WIDE_RAIL_MIN_PX - 1;
  return `
      @media (min-width: ${minWide}px) and (max-width: ${maxStrip}px) {
        ${selector} {
          left: 50%;
          right: auto;
          top: auto;
          bottom: max(12px, env(safe-area-inset-bottom, 0px));
          width: min(720px, calc(100vw - 24px));
          max-height: min(42vh, 380px);
          transform: ${bottomRest};
        }
        ${visibleRule}
      }
      @media (min-width: ${CONFIDE_WIDE_RAIL_MIN_PX}px) {
        ${selector} {
          left: auto;
          right: max(16px, env(safe-area-inset-right, 0px));
          top: 50%;
          bottom: auto;
          width: min(380px, 34vw);
          max-height: min(78vh, 640px);
          transform: ${rightRest};
        }
        ${visibleRightRule}
      }
  `;
}
