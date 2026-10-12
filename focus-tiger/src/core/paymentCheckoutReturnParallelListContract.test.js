/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkoutKindFromSearch } from './desktopCheckoutConfirm.js';
import {
  PAYMENT_THANKS_EMOTIONS,
  peekCheckoutReturnThanksKind
} from './paymentCheckoutThanks.js';

/** A3 census: web thanks peek vs desktop resume must agree on query keys. */
const SESSION_QUERY_BY_THANKS_KIND = Object.freeze({
  sanctuary: 'sanctuary_session=cs_test',
  membership: 'membership_session=cs_test',
  pro: 'pro_session=cs_test',
  'companion-addon': 'companion_addon_session=cs_test'
});

describe('paymentCheckoutReturnParallelListContract (A3)', () => {
  it('thanks kinds and desktop checkout kinds share session query detection', () => {
    for (const kind of Object.keys(PAYMENT_THANKS_EMOTIONS)) {
      if (kind === 'tip') {
        assert.equal(peekCheckoutReturnThanksKind('?product=1&tip=1'), 'tip');
        assert.equal(checkoutKindFromSearch('?product=1&tip=1'), 'tea');
        continue;
      }
      const query = `?product=1&${SESSION_QUERY_BY_THANKS_KIND[kind]}`;
      assert.equal(peekCheckoutReturnThanksKind(query), kind);
      assert.equal(checkoutKindFromSearch(query), kind);
    }
  });

  it('art collection return is desktop-only in this parallel list', () => {
    const query = '?product=1&art_session=cs_test_art';
    assert.equal(peekCheckoutReturnThanksKind(query), null);
    assert.equal(checkoutKindFromSearch(query), 'art-collection');
  });
});
