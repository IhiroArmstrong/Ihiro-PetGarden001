/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PAYMENT_THANKS_EMOTIONS,
  emotionKeyForPaymentThanks,
  peekCheckoutReturnThanksKind,
  resolveCheckoutReturnWelcomeGate
} from './paymentCheckoutThanks.js';

describe('paymentCheckoutThanks', () => {
  it('maps three SKUs to the locked thank-you emotions', () => {
    assert.equal(emotionKeyForPaymentThanks('tip'), 'teaDrinking');
    assert.equal(emotionKeyForPaymentThanks('sanctuary'), 'mindfulAcknowledge');
    assert.equal(emotionKeyForPaymentThanks('membership'), 'sessionComplete');
    assert.equal(PAYMENT_THANKS_EMOTIONS.tip, 'teaDrinking');
  });

  it('peeks tip / sanctuary / membership return queries', () => {
    assert.equal(
      peekCheckoutReturnThanksKind('?product=1&tip=1'),
      'tip'
    );
    assert.equal(
      peekCheckoutReturnThanksKind('?product=1&tea=success'),
      'tip'
    );
    assert.equal(
      peekCheckoutReturnThanksKind(
        '?product=1&sanctuary_session=cs_test_abc'
      ),
      'sanctuary'
    );
    assert.equal(
      peekCheckoutReturnThanksKind(
        '?product=1&membership_session=cs_test_xyz'
      ),
      'membership'
    );
    assert.equal(peekCheckoutReturnThanksKind('?product=1'), null);
    assert.equal(
      peekCheckoutReturnThanksKind('?sanctuary=cancel'),
      null
    );
  });

  it('tip plays at welcome slot; sanctuary/membership only skip welcome', () => {
    assert.deepEqual(resolveCheckoutReturnWelcomeGate('tip'), {
      skipWelcome: true,
      playAtWelcomeSlot: 'teaDrinking'
    });
    assert.deepEqual(resolveCheckoutReturnWelcomeGate('sanctuary'), {
      skipWelcome: true,
      playAtWelcomeSlot: null
    });
    assert.deepEqual(resolveCheckoutReturnWelcomeGate('membership'), {
      skipWelcome: true,
      playAtWelcomeSlot: null
    });
    assert.deepEqual(resolveCheckoutReturnWelcomeGate(null), {
      skipWelcome: false,
      playAtWelcomeSlot: null
    });
  });
});
