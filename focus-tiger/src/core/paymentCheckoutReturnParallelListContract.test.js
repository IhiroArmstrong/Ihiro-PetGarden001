/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listCommerceProducts } from './commerceProductRegistry.js';
import { checkoutKindFromSearch } from './desktopCheckoutConfirm.js';
import { peekCheckoutReturnThanksKind } from './paymentCheckoutThanks.js';

function sampleQueryForProduct(row) {
  if (row.returnQueryMode === 'tip-query') {
    return '?product=1&tip=1';
  }
  return `?product=1&${row.stripeSessionParam}=cs_test`;
}

describe('paymentCheckoutReturnParallelListContract (A9 registry)', () => {
  it('thanks peek and desktop checkout kinds share session query detection', () => {
    for (const row of listCommerceProducts()) {
      const query = sampleQueryForProduct(row);
      assert.equal(checkoutKindFromSearch(query), row.desktopCheckoutKind);
      if (row.peekProductShellThanks) {
        assert.equal(peekCheckoutReturnThanksKind(query), row.thanksKind);
      } else {
        assert.equal(peekCheckoutReturnThanksKind(query), null);
      }
    }
  });
});
