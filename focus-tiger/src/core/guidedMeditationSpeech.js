/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Dedicated speak channel for script-guided meditation.
 * Independent of practice-announcement cue *dedupe*, but must honor the
 * Voice announcements / 朗读练习引导 master switch (audio consumer census).
 */

import {
  canUseSystemTts,
  speakSystemTts,
  stopSystemTts
} from './systemTtsBridge.js';
import { isSystemTtsAnnouncementsEnabled } from './systemTtsPreference.js';

export const GUIDED_MEDITATION_SPEECH_RATE = 0.75;

/**
 * @param {{ widthPx?: number, globalObj?: object }} [opts]
 * @returns {boolean}
 */
export function canSpeakGuidedMeditation(opts = {}) {
  return canUseSystemTts({
    widthPx: opts.widthPx,
    globalObj: opts.globalObj
  });
}

/**
 * @param {{
 *   text?: string,
 *   locale?: string,
 *   globalObj?: object,
 *   onFinished?: () => void,
 *   widthPx?: number,
 *   storage?: Storage | null
 * }} payload
 * @returns {boolean} true when a speak was dispatched
 */
export function speakGuidedMeditationSentence(payload = {}) {
  if (!canSpeakGuidedMeditation(payload)) return false;
  if (!isSystemTtsAnnouncementsEnabled(payload.storage)) return false;
  const body = String(payload.text || '').trim();
  if (!body) return false;
  return speakSystemTts({
    text: body,
    locale: payload.locale || 'en',
    globalObj: payload.globalObj,
    onFinished: payload.onFinished,
    rate: GUIDED_MEDITATION_SPEECH_RATE
  });
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function stopGuidedMeditationSpeech(globalObj = globalThis) {
  return stopSystemTts(globalObj);
}
