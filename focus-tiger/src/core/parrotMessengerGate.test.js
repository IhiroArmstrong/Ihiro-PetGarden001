import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPlayParrotMessengerOnBannerShow } from './parrotMessengerGate.js';

describe('shouldPlayParrotMessengerOnBannerShow', () => {
  it('plays on first show transition', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: false,
        alreadyPlayedThisPageSession: false
      }),
      true
    );
  });

  it('skips when banner already visible (re-sync)', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: true,
        alreadyPlayedThisPageSession: false
      }),
      false
    );
  });

  it('skips hide decisions', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'hide',
        bannerWasVisible: false,
        alreadyPlayedThisPageSession: false
      }),
      false
    );
  });

  it('skips after already played this page session', () => {
    assert.equal(
      shouldPlayParrotMessengerOnBannerShow({
        action: 'show',
        bannerWasVisible: false,
        alreadyPlayedThisPageSession: true
      }),
      false
    );
  });
});
