/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { YIN_VOICE_BACKUP_MISSED_KEY } from './yinVoiceCommandEntry.js';
import {
  planBackupAfterListen,
  planForgetAfterListen
} from './yinVoiceOperatingSession.js';

describe('T10 backup confirm effects', () => {
  it('does not write before the recap has finished', () => {
    const plan = planBackupAfterListen({ reply: 'yes', speechEnded: false });
    assert.equal(plan.writeBackup, false);
    assert.equal(plan.reason, 'window_not_open');
  });

  it('writes only after a clear Yes', () => {
    const plan = planBackupAfterListen({ reply: 'yes', speechEnded: true });
    assert.equal(plan.writeBackup, true);
  });

  it('says the missed line on timeout and does not write', () => {
    const plan = planBackupAfterListen({ reply: 'empty', speechEnded: true });
    assert.equal(plan.writeBackup, false);
    assert.equal(plan.reason, 'timeout');
    assert.equal(plan.sayKey, YIN_VOICE_BACKUP_MISSED_KEY);
  });

  it('uses the same missed line when the reply is unclear', () => {
    const plan = planBackupAfterListen({
      reply: 'unrecognized',
      speechEnded: true
    });
    assert.equal(plan.writeBackup, false);
    assert.equal(plan.sayKey, YIN_VOICE_BACKUP_MISSED_KEY);
  });

  it('does not wipe on the forget confirmation sentence', () => {
    assert.equal(planForgetAfterListen({ reply: 'forget_confirm' }).wipe, false);
    assert.equal(planForgetAfterListen({ reply: 'yes' }).wipe, false);
    assert.equal(planForgetAfterListen({ reply: 'empty' }).wipe, false);
  });
});
