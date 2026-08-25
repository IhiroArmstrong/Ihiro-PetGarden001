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

import { isDesktopShellRuntime } from './desktopShell.js';

/** @typedef {'unknown' | 'available' | 'unavailable'} DocumentPipProbeState */

/** @type {DocumentPipProbeState} */
let documentPipProbeState = 'unknown';

/**
 * @returns {DocumentPipProbeState}
 */
export function getDocumentPictureInPictureProbeState() {
  return documentPipProbeState;
}

/** @returns {void} */
export function resetDocumentPictureInPictureProbeState() {
  documentPipProbeState = 'unknown';
}

/** @returns {void} */
export function markDocumentPictureInPictureUnavailable() {
  documentPipProbeState = 'unavailable';
}

/**
 * API shape only — not proof that `requestWindow()` succeeds (Electron).
 * @param {Window | undefined | null} [win]
 * @returns {boolean}
 */
export function hasDocumentPictureInPictureShape(win = globalThis) {
  try {
    return typeof win?.documentPictureInPicture?.requestWindow === 'function';
  } catch {
    return false;
  }
}

/**
 * Electron desktop shell must pass a live probe before showing PiP entry.
 * @param {Window | undefined | null} [win]
 * @returns {boolean}
 */
export function needsDocumentPictureInPictureProbe(win = globalThis) {
  return (
    hasDocumentPictureInPictureShape(win) && isDesktopShellRuntime(win)
  );
}

/**
 * Whether PiP entry may be shown (shape + probe; §6.21 H1).
 * @param {Window | undefined | null} [win]
 * @returns {boolean}
 */
export function shouldShowDocumentPictureInPictureEntry(win = globalThis) {
  if (!hasDocumentPictureInPictureShape(win)) return false;
  if (documentPipProbeState === 'unavailable') return false;
  if (documentPipProbeState === 'available') return true;
  if (needsDocumentPictureInPictureProbe(win)) return false;
  return true;
}

/**
 * Desktop Chromium / recent Firefox; not Safari; not mobile Chrome.
 * Alias of {@link shouldShowDocumentPictureInPictureEntry}.
 * @param {Window | undefined | null} [win]
 * @returns {boolean}
 */
export function supportsDocumentPictureInPicture(win = globalThis) {
  return shouldShowDocumentPictureInPictureEntry(win);
}

/**
 * Live probe for Electron (and other shells where shape lies).
 * @param {Window | undefined | null} [win]
 * @returns {Promise<boolean>}
 */
export async function probeDocumentPictureInPicture(win = globalThis) {
  if (!hasDocumentPictureInPictureShape(win)) {
    documentPipProbeState = 'unavailable';
    return false;
  }
  if (documentPipProbeState === 'unavailable') return false;
  if (documentPipProbeState === 'available') return true;
  if (!needsDocumentPictureInPictureProbe(win)) {
    documentPipProbeState = 'available';
    return true;
  }
  try {
    const pipWindow = await win.documentPictureInPicture.requestWindow({
      width: 64,
      height: 64,
      preferInitialWindowPlacement: true
    });
    try {
      pipWindow.close();
    } catch {
      // ignore
    }
    documentPipProbeState = 'available';
    return true;
  } catch {
    documentPipProbeState = 'unavailable';
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
