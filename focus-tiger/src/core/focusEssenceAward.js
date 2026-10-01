/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Essence L1 award: ledger pure functions + wallet writes.
 * Flag off = no writes. Does not touch Coin lifetime marks.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { shiftLocalDateKey } from './PracticeDaysStore.js';
import { COMPANION_MODE_STAY } from './FocusSession.js';
import { GRANT_KIND, computeFocusEssenceGrant } from './focusEssenceLedger.js';
import { isFocusEssenceAwardEnabled } from './focusEssenceAwardGate.js';

/**
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} practiceDaysStore
 * @param {Date} [now]
 * @returns {boolean}
 */
export function practicedYesterdayForEssence(practiceDaysStore, now = new Date()) {
  const yesterday = shiftLocalDateKey(getLocalDateKey(now), -1);
  return practiceDaysStore.getPracticedDateKeys().includes(yesterday);
}

/**
 * @param {object} opts
 * @param {import('./focusEssenceLedger.js').FocusEssenceGrantEvent} opts.event
 * @param {import('./FocusEssenceStore.js').FocusEssenceStore} opts.store
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
export function applyFocusEssenceGrant({
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
      : isFocusEssenceAwardEnabled({ search });
  if (!awardOn) {
    return {
      applied: false,
      points: 0,
      reason: 'flag-off',
      snapshot
    };
  }

  const grant = computeFocusEssenceGrant(
    event,
    snapshot.day,
    snapshot.session,
    {
      yesterdayPracticed: practicedYesterdayForEssence(
        practiceDaysStore,
        now()
      )
    }
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
 * Breath practice 坐满：时长点按 Stay 档 + 每日微仪式 +1。
 *
 * @param {object} opts
 * @param {number} opts.durationMinutes
 * @param {import('./FocusEssenceStore.js').FocusEssenceStore} opts.store
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} opts.practiceDaysStore
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 */
export function applyBreathPracticeFocusEssenceGrant({
  durationMinutes,
  store,
  practiceDaysStore,
  now,
  enabled,
  search = ''
} = {}) {
  const shared = { store, practiceDaysStore, now, enabled, search };
  const timed = applyFocusEssenceGrant({
    ...shared,
    event: {
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes
    }
  });
  const ritual = applyFocusEssenceGrant({
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
 * @param {object} opts
 * @param {import('./FocusEssenceStore.js').FocusEssenceStore} opts.store
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 * @returns {boolean}
 */
export function maybeResetFocusEssenceSession({
  store,
  enabled,
  search = ''
} = {}) {
  const awardOn =
    enabled !== undefined
      ? enabled === true
      : isFocusEssenceAwardEnabled({ search });
  if (!awardOn) return false;
  store.resetSession();
  return true;
}
