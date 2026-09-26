/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Renderer bridge for Electron Speak-to-type (macOS on-device STT).
 * Web builds have no bridge; helpers must no-op.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';
import {
  DESKTOP_COMPANION_WIDE_MIN_PX,
  isDesktopCompanionViewportAllowed
} from './desktopCompanionGate.js';

/**
 * @param {object} [globalObj]
 * @returns {null | {
 *   getGate?: () => Promise<unknown>,
 *   start?: () => Promise<unknown>,
 *   stop?: () => Promise<unknown>,
 *   snapshot?: () => Promise<unknown>,
 *   onStatus?: (cb: (payload: object) => void) => () => void
 * }}
 */
export function getVoiceInputBridge(globalObj = globalThis) {
  const shell = getDesktopShellBridge(globalObj);
  const voiceInput = shell && shell.voiceInput;
  return voiceInput && typeof voiceInput === 'object' ? voiceInput : null;
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function hasVoiceInputBridge(globalObj = globalThis) {
  return getVoiceInputBridge(globalObj) != null;
}

/**
 * Product chrome: Electron macOS wide viewport only (Brief task-voice-input-v1).
 *
 * @param {{ widthPx?: number, globalObj?: object }} [opts]
 * @returns {boolean}
 */
export function canShowVoiceInputChrome({ widthPx = 0, globalObj = globalThis } = {}) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  if (!hasVoiceInputBridge(globalObj)) return false;
  return isDesktopCompanionViewportAllowed(widthPx);
}

export { DESKTOP_COMPANION_WIDE_MIN_PX };

/**
 * Keep the locale sentence; append helper capture stats in parentheses.
 *
 * @param {string} baseCopy
 * @param {unknown} diagnostics
 * @returns {string}
 */
export function withVoiceCaptureDiagnostics(baseCopy, diagnostics) {
  const diag = String(diagnostics || '').trim();
  const base = String(baseCopy || '').trim();
  if (!diag) return base;
  return `${base} (${diag})`;
}

/**
 * Append or set transcript text on a textarea-like control.
 *
 * @param {HTMLTextAreaElement | HTMLInputElement} el
 * @param {string} transcript
 * @param {number} [maxLength]
 */
export function applyVoiceTranscriptToField(el, transcript, maxLength = Infinity) {
  const next = String(transcript || '').trim();
  if (!next) return;
  const existing = String(el.value || '').trim();
  const merged = existing ? `${existing} ${next}` : next;
  const capped =
    Number.isFinite(maxLength) && maxLength > 0
      ? merged.slice(0, maxLength)
      : merged;
  el.value = capped;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
