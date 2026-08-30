/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resumePendingDesktopCheckout } from './desktopCheckoutConfirm.js';
import { DESKTOP_CHECKOUT_PENDING_STORAGE_KEY } from './desktopCheckoutPending.js';
import { ENTITLEMENT_CACHE_STORAGE_KEY } from './entitlement/entitlementState.js';

describe('desktopCheckoutConfirm', () => {
  it('confirms Pro using pending sessionId without URL deep link', async () => {
    const storage = {
      data: {},
      getItem(k) {
        return this.data[k] ?? null;
      },
      setItem(k, v) {
        this.data[k] = v;
      },
      removeItem(k) {
        delete this.data[k];
      }
    };
    globalThis.localStorage = storage;
    globalThis.sessionStorage = storage;
    globalThis.desktopShell = { isDesktop: true };
    storage.setItem(
      DESKTOP_CHECKOUT_PENDING_STORAGE_KEY,
      JSON.stringify({
        kind: 'pro',
        startedAt: new Date().toISOString(),
        sessionId: 'cs_test_pro_123'
      })
    );

    const posts = [];
    const outcome = await resumePendingDesktopCheckout({
      storage,
      search: '?product=1',
      postJson: async (path, init) => {
        posts.push({ path, body: init?.body });
        return {
          active: true,
          unlocked: true,
          periodEndsAt: '2026-09-30T00:00:00.000Z',
          planId: 'focus-tiger-pro'
        };
      }
    });

    assert.equal(outcome, 'success');
    assert.equal(posts.length, 1);
    assert.equal(posts[0].path, '/api/confirm-pro-session');
    assert.match(String(posts[0].body), /cs_test_pro_123/);
    const cache = JSON.parse(storage.getItem(ENTITLEMENT_CACHE_STORAGE_KEY));
    assert.equal(cache.subscription.planId, 'focus-tiger-pro');
    assert.equal(storage.getItem(DESKTOP_CHECKOUT_PENDING_STORAGE_KEY), null);
  });
});
