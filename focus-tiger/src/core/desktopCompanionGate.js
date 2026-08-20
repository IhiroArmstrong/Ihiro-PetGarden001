/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Renderer gates for desktop on-device companion L1.
 * Must not import llama/hold modules from `focus-tiger/desktop`.
 * Only `window.desktopShell.companion` from preload.
 */

import { getDesktopShellBridge } from './desktopShell.js';

/** Match `RESPONSIVE_LAYOUT` wide shell / `WideIdleMoreMenu` WIDE_MQ. */
export const DESKTOP_COMPANION_WIDE_MIN_PX = 480;

/**
 * @param {object} [globalObj]
 * @returns {null | object}
 */
export function getDesktopCompanionBridge(globalObj = globalThis) {
  const shell = getDesktopShellBridge(globalObj);
  const companion = shell && shell.companion;
  return companion && typeof companion === 'object' ? companion : null;
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function hasDesktopCompanionBridge(globalObj = globalThis) {
  return getDesktopCompanionBridge(globalObj) != null;
}

/**
 * @param {number} widthPx
 * @returns {boolean}
 */
export function isDesktopCompanionViewportAllowed(widthPx) {
  const n = Number(widthPx);
  return Number.isFinite(n) && n >= DESKTOP_COMPANION_WIDE_MIN_PX;
}

/**
 * Register generation-capable Confide extras (progress layer, not L2 chat).
 * @param {{ hasBridge?: boolean, widthPx?: number }} [opts]
 * @returns {boolean}
 */
export function canRegisterDesktopCompanionGeneration({
  hasBridge = false,
  widthPx = 0
} = {}) {
  return Boolean(hasBridge) && isDesktopCompanionViewportAllowed(widthPx);
}

/**
 * Wide → narrow: close the generate layer; do not stuff it into the drawer.
 * @param {{ generateLayerOpen?: boolean, widthPx?: number }} [opts]
 * @returns {boolean}
 */
export function shouldCloseDesktopCompanionGenerateLayer({
  generateLayerOpen = false,
  widthPx = 0
} = {}) {
  return Boolean(generateLayerOpen) && !isDesktopCompanionViewportAllowed(widthPx);
}

/**
 * @param {{ phase?: string, focusing?: boolean } | null | undefined} status
 * @returns {string}
 */
export function desktopCompanionStatusCopyKey(status) {
  if (status?.focusing) return 'CONFIDE_DESKTOP_STATUS_UNLOADED_FOCUSING';
  switch (status?.phase) {
    case 'downloading':
      return 'CONFIDE_DESKTOP_STATUS_DOWNLOADING';
    case 'loading':
      return 'CONFIDE_DESKTOP_STATUS_LOADING';
    case 'ready':
      return 'CONFIDE_DESKTOP_STATUS_READY';
    case 'unloading':
      return 'CONFIDE_DESKTOP_STATUS_UNLOADING';
    case 'error':
      return 'CONFIDE_DESKTOP_STATUS_ERROR';
    default:
      return 'CONFIDE_DESKTOP_STATUS_PREPARING';
  }
}

/**
 * @param {{ received?: number | null, total?: number | null } | null | undefined} status
 * @returns {number | null}
 */
export function desktopCompanionDownloadPercent(status) {
  const received = Number(status?.received);
  const total = Number(status?.total);
  if (!Number.isFinite(received) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round((received / total) * 100)));
}
