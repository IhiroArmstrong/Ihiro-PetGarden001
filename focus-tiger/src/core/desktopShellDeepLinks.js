/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  PRACTICE_DEEP_LINK_EVENT,
  replacePracticeDeepLinkSearch
} from './practiceDeepLinkLocation.js';

/**
 * Checkout resume + practice in-page query (Electron C). Sit apply stays on Web B.
 *
 * @param {object} deps
 * @param {() => boolean} deps.isDesktopShell
 * @param {(search?: string) => unknown} deps.resumeCheckout
 * @param {() => null | { onShellVisibility?: Function, onCheckoutReturn?: Function, onPracticeDeepLink?: Function }} deps.getShell
 * @param {() => unknown} deps.readCheckoutPending
 * @param {typeof document} [deps.doc]
 * @param {typeof window} [deps.win]
 */
export function attachDesktopShellDeepLinks(deps) {
  if (!deps.isDesktopShell()) return;
  const doc = deps.doc ?? document;
  const win = deps.win ?? window;
  const tickCheckout = () => {
    void deps.resumeCheckout();
  };
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'visible') tickCheckout();
  });
  win.addEventListener('focus', tickCheckout);
  const shell = deps.getShell();
  shell?.onShellVisibility?.((payload) => {
    if (payload?.hidden === false) tickCheckout();
  });
  shell?.onCheckoutReturn?.((search) => {
    void deps.resumeCheckout(search);
  });
  shell?.onPracticeDeepLink?.((search) => {
    replacePracticeDeepLinkSearch(win.history, win.location, search);
    win.dispatchEvent(
      new CustomEvent(PRACTICE_DEEP_LINK_EVENT, { detail: { search } })
    );
  });
  tickCheckout();
  win.setInterval(() => {
    if (!deps.readCheckoutPending()) return;
    tickCheckout();
  }, 2500);
}
