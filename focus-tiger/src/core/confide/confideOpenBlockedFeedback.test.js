/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
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
});
