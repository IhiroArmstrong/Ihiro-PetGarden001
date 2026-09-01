/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clearDesktopCheckoutPending,
  markDesktopCheckoutPending,
  noteDesktopCheckoutOpened,
  readDesktopCheckoutPending
} from './desktopCheckoutPending.js';

describe('desktopCheckoutPending', () => {
  it('does not persist without desktop shell', () => {
    const storage = new Map();
    globalThis.sessionStorage = {
      setItem(k, v) {
        storage.set(k, v);
      },
      getItem(k) {
        return storage.get(k) ?? null;
      },
      removeItem(k) {
        storage.delete(k);
      }
    };
    const prev = globalThis.desktopShell;
    delete globalThis.desktopShell;
    try {
      markDesktopCheckoutPending('pro');
      assert.equal(storage.size, 0);
    } finally {
      if (prev !== undefined) globalThis.desktopShell = prev;
    }
  });

  it('round-trips pending checkout kind', () => {
    const storage = new Map();
    globalThis.sessionStorage = {
      setItem(k, v) {
        storage.set(k, v);
      },
      getItem(k) {
        return storage.get(k) ?? null;
      },
      removeItem(k) {
        storage.delete(k);
      }
    };
    globalThis.desktopShell = { isDesktop: true };
    try {
      markDesktopCheckoutPending('pro', '', () => new Date('2026-08-30T12:00:00Z'));
      assert.equal(readDesktopCheckoutPending(() => new Date('2026-08-30T12:05:00Z'))?.kind, 'pro');
      assert.ok(readDesktopCheckoutPending(() => new Date('2026-08-30T12:05:00Z'))?.startedAt);
      clearDesktopCheckoutPending();
      assert.equal(readDesktopCheckoutPending(), null);
      noteDesktopCheckoutOpened('membership', {
        sessionId: 'cs_test_mem_1',
        url: 'https://checkout.stripe.com/c/pay/cs_test_ignored'
      });
      assert.equal(readDesktopCheckoutPending()?.kind, 'membership');
      assert.equal(readDesktopCheckoutPending()?.sessionId, 'cs_test_mem_1');
    } finally {
      delete globalThis.desktopShell;
    }
  });
});
