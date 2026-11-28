/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';
import { setPracticeBackupCloudEnabledForTests } from './practiceBackup/practiceBackupCloudEnabled.js';
import { WIDE_MENU_RADIAL_GROUP_KEYS } from './wideMenuRadialLayout.js';

describe('idle account menu · T93 D6', () => {
  it('pins Sign in at the top of the ⋯ list when the cloud gate is on', () => {
    const rows = listSecondaryChromeEntries('wide-more', {
      reminderAvailable: false,
      newsletterSubmitted: true
    });
    const first = rows.find((r) => r.proxy);
    assert.equal(first?.proxy, 'account');
    assert.equal(first?.pinToMenuTop, true);
    assert.equal(first?.interactive, undefined);
    assert.equal(first?.testId, 'idle-account-email-restore');
    assert.equal(first?.handler, 'onAccount');
    assert.equal(first?.labelKey, 'EMAIL_JOURNEY_MENU_SIGN_IN');
    assert.equal(
      rows.filter((r) => r.proxy === 'account').length,
      1
    );
    const prefAccount = rows.find(
      (r) => r.proxy === 'account' && r.kind !== 'action'
    );
    assert.equal(prefAccount, undefined);
  });

  it('shows a masked email when signed in', () => {
    const rows = listSecondaryChromeEntries('wide-more', {
      reminderAvailable: false,
      newsletterSubmitted: true,
      signedInEmail: 'sam@gmail.com'
    });
    const account = rows.find((r) => r.proxy === 'account');
    assert.equal(account?.labelText, 's•••@gmail.com');
  });

  it('hides Sign in when tests force the gate off', () => {
    setPracticeBackupCloudEnabledForTests(false);
    try {
      const rows = listSecondaryChromeEntries('wide-more', {
        reminderAvailable: false,
        newsletterSubmitted: true
      });
      assert.equal(
        rows.some((r) => r.proxy === 'account'),
        false
      );
    } finally {
      setPracticeBackupCloudEnabledForTests(true);
    }
  });

  it('hides Sign in when store cloud UI is off', () => {
    const rows = listSecondaryChromeEntries('wide-more', {
      reminderAvailable: false,
      newsletterSubmitted: true,
      emailJourneyCloudUi: false
    });
    assert.equal(
      rows.some((r) => r.proxy === 'account'),
      false
    );
  });

  it('does not add Sign in to the wide radial five icons', () => {
    assert.equal(WIDE_MENU_RADIAL_GROUP_KEYS.includes('account'), false);
    assert.deepEqual(
      [...WIDE_MENU_RADIAL_GROUP_KEYS],
      [
        'MENU_GROUP_PRACTICE',
        'MENU_GROUP_RECORDS',
        'MENU_GROUP_INSPIRATION',
        'MENU_GROUP_NOT_ALONE',
        'MENU_GROUP_PREFERENCES'
      ]
    );
  });
});
