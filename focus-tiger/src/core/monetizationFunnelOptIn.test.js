/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY,
  isMonetizationFunnelOptInEnabled,
  normalizeMonetizationFunnelOptInState,
  readMonetizationFunnelOptInState,
  setMonetizationFunnelOptIn
} from './monetizationFunnelOptIn.js';
import {
  buildMonetizationFunnelUploadPayload,
  flushMonetizationFunnelUpload,
  resetMonetizationFunnelUploadThrottleForTests,
  sanitizeMonetizationFunnelCounts
} from './monetizationFunnelUpload.js';
import {
  MONETIZATION_FUNNEL_STORAGE_KEY,
  MonetizationFunnelStore
} from './monetizationIntentFunnel.js';

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

describe('monetizationFunnelOptIn', () => {
  it('defaults off', () => {
    const storage = memoryStorage();
    assert.equal(isMonetizationFunnelOptInEnabled(storage), false);
    assert.equal(
      normalizeMonetizationFunnelOptInState(null).enabled,
      false
    );
  });

  it('enabling mints clientId and consentedAt', () => {
    const storage = memoryStorage();
    const next = setMonetizationFunnelOptIn(
      storage,
      true,
      () => new Date('2026-08-12T03:00:00Z')
    );
    assert.equal(next.enabled, true);
    assert.ok(next.clientId);
    assert.equal(next.consentedAt, '2026-08-12T03:00:00.000Z');
    assert.ok(storage.getItem(MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY));
  });

  it('disabling keeps clientId but stops enabled', () => {
    const storage = memoryStorage();
    const on = setMonetizationFunnelOptIn(storage, true);
    const off = setMonetizationFunnelOptIn(storage, false);
    assert.equal(off.enabled, false);
    assert.equal(off.clientId, on.clientId);
  });
});

describe('monetizationFunnelUpload', () => {
  it('buildPayload returns null when opt-in off', () => {
    const storage = memoryStorage();
    const store = new MonetizationFunnelStore({
      storage,
      afterRecord: () => {}
    });
    store.supportOpen();
    assert.equal(buildMonetizationFunnelUploadPayload({ storage }), null);
  });

  it('buildPayload includes counts when opted in', () => {
    const storage = memoryStorage();
    setMonetizationFunnelOptIn(
      storage,
      true,
      () => new Date('2026-08-12T03:00:00Z')
    );
    const store = new MonetizationFunnelStore({
      storage,
      afterRecord: () => {}
    });
    store.supportCta('tea');
    const payload = buildMonetizationFunnelUploadPayload({
      storage,
      now: () => new Date('2026-08-12T03:01:00Z')
    });
    assert.ok(payload);
    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.counts['support_cta:tea'], 1);
    assert.ok(payload.clientId);
  });

  it('sanitizeCounts drops unknown keys', () => {
    assert.deepEqual(
      sanitizeMonetizationFunnelCounts({
        support_open: 2,
        'evil:hack': 9,
        free_text: 1
      }),
      { support_open: 2 }
    );
  });

  it('flush does not post when opt-in off', async () => {
    resetMonetizationFunnelUploadThrottleForTests();
    const storage = memoryStorage();
    let posts = 0;
    const result = await flushMonetizationFunnelUpload({
      storage,
      force: true,
      postJson: async () => {
        posts += 1;
        return { ok: true };
      }
    });
    assert.equal(result.skipped, true);
    assert.equal(posts, 0);
  });

  it('flush posts when opted in', async () => {
    resetMonetizationFunnelUploadThrottleForTests();
    const storage = memoryStorage();
    setMonetizationFunnelOptIn(storage, true);
    const store = new MonetizationFunnelStore({
      storage,
      afterRecord: () => {}
    });
    store.checkoutComplete('tea');
    let body = null;
    const result = await flushMonetizationFunnelUpload({
      storage,
      force: true,
      getBaseUrl: () => 'http://127.0.0.1:8787',
      postJson: async (_path, init) => {
        body = JSON.parse(String(init.body || '{}'));
        return { ok: true };
      }
    });
    assert.equal(result.ok, true);
    assert.equal(body.schemaVersion, 1);
    assert.equal(body.counts['checkout_complete:tea'], 1);
    const meta = readMonetizationFunnelOptInState(storage);
    assert.ok(meta.lastUploadAt);
    assert.equal(meta.lastUploadError, null);
  });

  it('afterRecord hook can schedule without breaking local record', () => {
    const storage = memoryStorage();
    let seen = null;
    const store = new MonetizationFunnelStore({
      storage,
      afterRecord: (name) => {
        seen = name;
      }
    });
    store.supportOpen('fab');
    assert.equal(seen, 'support_open');
    assert.ok(storage.getItem(MONETIZATION_FUNNEL_STORAGE_KEY));
  });
});
