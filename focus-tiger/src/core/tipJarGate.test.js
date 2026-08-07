import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TIP_JAR_STORAGE_KEY,
  clearTipStatus,
  consumeTipReturnQuery,
  hasTipped,
  markTipFromCheckoutReturn,
  markTipFromEmailRestore,
  normalizeTipStatus,
  readTipStatus
} from './tipJarGate.js';

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
    markTipFromCheckoutReturn(storage, {
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    assert.equal(hasTipped({ storage }), true);
    assert.equal(readTipStatus(storage).tipCount, 1);
    assert.equal(readTipStatus(storage).source, 'checkout-return');
    markTipFromCheckoutReturn(storage, {
      now: () => new Date('2026-08-07T00:00:00.000Z')
    });
    assert.equal(readTipStatus(storage).tipCount, 2);
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
  });
});
