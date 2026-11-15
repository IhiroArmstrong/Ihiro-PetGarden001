/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID,
  CONFIDE_OPEN_BLOCKED_TOAST_TESTID,
  confideOpenBlockedUserMessage
} from './confideOpenBlockedFeedback.js';

describe('confideOpenBlockedFeedback', () => {
  it('exposes a stable toast test id', () => {
    assert.equal(CONFIDE_OPEN_BLOCKED_TOAST_TESTID, 'confide-open-blocked-safety-help');
  });

  it('uses T92 safety-01 helpline copy (zh)', () => {
    const zh = confideOpenBlockedUserMessage('zh');
    assert.match(zh, /请您拨打本地求助热线/);
    assert.match(zh, /当地紧急电话/);
  });

  it('uses T92 safety-01 helpline copy (en)', () => {
    const en = confideOpenBlockedUserMessage('en');
    assert.match(en, /local crisis helpline/i);
  });

  it('entitlement variant does not surface crisis helpline copy (en)', () => {
    const en = confideOpenBlockedUserMessage('en', { variant: 'entitlement' });
    assert.match(en, /not open in this release/i);
    assert.doesNotMatch(en, /crisis helpline/i);
  });

  it('entitlement variant does not surface crisis helpline copy (zh)', () => {
    const zh = confideOpenBlockedUserMessage('zh', { variant: 'entitlement' });
    assert.match(zh, /尚未对客人开放/);
    assert.doesNotMatch(zh, /求助热线/);
  });

  it('exposes entitlement toast test id', () => {
    assert.equal(
      CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID,
      'confide-open-blocked-entitlement'
    );
  });
});