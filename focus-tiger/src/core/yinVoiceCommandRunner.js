/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS,
  YIN_VOICE_BACKUP_MISSED_KEY,
  YIN_VOICE_LANGUAGE_UNDO_MS,
  classifyYinVoiceConfirmReply,
  normalizeYinVoiceListenResult
} from './yinVoiceCommandEntry.js';
import {
  planBackupAfterListen,
  planForgetAfterListen
} from './yinVoiceOperatingSession.js';

/**
 * @param {object} decision
 * @param {{
 *   show: (userText: string, sayKey: string, opts?: { captureDiagnostics?: string }) => void,
 *   speakAndWait: (sayKey: string) => Promise<boolean>,
 *   listen: (ms: number) => Promise<string | { transcript?: string, captureDiagnostics?: string }>,
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
    const heardRaw = speechEnded
      ? await deps.listen(YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS)
      : '';
    const { transcript, captureDiagnostics } = normalizeYinVoiceListenResult(heardRaw);
    const plan = planBackupAfterListen({
      reply: classifyYinVoiceConfirmReply(transcript),
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
    if (plan.sayKey) {
      deps.show(userText, plan.sayKey, {
        captureDiagnostics:
          plan.sayKey === YIN_VOICE_BACKUP_MISSED_KEY ? captureDiagnostics : ''
      });
    }
    return;
  }

  if (decision.command === 'forget_all') {
    deps.show(userText, 'YIN_VOICE_FORGET_RECAP');
    const speechEnded = await deps.speakAndWait('YIN_VOICE_FORGET_RECAP');
    const heardRaw = speechEnded
      ? await deps.listen(YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS)
      : '';
    const { transcript } = normalizeYinVoiceListenResult(heardRaw);
    const plan = planForgetAfterListen({
      reply: classifyYinVoiceConfirmReply(transcript)
    });
    deps.show(userText, plan.sayKey);
    return;
  }

  if (decision.command === 'open_journey_log') {
    deps.openJourney();
    deps.show(userText, 'YIN_VOICE_JOURNEY_OPENED');
    void deps.speakAndWait('YIN_VOICE_JOURNEY_OPENED');
    const { transcript: journeyUndo } = normalizeYinVoiceListenResult(
      await deps.listen(YIN_VOICE_LANGUAGE_UNDO_MS)
    );
    if (classifyYinVoiceConfirmReply(journeyUndo) === 'no') {
      deps.closeJourney();
      deps.show(userText, 'YIN_VOICE_CANCELLED');
    }
    return;
  }

  if (decision.command === 'switch_language') {
    const switched = deps.switchLanguage(decision.targetLocale || null);
    if (!switched?.changed) {
      deps.show(userText, 'YIN_VOICE_LANGUAGE_UNCHANGED');
      void deps.speakAndWait('YIN_VOICE_LANGUAGE_UNCHANGED');
      return;
    }
    deps.show(userText, 'YIN_VOICE_LANGUAGE_SWITCHED');
    void deps.speakAndWait('YIN_VOICE_LANGUAGE_SWITCHED');
    const { transcript: languageUndo } = normalizeYinVoiceListenResult(
      await deps.listen(YIN_VOICE_LANGUAGE_UNDO_MS)
    );
    if (classifyYinVoiceConfirmReply(languageUndo) === 'no') {
      switched.undo();
      deps.show(userText, 'YIN_VOICE_CANCELLED');
    }
  }
}
