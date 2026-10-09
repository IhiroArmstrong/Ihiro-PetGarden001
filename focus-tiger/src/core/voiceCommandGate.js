/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product gate for Voice Command Routing (Brief B · Slice 1).
 * English UI + Electron macOS wide viewport only.
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
