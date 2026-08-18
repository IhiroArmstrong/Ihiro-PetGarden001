/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 同坐点 L1 发点：账本纯函数 + 钱包写入。Flag 关则完全不写。
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { shiftLocalDateKey } from './PracticeDaysStore.js';
import { computeFocusCoinsGrant } from './focusCoinsLedger.js';
import { isFocusCoinsAwardEnabled } from './focusCoinsAwardGate.js';

/**
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} practiceDaysStore
 * @param {Date} [now]
 * @returns {boolean}
 */
export function practicedYesterday(practiceDaysStore, now = new Date()) {
  const yesterday = shiftLocalDateKey(getLocalDateKey(now), -1);
  return practiceDaysStore.getPracticedDateKeys().includes(yesterday);
}

/**
 * @param {object} opts
 * @param {import('./focusCoinsLedger.js').FocusCoinsGrantEvent} opts.event
 * @param {import('./focusCoinsStore.js').FocusCoinsStore} opts.store
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} opts.practiceDaysStore
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 * @returns {{
 *   applied: boolean,
 *   points: number,
 *   reason: string,
 *   snapshot: object
 * }}
 */
export function applyFocusCoinsGrant({
  event,
  store,
  practiceDaysStore,
  now = () => new Date(),
  enabled,
  search = ''
} = {}) {
  const snapshot = store.getSnapshot();
  const awardOn =
    enabled !== undefined
      ? enabled === true
      : isFocusCoinsAwardEnabled({ search });
  if (!awardOn) {
    return {
      applied: false,
      points: 0,
      reason: 'flag-off',
      snapshot
    };
  }

  const grant = computeFocusCoinsGrant(
    event,
    snapshot.day,
    snapshot.session,
    { yesterdayPracticed: practicedYesterday(practiceDaysStore, now()) }
  );
  if (grant.points > 0) {
    store.commitGrant(grant);
  }
  return {
    applied: grant.reason === 'ok',
    points: grant.points,
    reason: grant.reason,
    snapshot: store.getSnapshot()
  };
}

/**
 * 新一轮 Arrival / Sit 清会话旗。Flag 关则不落盘（Playbook 红线 C）。
 *
 * @param {object} opts
 * @param {import('./focusCoinsStore.js').FocusCoinsStore} opts.store
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 * @returns {boolean} 是否执行了 reset
 */
export function maybeResetFocusCoinsSession({
  store,
  enabled,
  search = ''
} = {}) {
  const awardOn =
    enabled !== undefined
      ? enabled === true
      : isFocusCoinsAwardEnabled({ search });
  if (!awardOn) return false;
  store.resetSession();
  return true;
}
