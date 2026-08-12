/**
 * Pure wall-clock rules for Focus mid-session interval cues.
 * Brief: every 180s after start; no tick at t≈0; skip if remaining < 30s.
 */

/** Interval between mid-session bells (ms). */
export const SESSION_INTERVAL_MS = 180_000;

/** Skip an interval beat when remaining session time is strictly below this (ms). */
export const SESSION_INTERVAL_END_SKIP_MS = 30_000;

/**
 * @param {{
 *   elapsedMs: number,
 *   targetMs: number,
 *   lastFiredCount: number
 * }} input
 * @returns {{ action: 'wait' } | { action: 'play' | 'skip', firedCount: number }}
 */
export function evaluateIntervalCue({ elapsedMs, targetMs, lastFiredCount }) {
  const last = Math.max(0, Math.floor(Number(lastFiredCount) || 0));
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  const target = Math.max(0, Number(targetMs) || 0);
  const nextCount = last + 1;
  const dueAt = nextCount * SESSION_INTERVAL_MS;
  if (elapsed < dueAt) {
    return { action: 'wait' };
  }
  const remaining = target - elapsed;
  if (remaining < SESSION_INTERVAL_END_SKIP_MS) {
    return { action: 'skip', firedCount: nextCount };
  }
  return { action: 'play', firedCount: nextCount };
}
