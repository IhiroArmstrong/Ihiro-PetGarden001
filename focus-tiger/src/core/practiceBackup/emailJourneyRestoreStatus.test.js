/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  emailJourneyStatusKeyForError,
  isEmailJourneyAddressValid,
  isEmailJourneyCloudUiAllowedForChannel
} from './emailJourneyRestoreStatus.js';
import { practiceBackupCloudEnabled } from './practiceBackupCloudEnabled.js';

describe('emailJourneyRestoreStatus · T93 D3', () => {
  it('keeps the direct-channel client cloud gate on', () => {
    assert.equal(practiceBackupCloudEnabled, true);
  });

  it('rejects empty or malformed email before send', () => {
    assert.equal(isEmailJourneyAddressValid(''), false);
    assert.equal(isEmailJourneyAddressValid('not-an-email'), false);
    assert.equal(isEmailJourneyAddressValid('a@example.com'), true);
  });

  it('maps Worker 410 to the unavailable copy key', () => {
    const err = Object.assign(new Error('disabled'), {
      status: 410,
      body: { error: 'practice_backup_disabled' }
    });
    assert.equal(
      emailJourneyStatusKeyForError(err),
      'EMAIL_JOURNEY_STATUS_UNAVAILABLE'
    );
  });

  it('maps other failures to retry/network, not silent', () => {
    assert.equal(
      emailJourneyStatusKeyForError(new Error('offline')),
      'EMAIL_JOURNEY_STATUS_NETWORK'
    );
  });

  it('keeps Setapp and MAS off the cloud login UI', () => {
    assert.equal(isEmailJourneyCloudUiAllowedForChannel('direct'), true);
    assert.equal(isEmailJourneyCloudUiAllowedForChannel('setapp'), false);
    assert.equal(isEmailJourneyCloudUiAllowedForChannel('mas'), false);
  });
});
