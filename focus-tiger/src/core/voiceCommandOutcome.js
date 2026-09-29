/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Map STT transcript → voice-command outcome (Brief B · Slice 1).
 */

import { parseVoiceCommandDuration, VOICE_DURATION_MODES } from './voiceCommandDuration.js';

/** Brief B · Slice 2 — tap-to-answer chips when voice omits duration. */
export const VOICE_COMMAND_ASK_DURATION_MINUTES = Object.freeze([25, 50]);

/**
 * @typedef {'start_fixed' | 'start_open' | 'ask_duration' | 'refuse' | 'unsupported' | 'empty'} VoiceCommandOutcomeKind
 * @typedef {{
 *   kind: VoiceCommandOutcomeKind,
 *   minutes?: number,
 *   reason?: string,
 *   transcript?: string
 * }} VoiceCommandOutcome
 */

/**
 * @param {unknown} transcript
 * @param {{ showOpenEnded?: boolean }} [opts]
 * @returns {VoiceCommandOutcome}
 */
export function resolveVoiceCommandOutcome(transcript, { showOpenEnded = true } = {}) {
  const text = String(transcript || '').trim();
  if (!text) return { kind: 'empty' };

  const parsed = parseVoiceCommandDuration(text);
  if (parsed.action === 'start' && parsed.durationMode === VOICE_DURATION_MODES.open) {
    if (!showOpenEnded) {
      return { kind: 'refuse', reason: 'open_unavailable', transcript: text };
    }
    return { kind: 'start_open', transcript: text };
  }
  if (parsed.action === 'start' && typeof parsed.minutes === 'number') {
    return { kind: 'start_fixed', minutes: parsed.minutes, transcript: text };
  }
  if (parsed.action === 'ask_duration') {
    return { kind: 'ask_duration', transcript: text };
  }
  if (parsed.action === 'unsupported') {
    return { kind: 'unsupported', reason: parsed.reason || 'unsupported', transcript: text };
  }
  return { kind: 'refuse', reason: parsed.reason || 'unknown', transcript: text };
}

/**
 * @param {VoiceCommandOutcome} outcome
 * @returns {string}
 */
export function voiceCommandOutcomeLocaleKey(outcome) {
  switch (outcome.kind) {
    case 'ask_duration':
      return 'VOICE_COMMAND_ASK_DURATION';
    case 'unsupported':
      return outcome.reason === 'stop_not_in_v1'
        ? 'VOICE_COMMAND_REFUSE_STOP'
        : 'VOICE_COMMAND_REFUSE_UNSUPPORTED';
    case 'refuse':
      if (outcome.reason === 'over_cap') return 'VOICE_COMMAND_REFUSE_OVER_CAP';
      if (outcome.reason === 'ambiguous') return 'VOICE_COMMAND_REFUSE_AMBIGUOUS';
      if (outcome.reason === 'open_unavailable') return 'VOICE_COMMAND_REFUSE_OPEN_UNAVAILABLE';
      return 'VOICE_COMMAND_REFUSE_UNKNOWN';
    case 'empty':
      return 'VOICE_INPUT_ERROR_NO_SPEECH';
    default:
      return 'VOICE_COMMAND_REFUSE_UNKNOWN';
  }
}
