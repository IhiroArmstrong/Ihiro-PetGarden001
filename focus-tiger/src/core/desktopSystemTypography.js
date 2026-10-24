/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { isDesktopShellRuntime } from './desktopShell.js';

/** Electron-only UI sans stack (SF Pro / PingFang / Segoe). Web keeps Nunito via :root. */
export const DESKTOP_UI_FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Hiragino Sans", "Yu Gothic UI", "Segoe UI", system-ui, sans-serif';

export const DESKTOP_SHELL_HTML_CLASS = 'ft-desktop-shell';

/**
 * @param {Document} [doc]
 * @param {object} [globalObj]
 * @returns {boolean} whether the desktop shell class is present after apply
 */
export function applyDesktopShellTypographyClass(doc = document, globalObj = globalThis) {
  const root = doc?.documentElement;
  if (!root || !root.classList) return false;
  if (!isDesktopShellRuntime(globalObj)) {
    root.classList.remove(DESKTOP_SHELL_HTML_CLASS);
    return false;
  }
  root.classList.add(DESKTOP_SHELL_HTML_CLASS);
  return true;
}
