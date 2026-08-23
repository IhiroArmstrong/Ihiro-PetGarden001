/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasRecordedAnyPractice,
  shouldLeadSupportModalWithTea,
  supportModalCardOrder,
  supportModalFunnelLayout,
  supportModalSuggestedHost,
  SUPPORT_MODAL_CARD_ORDER_DEFAULT,
  SUPPORT_MODAL_CARD_ORDER_TEA_FIRST
} from './supportModalLead.js';

describe('supportModalLead', () => {
  it('leads with tea only when both lotus minutes and practice-days are empty', () => {
    assert.equal(shouldLeadSupportModalWithTea({}), true);
    assert.equal(
      shouldLeadSupportModalWithTea({ lifetimeMinutes: 0, practicedDayCount: 0 }),
      true
    );
    assert.equal(hasRecordedAnyPractice({ lifetimeMinutes: 0, practicedDayCount: 0 }), false);
  });

  it('treats lotus minutes, practice-days, Honesty-or-Breath-length minutes as recorded', () => {
    assert.equal(shouldLeadSupportModalWithTea({ lifetimeMinutes: 1 }), false);
    assert.equal(shouldLeadSupportModalWithTea({ practicedDayCount: 1 }), false);
    assert.equal(
      shouldLeadSupportModalWithTea({ lifetimeMinutes: 1, practicedDayCount: 0 }),
      false
    );
    assert.equal(
      shouldLeadSupportModalWithTea({ lifetimeMinutes: 0, practicedDayCount: 2 }),
      false
    );
  });

  it('does not require a long session — any positive minutes count', () => {
    assert.equal(shouldLeadSupportModalWithTea({ lifetimeMinutes: 1 }), false);
  });

  it('locks tea-first vs default card order and Suggested host', () => {
    assert.deepEqual(
      supportModalCardOrder(true),
      SUPPORT_MODAL_CARD_ORDER_TEA_FIRST
    );
    assert.deepEqual(
      supportModalCardOrder(false),
      SUPPORT_MODAL_CARD_ORDER_DEFAULT
    );
    assert.equal(supportModalSuggestedHost(true), 'tea');
    assert.equal(supportModalSuggestedHost(false), 'sanctuary');
    assert.equal(SUPPORT_MODAL_CARD_ORDER_TEA_FIRST[0], 'yin-support-tea-card');
    assert.equal(SUPPORT_MODAL_CARD_ORDER_DEFAULT[0], 'yin-support-sanctuary-card');
  });

  it('maps tea-first lead to funnel layout dimension', () => {
    assert.equal(supportModalFunnelLayout(true), 'tea-first');
    assert.equal(supportModalFunnelLayout(false), 'sanctuary-first');
  });
});
