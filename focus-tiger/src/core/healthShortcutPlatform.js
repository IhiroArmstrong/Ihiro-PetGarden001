/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { isDesktopShellRuntime } from './desktopShell.js';

/**
 * Brief §5.3 — Health log button surface is iOS / iPadOS only (not Mac Shortcuts Health).
 * @returns {boolean}
 */
export function isIosShortcutsHealthSurface() {
  if (typeof navigator === 'undefined') return false;
  const ua = String(navigator.userAgent || '');
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return (
    navigator.platform === 'MacIntel' &&
    Number(navigator.maxTouchPoints) > 1
  );
}

/**
 * Preferences toggle is writable only on iPhone/iPad Safari web — never in the desktop app.
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canConfigureHealthShortcutLogPreference(globalObj = globalThis) {
  if (isDesktopShellRuntime(globalObj)) return false;
  return isIosShortcutsHealthSurface();
}
