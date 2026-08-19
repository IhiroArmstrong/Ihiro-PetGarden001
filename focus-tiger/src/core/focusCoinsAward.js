/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 寅币 L1 发点：账本纯函数 + 钱包写入。Flag 关则完全不写。
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { shiftLocalDateKey } from './PracticeDaysStore.js';
import { COMPANION_MODE_STAY } from './FocusSession.js';
import { GRANT_KIND, computeFocusCoinsGrant } from './focusCoinsLedger.js';
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
    if (event?.kind === GRANT_KIND.ACTIVE_RECOVER) {
      store.markLifetime({ activeRecover: true });
    }
  }
  return {
    applied: grant.reason === 'ok',
    points: grant.points,
    reason: grant.reason,
    snapshot: store.getSnapshot()
  };
}

/**
 * Breath practice 坐满：时长点按 Stay 档（5 分=1）+ 每日微仪式 +1。
 * Leave 中途不调用。1 分 Breath 时长池为 0，只可能留下那笔 +1。
 *
 * @param {object} opts
 * @param {number} opts.durationMinutes
 * @param {import('./focusCoinsStore.js').FocusCoinsStore} opts.store
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} opts.practiceDaysStore
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 * @returns {{
 *   timed: ReturnType<typeof applyFocusCoinsGrant>,
 *   ritual: ReturnType<typeof applyFocusCoinsGrant>,
 *   points: number
 * }}
 */
export function applyBreathPracticeFocusCoinsGrant({
  durationMinutes,
  store,
  practiceDaysStore,
  now,
  enabled,
  search = ''
} = {}) {
  const shared = { store, practiceDaysStore, now, enabled, search };
  const timed = applyFocusCoinsGrant({
    ...shared,
    event: {
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes
    }
  });
  const ritual = applyFocusCoinsGrant({
    ...shared,
    event: { kind: GRANT_KIND.MICRO_RITUAL }
  });
  return {
    timed,
    ritual,
    points: timed.points + ritual.points
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
