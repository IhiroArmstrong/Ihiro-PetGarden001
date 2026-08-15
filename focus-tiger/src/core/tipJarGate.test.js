import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TIP_JAR_STORAGE_KEY,
  TIP_JAR_PRICE_USD,
  clearTipStatus,
  consumeTipReturnQuery,
  ensureTipBadgesAwarded,
  syncTipBadgesFromPractice,
  hasTipped,
  markTipFromCheckoutReturn,
  markTipFromEmailRestore,
  normalizeTipStatus,
  readTipStatus
} from './tipJarGate.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';

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

describe('tipJarGate', () => {
  it('normalize defaults to not tipped', () => {
    assert.equal(normalizeTipStatus(null).tipped, false);
    assert.equal(normalizeTipStatus({}).tipCount, 0);
  });

  it('hasTipped and increments tipCount on checkout return', () => {
    const storage = memoryStorage();
    assert.equal(hasTipped({ storage }), false);
    const first = markTipFromCheckoutReturn(storage, {
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    assert.equal(hasTipped({ storage }), true);
    assert.equal(readTipStatus(storage).tipCount, 1);
    assert.equal(first.isRepeatTip, false);
    assert.equal(readTipStatus(storage).source, 'checkout-return');
    assert.equal(readTipStatus(storage).badgeIds.length, 3);
    assert.equal(readTipStatus(storage).tipLog.length, 1);
    const second = markTipFromCheckoutReturn(storage, {
      now: () => new Date('2026-08-07T00:00:00.000Z')
    });
    assert.equal(readTipStatus(storage).tipCount, 2);
    assert.equal(second.isRepeatTip, true);
    // No new practice → re-tip does not add badges
    assert.equal(readTipStatus(storage).badgeIds.length, 3);
    assert.equal(readTipStatus(storage).tipLog.length, 2);
    assert.ok(storage.getItem(TIP_JAR_STORAGE_KEY));
  });

  it('email restore writes tip schema', () => {
    const storage = memoryStorage();
    markTipFromEmailRestore(storage, {
      email: '  Tea@Example.COM ',
      tipCount: 3,
      lastTippedAt: '2026-08-01T12:00:00.000Z',
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    const s = readTipStatus(storage);
    assert.equal(s.tipped, true);
    assert.equal(s.email, 'tea@example.com');
    assert.equal(s.tipCount, 3);
    assert.equal(s.source, 'email-restore');
  });

  it('consumeTipReturnQuery marks success and strips query', () => {
    const storage = memoryStorage();
    /** @type {string[]} */
    const replaced = [];
    const result = consumeTipReturnQuery({
      storage,
      search: '?product=1&tip=1&x=1',
      replaceUrl: (u) => replaced.push(u),
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    assert.equal(result.consumed, true);
    assert.equal(result.outcome, 'success');
    assert.equal(hasTipped({ storage }), true);
    assert.ok(replaced[0].includes('product=1'));
    assert.ok(!replaced[0].includes('tip='));
  });

  it('consumeTipReturnQuery cancel does not mark tipped', () => {
    const storage = memoryStorage();
    const result = consumeTipReturnQuery({
      storage,
      search: '?tip=cancel',
      replaceUrl: () => {}
    });
    assert.equal(result.outcome, 'cancel');
    assert.equal(hasTipped({ storage }), false);
  });

  it('clearTipStatus resets', () => {
    const storage = memoryStorage();
    markTipFromCheckoutReturn(storage);
    clearTipStatus(storage);
    assert.equal(hasTipped({ storage }), false);
    assert.equal(readTipStatus(storage).tipCount, 0);
    assert.deepEqual(readTipStatus(storage).badgeIds, []);
  });

  it('ensureTipBadgesAwarded backfills empty badgeIds for tipped users', () => {
    const storage = memoryStorage({
      [TIP_JAR_STORAGE_KEY]: JSON.stringify({
        tipped: true,
        tipCount: 1,
        lastTippedAt: '2026-08-01T00:00:00.000Z',
        email: null,
        source: 'checkout-return'
      })
    });
    assert.deepEqual(readTipStatus(storage).badgeIds, []);
    const result = ensureTipBadgesAwarded(storage);
    assert.equal(result.newlyAddedIds.length, 3);
    assert.equal(readTipStatus(storage).badgeIds.length, 3);
    assert.deepEqual(ensureTipBadgesAwarded(storage).newlyAddedIds, []);
  });

  it('syncTipBadgesFromPractice awards free badge after practice without tip', () => {
    const storage = memoryStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: [{ date: '2026-08-09', totalMinutes: 25 }]
      })
    });
    assert.equal(hasTipped({ storage }), false);
    const result = syncTipBadgesFromPractice(storage);
    assert.equal(result.newlyAddedIds.length, 1);
    assert.equal(readTipStatus(storage).badgeIds.length, 1);
    assert.equal(hasTipped({ storage }), false);
    assert.deepEqual(syncTipBadgesFromPractice(storage).newlyAddedIds, []);
  });

  it('tipped user grows badges when practice rises without re-tip', () => {
    const storage = memoryStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: [{ date: '2026-08-01', totalMinutes: 10 }]
      })
    });
    markTipFromCheckoutReturn(storage);
    assert.equal(readTipStatus(storage).badgeIds.length, 3);
    storage.setItem(
      PRACTICE_DAYS_STORAGE_KEY,
      JSON.stringify({
        days: [
          { date: '2026-08-01', totalMinutes: 60 },
          { date: '2026-08-02', totalMinutes: 60 },
          { date: '2026-08-03', totalMinutes: 60 }
        ]
      })
    );
    const grown = syncTipBadgesFromPractice(storage);
    assert.ok(grown.newlyAddedIds.length >= 1);
    assert.ok(readTipStatus(storage).badgeIds.length > 3);
  });
});

describe('tip display price vs membership', () => {
  it('Buy Yin a Tea stays below monthly membership', async () => {
    const { MEMBERSHIP_PRICE_DISPLAY } = await import(
      './membershipCheckout.js'
    );
    assert.equal(TIP_JAR_PRICE_USD, '4.99');
    assert.ok(
      Number(TIP_JAR_PRICE_USD) < Number(MEMBERSHIP_PRICE_DISPLAY),
      `tea ${TIP_JAR_PRICE_USD} must be < membership ${MEMBERSHIP_PRICE_DISPLAY}`
    );
  });
});
