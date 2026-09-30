/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Renderer bridge for Electron System TTS (macOS AVSpeechSynthesizer).
 * Web builds have no bridge; helpers must no-op.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';
import {
  DESKTOP_COMPANION_WIDE_MIN_PX,
  isDesktopCompanionViewportAllowed
} from './desktopCompanionGate.js';
import {
  CONFIDE_EMOTION_BUCKETS,
  CONFIDE_GENERATE_REPLY_ROUTE,
  CONFIDE_ROUTE
} from './confide/confideRoutes.js';

/**
 * @param {string} locale
 * @returns {'en-US' | 'ja-JP'}
 */
export function mapLocaleToTtsLocale(locale) {
  const id = String(locale || 'en').toLowerCase();
  if (id.startsWith('ja')) return 'ja-JP';
  return 'en-US';
}

/**
 * Reply route ids cleared for speech. Brief task-confide-tts-v1 speaks every
 * reply except the two crisis routes, and the local-AI branch is the main case
 * — so the emotion buckets, fallback and `generate` all belong here.
 *
 * Listing what may speak rather than what may not keeps an unrecognised route
 * id silent: a future crisis-adjacent route would otherwise be read aloud
 * until someone remembered to add it to an exclusion list.
 *
 * @type {ReadonlySet<string>}
 */
const SPEAKABLE_CONFIDE_REPLY_ROUTES = Object.freeze(
  new Set([
    ...CONFIDE_EMOTION_BUCKETS,
    CONFIDE_ROUTE.FALLBACK,
    CONFIDE_GENERATE_REPLY_ROUTE
  ])
);

/**
 * Crisis / safety routes stay text-only (Brief task-confide-tts-v1).
 *
 * @param {string} route
 * @returns {boolean}
 */
export function shouldSpeakConfideReply(route) {
  return SPEAKABLE_CONFIDE_REPLY_ROUTES.has(route);
}

/**
 * @param {object} [globalObj]
 * @returns {null | {
 *   getGate?: (locale?: string) => Promise<unknown>,
 *   speak?: (payload: { text?: string, locale?: string }) => Promise<unknown>,
 *   stop?: () => Promise<unknown>,
 *   snapshot?: () => Promise<unknown>,
 *   onStatus?: (cb: (payload: object) => void) => () => void
 * }}
 */
export function getSystemTtsBridge(globalObj = globalThis) {
  const shell = getDesktopShellBridge(globalObj);
  const systemTts = shell && shell.systemTts;
  return systemTts && typeof systemTts === 'object' ? systemTts : null;
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function hasSystemTtsBridge(globalObj = globalThis) {
  return getSystemTtsBridge(globalObj) != null;
}

/**
 * Product chrome: Electron macOS wide viewport only (Brief task-confide-tts-v1).
 *
 * @param {{ widthPx?: number, globalObj?: object }} [opts]
 * @returns {boolean}
 */
export function canUseSystemTts({ widthPx = 0, globalObj = globalThis } = {}) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  if (!hasSystemTtsBridge(globalObj)) return false;
  return isDesktopCompanionViewportAllowed(widthPx);
}

export { DESKTOP_COMPANION_WIDE_MIN_PX };
