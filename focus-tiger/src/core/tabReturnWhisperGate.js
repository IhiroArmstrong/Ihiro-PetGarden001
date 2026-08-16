/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Tab-return Yin whisper gate.
 * Key: focus-tiger.tab-return-whisper.v1
 *
 * Duration bands come from AttentionSignals (Page Visibility / blur merge).
 * This module does **not** read tab titles, URLs, or any cross-origin data.
 */

import {
  classifyTabReturnDuration,
  TAB_RETURN_WHISPER_MAX_MS,
  TAB_RETURN_WHISPER_MIN_MS
} from '../input/AttentionSignals.js';

export const TAB_RETURN_WHISPER_STORAGE_KEY =
  'focus-tiger.tab-return-whisper.v1';

/**
 * Independent clock from Active Recover; same 180s duration so tab-flipping
 * does not re-prompt. Do not share `_activeRecoverAvailableAt`.
 */
export const TAB_RETURN_WHISPER_COOLDOWN_MS = 3 * 60 * 1000;

/** Toast hold; timeout ≡ Skip (no ledger, no pressure). */
export const TAB_RETURN_WHISPER_TOAST_MS = 8_000;

/** Nested Breath Practice wall-clock (scene S component, 30s). */
export const TAB_RETURN_BREATH_MS = 30_000;

export { TAB_RETURN_WHISPER_MIN_MS, TAB_RETURN_WHISPER_MAX_MS };

/**
 * @param {unknown} raw
 * @returns {{ lastShownAt: number } | null}
 */
export function normalizeTabReturnWhisperState(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const lastShownAt = Number(
    /** @type {{ lastShownAt?: unknown }} */ (raw).lastShownAt
  );
  if (!Number.isFinite(lastShownAt) || lastShownAt <= 0) return null;
  return { lastShownAt };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ lastShownAt: number } | null}
 */
export function readTabReturnWhisperState(storage) {
  if (!storage?.getItem) return null;
  try {
    const raw = storage.getItem(TAB_RETURN_WHISPER_STORAGE_KEY);
    if (!raw) return null;
    return normalizeTabReturnWhisperState(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} nowMs
 */
export function markTabReturnWhisperShown(storage, nowMs) {
  if (!storage?.setItem) return;
  const at = Number(nowMs);
  if (!Number.isFinite(at) || at <= 0) return;
  try {
    storage.setItem(
      TAB_RETURN_WHISPER_STORAGE_KEY,
      JSON.stringify({ lastShownAt: at })
    );
  } catch {
    // quota / private mode
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} nowMs
 * @param {number} [cooldownMs]
 * @returns {number}
 */
export function getTabReturnWhisperCooldownRemainingMs(
  storage,
  nowMs,
  cooldownMs = TAB_RETURN_WHISPER_COOLDOWN_MS
) {
  const prev = readTabReturnWhisperState(storage);
  if (!prev) return 0;
  const windowMs = Number(cooldownMs);
  const cd = Number.isFinite(windowMs) && windowMs > 0
    ? windowMs
    : TAB_RETURN_WHISPER_COOLDOWN_MS;
  return Math.max(0, prev.lastShownAt + cd - Number(nowMs));
}

/**
 * Pure offer gate (duration + cooldown + session/mode/emotion).
 * @param {object} opts
 * @param {number} opts.durationMs
 * @param {boolean} [opts.sessionActive]
 * @param {boolean} [opts.suppressAwayReminders]
 * @param {number} [opts.cooldownRemainingMs]
 * @param {boolean} [opts.strongEmotion]
 * @returns {{ offer: boolean, reason?: string }}
 */
export function shouldOfferTabReturnWhisper({
  durationMs,
  sessionActive = true,
  suppressAwayReminders = false,
  cooldownRemainingMs = 0,
  strongEmotion = false
} = {}) {
  if (!sessionActive) return { offer: false, reason: 'inactive' };
  if (suppressAwayReminders) return { offer: false, reason: 'suppressed' };
  if (strongEmotion) return { offer: false, reason: 'strong_emotion' };

  const band = classifyTabReturnDuration(durationMs);
  if (band === 'silent') return { offer: false, reason: 'silent' };
  if (band === 'above-cap') return { offer: false, reason: 'above-cap' };
  if (Number(cooldownRemainingMs) > 0) {
    return { offer: false, reason: 'cooldown' };
  }
  return { offer: true };
}
