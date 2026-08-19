/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Quiet 寅币 caption under Focus / Breath duration chips.
 * Not a HUD, not a toast, not L3 drawer.
 */

import { t } from '../locales/i18n.js';
import { isFocusCoinsAwardEnabled } from '../core/focusCoinsAwardGate.js';

export const FOCUS_COINS_DURATION_HINT_ID = 'focus-coins-duration-hint';

/**
 * @param {{ search?: string }} [opts]
 * @returns {boolean}
 */
export function shouldShowFocusCoinsDurationHint({ search = '' } = {}) {
  return isFocusCoinsAwardEnabled({ search });
}

/**
 * @param {{ search?: string }} [opts]
 * @returns {HTMLParagraphElement | null}
 */
export function createFocusCoinsDurationHint({ search = '' } = {}) {
  if (!shouldShowFocusCoinsDurationHint({ search })) return null;
  const hint = document.createElement('p');
  hint.id = FOCUS_COINS_DURATION_HINT_ID;
  hint.className = 'focus-coins-duration-hint';
  hint.dataset.focusCoinsDurationHint = '1';
  hint.style.cssText =
    'margin:0 0 12px;font-size:11px;line-height:1.45;color:#8b7355;text-align:center;font-weight:400;';
  hint.textContent = t('focus_coins.duration_hint');
  return hint;
}

/**
 * @returns {string}
 */
export function readFocusCoinsHintSearch() {
  return typeof location !== 'undefined' ? location.search : '';
}
