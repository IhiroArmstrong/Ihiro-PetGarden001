/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 寅币 L2 兑换：花点留下只增不减资产。Flag 关则完全不写。
 * 不写 Tea / Sanctuary badgeIds，不满足 isEntitled。
 */

import {
  evaluateFocusCoinRedeem
} from './focusCoinsLedger.js';
import { isFocusCoinsAwardEnabled } from './focusCoinsAwardGate.js';

/**
 * @param {object} opts
 * @param {import('./focusCoinsStore.js').FocusCoinsStore} opts.store
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} opts.practiceDaysStore
 * @param {import('./LotusPondStore.js').LotusPondStore} opts.lotusPondStore
 * @returns {Parameters<typeof evaluateFocusCoinRedeem>[1]}
 */
export function buildFocusCoinRedeemContext({
  store,
  practiceDaysStore,
  lotusPondStore
}) {
  const snap = store.getSnapshot();
  const bloomCount = lotusPondStore.getVisibleBloomCount();
  return {
    balance: snap.balance,
    ownedIds: snap.ownedIds,
    lifetimeMinutes: lotusPondStore.getLifetimeMinutes(),
    practiceDayCount: practiceDaysStore.getPracticedDateKeys().length,
    hasLotusBloom: bloomCount > 0,
    hasIncense: false,
    hasHonestyWake: snap.lifetimeMarks?.honestyWake === true,
    hasActiveRecover: snap.lifetimeMarks?.activeRecover === true
  };
}

/**
 * @param {string[]} grantedIds
 * @param {string | null} currentlyEquipped
 * @returns {string | null | undefined} undefined = leave unchanged
 */
export function titleToEquipAfterRedeem(grantedIds, currentlyEquipped) {
  const titles = (grantedIds || []).filter((id) => id.startsWith('title.'));
  if (titles.length === 0) return undefined;
  if (currentlyEquipped) return undefined;
  return titles[0];
}

/**
 * @param {object} opts
 * @param {string} opts.skuId
 * @param {import('./focusCoinsStore.js').FocusCoinsStore} opts.store
 * @param {import('./PracticeDaysStore.js').PracticeDaysStore} opts.practiceDaysStore
 * @param {import('./LotusPondStore.js').LotusPondStore} opts.lotusPondStore
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 */
export function applyFocusCoinsRedeem({
  skuId,
  store,
  practiceDaysStore,
  lotusPondStore,
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
      ok: false,
      reason: 'flag-off',
      balance: snapshot.balance,
      ownedIds: snapshot.ownedIds,
      entitlementPatch: null,
      grantedIds: [],
      snapshot
    };
  }

  const result = evaluateFocusCoinRedeem(
    skuId,
    buildFocusCoinRedeemContext({
      store,
      practiceDaysStore,
      lotusPondStore
    })
  );
  if (!result.ok) {
    return { ...result, snapshot };
  }

  const nextTitle = titleToEquipAfterRedeem(
    result.grantedIds,
    snapshot.equippedTitle
  );
  store.commitRedeem({
    balance: result.balance,
    ownedIds: result.ownedIds,
    equippedTitle:
      nextTitle === undefined ? snapshot.equippedTitle : nextTitle
  });
  return {
    ...result,
    snapshot: store.getSnapshot()
  };
}

/**
 * @param {object} opts
 * @param {string | null} opts.titleId
 * @param {import('./focusCoinsStore.js').FocusCoinsStore} opts.store
 * @param {boolean} [opts.enabled]
 * @param {string} [opts.search]
 */
export function applyFocusCoinsEquipTitle({
  titleId,
  store,
  enabled,
  search = ''
} = {}) {
  const snapshot = store.getSnapshot();
  const awardOn =
    enabled !== undefined
      ? enabled === true
      : isFocusCoinsAwardEnabled({ search });
  if (!awardOn) {
    return { ok: false, reason: 'flag-off', snapshot };
  }
  if (titleId != null) {
    if (typeof titleId !== 'string' || !titleId.startsWith('title.')) {
      return { ok: false, reason: 'not-title', snapshot };
    }
    if (!snapshot.ownedIds.includes(titleId)) {
      return { ok: false, reason: 'not-owned', snapshot };
    }
  }
  const ok = store.equipTitle(titleId ?? null);
  return {
    ok,
    reason: ok ? 'ok' : 'not-owned',
    snapshot: store.getSnapshot()
  };
}
