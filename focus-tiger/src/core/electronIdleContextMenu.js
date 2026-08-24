/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron-only Idle blank right-click → open the same secondary menu as ⋯ / drawer.
 * Web Safari must not register this listener (no global contextmenu steal).
 */

import { isDesktopShellRuntime } from './desktopShell.js';

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'textarea',
  'select',
  'label',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="link"]',
  '[contenteditable="true"]',
  'ft-onboarding-hint-bubble'
].join(',');

const CHROME_SELECTOR = [
  '#session-start-dock',
  '#btn-focus',
  '#yin-sprite-player',
  '#sprite-player',
  '#active-recover-anchor',
  '#immersive-presence',
  '#focus-hud',
  '#arrival-practice',
  '#reflection-moment',
  '#companion-mode',
  '#honesty-idle',
  '#ft-wide-more-btn',
  '#ft-wide-more-menu',
  '#ft-wide-more-backdrop',
  '#ft-narrow-options-drawer',
  '#ft-narrow-grabber',
  '#ft-narrow-home-ctas',
  '#idle-yin-tap-anchor',
  '.onboarding-hint-help',
  '#ft-narrow-help-btn',
  '#onboarding-app-purpose',
  '#onboarding-privacy-sheet'
].join(',');

/**
 * @param {EventTarget | null | undefined} target
 * @returns {boolean}
 */
export function isElectronIdleContextMenuTarget(target) {
  const el =
    target && typeof target === 'object' && typeof target.closest === 'function'
      ? /** @type {Element} */ (target)
      : null;
  if (!el) return false;
  if (el.closest(INTERACTIVE_SELECTOR)) return false;
  if (el.closest(CHROME_SELECTOR)) return false;
  return true;
}

/**
 * @param {{
 *   getIsIdleContextMenuAllowed?: () => boolean,
 *   onOpenSecondaryMenu?: () => void
 * }} [options]
 * @returns {() => void} unbind
 */
export function bindElectronIdleContextMenu({
  getIsIdleContextMenuAllowed = () => false,
  onOpenSecondaryMenu = () => {}
} = {}) {
  if (!isDesktopShellRuntime()) return () => {};

  const onContextMenu = (event) => {
    if (!getIsIdleContextMenuAllowed()) return;
    if (!isElectronIdleContextMenuTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    onOpenSecondaryMenu();
  };

  document.addEventListener('contextmenu', onContextMenu, true);
  return () => document.removeEventListener('contextmenu', onContextMenu, true);
}
