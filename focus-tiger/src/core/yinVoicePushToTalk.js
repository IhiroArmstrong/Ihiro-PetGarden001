/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { resolveVoiceCommandOutcome } from './voiceCommandOutcome.js';
import {
  YIN_VOICE_PUSH_TO_TALK_ACCELERATOR,
  classifyYinVoiceEntry
} from './yinVoiceCommandEntry.js';

export { YIN_VOICE_PUSH_TO_TALK_ACCELERATOR };

/**
 * Electron's global shortcut fires on press, not on key-up.
 * Press starts listening. The next press stops and submits.
 *
 * @param {'idle' | 'listening'} phase
 * @returns {'listening' | 'submit'}
 */
export function nextPushToTalkPhase(phase) {
  return phase === 'listening' ? 'submit' : 'listening';
}

/**
 * @param {{
 *   focusing?: boolean,
 *   rawTranscript?: unknown,
 *   enabled?: boolean
 * }} input
 */
export function routePushToTalkTranscript({
  focusing = false,
  rawTranscript = '',
  enabled = true
} = {}) {
  if (focusing) {
    const outcome = resolveVoiceCommandOutcome(rawTranscript, {
      focusing: true,
      showOpenEnded: false
    });
    if (outcome.kind === 'end_focus') {
      return { channel: 'end_focus', outcome };
    }
    return { channel: 'focus_hold', outcome };
  }
  return classifyYinVoiceEntry(rawTranscript, { enabled });
}

/**
 * @param {{
 *   start: () => Promise<unknown>,
 *   stop: () => Promise<{ transcript?: string } | null | undefined>,
 *   onTranscript: (raw: string) => void
 * }} deps
 */
export function createPushToTalkToggle({ start, stop, onTranscript }) {
  let phase = /** @type {'idle' | 'listening'} */ ('idle');
  return async function toggle() {
    const next = nextPushToTalkPhase(phase);
    if (next === 'listening') {
      phase = 'listening';
      await start();
      return;
    }
    phase = 'idle';
    const result = await stop();
    const raw = String(result?.transcript || '').trim();
    if (raw) onTranscript(raw);
  };
}
