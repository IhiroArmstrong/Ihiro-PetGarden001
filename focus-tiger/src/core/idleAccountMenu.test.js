/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';

describe('idle account menu · T93 D3', () => {
  it('makes the Preferences email row clickable with a restore test id', () => {
    const rows = listSecondaryChromeEntries('wide-more', {
      reminderAvailable: false,
      newsletterSubmitted: true
    });
    const account = rows.find((r) => r.proxy === 'account');
    assert.equal(account?.interactive, undefined);
    assert.equal(account?.testId, 'idle-account-email-restore');
    assert.equal(account?.handler, 'onAccount');
    assert.equal(account?.labelKey, 'EMAIL_JOURNEY_MENU_LABEL');
  });

  it('keeps the row grey when store cloud UI is off', () => {
    const rows = listSecondaryChromeEntries('wide-more', {
      reminderAvailable: false,
      newsletterSubmitted: true,
      emailJourneyCloudUi: false
    });
    const account = rows.find((r) => r.proxy === 'account');
    assert.equal(account?.interactive, false);
  });
});
