/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
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
 * Speak whenever Confide shows a reply body (Brief T34).
 * Route id is not a mute switch: crisis, aggression, Help Center redirect,
 * and unrecognised ids all speak the on-screen text. Empty body stays silent.
 * Stop/close/newest-wins remain the user's quiet path — this function does
 * not remove them.
 *
 * @param {string | null | undefined} [_route]
 * @param {string | null | undefined} [text]
 * @returns {boolean}
 */
export function shouldSpeakConfideReply(_route, text) {
  if (text !== undefined) return String(text || '').trim().length > 0;
  return true;
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
 * Single dispatch point for every product speech request.
 *
 * There are two independent speakers — Confide replies and the focus-end
 * announcement — and the platform synthesizer will happily run both at once.
 * Routing everything through here makes the newest request win: stop first,
 * then speak.
 *
 * "Newest wins" is not a new product call. `task-confide-tts-v1` locks speech
 * to within 0–1s of the text appearing, which rules out queueing; and letting
 * the previous line finish while new text is already on screen would read the
 * wrong thing aloud.
 *
 * Returns synchronously so callers keep their "did we dispatch" contract, while
 * the stop→speak order is still guaranteed by chaining.
 *
 * @param {{ text?: string, locale?: string, globalObj?: object }} payload
 * @returns {boolean} true when a speak request was dispatched
 */
export function speakSystemTts({ text, locale, globalObj = globalThis } = {}) {
  const bridge = getSystemTtsBridge(globalObj);
  if (!bridge || typeof bridge.speak !== 'function') return false;
  const body = String(text || '').trim();
  if (!body) return false;

  const stopped =
    typeof bridge.stop === 'function'
      ? Promise.resolve()
          .then(() => bridge.stop())
          .catch(() => {})
      : Promise.resolve();
  void stopped.then(() => bridge.speak({ text: body, locale }));
  return true;
}

/**
 * Stop whatever is currently speaking, from any source.
 *
 * @param {object} [globalObj]
 * @returns {boolean} true when a stop request was dispatched
 */
export function stopSystemTts(globalObj = globalThis) {
  const bridge = getSystemTtsBridge(globalObj);
  if (!bridge || typeof bridge.stop !== 'function') return false;
  void Promise.resolve()
    .then(() => bridge.stop())
    .catch(() => {});
  return true;
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
