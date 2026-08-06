import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTER_STORAGE_KEY,
  clearSupporterStatus,
  consumeSupporterReturnQuery,
  isSupporter,
  markSupporterFromCheckoutReturn,
  markSupporterFromEmailRestore,
  normalizeSupporterStatus,
  readSupporterStatus
} from './supporterGate.js';

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

describe('supporterGate', () => {
  it('normalize defaults to non-supporter', () => {
    assert.equal(normalizeSupporterStatus(null).supporter, false);
    assert.equal(normalizeSupporterStatus({}).supporter, false);
  });

  it('isSupporter reads localStorage flag', () => {
    const storage = memoryStorage();
    assert.equal(isSupporter({ storage }), false);
    markSupporterFromCheckoutReturn(storage, {
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    assert.equal(isSupporter({ storage }), true);
    assert.equal(
      readSupporterStatus(storage).source,
      'checkout-return'
    );
    assert.ok(storage.getItem(SUPPORTER_STORAGE_KEY));
  });

  it('email restore writes verified source', () => {
    const storage = memoryStorage();
    markSupporterFromEmailRestore(storage, {
      email: '  Founder@Example.COM ',
      purchasedAt: '2026-08-01T12:00:00.000Z',
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    const s = readSupporterStatus(storage);
    assert.equal(s.supporter, true);
    assert.equal(s.email, 'founder@example.com');
    assert.equal(s.source, 'email-restore');
    assert.equal(s.purchasedAt, '2026-08-01T12:00:00.000Z');
  });

  it('consumeSupporterReturnQuery marks success and strips query', () => {
    const storage = memoryStorage();
    /** @type {string[]} */
    const replaced = [];
    const result = consumeSupporterReturnQuery({
      storage,
      search: '?product=1&supporter=1&x=1',
      replaceUrl: (u) => replaced.push(u),
      now: () => new Date('2026-08-06T00:00:00.000Z')
    });
    assert.equal(result.consumed, true);
    assert.equal(result.outcome, 'success');
    assert.equal(isSupporter({ storage }), true);
    assert.ok(replaced[0].includes('product=1'));
    assert.ok(!replaced[0].includes('supporter='));
  });

  it('consumeSupporterReturnQuery cancel does not mark supporter', () => {
    const storage = memoryStorage();
    const result = consumeSupporterReturnQuery({
      storage,
      search: '?supporter=cancel',
      replaceUrl: () => {}
    });
    assert.equal(result.outcome, 'cancel');
    assert.equal(isSupporter({ storage }), false);
  });

  it('clearSupporterStatus resets', () => {
    const storage = memoryStorage();
    markSupporterFromCheckoutReturn(storage);
    clearSupporterStatus(storage);
    assert.equal(isSupporter({ storage }), false);
  });
});
