/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Top-level Confide "Thinking…" watchdog. Inner classify/generate timeouts
 * do not cover ensureReady / llama lock stalls — this one must.
 */

/** Hybrid classify (12s) + generate (20s) plus a small IPC cushion. */
export const CONFIDE_PENDING_REPLY_WATCHDOG_MS = 45_000;

/**
 * @param {{
 *   startedAtMs: number,
 *   nowMs: number,
 *   timeoutMs?: number
 * }} opts
 * @returns {boolean}
 */
export function shouldTripConfidePendingReplyWatchdog(opts) {
  const startedAtMs = Number(opts?.startedAtMs);
  const nowMs = Number(opts?.nowMs);
  const timeoutMs = Number(
    opts?.timeoutMs == null ? CONFIDE_PENDING_REPLY_WATCHDOG_MS : opts.timeoutMs
  );
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(nowMs)) return false;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return false;
  return nowMs - startedAtMs >= timeoutMs;
}
