/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product gate for Voice Command Routing (Brief B · Slice 1).
 * On-screen chrome: English UI + Electron macOS wide viewport.
 * Spoken routing: same desktop mic, any UI language, so an English
 * "switch back to English" still works after the interface leaves English.
 */

import { getLocale } from '../locales/i18n.js';
import { canShowVoiceInputChrome } from './voiceInputBridge.js';

/**
 * @param {{ widthPx?: number, locale?: string, globalObj?: object }} [opts]
 * @returns {boolean}
 */
export function canShowVoiceCommandChrome({
  widthPx = 0,
  locale = getLocale(),
  globalObj = globalThis
} = {}) {
  if (locale !== 'en') return false;
  return canShowVoiceInputChrome({ widthPx, globalObj });
}

/**
 * Whether a push-to-talk transcript may be classified.
 * UI language is not an input: the classifier only matches English speech,
 * and a non-English screen must still hear "switch back to English".
 *
 * @param {{ widthPx?: number, globalObj?: object }} [opts]
 * @returns {boolean}
 */
export function canRouteSpokenYinCommand({
  widthPx = 0,
  globalObj = globalThis
} = {}) {
  return canShowVoiceInputChrome({ widthPx, globalObj });
}
