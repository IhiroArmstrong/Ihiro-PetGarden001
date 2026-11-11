/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyDesktopDeepLink,
  desktopPracticeLoadUrl
} from '../../desktop/practiceDeepLinkDispatch.js';

const PRACTICE = 'focus-tiger://app/?product=1&start=sit&min=5';
const CHECKOUT =
  'focus-tiger://app/?product=1&pro_session=cs_test_abc&start=sit&min=5';
const ART =
  'focus-tiger://app/?product=1&art_session=cs_test_art&start=sit&min=5';
const DISCARD = 'focus-tiger://app/?product=1&start=hack&min=5';
const OPEN = 'focus-tiger://app/?product=1';
const BREATH = 'focus-tiger://app/?product=1&start=breath&min=1';

describe('classifyDesktopDeepLink (C slice)', () => {
  it('keeps checkout ahead of practice when session keys are present', () => {
    assert.equal(classifyDesktopDeepLink(CHECKOUT).kind, 'checkout');
    assert.equal(classifyDesktopDeepLink(ART).kind, 'checkout');
    assert.match(classifyDesktopDeepLink(CHECKOUT).search, /pro_session=/);
  });

  it('classifies whitelist Sit/Breath as practice, not checkout', () => {
    assert.deepEqual(classifyDesktopDeepLink(PRACTICE), {
      kind: 'practice',
      search: '?product=1&start=sit&min=5',
      intent: { start: 'sit', minutes: 5 }
    });
    assert.equal(classifyDesktopDeepLink(BREATH).kind, 'practice');
    assert.equal(classifyDesktopDeepLink(BREATH).intent?.start, 'breath');
  });

  it('discards unknown start on the desktop origin', () => {
    assert.equal(classifyDesktopDeepLink(DISCARD).kind, 'discard');
    assert.equal(classifyDesktopDeepLink(OPEN).kind, 'open');
    assert.equal(classifyDesktopDeepLink('http://127.0.0.1:5173/?start=sit&min=5').kind, 'foreign');
    assert.equal(classifyDesktopDeepLink('focustiger://app/?start=sit&min=5').kind, 'foreign');
  });

  it('builds load URLs without leaving the desktop origin in production', () => {
    assert.equal(
      desktopPracticeLoadUrl('product=1&start=sit&min=5', { isDev: true }),
      'http://127.0.0.1:5173/?product=1&start=sit&min=5'
    );
    assert.equal(
      desktopPracticeLoadUrl('?product=1&start=sit&min=5', { isDev: false }),
      'focus-tiger://app/index.html?product=1&start=sit&min=5'
    );
  });
});
