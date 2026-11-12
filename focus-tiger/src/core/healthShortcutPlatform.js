/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

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
