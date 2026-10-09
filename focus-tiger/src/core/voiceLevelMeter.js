/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Map one microphone RMS sample to a 0–1 bar height.
 * Silence stays at 0. There is no self-running animation.
 */

/** Below this RMS the room is treated as quiet. */
export const VOICE_LEVEL_SILENCE_RMS = 0.002;

/**
 * @param {unknown} rms
 * @returns {number}
 */
export function voiceLevelUnit(rms) {
  const n = Number(rms);
  if (!Number.isFinite(n) || n < VOICE_LEVEL_SILENCE_RMS) return 0;
  const db = 20 * Math.log10(n);
  const unit = (db + 54) / 36;
  if (unit <= 0) return 0;
  if (unit >= 1) return 1;
  return unit;
}
