/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';
import { setPracticeBackupCloudEnabledForTests } from './practiceBackup/practiceBackupCloudEnabled.js';

describe('idle account menu · T93 D3', () => {
  it('keeps the Preferences email row non-interactive on the first-invite gate', () => {
    const rows = listSecondaryChromeEntries('wide-more', {
      reminderAvailable: false,
      newsletterSubmitted: true
    });
    const account = rows.find((r) => r.proxy === 'account');
    assert.equal(account?.interactive, false);
    assert.notEqual(account?.testId, 'idle-account-email-restore');
  });

  it('makes the Preferences email row clickable when the gate is on', () => {
    setPracticeBackupCloudEnabledForTests(true);
    try {
      const rows = listSecondaryChromeEntries('wide-more', {
        reminderAvailable: false,
        newsletterSubmitted: true
      });
      const account = rows.find((r) => r.proxy === 'account');
      assert.equal(account?.interactive, undefined);
      assert.equal(account?.testId, 'idle-account-email-restore');
      assert.equal(account?.handler, 'onAccount');
      assert.equal(account?.labelKey, 'EMAIL_JOURNEY_MENU_LABEL');
    } finally {
      setPracticeBackupCloudEnabledForTests(false);
    }
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
