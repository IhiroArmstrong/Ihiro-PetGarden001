/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY
} from './FocusSession.js';
import {
  FEATURE_CATALOG,
  isEntitled
} from './entitlement/entitlementGate.js';
import {
  FOCUS_COIN_CATALOG,
  FOCUS_COINS_DISPLAY_NAME,
  GRANT_KIND,
  SUMERU_BUNDLE_ID,
  SUMERU_MIN_LIFETIME_MINUTES,
  SUMERU_PRICE,
  coinsSatisfyEntitlement,
  computeFocusCoinsGrant,
  emptyFocusCoinsDayState,
  emptyFocusCoinsSessionState,
  evaluateFocusCoinRedeem,
  listFocusCoinCatalogViolations,
  listPaidFeatureKeysBlockedFromCoins
} from './focusCoinsLedger.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('focusCoinsLedger L0', () => {
  it('display name is 同坐点, not arcade copy', () => {
    assert.equal(FOCUS_COINS_DISPLAY_NAME, '同坐点');
  });

  it('incomplete / unreached timed session → 0', () => {
    const a = computeFocusCoinsGrant({ kind: GRANT_KIND.INCOMPLETE });
    assert.equal(a.points, 0);
    assert.equal(a.reason, 'incomplete');
    const b = computeFocusCoinsGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: false,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes: 25
    });
    assert.equal(b.points, 0);
    assert.equal(b.reason, 'incomplete');
  });

  it('Stay 25 min → 5; Across tools 25 min → 2', () => {
    const stay = computeFocusCoinsGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STAY,
      durationMinutes: 25
    });
    assert.equal(stay.points, 5);
    assert.equal(stay.durationDelta, 5);
    const flow = computeFocusCoinsGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_ACROSS_TOOLS,
      durationMinutes: 25
    });
    assert.equal(flow.points, 2);
    const offline = computeFocusCoinsGrant({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: COMPANION_MODE_STEP_AWAY,
      durationMinutes: 25
    });
    assert.equal(offline.points, 2);
  });

  it('Honesty 30 → 3; same-day second Honesty → 0', () => {
    const first = computeFocusCoinsGrant({
      kind: GRANT_KIND.HONESTY,
      durationMinutes: 30
    });
    assert.equal(first.points, 3);
    assert.equal(first.nextDay.honestyMinted, true);
    const second = computeFocusCoinsGrant(
      { kind: GRANT_KIND.HONESTY, durationMinutes: 30 },
      first.nextDay
    );
    assert.equal(second.points, 0);
    assert.equal(second.reason, 'honesty-already-minted');
  });

  it('duration pool above 36 stops minting', () => {
    const day = emptyFocusCoinsDayState();
    day.durationGranted = 36;
    const g = computeFocusCoinsGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      day
    );
    assert.equal(g.points, 0);
    assert.equal(g.reason, 'daily-cap');
  });

  it('presence echo +3 only on first qualifying grant when yesterday practiced', () => {
    const none = computeFocusCoinsGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      emptyFocusCoinsDayState(),
      emptyFocusCoinsSessionState(),
      { yesterdayPracticed: false }
    );
    assert.equal(none.points, 5);
    assert.equal(none.echoDelta, 0);

    const echoed = computeFocusCoinsGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      emptyFocusCoinsDayState(),
      emptyFocusCoinsSessionState(),
      { yesterdayPracticed: true }
    );
    assert.equal(echoed.points, 8);
    assert.equal(echoed.echoDelta, 3);

    const second = computeFocusCoinsGrant(
      {
        kind: GRANT_KIND.TIMED,
        reachedTarget: true,
        companionMode: COMPANION_MODE_STAY,
        durationMinutes: 25
      },
      echoed.nextDay,
      emptyFocusCoinsSessionState(),
      { yesterdayPracticed: true }
    );
    assert.equal(second.points, 5);
    assert.equal(second.echoDelta, 0);
  });

  it('passive Recover and dormantWake → 0', () => {
    assert.equal(
      computeFocusCoinsGrant({ kind: GRANT_KIND.PASSIVE_RECOVER }).points,
      0
    );
    assert.equal(
      computeFocusCoinsGrant({ kind: GRANT_KIND.DORMANT_WAKE }).points,
      0
    );
  });

  it('ritual Arrive/Reflect/active Recover respect session and daily caps', () => {
    const arrive = computeFocusCoinsGrant({ kind: GRANT_KIND.ARRIVE });
    assert.equal(arrive.points, 2);
    const arriveAgain = computeFocusCoinsGrant(
      { kind: GRANT_KIND.ARRIVE },
      arrive.nextDay,
      arrive.nextSession
    );
    assert.equal(arriveAgain.points, 0);

    const recover = computeFocusCoinsGrant({ kind: GRANT_KIND.ACTIVE_RECOVER });
    assert.equal(recover.points, 1);
    const day = recover.nextDay;
    day.activeRecoverCount = 3;
    const capped = computeFocusCoinsGrant(
      { kind: GRANT_KIND.ACTIVE_RECOVER },
      day,
      emptyFocusCoinsSessionState()
    );
    assert.equal(capped.points, 0);
    assert.equal(capped.reason, 'active-recover-daily-cap');
  });

  it('catalog has no FEATURE_CATALOG collisions and forbids cash', () => {
    assert.deepEqual(listFocusCoinCatalogViolations(), []);
    for (const sku of FOCUS_COIN_CATALOG) {
      assert.equal(sku.cashPurchasable, false);
      assert.equal(sku.skippableByEntitlement, false);
      assert.equal(sku.id in FEATURE_CATALOG, false);
    }
    assert.equal('focus.coins' in FEATURE_CATALOG, false);
  });

  it('redeem must not entitle ambient.deep.play or ritual access keys', () => {
    const paid = listPaidFeatureKeysBlockedFromCoins();
    assert.ok(paid.includes('ambient.deep.play'));
    assert.ok(paid.includes('ritual.morning.access'));
    const storage = memoryStorage();
    const wallet = { balance: 9999, ownedIds: FOCUS_COIN_CATALOG.map((s) => s.id) };
    assert.equal(coinsSatisfyEntitlement('ambient.deep.play', wallet), false);
    assert.equal(
      isEntitled('ambient.deep.play', { storage, now: () => new Date(0) }),
      false
    );
    for (const key of paid.filter((k) => k.endsWith('.access'))) {
      const result = evaluateFocusCoinRedeem(key, { balance: 9999 });
      assert.equal(result.ok, false);
      assert.equal(result.entitlementPatch, null);
      assert.equal(coinsSatisfyEntitlement(key, wallet), false);
    }
  });

  it('须弥坐 needs 360 points AND 600 lifetime minutes; membership cannot skip', () => {
    const noMinutes = evaluateFocusCoinRedeem(SUMERU_BUNDLE_ID, {
      balance: SUMERU_PRICE,
      lifetimeMinutes: SUMERU_MIN_LIFETIME_MINUTES - 1,
      lifetimeActive: true,
      subscriptionEntitled: true
    });
    assert.equal(noMinutes.ok, false);
    assert.equal(noMinutes.reason, 'lifetime-minutes');
    assert.equal(noMinutes.entitlementPatch, null);

    const noCoins = evaluateFocusCoinRedeem(SUMERU_BUNDLE_ID, {
      balance: SUMERU_PRICE - 1,
      lifetimeMinutes: SUMERU_MIN_LIFETIME_MINUTES,
      lifetimeActive: true
    });
    assert.equal(noCoins.ok, false);
    assert.equal(noCoins.reason, 'insufficient-balance');

    const membershipCannotSkip = evaluateFocusCoinRedeem(SUMERU_BUNDLE_ID, {
      balance: 0,
      lifetimeMinutes: SUMERU_MIN_LIFETIME_MINUTES,
      lifetimeActive: true,
      subscriptionEntitled: true
    });
    assert.equal(membershipCannotSkip.ok, false);
    assert.equal(membershipCannotSkip.entitlementPatch, null);

    const ok = evaluateFocusCoinRedeem(SUMERU_BUNDLE_ID, {
      balance: SUMERU_PRICE,
      lifetimeMinutes: SUMERU_MIN_LIFETIME_MINUTES
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.balance, 0);
    assert.ok(ok.ownedIds.includes('space.sumeru-cushion'));
    assert.ok(ok.ownedIds.includes('title.long-sitter'));
    assert.equal(ok.entitlementPatch, null);
  });
});
