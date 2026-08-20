/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 寅币（Focus Coins）L0 ledger — pure functions only.
 *
 * No storage, no main.js, no entitlement writes. L1 may persist the
 * returned day/session snapshots; this module must stay hook-free.
 *
 * @see docs/FOCUS_COINS.md
 * @see docs/task-briefs/task-focus-coins.md
 */

import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY
} from './FocusSession.js';
import { FEATURE_CATALOG } from './entitlement/entitlementRegistry.js';

export const FOCUS_COINS_DISPLAY_NAME = '寅币';
export const FOCUS_COINS_DISPLAY_NAME_EN = 'Focus Coins';
export const FOCUS_COINS_COLLECTIONS_NAME = '阿寅的珍藏';
export const FOCUS_COINS_COLLECTIONS_NAME_EN = "Yin's Collections";

export const GRANT_KIND = Object.freeze({
  INCOMPLETE: 'incomplete',
  TIMED: 'timed',
  HONESTY: 'honesty',
  ARRIVE: 'arrive',
  REFLECT: 'reflect',
  ACTIVE_RECOVER: 'activeRecover',
  PASSIVE_RECOVER: 'passiveRecover',
  MICRO_RITUAL: 'microRitual',
  DORMANT_WAKE: 'dormantWake'
});

export const STAY_MINUTES_PER_POINT = 5;
export const HALF_RATE_MINUTES_PER_POINT = 10;
export const HONESTY_MINUTES_CAP = 30;

export const DURATION_DAILY_CAP = 36;
export const HONESTY_DAILY_CAP = 3;
export const RITUAL_DAILY_CAP = 12;
export const TOTAL_DAILY_CAP = 48;

export const ARRIVE_POINTS = 2;
export const REFLECT_POINTS = 2;
export const ACTIVE_RECOVER_POINTS = 1;
export const MICRO_RITUAL_POINTS = 1;
export const PRESENCE_ECHO_POINTS = 3;
export const ACTIVE_RECOVER_DAILY_MAX = 3;

export const SUMERU_BUNDLE_ID = 'bundle.sumeru-seat';
export const TITLE_LONG_SITTER_ID = 'title.long-sitter';
export const SUMERU_PRICE = 360;
export const SUMERU_MIN_LIFETIME_MINUTES = 600;

/**
 * @typedef {'duration' | 'honesty' | 'ritual' | 'none'} FocusCoinPool
 * @typedef {{
 *   durationGranted: number,
 *   honestyGranted: number,
 *   ritualGranted: number,
 *   echoGranted: number,
 *   honestyMinted: boolean,
 *   hadQualifyingGrant: boolean,
 *   microRitualGranted: boolean,
 *   activeRecoverCount: number
 * }} FocusCoinsDayState
 * @typedef {{
 *   arriveGranted: boolean,
 *   reflectGranted: boolean,
 *   activeRecoverGranted: boolean
 * }} FocusCoinsSessionState
 * @typedef {{
 *   kind: string,
 *   reachedTarget?: boolean,
 *   companionMode?: string,
 *   durationMinutes?: number
 * }} FocusCoinsGrantEvent
 * @typedef {{
 *   id: string,
 *   kind: 'space' | 'yin-accent' | 'title' | 'badge.rare' | 'bundle' | 'collection' | 'gesture',
 *   price: number,
 *   grants: string[],
 *   retiredOverlay?: boolean,
 *   minPracticeDays?: number,
 *   minLifetimeMinutes?: number,
 *   requireLotusBloom?: boolean,
 *   requireIncense?: boolean,
 *   requireHonestyWake?: boolean,
 *   requireActiveRecover?: boolean,
 *   cashPurchasable: false,
 *   skippableByEntitlement: false
 * }} FocusCoinSku
 */

/** @returns {FocusCoinsDayState} */
export function emptyFocusCoinsDayState() {
  return {
    durationGranted: 0,
    honestyGranted: 0,
    ritualGranted: 0,
    echoGranted: 0,
    honestyMinted: false,
    hadQualifyingGrant: false,
    microRitualGranted: false,
    activeRecoverCount: 0
  };
}

/** @returns {FocusCoinsSessionState} */
export function emptyFocusCoinsSessionState() {
  return {
    arriveGranted: false,
    reflectGranted: false,
    activeRecoverGranted: false
  };
}

/**
 * Paid catalog keys Coins must never satisfy.
 * @returns {string[]}
 */
export function listPaidFeatureKeysBlockedFromCoins() {
  return Object.entries(FEATURE_CATALOG)
    .filter(([, entry]) => entry.requiredTier !== 'free')
    .map(([key]) => key)
    .sort();
}

/**
 * Coins never answer `isEntitled`. Wallet is ignored on purpose.
 * @param {string} _featureKey
 * @param {unknown} [_wallet]
 * @returns {false}
 */
export function coinsSatisfyEntitlement(_featureKey, _wallet) {
  return false;
}

const NOT_CASH = Object.freeze({
  cashPurchasable: false,
  skippableByEntitlement: false
});

/**
 * Locked Collections shop (2026-08-20): eight 清供 stills.
 * Same SKU ids / prices / gates; overlay visuals stay off the sprite stage.
 */
export const FOCUS_COIN_CURIO_SHOP_IDS = Object.freeze([
  'space.incense-tint-warm',
  'space.lotus-dew',
  'yin-accent.wood-beads',
  'yin-accent.folded-cloak',
  'title.sits-with-yin',
  'title.returned-gently',
  'badge.rare.quiet-pebble',
  SUMERU_BUNDLE_ID
]);

/** @type {ReadonlyArray<FocusCoinSku>} */
export const FOCUS_COIN_CATALOG = Object.freeze([
  Object.freeze({
    id: 'space.incense-tint-warm',
    kind: 'space',
    price: 24,
    grants: Object.freeze(['space.incense-tint-warm']),
    minPracticeDays: 3,
    requireIncense: true,
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'space.lotus-dew',
    kind: 'space',
    price: 48,
    grants: Object.freeze(['space.lotus-dew']),
    requireLotusBloom: true,
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'yin-accent.wood-beads',
    kind: 'yin-accent',
    price: 36,
    grants: Object.freeze(['yin-accent.wood-beads']),
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'yin-accent.folded-cloak',
    kind: 'yin-accent',
    price: 60,
    grants: Object.freeze(['yin-accent.folded-cloak']),
    requireHonestyWake: true,
    ...NOT_CASH
  }),
  Object.freeze({
    id: SUMERU_BUNDLE_ID,
    kind: 'bundle',
    price: SUMERU_PRICE,
    grants: Object.freeze(['space.sumeru-cushion', 'title.long-sitter']),
    minLifetimeMinutes: SUMERU_MIN_LIFETIME_MINUTES,
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'title.sits-with-yin',
    kind: 'title',
    price: 18,
    grants: Object.freeze(['title.sits-with-yin']),
    minPracticeDays: 3,
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'title.returned-gently',
    kind: 'title',
    price: 30,
    grants: Object.freeze(['title.returned-gently']),
    requireActiveRecover: true,
    ...NOT_CASH
  }),
  Object.freeze({
    id: TITLE_LONG_SITTER_ID,
    kind: 'title',
    price: SUMERU_PRICE,
    grants: Object.freeze([TITLE_LONG_SITTER_ID]),
    minLifetimeMinutes: SUMERU_MIN_LIFETIME_MINUTES,
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'badge.rare.quiet-pebble',
    kind: 'badge.rare',
    price: 72,
    grants: Object.freeze(['badge.rare.quiet-pebble']),
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'collection.porcelain.qing-vase',
    kind: 'collection',
    price: 40,
    grants: Object.freeze(['collection.porcelain.qing-vase']),
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'collection.bronze.ritual-vessel',
    kind: 'collection',
    price: 56,
    grants: Object.freeze(['collection.bronze.ritual-vessel']),
    ...NOT_CASH
  }),
  Object.freeze({
    id: 'gesture.wave-hello',
    kind: 'gesture',
    price: 48,
    grants: Object.freeze(['gesture.wave-hello']),
    ...NOT_CASH
  })
]);

/** @param {string} skuId */
export function getFocusCoinSku(skuId) {
  return FOCUS_COIN_CATALOG.find((sku) => sku.id === skuId) ?? null;
}

/** Shop / Collections SKUs — locked 清供 eight; extras stay in catalog only. */
export function listShopFocusCoinSkus() {
  return FOCUS_COIN_CURIO_SHOP_IDS.map((id) => getFocusCoinSku(id)).filter(
    Boolean
  );
}

/**
 * @param {number} n
 * @returns {number}
 */
function nonNegInt(n) {
  const v = Math.floor(Number(n) || 0);
  return v > 0 ? v : 0;
}

/**
 * @param {FocusCoinsDayState} day
 * @returns {number}
 */
export function focusCoinsDayTotal(day) {
  return (
    nonNegInt(day?.durationGranted) +
    nonNegInt(day?.honestyGranted) +
    nonNegInt(day?.ritualGranted) +
    nonNegInt(day?.echoGranted)
  );
}

/**
 * @param {string} companionMode
 * @param {number} durationMinutes
 * @returns {number}
 */
export function durationPointsForTimedSession(companionMode, durationMinutes) {
  const minutes = nonNegInt(durationMinutes);
  if (companionMode === COMPANION_MODE_STAY) {
    return Math.floor(minutes / STAY_MINUTES_PER_POINT);
  }
  if (
    companionMode === COMPANION_MODE_ACROSS_TOOLS ||
    companionMode === COMPANION_MODE_STEP_AWAY
  ) {
    return Math.floor(minutes / HALF_RATE_MINUTES_PER_POINT);
  }
  return 0;
}

/**
 * @param {number} durationMinutes
 * @returns {number}
 */
export function honestyPointsForCheckIn(durationMinutes) {
  const minutes = Math.min(nonNegInt(durationMinutes), HONESTY_MINUTES_CAP);
  return Math.floor(minutes / HALF_RATE_MINUTES_PER_POINT);
}

/**
 * @param {FocusCoinsDayState} day
 * @param {FocusCoinPool} pool
 * @returns {number}
 */
function remainingInPool(day, pool) {
  const totalLeft = Math.max(0, TOTAL_DAILY_CAP - focusCoinsDayTotal(day));
  if (pool === 'duration') {
    return Math.min(
      totalLeft,
      Math.max(0, DURATION_DAILY_CAP - nonNegInt(day.durationGranted))
    );
  }
  if (pool === 'honesty') {
    return Math.min(
      totalLeft,
      Math.max(0, HONESTY_DAILY_CAP - nonNegInt(day.honestyGranted))
    );
  }
  if (pool === 'ritual') {
    return Math.min(
      totalLeft,
      Math.max(0, RITUAL_DAILY_CAP - nonNegInt(day.ritualGranted))
    );
  }
  return 0;
}

/**
 * @param {FocusCoinsDayState} day
 * @returns {FocusCoinsDayState}
 */
function cloneDay(day) {
  return { ...emptyFocusCoinsDayState(), ...day };
}

/**
 * @param {FocusCoinsSessionState} session
 * @returns {FocusCoinsSessionState}
 */
function cloneSession(session) {
  return { ...emptyFocusCoinsSessionState(), ...session };
}

/**
 * Award 寅币 for one completed (or incomplete) event.
 *
 * @param {FocusCoinsGrantEvent} event
 * @param {FocusCoinsDayState} [day]
 * @param {FocusCoinsSessionState} [session]
 * @param {{ yesterdayPracticed?: boolean }} [opts]
 */
export function computeFocusCoinsGrant(
  event,
  day = emptyFocusCoinsDayState(),
  session = emptyFocusCoinsSessionState(),
  opts = {}
) {
  const nextDay = cloneDay(day);
  const nextSession = cloneSession(session);
  const yesterdayPracticed = opts.yesterdayPracticed === true;
  const kind = event?.kind;

  const zero = (reason) => ({
    points: 0,
    durationDelta: 0,
    honestyDelta: 0,
    ritualDelta: 0,
    echoDelta: 0,
    reason,
    nextDay,
    nextSession
  });

  if (
    kind === GRANT_KIND.INCOMPLETE ||
    (kind === GRANT_KIND.TIMED && event.reachedTarget !== true)
  ) {
    return zero('incomplete');
  }

  if (kind === GRANT_KIND.PASSIVE_RECOVER || kind === GRANT_KIND.DORMANT_WAKE) {
    return zero(kind);
  }

  /** @type {FocusCoinPool} */
  let pool = 'none';
  let raw = 0;

  if (kind === GRANT_KIND.TIMED) {
    pool = 'duration';
    raw = durationPointsForTimedSession(
      event.companionMode,
      event.durationMinutes
    );
    if (raw <= 0) return zero('below-rate');
  } else if (kind === GRANT_KIND.HONESTY) {
    if (nextDay.honestyMinted) return zero('honesty-already-minted');
    pool = 'honesty';
    raw = honestyPointsForCheckIn(event.durationMinutes);
    if (raw <= 0) return zero('below-rate');
  } else if (kind === GRANT_KIND.ARRIVE) {
    if (nextSession.arriveGranted) return zero('session-already-granted');
    pool = 'ritual';
    raw = ARRIVE_POINTS;
  } else if (kind === GRANT_KIND.REFLECT) {
    if (nextSession.reflectGranted) return zero('session-already-granted');
    pool = 'ritual';
    raw = REFLECT_POINTS;
  } else if (kind === GRANT_KIND.ACTIVE_RECOVER) {
    if (nextSession.activeRecoverGranted) return zero('session-already-granted');
    if (nextDay.activeRecoverCount >= ACTIVE_RECOVER_DAILY_MAX) {
      return zero('active-recover-daily-cap');
    }
    pool = 'ritual';
    raw = ACTIVE_RECOVER_POINTS;
  } else if (kind === GRANT_KIND.MICRO_RITUAL) {
    if (nextDay.microRitualGranted) return zero('micro-ritual-daily-cap');
    pool = 'ritual';
    raw = MICRO_RITUAL_POINTS;
  } else {
    return zero('unknown-kind');
  }

  const capped = Math.min(raw, remainingInPool(nextDay, pool));
  if (capped <= 0) return zero('daily-cap');

  if (pool === 'duration') nextDay.durationGranted += capped;
  if (pool === 'honesty') {
    nextDay.honestyGranted += capped;
    nextDay.honestyMinted = true;
  }
  if (pool === 'ritual') {
    nextDay.ritualGranted += capped;
    if (kind === GRANT_KIND.ARRIVE) nextSession.arriveGranted = true;
    if (kind === GRANT_KIND.REFLECT) nextSession.reflectGranted = true;
    if (kind === GRANT_KIND.ACTIVE_RECOVER) {
      nextSession.activeRecoverGranted = true;
      nextDay.activeRecoverCount += 1;
    }
    if (kind === GRANT_KIND.MICRO_RITUAL) nextDay.microRitualGranted = true;
  }

  let echoDelta = 0;
  if (yesterdayPracticed && !day.hadQualifyingGrant) {
    const echoLeft = Math.max(0, TOTAL_DAILY_CAP - focusCoinsDayTotal(nextDay));
    echoDelta = Math.min(PRESENCE_ECHO_POINTS, echoLeft);
    nextDay.echoGranted += echoDelta;
  }
  nextDay.hadQualifyingGrant = true;

  const points = capped + echoDelta;
  return {
    points,
    durationDelta: pool === 'duration' ? capped : 0,
    honestyDelta: pool === 'honesty' ? capped : 0,
    ritualDelta: pool === 'ritual' ? capped : 0,
    echoDelta,
    reason: 'ok',
    nextDay,
    nextSession
  };
}

/**
 * @param {object} ctx
 * @param {number} ctx.balance
 * @param {string[]} [ctx.ownedIds]
 * @param {number} [ctx.lifetimeMinutes]
 * @param {number} [ctx.practiceDayCount]
 * @param {boolean} [ctx.hasLotusBloom]
 * @param {boolean} [ctx.hasIncense]
 * @param {boolean} [ctx.hasHonestyWake]
 * @param {boolean} [ctx.hasActiveRecover]
 * @param {boolean} [ctx.lifetimeActive]
 * @param {boolean} [ctx.subscriptionEntitled]
 * @param {boolean} [ctx.tipped]
 */
export function evaluateFocusCoinRedeem(skuId, ctx = {}) {
  const sku = getFocusCoinSku(skuId);
  const owned = Array.isArray(ctx.ownedIds) ? ctx.ownedIds.slice() : [];
  const balance = nonNegInt(ctx.balance);

  const deny = (reason) => ({
    ok: false,
    reason,
    balance,
    ownedIds: owned,
    entitlementPatch: null,
    grantedIds: []
  });

  if (!sku) return deny('unknown-sku');
  if (sku.retiredOverlay === true) return deny('retired-overlay');
  if (sku.cashPurchasable !== false) return deny('cash-purchasable-forbidden');
  if (sku.skippableByEntitlement !== false) {
    return deny('entitlement-skip-forbidden');
  }
  if (owned.includes(sku.id) || sku.grants.every((id) => owned.includes(id))) {
    return deny('already-owned');
  }
  if (balance < sku.price) return deny('insufficient-balance');
  if (
    sku.minLifetimeMinutes != null &&
    nonNegInt(ctx.lifetimeMinutes) < sku.minLifetimeMinutes
  ) {
    return deny('lifetime-minutes');
  }
  if (sku.requireIncense) {
    const daysOk =
      nonNegInt(ctx.practiceDayCount) >= nonNegInt(sku.minPracticeDays);
    if (ctx.hasIncense !== true && !daysOk) return deny('incense');
  } else if (
    sku.minPracticeDays != null &&
    nonNegInt(ctx.practiceDayCount) < sku.minPracticeDays
  ) {
    return deny('practice-days');
  }
  if (sku.requireLotusBloom && ctx.hasLotusBloom !== true) {
    return deny('lotus-bloom');
  }
  if (sku.requireHonestyWake && ctx.hasHonestyWake !== true) {
    return deny('honesty-wake');
  }
  if (sku.requireActiveRecover && ctx.hasActiveRecover !== true) {
    return deny('active-recover');
  }

  const blocked = new Set(listPaidFeatureKeysBlockedFromCoins());
  if (sku.grants.some((id) => blocked.has(id) || id in FEATURE_CATALOG)) {
    return deny('grants-paid-feature');
  }

  const grantedIds = sku.grants.filter((id) => !owned.includes(id));
  const nextOwned = [...owned, sku.id, ...grantedIds];
  return {
    ok: true,
    reason: 'ok',
    balance: balance - sku.price,
    ownedIds: [...new Set(nextOwned)],
    entitlementPatch: null,
    grantedIds
  };
}

/**
 * Catalog must not impersonate entitlement keys or allow cash.
 * @returns {string[]}
 */
export function listFocusCoinCatalogViolations() {
  const blocked = new Set(listPaidFeatureKeysBlockedFromCoins());
  /** @type {string[]} */
  const violations = [];
  for (const sku of FOCUS_COIN_CATALOG) {
    if (sku.id in FEATURE_CATALOG) {
      violations.push(`${sku.id}: catalog id collides with FEATURE_CATALOG`);
    }
    if (sku.cashPurchasable !== false) {
      violations.push(`${sku.id}: cashPurchasable must be false`);
    }
    if (sku.skippableByEntitlement !== false) {
      violations.push(`${sku.id}: skippableByEntitlement must be false`);
    }
    for (const grant of sku.grants) {
      if (blocked.has(grant) || grant in FEATURE_CATALOG) {
        violations.push(`${sku.id}: grant ${grant} is an entitlement key`);
      }
    }
  }
  return violations;
}
