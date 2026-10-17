/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T10 address latch. Compares the name slot to the raw transcript,
 * before Speak-to-type homophone correction (Ian / Ean / Iain → Yin).
 */

import { isConfideBoundaryIntent } from './confide/confideBoundaryRespect.js';
import { matchesSafetyRedirect } from './confide/confideSafetyKeywords.js';
import { applyVoiceProductLexicon } from './voiceProductLexicon.js';

/** B-tier confirm listen window. Starts only after the recap finishes. */
export const YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS = 10_000;

/** A-tier language undo. Starts when the switch happens. */
export const YIN_VOICE_LANGUAGE_UNDO_MS = 5_000;

export const YIN_VOICE_PUSH_TO_TALK_ACCELERATOR = 'Control+Shift+Y';

export const YIN_VOICE_BACKUP_MISSED_KEY = 'YIN_VOICE_BACKUP_MISSED';

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeYinVoiceUtterance(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ADDRESS_RE =
  /^(?:hi|hey|ok) yin\b\s*(?:please|can you|could you)\b\s*(.*)$/;

/**
 * @param {unknown} rawTranscript
 * @param {{ enabled?: boolean }} [opts]
 */
export function classifyYinVoiceEntry(rawTranscript, { enabled = true } = {}) {
  const raw = String(rawTranscript ?? '');
  const display = applyVoiceProductLexicon(raw);
  if (!enabled) {
    return { channel: 'confide', reason: 'gate_closed', raw, display };
  }
  if (matchesSafetyRedirect(raw) || isConfideBoundaryIntent(raw)) {
    return { channel: 'confide', reason: 'safety_first', raw, display };
  }

  const normalized = normalizeYinVoiceUtterance(raw);
  const address = normalized.match(ADDRESS_RE);
  if (!address) {
    return { channel: 'confide', reason: 'no_address', raw, display };
  }

  const rest = address[1] || '';
  if (/\bforget everything\b/.test(rest) || /\bforget all\b/.test(rest)) {
    return {
      channel: 'command',
      command: 'forget_all',
      tier: 'C',
      execute: false,
      raw,
      display
    };
  }
  if (/\bbackup\b/.test(rest) || /\bback up\b/.test(rest)) {
    return {
      channel: 'command',
      command: 'backup',
      tier: 'B',
      execute: false,
      raw,
      display
    };
  }
  if (/\bjourney log\b/.test(rest)) {
    return {
      channel: 'command',
      command: 'open_journey_log',
      tier: 'A',
      execute: true,
      raw,
      display
    };
  }
  if (/\b(?:switch|change)\b/.test(rest) && /\blanguage\b/.test(rest)) {
    return {
      channel: 'command',
      command: 'switch_language',
      tier: 'A',
      execute: true,
      raw,
      display
    };
  }
  return {
    channel: 'confide',
    reason: 'address_without_command',
    raw,
    display
  };
}

/**
 * Reply inside an already-open confirm window. Not an address latch.
 * @param {unknown} transcript
 * @returns {'yes' | 'no' | 'forget_confirm' | 'empty' | 'unrecognized'}
 */
export function classifyYinVoiceConfirmReply(transcript) {
  const normalized = normalizeYinVoiceUtterance(transcript);
  if (!normalized) return 'empty';
  if (normalized === 'yes forget everything') return 'forget_confirm';
  if (/^(?:yes|ok|okay|please do it|go ahead)$/.test(normalized)) return 'yes';
  if (/^(?:no|cancel|stop|never mind)$/.test(normalized)) return 'no';
  return 'unrecognized';
}

/**
 * @param {number | null | undefined} speechEndedAt
 * @param {number | null | undefined} now
 */
export function backupConfirmWindow(speechEndedAt, now) {
  if (speechEndedAt == null || now == null) {
    return { open: false, timedOut: false };
  }
  const elapsed = now - speechEndedAt;
  if (elapsed < 0) return { open: false, timedOut: false };
  return {
    open: elapsed < YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS,
    timedOut: elapsed >= YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS
  };
}

/**
 * @param {string} current
 * @param {readonly string[]} ids
 * @returns {string | null}
 */
export function nextPickerLocaleId(current, ids) {
  const list = (ids || []).filter(Boolean);
  const index = list.indexOf(current);
  if (list.length < 2 || index < 0) return null;
  return list[(index + 1) % list.length];
}
