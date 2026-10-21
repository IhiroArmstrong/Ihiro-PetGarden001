/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Pure policy for the macOS NSPanel floating companion.
 * Swift helper must mirror these tokens (see desktop/native/floating-marker.swift).
 */

export const DEFAULT_FLOATING_MARKER_PREFS = Object.freeze({
  show: false,
  hideInFullScreen: true
});

/**
 * @param {unknown} raw
 * @returns {{ show: boolean, hideInFullScreen: boolean }}
 */
export function normalizeFloatingMarkerPrefs(raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  return {
    show: row.show === true,
    hideInFullScreen: row.hideInFullScreen !== false
  };
}

/**
 * Window collection-behavior tokens. Hide-in-fullscreen MUST drop
 * canJoinAllSpaces / fullScreenAuxiliary — that pair is why the stage-1
 * demo stayed visible on Safari/Chrome fullscreen Spaces.
 *
 * @param {boolean} hideInFullScreen
 * @returns {string[]}
 */
export function collectionBehaviorTokens(hideInFullScreen) {
  if (hideInFullScreen) {
    return ['stationary', 'ignoresCycle', 'moveToActiveSpace'];
  }
  return ['stationary', 'ignoresCycle', 'canJoinAllSpaces', 'fullScreenAuxiliary'];
}

/**
 * @param {boolean} hideInFullScreen
 * @param {{ menuBarCollapsed?: boolean, coveringWindow?: boolean }} presence
 * @returns {boolean}
 */
export function shouldOrderOutForFullScreen(hideInFullScreen, presence = {}) {
  if (!hideInFullScreen) return false;
  return Boolean(presence.menuBarCollapsed || presence.coveringWindow);
}

/**
 * @param {number} coveringArea
 * @param {number} screenArea
 * @returns {boolean}
 */
export function isCoveringWindow(coveringArea, screenArea) {
  if (!(screenArea > 0) || !(coveringArea > 0)) return false;
  return coveringArea / screenArea >= 0.97;
}
