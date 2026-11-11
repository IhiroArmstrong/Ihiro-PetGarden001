/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRACTICE_DEEP_LINK_BREATH_MINUTES,
  PRACTICE_DEEP_LINK_SIT_MINUTES,
  parsePracticeDeepLink,
  parsePracticeDeepLinkUnlessCheckout
} from './practiceDeepLinkParse.js';

describe('parsePracticeDeepLink', () => {
  it('accepts sit with whitelist minutes (case-insensitive start)', () => {
    assert.deepEqual(
      parsePracticeDeepLink('?product=1&start=SIT&min=5'),
      { start: 'sit', minutes: 5 }
    );
    for (const minutes of PRACTICE_DEEP_LINK_SIT_MINUTES) {
      assert.deepEqual(parsePracticeDeepLink(`start=sit&min=${minutes}`), {
        start: 'sit',
        minutes
      });
    }
  });

  it('accepts micro with the same minute table as sit', () => {
    assert.deepEqual(parsePracticeDeepLink('?start=micro&min=3'), {
      start: 'micro',
      minutes: 3
    });
  });

  it('accepts breath only when min=1', () => {
    assert.deepEqual(parsePracticeDeepLink('?start=breath&min=1'), {
      start: 'breath',
      minutes: 1
    });
    assert.equal(parsePracticeDeepLink('?start=breath&min=5'), null);
    assert.deepEqual(PRACTICE_DEEP_LINK_BREATH_MINUTES, [1]);
  });

  it('discards unknown start, bad min, or partial params (whole link)', () => {
    assert.equal(parsePracticeDeepLink('?start=hack&min=5'), null);
    assert.equal(parsePracticeDeepLink('?start=sit&min=7'), null);
    assert.equal(parsePracticeDeepLink('?start=sit&min=5.0'), null);
    assert.equal(parsePracticeDeepLink('?start=sit'), null);
    assert.equal(parsePracticeDeepLink('?min=5'), null);
    assert.equal(parsePracticeDeepLink(''), null);
    assert.equal(parsePracticeDeepLink('?start=templateId&min=5'), null);
  });

  it('ignores extra query keys (product, confide, etc.)', () => {
    assert.deepEqual(
      parsePracticeDeepLink(
        '?product=1&confide=1&start=sit&min=10&entitlementMock=pro'
      ),
      { start: 'sit', minutes: 10 }
    );
  });
});

describe('parsePracticeDeepLinkUnlessCheckout', () => {
  it('returns null when checkout session params are present', () => {
    const search =
      '?product=1&pro_session=cs_test_abc&start=sit&min=5';
    assert.deepEqual(parsePracticeDeepLink(search), {
      start: 'sit',
      minutes: 5
    });
    assert.equal(parsePracticeDeepLinkUnlessCheckout(search), null);
    assert.equal(
      parsePracticeDeepLinkUnlessCheckout(
        '?product=1&art_session=cs_test_art&start=sit&min=5'
      ),
      null
    );
  });

  it('still parses practice when only product=1 is present', () => {
    assert.deepEqual(
      parsePracticeDeepLinkUnlessCheckout('?product=1&start=sit&min=5'),
      { start: 'sit', minutes: 5 }
    );
  });
});
