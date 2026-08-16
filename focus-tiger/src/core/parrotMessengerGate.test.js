/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPlayParrotMessengerOnBannerShow } from './parrotMessengerGate.js';

describe('shouldPlayParrotMessengerOnBannerShow', () => {
  it('plays on first show transition', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: false
      }),
      true
    );
  });

  it('skips when banner already visible (re-sync)', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: true
      }),
      false
    );
  });

  it('skips hide decisions', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'hide',
        bannerWasVisible: false
      }),
      false
    );
  });

  it('skips while cold-start welcome is holding the messenger', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: false,
        holdForWelcome: true
      }),
      false
    );
  });

  it('plays again on a later show after banner was hidden', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: false,
        holdForWelcome: false
      }),
      true
    );
  });
});
