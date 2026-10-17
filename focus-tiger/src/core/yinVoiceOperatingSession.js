/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { YIN_VOICE_BACKUP_MISSED_KEY } from './yinVoiceCommandEntry.js';

/**
 * What the backup confirm may do after the listen window.
 * Timeout and an unclear reply both cancel, and both must be spoken.
 *
 * @param {{ reply: string, speechEnded: boolean }} input
 */
export function planBackupAfterListen({ reply, speechEnded }) {
  if (!speechEnded) {
    return { writeBackup: false, sayKey: null, reason: 'window_not_open' };
  }
  if (reply === 'yes') {
    return { writeBackup: true, sayKey: 'YIN_VOICE_BACKUP_DONE', reason: 'yes' };
  }
  if (reply === 'no') {
    return { writeBackup: false, sayKey: 'YIN_VOICE_CANCELLED', reason: 'cancel' };
  }
  return {
    writeBackup: false,
    sayKey: YIN_VOICE_BACKUP_MISSED_KEY,
    reason: reply === 'empty' ? 'timeout' : 'unclear'
  };
}

/**
 * C-tier forget confirmation never deletes in this knife.
 *
 * @param {{ reply: string }} input
 */
export function planForgetAfterListen({ reply }) {
  return {
    wipe: false,
    sayKey:
      reply === 'forget_confirm'
        ? 'YIN_VOICE_FORGET_HEARD_NOT_ERASED'
        : 'YIN_VOICE_FORGET_NOT_ERASED'
  };
}
