/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * On-demand wave from Yin's Collections (`playEmotion` / panel Play).
 * The 清供-8 drawer does not list `gesture.wave-hello`.
 * Play does not require bonding that unlistable SKU.
 * Does not re-enable welcomeBack / cold-start / 10-minute idle wave.
 */

export const COLLECTIONS_WAVE_HELLO_SKU = 'gesture.wave-hello';
export const COLLECTIONS_WAVE_HELLO_EMOTION_KEY = 'collectionsWaveHello';
export const COLLECTIONS_WAVE_HELLO_SEQUENCE = 'waveHello';

/** Baselines that may accept Collections playback. */
const READY_EMOTION_KEYS = new Set(['idle', 'smiling']);

/**
 * @param {string[] | null | undefined} ownedIds
 * @returns {boolean}
 */
export function ownsCollectionsWaveHello(ownedIds) {
  return Array.isArray(ownedIds) && ownedIds.includes(COLLECTIONS_WAVE_HELLO_SKU);
}

/**
 * @param {object} [opts]
 * @param {string} [opts.sessionState]
 * @param {boolean} [opts.focusing]
 * @param {string | null} [opts.emotionKey]
 * @returns {{ ok: boolean, reason?: string }}
 */
export function evaluateCollectionsWaveHelloPlay({
  sessionState = '',
  focusing = false,
  emotionKey = null
} = {}) {
  if (focusing) {
    return { ok: false, reason: 'busy' };
  }
  if (sessionState && sessionState !== 'IDLE') {
    return { ok: false, reason: 'busy' };
  }
  const key = typeof emotionKey === 'string' && emotionKey ? emotionKey : 'idle';
  if (!READY_EMOTION_KEYS.has(key)) {
    return { ok: false, reason: 'busy' };
  }
  return { ok: true };
}

/**
 * @param {Parameters<typeof evaluateCollectionsWaveHelloPlay>[0]} [opts]
 * @returns {boolean}
 */
export function canPlayCollectionsWaveHello(opts = {}) {
  return evaluateCollectionsWaveHelloPlay(opts).ok === true;
}
