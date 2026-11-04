/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveContemplativeInquiryMenuClick } from './contemplativeInquiryFocusingYield.js';

test('idle / missing focusing → open the sit card', () => {
  assert.equal(resolveContemplativeInquiryMenuClick({}), 'open');
  assert.equal(resolveContemplativeInquiryMenuClick({ focusing: false }), 'open');
});

test('focusing → hint Rise; never treat the click as Rise or as open', () => {
  assert.equal(
    resolveContemplativeInquiryMenuClick({ focusing: true }),
    'hint-rise'
  );
  assert.notEqual(
    resolveContemplativeInquiryMenuClick({ focusing: true }),
    'open'
  );
});
