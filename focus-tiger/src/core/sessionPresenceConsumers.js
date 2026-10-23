/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T50 Phase 1 — map session-presence labels onto existing end channels.
 * Labels never render. Does not choose next-session duration.
 */

import { SESSION_PRESENCE_LABELS } from './sessionPresenceSummary.js';
import { MOMENT_WHISPER_PLAYABLE } from './momentWhispersGate.js';

/** @typedef {'arrive' | 'focus' | 'recover' | 'transition' | 'reflect'} MomentWhisperKey */

/**
 * @param {string | null | undefined} label
 * @returns {{
 *   whisperKeys: readonly MomentWhisperKey[],
 *   cawPools: readonly ('arrive' | 'transition' | 'recover')[],
 *   lightCompleteBias: 'sessionComplete' | 'mindfulAcknowledge' | null
 * }}
 */
export function selectPresenceEndConsumers(label) {
  if (label === SESSION_PRESENCE_LABELS.DRIFTING) {
    return {
      whisperKeys: Object.freeze(['arrive', 'reflect']),
      cawPools: Object.freeze(['arrive', 'transition']),
      lightCompleteBias: 'sessionComplete'
    };
  }
  if (label === SESSION_PRESENCE_LABELS.STRUGGLING) {
    return {
      whisperKeys: Object.freeze(['recover', 'reflect']),
      cawPools: Object.freeze(['recover']),
      lightCompleteBias: 'mindfulAcknowledge'
    };
  }
  return {
    whisperKeys: Object.freeze(['reflect']),
    cawPools: Object.freeze([]),
    lightCompleteBias: null
  };
}

/**
 * @param {string | null | undefined} label
 * @param {{ isPlayable?: (key: string) => boolean }} [opts]
 * @returns {MomentWhisperKey}
 */
export function pickPresenceWhisperKey(label, opts = {}) {
  const isPlayable =
    typeof opts.isPlayable === 'function'
      ? opts.isPlayable
      : (key) => MOMENT_WHISPER_PLAYABLE.has(/** @type {MomentWhisperKey} */ (key));
  const { whisperKeys } = selectPresenceEndConsumers(label);
  for (const key of whisperKeys) {
    if (isPlayable(key)) return key;
  }
  return 'reflect';
}
