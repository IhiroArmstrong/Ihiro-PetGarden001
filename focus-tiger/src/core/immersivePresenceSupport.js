/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Immersive Presence (MVP probe) — feature detection & gate helpers.
 * Product name ≠ Companion Mode (stay / stepAway / acrossTools).
 *
 * @see docs/DESIGN.md「全屏陪伴 / Immersive Presence」
 */

/**
 * Document Picture-in-Picture (HTML in a floating window).
 * Desktop Chromium / recent Firefox; not Safari; not mobile Chrome.
 * @param {Window | undefined | null} [win]
 * @returns {boolean}
 */
export function supportsDocumentPictureInPicture(win = globalThis) {
  try {
    return typeof win?.documentPictureInPicture?.requestWindow === 'function';
  } catch {
    return false;
  }
}

/**
 * Best-effort browser fullscreen (optional enhancement; iOS often unavailable).
 * @param {Document | undefined | null} [doc]
 * @returns {boolean}
 */
export function supportsElementFullscreen(doc = globalThis.document) {
  try {
    const el = doc?.documentElement;
    return Boolean(
      el &&
        (typeof el.requestFullscreen === 'function' ||
          typeof el.webkitRequestFullscreen === 'function')
    );
  } catch {
    return false;
  }
}

/**
 * Controls may open only while Focusing and not mid completion overlay.
 * @param {{ isFocusing?: boolean, completionPending?: boolean }} state
 * @returns {boolean}
 */
export function canEnterImmersivePresence(state = {}) {
  return Boolean(state.isFocusing) && !state.completionPending;
}

/**
 * @param {Document | undefined | null} [doc]
 * @returns {boolean}
 */
export function isDocumentFullscreen(doc = globalThis.document) {
  try {
    return Boolean(doc?.fullscreenElement || doc?.webkitFullscreenElement);
  } catch {
    return false;
  }
}

/**
 * @param {HTMLElement} el
 * @returns {Promise<void>}
 */
export async function requestElementFullscreen(el) {
  if (!el) return;
  if (typeof el.requestFullscreen === 'function') {
    await el.requestFullscreen();
    return;
  }
  if (typeof el.webkitRequestFullscreen === 'function') {
    el.webkitRequestFullscreen();
  }
}

/**
 * @param {Document | undefined | null} [doc]
 * @returns {Promise<void>}
 */
export async function exitElementFullscreen(doc = globalThis.document) {
  try {
    if (doc?.fullscreenElement && typeof doc.exitFullscreen === 'function') {
      await doc.exitFullscreen();
      return;
    }
    if (
      doc?.webkitFullscreenElement &&
      typeof doc.webkitExitFullscreen === 'function'
    ) {
      doc.webkitExitFullscreen();
    }
  } catch {
    // User / OS may already have exited.
  }
}

/**
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatMmSs(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
