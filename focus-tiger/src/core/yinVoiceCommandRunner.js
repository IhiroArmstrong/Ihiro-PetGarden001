/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS,
  YIN_VOICE_LANGUAGE_UNDO_MS,
  classifyYinVoiceConfirmReply
} from './yinVoiceCommandEntry.js';
import {
  planBackupAfterListen,
  planForgetAfterListen
} from './yinVoiceOperatingSession.js';

/**
 * @param {object} decision
 * @param {{
 *   show: (userText: string, sayKey: string) => void,
 *   speakAndWait: (sayKey: string) => Promise<boolean>,
 *   listen: (ms: number) => Promise<string>,
 *   writeBackup: () => Promise<void>,
 *   openJourney: () => void,
 *   closeJourney: () => void,
 *   switchLanguage: () => { changed: boolean, undo: () => void }
 * }} deps
 */
export async function runYinVoiceCommand(decision, deps) {
  const userText = decision.display || decision.raw || '';
  if (decision.command === 'backup') {
    deps.show(userText, 'YIN_VOICE_BACKUP_RECAP');
    const speechEnded = await deps.speakAndWait('YIN_VOICE_BACKUP_RECAP');
    const heard = speechEnded
      ? await deps.listen(YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS)
      : '';
    const plan = planBackupAfterListen({
      reply: classifyYinVoiceConfirmReply(heard),
      speechEnded
    });
    if (plan.writeBackup) {
      try {
        await deps.writeBackup();
        deps.show(userText, plan.sayKey);
      } catch {
        deps.show(userText, 'YIN_VOICE_BACKUP_FAILED');
      }
      return;
    }
    if (plan.sayKey) deps.show(userText, plan.sayKey);
    return;
  }

  if (decision.command === 'forget_all') {
    deps.show(userText, 'YIN_VOICE_FORGET_RECAP');
    const speechEnded = await deps.speakAndWait('YIN_VOICE_FORGET_RECAP');
    const heard = speechEnded
      ? await deps.listen(YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS)
      : '';
    const plan = planForgetAfterListen({
      reply: classifyYinVoiceConfirmReply(heard)
    });
    deps.show(userText, plan.sayKey);
    return;
  }

  if (decision.command === 'open_journey_log') {
    deps.openJourney();
    deps.show(userText, 'YIN_VOICE_JOURNEY_OPENED');
    void deps.speakAndWait('YIN_VOICE_JOURNEY_OPENED');
    const heard = await deps.listen(YIN_VOICE_LANGUAGE_UNDO_MS);
    if (classifyYinVoiceConfirmReply(heard) === 'no') {
      deps.closeJourney();
      deps.show(userText, 'YIN_VOICE_CANCELLED');
    }
    return;
  }

  if (decision.command === 'switch_language') {
    const switched = deps.switchLanguage();
    if (!switched?.changed) {
      deps.show(userText, 'YIN_VOICE_LANGUAGE_UNCHANGED');
      void deps.speakAndWait('YIN_VOICE_LANGUAGE_UNCHANGED');
      return;
    }
    deps.show(userText, 'YIN_VOICE_LANGUAGE_SWITCHED');
    void deps.speakAndWait('YIN_VOICE_LANGUAGE_SWITCHED');
    const heard = await deps.listen(YIN_VOICE_LANGUAGE_UNDO_MS);
    if (classifyYinVoiceConfirmReply(heard) === 'no') {
      switched.undo();
      deps.show(userText, 'YIN_VOICE_CANCELLED');
    }
  }
}
