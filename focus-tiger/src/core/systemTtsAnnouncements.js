/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product System TTS announcements. Gated by the global Voice announcements
 * switch. Confide reply speech stays independent in ConfideToYinUI.
 *
 * Same cue id is spoken once until `resetPracticeAnnouncementCue()` (a new
 * practice) or a different cue id. Breath-phase inhale / exhale TTS is
 * retired (T27); call `maybeSpeakBreathPhaseCue` stays a no-op so UI wiring
 * cannot silently re-speak.
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
 * Practice-in-progress Inhale / Exhale TTS is off (T27). Call sites stay so
 * Arrival / Honesty / Ritual / MicroRitual cannot miss a later restore.
 * Locale keys `HONESTY_BREATH_*` stay for on-screen labels.
 *
 * @param {{
 *   inhale?: boolean,
 *   elapsedMs?: number,
 *   phaseMs?: number,
 *   scope?: string,
 *   widthPx?: number,
 *   storage?: Storage | null,
 *   globalObj?: object
 * }} [_opts]
 * @returns {false}
 */
export function maybeSpeakBreathPhaseCue(_opts = {}) {
  return false;
}
