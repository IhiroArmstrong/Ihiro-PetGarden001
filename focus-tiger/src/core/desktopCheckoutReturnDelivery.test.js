/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { planDesktopCheckoutReturn } from '../../desktop/checkoutReturnDelivery.js';

const mainSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../desktop/main.js'),
  'utf8'
);

test('an open shell stays on the current page', () => {
  const plan = planDesktopCheckoutReturn({
    pageUrl: 'http://127.0.0.1:5173/?product=1',
    isLoading: false,
    search: '?product=1&art_session=cs_test_art'
  });
  assert.equal(plan.mode, 'in-page');
  assert.match(plan.search, /art_session=cs_test_art/);
  assert.equal(plan.search.includes('http'), false);
});

test('cold start still loads once with the checkout query', () => {
  const plan = planDesktopCheckoutReturn({
    pageUrl: '',
    isLoading: true,
    search: 'pro_session=cs_test_pro'
  });
  assert.equal(plan.mode, 'load');
  assert.match(plan.search, /pro_session=cs_test_pro/);
  assert.match(plan.search, /product=1/);
});

test('the shell delivers an in-page return instead of always reloading', () => {
  assert.match(mainSrc, /planDesktopCheckoutReturn/);
  assert.match(mainSrc, /desktop:checkout-return/);
  assert.match(mainSrc, /plan\.mode === 'in-page'/);
});
