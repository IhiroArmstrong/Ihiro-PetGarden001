import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONTEXTUAL_TEA_TIP_STORAGE_KEY,
  localDayKey,
  markContextualTeaTipDismissed,
  markContextualTeaTipShown,
  shouldOfferContextualTeaTip,
  readContextualTeaTipState
} from './contextualTeaTipGate.js';

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

describe('contextualTeaTipGate', () => {
  it('allows first offer of the day for known reasons', () => {
    const storage = memoryStorage();
    const now = new Date('2026-08-12T10:00:00');
    assert.equal(
      shouldOfferContextualTeaTip(storage, 'session-complete', { now }),
      true
    );
    assert.equal(
      shouldOfferContextualTeaTip(storage, 'milestone', { now }),
      true
    );
  });

  it('rejects busy / unknown reason / second show same day', () => {
    const storage = memoryStorage();
    const now = new Date('2026-08-12T10:00:00');
    assert.equal(
      shouldOfferContextualTeaTip(storage, 'session-complete', {
        now,
        busy: true
      }),
      false
    );
    assert.equal(
      shouldOfferContextualTeaTip(storage, /** @type {any} */ ('nope'), {
        now
      }),
      false
    );
    markContextualTeaTipShown(storage, 'session-complete', { now });
    assert.equal(
      shouldOfferContextualTeaTip(storage, 'milestone', { now }),
      false
    );
    const nextDay = new Date('2026-08-13T09:00:00');
    assert.equal(
      shouldOfferContextualTeaTip(storage, 'milestone', { now: nextDay }),
      true
    );
  });

  it('records show day + dismiss count', () => {
    const storage = memoryStorage();
    const now = new Date('2026-08-12T15:30:00+08:00');
    markContextualTeaTipShown(storage, 'milestone', { now });
    const state = readContextualTeaTipState(storage);
    assert.equal(state.lastShownLocalDay, localDayKey(now));
    assert.equal(state.lastShownReason, 'milestone');
    assert.ok(state.lastShownAt);
    markContextualTeaTipDismissed(storage);
    assert.equal(readContextualTeaTipState(storage).dismissedCount, 1);
    assert.equal(
      storage.getItem(CONTEXTUAL_TEA_TIP_STORAGE_KEY)?.includes('milestone'),
      true
    );
  });
});
