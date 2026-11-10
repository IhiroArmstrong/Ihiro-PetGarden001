/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyPracticeBackupCloudResult,
  isPracticeBackupCloudDisabledError
} from './practiceBackupCloudHttp.js';
import { practiceBackupCloudEnabled } from './practiceBackupCloudEnabled.js';
import { requestPracticeBackupOtp } from './practiceBackupSync.js';

describe('practiceBackupCloudHttp · T93 D2 dual-state', () => {
  it('does not turn the client cloud gate on', () => {
    assert.equal(practiceBackupCloudEnabled, false);
  });

  it('treats 410 practice_backup_disabled as the still-closed Worker', () => {
    const err = Object.assign(new Error('Practice cloud backup is not enabled on this Worker.'), {
      status: 410,
      body: { error: 'practice_backup_disabled', detail: 'Practice cloud backup is not enabled on this Worker.' }
    });
    assert.equal(isPracticeBackupCloudDisabledError(err), true);
    assert.equal(classifyPracticeBackupCloudResult(undefined, err).kind, 'disabled');
  });

  it('treats 200/ok JSON as the allowed Worker', () => {
    const payload = { ok: true };
    assert.equal(isPracticeBackupCloudDisabledError(payload), false);
    assert.equal(classifyPracticeBackupCloudResult(payload, undefined).kind, 'ok');
  });

  it('does not treat other HTTP errors as the backup-disabled gate', () => {
    const err = Object.assign(new Error('HTTP 401'), {
      status: 401,
      body: { error: 'unauthorized' }
    });
    assert.equal(isPracticeBackupCloudDisabledError(err), false);
    assert.equal(classifyPracticeBackupCloudResult(undefined, err).kind, 'error');
  });

  it('requestPracticeBackupOtp keeps 410 as a typed throw and 200 as payload', async () => {
    const ok = await requestPracticeBackupOtp('a@example.com', async () => ({ ok: true }));
    assert.deepEqual(ok, { ok: true });

    const disabled = Object.assign(new Error('disabled'), {
      status: 410,
      body: { error: 'practice_backup_disabled' }
    });
    await assert.rejects(
      () =>
        requestPracticeBackupOtp('a@example.com', async () => {
          throw disabled;
        }),
      (err) => {
        assert.equal(isPracticeBackupCloudDisabledError(err), true);
        assert.equal(/** @type {{ reason?: string }} */ (err).reason, 'practice_backup_disabled');
        return true;
      }
    );
  });
});
