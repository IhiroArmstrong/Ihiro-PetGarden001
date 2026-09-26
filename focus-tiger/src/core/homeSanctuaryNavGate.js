/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Sanctuary home navigation — first-use blue pulse on compass chrome.
 * PO 拍板 2026-09-26 · fan: Home / Calendar / Collection.
 */

export const HOME_SANCTUARY_NAV_SEEN_KEY =
  'focus-tiger.home-sanctuary-nav-seen.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenHomeSanctuaryNav(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(HOME_SANCTUARY_NAV_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldShowHomeSanctuaryNavPulse(storage) {
  return !hasSeenHomeSanctuaryNav(storage);
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markHomeSanctuaryNavSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(HOME_SANCTUARY_NAV_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * @param {HTMLElement | null | undefined} btn
 * @param {boolean} show
 * @returns {void}
 */
export function syncHomeSanctuaryNavPulse(btn, show) {
  if (!btn) return;
  let dot = btn.querySelector(':scope > .ft-home-sanctuary-nav-pulse');
  if (!show) {
    dot?.remove();
    btn.classList.remove('has-sanctuary-nav-pulse');
    return;
  }
  if (!dot) {
    dot = document.createElement('span');
    dot.className = 'ft-home-sanctuary-nav-pulse';
    dot.setAttribute('aria-hidden', 'true');
    btn.appendChild(dot);
  }
  btn.classList.add('has-sanctuary-nav-pulse');
}
