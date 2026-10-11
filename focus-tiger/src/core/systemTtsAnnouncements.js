/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product System TTS announcements. Gated by the global Voice announcements
 * switch. Confide reply speech stays independent in ConfideToYinUI.
 *
 * Same cue id is spoken once until `resetPracticeAnnouncementCue()` (a new
 * practice) or a different cue id. Breath phases include the cycle index so
 * each inhale / exhale is heard again.
 */

import { t, getLocale } from '../locales/i18n.js';
import { canUseSystemTts, mapLocaleToTtsLocale, speakSystemTts } from './systemTtsBridge.js';
import { isSystemTtsAnnouncementsEnabled } from './systemTtsPreference.js';

/** @type {string} */
let lastCueId = '';

/** Drop the last cue so the next practice can say the same line again. */
export function resetPracticeAnnouncementCue() {
  lastCueId = '';
}

/**
 * @param {{
 *   text?: string,
 *   cueId?: string,
 *   widthPx?: number,
 *   storage?: Storage | null,
 *   globalObj?: object
 * }} [opts]
 * @returns {boolean} true when a speak request was dispatched
 */
export function maybeSpeakPracticeAnnouncement({
  text,
  cueId,
  widthPx = typeof window !== 'undefined' ? window.innerWidth : 0,
  storage = typeof localStorage !== 'undefined' ? localStorage : null,
  globalObj = globalThis
} = {}) {
  const body = String(text || '').trim();
  if (!body) return false;
  const id = String(cueId || body);
  if (id === lastCueId) return false;
  if (!isSystemTtsAnnouncementsEnabled(storage)) return false;
  if (!canUseSystemTts({ widthPx, globalObj })) return false;
  lastCueId = id;
  return speakSystemTts({
    text: body,
    locale: mapLocaleToTtsLocale(getLocale()),
    globalObj
  });
}

/**
 * @param {{
 *   widthPx?: number,
 *   storage?: Storage | null,
 *   globalObj?: object
 * }} [opts]
 * @returns {boolean} true when a speak request was dispatched
 */
export function maybeSpeakFocusEndAnnouncement(opts = {}) {
  return maybeSpeakPracticeAnnouncement({
    ...opts,
    text: t('system_tts.focus_end'),
    cueId: `focus-end:${Date.now()}`
  });
}

/**
 * Speak Inhale / Exhale once per cycle. `scope` keeps two practices apart.
 *
 * @param {{
 *   inhale?: boolean,
 *   elapsedMs?: number,
 *   phaseMs?: number,
 *   scope?: string,
 *   widthPx?: number,
 *   storage?: Storage | null,
 *   globalObj?: object
 * }} [opts]
 * @returns {boolean}
 */
export function maybeSpeakBreathPhaseCue({
  inhale = true,
  elapsedMs = 0,
  phaseMs = 2500,
  scope = 'breath',
  widthPx,
  storage,
  globalObj
} = {}) {
  const phase = Math.max(1, Number(phaseMs) || 2500);
  const cycle = Math.floor(Math.max(0, Number(elapsedMs) || 0) / phase);
  const key = inhale ? 'HONESTY_BREATH_INHALE' : 'HONESTY_BREATH_EXHALE';
  return maybeSpeakPracticeAnnouncement({
    text: t(key),
    cueId: `${scope}:${key}:${cycle}`,
    widthPx,
    storage,
    globalObj
  });
}
