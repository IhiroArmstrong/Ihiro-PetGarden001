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

/** Previous hypothesis must be at least this long before a short replacement counts as a drop. */
export const VOICE_HYPOTHESIS_SHRINK_MIN_PREV_CHARS = 40;

/** Incoming text at or under this fraction of the previous hypothesis is "much shorter". */
export const VOICE_HYPOTHESIS_SHRINK_MAX_RATIO = 0.6;

/**
 * Keep the longer on-device hypothesis when a later result is only a short tail.
 * Normal growth and similar-length corrections still replace.
 * Swift `foldVoiceRecognitionHypothesis` must stay in lockstep.
 *
 * @param {string} previous
 * @param {string} incoming
 * @returns {{ text: string, shrunk: boolean }}
 */
export function foldVoiceRecognitionHypothesis(previous, incoming) {
  const prev = String(previous || '').trim();
  const next = String(incoming || '').trim();
  if (!next) return { text: prev, shrunk: false };
  if (!prev) return { text: next, shrunk: false };
  if (next.startsWith(prev)) return { text: next, shrunk: false };
  const muchShorter =
    prev.length >= VOICE_HYPOTHESIS_SHRINK_MIN_PREV_CHARS &&
    next.length <= prev.length * VOICE_HYPOTHESIS_SHRINK_MAX_RATIO;
  if (muchShorter) return { text: prev, shrunk: true };
  return { text: next, shrunk: false };
}

/**
 * Amber truncation line: field hit 280, or a later hypothesis dropped the front.
 *
 * @param {{ truncated?: boolean, hypothesisShrunk?: boolean }} input
 * @returns {boolean}
 */
export function voiceTranscriptNeedsTruncationNotice({
  truncated = false,
  hypothesisShrunk = false
} = {}) {
  return truncated === true || hypothesisShrunk === true;
}

/**
 * Set transcript text on a textarea-like control (Speak-to-type replaces field content).
 *
 * @param {HTMLTextAreaElement | HTMLInputElement} el
 * @param {string} transcript
 * @param {number} [maxLength]
 * @returns {{ truncated: boolean }}
 */
export function applyVoiceTranscriptToField(el, transcript, maxLength = Infinity) {
  const next = String(transcript || '').trim();
  if (!next) return { truncated: false };
  const capped =
    Number.isFinite(maxLength) && maxLength > 0 ? next.slice(0, maxLength) : next;
  const truncated = capped.length < next.length;
  el.value = capped;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return { truncated };
}
