import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MONETIZATION_FUNNEL_CONSENT_STORAGE_KEY,
  buildMonetizationFunnelIngestPayload,
  monetizationFunnelCountDelta,
  normalizeMonetizationFunnelConsent,
  readMonetizationFunnelConsent,
  setMonetizationFunnelOptIn
} from './monetizationFunnelConsent.js';
import { tryUploadMonetizationFunnel } from './monetizationFunnelUpload.js';

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

describe('monetizationFunnelConsent', () => {
  it('defaults opted out and creates installId', () => {
    const s = normalizeMonetizationFunnelConsent(null);
    assert.equal(s.optedIn, false);
    assert.ok(s.installId);
  });

  it('delta only includes positive increases', () => {
    assert.deepEqual(
      monetizationFunnelCountDelta(
        { 'support_open': 3, 'support_cta:tea': 1 },
        { support_open: 2 }
      ),
      { support_open: 1, 'support_cta:tea': 1 }
    );
  });

  it('build payload null when opted out or no delta', () => {
    const consent = normalizeMonetizationFunnelConsent({
      optedIn: false,
      installId: 'x'
    });
    assert.equal(
      buildMonetizationFunnelIngestPayload(consent, { support_open: 1 }),
      null
    );
    const on = setMonetizationFunnelOptIn(memoryStorage(), true);
    assert.equal(
      buildMonetizationFunnelIngestPayload(
        { ...on, lastSentCounts: { support_open: 1 } },
        { support_open: 1 }
      ),
      null
    );
  });

  it('build payload has only schemaVersion installId counts', () => {
    const on = {
      optedIn: true,
      installId: 'anon-1',
      lastSentCounts: {},
      lastSentAt: null
    };
    const p = buildMonetizationFunnelIngestPayload(on, {
      support_open: 2,
      reflection_text: 9
    });
    assert.deepEqual(Object.keys(p).sort(), [
      'counts',
      'installId',
      'schemaVersion'
    ]);
    assert.equal(p.schemaVersion, 1);
    assert.equal(p.installId, 'anon-1');
    assert.equal(p.counts.support_open, 2);
    assert.equal(p.counts.reflection_text, undefined);
  });

  it('persists opt-in flag', () => {
    const storage = memoryStorage();
    setMonetizationFunnelOptIn(storage, true);
    assert.equal(readMonetizationFunnelConsent(storage).optedIn, true);
    assert.ok(storage.getItem(MONETIZATION_FUNNEL_CONSENT_STORAGE_KEY));
    setMonetizationFunnelOptIn(storage, false);
    assert.equal(readMonetizationFunnelConsent(storage).optedIn, false);
  });
});

describe('tryUploadMonetizationFunnel', () => {
  it('skips when opted out', async () => {
    const storage = memoryStorage();
    const r = await tryUploadMonetizationFunnel({
      storage,
      readCounts: () => ({ support_open: 1 }),
      postJson: async () => {
        throw new Error('should not post');
      }
    });
    assert.equal(r.sent, false);
    assert.equal(r.reason, 'opted_out');
  });

  it('posts delta and advances lastSentCounts', async () => {
    const storage = memoryStorage();
    setMonetizationFunnelOptIn(storage, true);
    let body = null;
    const r = await tryUploadMonetizationFunnel({
      storage,
      readCounts: () => ({ support_open: 2, 'checkout_start:tea': 1 }),
      postJson: async (_path, init) => {
        body = JSON.parse(String(init.body || '{}'));
        return { ok: true };
      }
    });
    assert.equal(r.sent, true);
    assert.equal(body.schemaVersion, 1);
    assert.equal(body.counts.support_open, 2);
    const consent = readMonetizationFunnelConsent(storage);
    assert.equal(consent.lastSentCounts.support_open, 2);
    assert.ok(consent.lastSentAt);
  });
});
