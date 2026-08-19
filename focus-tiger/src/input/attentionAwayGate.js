/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { isTrayHideReason } from '../../desktop/trayPolicy.js';

/**
 * Whether AttentionSignals should treat the shell as "user went to another app".
 * Hide-to-tray (SB-18) is not away, even when `document.hidden` is true.
 *
 * @param {{
 *   windowFocused?: boolean,
 *   documentVisible?: boolean,
 *   hideReason?: string | null,
 * }} [state]
 * @returns {boolean}
 */
export function isAttentionAway(state = {}) {
  if (isTrayHideReason(state.hideReason)) return false;
  return !state.windowFocused || !state.documentVisible;
}
