/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Product System TTS announcements (focus end). Gated by global switch;
 * Confide reply speech stays independent in ConfideToYinUI.
 */

import { t, getLocale } from '../locales/i18n.js';
import {
  canUseSystemTts,
  getSystemTtsBridge,
  mapLocaleToTtsLocale
} from './systemTtsBridge.js';
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
  const bridge = getSystemTtsBridge(globalObj);
  if (!bridge || typeof bridge.speak !== 'function') return false;
  const text = String(t('system_tts.focus_end') || '').trim();
  if (!text) return false;
  void bridge.speak({
    text,
    locale: mapLocaleToTtsLocale(getLocale())
  });
  return true;
}
