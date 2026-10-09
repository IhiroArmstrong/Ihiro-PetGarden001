/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product System TTS announcements (focus end). Gated by global switch;
 * Confide reply speech stays independent in ConfideToYinUI.
 */

import { t, getLocale } from '../locales/i18n.js';
import { canUseSystemTts, mapLocaleToTtsLocale, speakSystemTts } from './systemTtsBridge.js';
import { isSystemTtsAnnouncementsEnabled } from './systemTtsPreference.js';

/**
 * @param {{
 *   widthPx?: number,
 *   storage?: Storage | null,
 *   globalObj?: object
 * }} [opts]
 * @returns {boolean} true when a speak request was dispatched
 */
export function maybeSpeakFocusEndAnnouncement({
  widthPx = typeof window !== 'undefined' ? window.innerWidth : 0,
  storage = typeof localStorage !== 'undefined' ? localStorage : null,
  globalObj = globalThis
} = {}) {
  if (!isSystemTtsAnnouncementsEnabled(storage)) return false;
  if (!canUseSystemTts({ widthPx, globalObj })) return false;
  return speakSystemTts({
    text: t('system_tts.focus_end'),
    locale: mapLocaleToTtsLocale(getLocale()),
    globalObj
  });
}
