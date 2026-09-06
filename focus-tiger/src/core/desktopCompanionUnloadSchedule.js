/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle companion unload grace: shell hidden or Confide closed → unload after delay.
 * Focusing still uses immediate unload in l1Runtime (no grace).
 */

import { getDesktopShellBridge } from './desktopShell.js';

/** Product-locked grace (2026-09-06). */
export const COMPANION_UNLOAD_GRACE_MS = 60_000;

/**
 * @param {{
 *   unload?: () => void | Promise<unknown>,
 *   graceMs?: number,
 *   setTimer?: (fn: () => void, ms: number) => unknown,
 *   clearTimer?: (id: unknown) => void
 * }} [opts]
 */
export function createCompanionUnloadScheduler(opts = {}) {
  const graceMs = Number(opts.graceMs ?? COMPANION_UNLOAD_GRACE_MS);
  const setTimer = opts.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = opts.clearTimer ?? ((id) => clearTimeout(id));
  const unload = opts.unload ?? (() => {});

  /** @type {unknown} */
  let timerId = null;

  function cancel() {
    if (timerId == null) return;
    clearTimer(timerId);
    timerId = null;
  }

  function schedule() {
    if (timerId != null) return;
    timerId = setTimer(() => {
      timerId = null;
      void Promise.resolve(unload()).catch(() => {});
    }, graceMs);
  }

  function isScheduled() {
    return timerId != null;
  }

  return { schedule, cancel, isScheduled };
}

/**
 * Shell hidden → schedule; visible → cancel. Does not replace AttentionSignals wiring.
 *
 * @param {{ schedule?: () => void, cancel?: () => void } | null | undefined} scheduler
 * @param {ReturnType<typeof getDesktopShellBridge>} [shell]
 * @returns {() => void}
 */
export function bindDesktopCompanionShellUnload(
  scheduler,
  shell = getDesktopShellBridge()
) {
  if (!scheduler || !shell || typeof shell.onShellVisibility !== 'function') {
    return () => {};
  }

  const onPayload = (payload) => {
    if (payload?.hidden === true) {
      scheduler.schedule?.();
      return;
    }
    if (payload?.hidden === false) {
      scheduler.cancel?.();
    }
  };

  const unsub = shell.onShellVisibility(onPayload);
  if (typeof shell.getShellVisibility === 'function') {
    void Promise.resolve(shell.getShellVisibility())
      .then(onPayload)
      .catch(() => {});
  }
  return typeof unsub === 'function' ? unsub : () => {};
}
