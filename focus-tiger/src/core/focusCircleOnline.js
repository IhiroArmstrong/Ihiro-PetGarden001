/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * While this app is open and in a circle, tell the cloud we are still here.
 * Quit or a dropped connection stops the heartbeat; the count falls off after
 * the server TTL. Sitting lanterns are a different signal.
 *
 * Background network:
 * 1. First beat is delayed so it does not overlap Arrival / the first Idle breath.
 * 2. The stored count is rewritten only when the number changed.
 * 3. The request is not awaited by any animation.
 */

import {
  isFocusCircleClientEnabled,
  postFocusCircle,
  readFocusCircleMembership,
  writeFocusCircleMembership
} from './focusCircleMembership.js';

export const FOCUS_CIRCLE_ONLINE_START_DELAY_MS = 4_000;
export const FOCUS_CIRCLE_ONLINE_INTERVAL_MS = 15_000;

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {number} [opts.startDelayMs]
 * @param {number} [opts.intervalMs]
 * @param {typeof postFocusCircle} [opts.postCircle]
 * @param {() => boolean} [opts.isHidden]
 * @param {typeof setTimeout} [opts.setTimer]
 * @param {typeof setInterval} [opts.setIntervalTimer]
 * @param {EventTarget} [opts.target]
 */
export function startFocusCircleOnlinePresence(opts = {}) {
  const storage = opts.storage ?? globalThis.localStorage;
  const postCircle = opts.postCircle ?? postFocusCircle;
  const startDelayMs = opts.startDelayMs ?? FOCUS_CIRCLE_ONLINE_START_DELAY_MS;
  const intervalMs = opts.intervalMs ?? FOCUS_CIRCLE_ONLINE_INTERVAL_MS;
  const isHidden = opts.isHidden ?? (() => globalThis.document?.hidden === true);
  const setTimer = opts.setTimer ?? globalThis.setTimeout.bind(globalThis);
  const setIntervalTimer = opts.setIntervalTimer ?? globalThis.setInterval.bind(globalThis);
  const target = opts.target ?? globalThis;

  let intervalId = 0;
  let stopped = false;

  const beat = async (action) => {
    if (stopped) return;
    if (!isFocusCircleClientEnabled({ search: opts.search ?? '' })) return;
    const membership = readFocusCircleMembership(storage);
    if (!membership) return;
    if (action === 'online_heartbeat' && isHidden()) return;
    const result = await postCircle({
      action,
      circleId: membership.circleId,
      memberId: membership.memberId,
      search: opts.search
    });
    if (action !== 'online_heartbeat' || !result?.ok || !result.membership) return;
    writeFocusCircleMembership(storage, {
      ...membership,
      memberCount: result.membership.memberCount
    });
  };

  const onPageHide = () => {
    void beat('online_leave');
  };
  target.addEventListener?.('pagehide', onPageHide);

  const startId = setTimer(() => {
    if (stopped) return;
    void beat('online_heartbeat');
    intervalId = setIntervalTimer(() => {
      void beat('online_heartbeat');
    }, intervalMs);
  }, startDelayMs);

  return () => {
    stopped = true;
    globalThis.clearTimeout?.(startId);
    if (intervalId) globalThis.clearInterval?.(intervalId);
    target.removeEventListener?.('pagehide', onPageHide);
  };
}
