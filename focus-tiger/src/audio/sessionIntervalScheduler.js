/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pure wall-clock rules for Focus mid-session interval cues.
 * Configurable intervalMs (0 = off); no tick at t≈0; skip if remaining < 30s.
 */

/** Default / 3-minute interval (ms). */
export const SESSION_INTERVAL_MS = 180_000;

/** 5-minute interval (ms). */
export const SESSION_INTERVAL_MS_5MIN = 300_000;

/** Skip an interval beat when remaining session time is strictly below this (ms). */
export const SESSION_INTERVAL_END_SKIP_MS = 30_000;

/**
 * @param {{
 *   elapsedMs: number,
 *   targetMs: number,
 *   lastFiredCount: number,
 *   intervalMs?: number
 * }} input
 * @returns {{ action: 'wait' | 'disabled' } | { action: 'play' | 'skip', firedCount: number }}
 */
export function evaluateIntervalCue({
  elapsedMs,
  targetMs,
  lastFiredCount,
  intervalMs = SESSION_INTERVAL_MS
}) {
  const step = Number(intervalMs);
  if (!Number.isFinite(step) || step <= 0) {
    return { action: 'disabled' };
  }
  const last = Math.max(0, Math.floor(Number(lastFiredCount) || 0));
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  const target = Math.max(0, Number(targetMs) || 0);
  const nextCount = last + 1;
  const dueAt = nextCount * step;
  if (elapsed < dueAt) {
    return { action: 'wait' };
  }
  const remaining = target - elapsed;
  if (remaining < SESSION_INTERVAL_END_SKIP_MS) {
    return { action: 'skip', firedCount: nextCount };
  }
  return { action: 'play', firedCount: nextCount };
}
