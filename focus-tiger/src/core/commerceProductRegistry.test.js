/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { checkoutKindFromSearch } from './desktopCheckoutConfirm.js';
import {
  getCommerceProduct,
  listCommerceProducts,
  listCommerceProductsWithSupportCard
} from './commerceProductRegistry.js';
import { listArtCollectionHdIds } from './artCollectionCatalog.js';
import { peekCheckoutReturnThanksKind } from './paymentCheckoutThanks.js';

const supportUiPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../ui/SupportYinModalUI.js'
);

const REQUIRED_ROW_KEYS = [
  'desktopCheckoutKind',
  'thanksKind',
  'returnQueryMode',
  'stripeSessionParam',
  'peekProductShellThanks',
  'thanksEmotionKey',
  'supportModalCheckoutKind',
  'supportCardTestId',
  'supportPaidSettledFlag',
  'hdGrantSource',
  'serialNumberRuleSource'
];

function sampleQueryForRow(row) {
  if (row.returnQueryMode === 'tip-query') {
    return '?product=1&tip=1';
  }
  return `?product=1&${row.stripeSessionParam}=cs_test_registry`;
}

describe('commerceProductRegistry (A9)', () => {
  it('every product row declares all registry fields', () => {
    for (const row of listCommerceProducts()) {
      for (const key of REQUIRED_ROW_KEYS) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(row, key),
          `${row.desktopCheckoutKind} missing ${key}`
        );
      }
      if (row.returnQueryMode === 'stripe-session') {
        assert.ok(
          row.stripeSessionParam,
          `${row.desktopCheckoutKind} needs stripeSessionParam`
        );
      }
      if (row.peekProductShellThanks) {
        assert.ok(row.thanksKind, `${row.desktopCheckoutKind} needs thanksKind`);
        assert.ok(
          row.thanksEmotionKey,
          `${row.desktopCheckoutKind} needs thanksEmotionKey`
        );
      } else {
        assert.equal(row.thanksKind, null);
        assert.equal(row.thanksEmotionKey, null);
      }
      if (row.supportModalCheckoutKind) {
        assert.ok(
          row.supportCardTestId,
          `${row.desktopCheckoutKind} needs supportCardTestId`
        );
      }
    }
  });

  it('art-collection return row is required (removing it should fail checkout parity)', () => {
    const art = getCommerceProduct('art-collection');
    assert.equal(art.stripeSessionParam, 'art_session');
    assert.equal(art.peekProductShellThanks, false);
    const query = sampleQueryForRow(art);
    assert.equal(peekCheckoutReturnThanksKind(query), null);
    assert.equal(checkoutKindFromSearch(query), 'art-collection');
  });

  it('thanks peek and desktop resume agree for every stripe-session product', () => {
    for (const row of listCommerceProducts()) {
      if (row.returnQueryMode === 'tip-query') {
        assert.equal(peekCheckoutReturnThanksKind('?product=1&tip=1'), 'tip');
        assert.equal(checkoutKindFromSearch('?product=1&tip=1'), 'tea');
        continue;
      }
      const query = sampleQueryForRow(row);
      assert.equal(checkoutKindFromSearch(query), row.desktopCheckoutKind);
      if (row.peekProductShellThanks) {
        assert.equal(peekCheckoutReturnThanksKind(query), row.thanksKind);
      } else {
        assert.equal(peekCheckoutReturnThanksKind(query), null);
      }
    }
  });

  it('art-collection declares hd grant + serial rule sources', () => {
    const art = getCommerceProduct('art-collection');
    assert.equal(art.hdGrantSource, 'art-collection-sheets');
    assert.equal(art.serialNumberRuleSource, 'art-edition-serial');
    assert.ok(listArtCollectionHdIds().length > 0);
  });

  it('Support modal declares wiring for every support-card product', () => {
    const src = fs.readFileSync(supportUiPath, 'utf8');
    for (const row of listCommerceProductsWithSupportCard()) {
      const kind = row.supportModalCheckoutKind;
      assert.match(
        src,
        new RegExp(`_runCheckout\\('${kind}'\\)`),
        `SupportYinModalUI missing checkout wiring for ${kind}`
      );
      assert.ok(
        src.includes(row.supportCardTestId),
        `missing ${row.supportCardTestId}`
      );
    }
  });
});
