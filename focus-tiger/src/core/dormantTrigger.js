/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * DORMANT 滚动空闲窗口判定（纯函数，便于单测）。
 */

import { DORMANT_IDLE_MS } from '../utils/Constants.js';

/**
 * @param {object} params
 * @param {number | null | undefined} params.lastEndedAt 最近一次专注结束 epoch ms
 * @param {number} params.nowMs 当前 epoch ms
 * @param {number} [params.idleMs] 默认 DORMANT_IDLE_MS
 * @returns {boolean}
 */
export function shouldEnterDormantIdle({
  lastEndedAt,
  nowMs,
  idleMs = DORMANT_IDLE_MS
}) {
  if (lastEndedAt == null || !Number.isFinite(lastEndedAt)) {
    return false;
  }
  if (!Number.isFinite(nowMs) || !Number.isFinite(idleMs) || idleMs <= 0) {
    return false;
  }
  return nowMs - lastEndedAt >= idleMs;
}

/**
 * @param {number | null | undefined} lastEndedAt
 * @returns {boolean}
 */
export function hasAnyFocusSessionEver(lastEndedAt) {
  return lastEndedAt != null && Number.isFinite(lastEndedAt);
}
