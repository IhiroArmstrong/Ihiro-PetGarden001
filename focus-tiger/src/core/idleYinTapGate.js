/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle tap on Yin → earWiggleHeadTouch (product-shell 2D hit).
 * Focusing uses Active Recover instead; overlays hide the hit (no silent click).
 */

export const IDLE_YIN_TAP_EMOTION_KEY = 'earWiggleHeadTouch';

/** Baselines that may accept a tap. One-shots (incl. this key) must finish first. */
const IDLE_TAP_READY_EMOTION_KEYS = new Set(['idle', 'smiling']);

/**
 * @param {object} [opts]
 * @param {string} [opts.sessionState]
 * @param {boolean} [opts.focusing]
 * @param {boolean} [opts.overlayBusy]
 * @param {string | null} [opts.emotionKey]
 * @returns {boolean}
 */
export function canPlayIdleYinTap({
  sessionState = '',
  focusing = false,
  overlayBusy = false,
  emotionKey = null
} = {}) {
  if (focusing) return false;
  if (sessionState !== 'IDLE') return false;
  if (overlayBusy) return false;
  if (emotionKey && !IDLE_TAP_READY_EMOTION_KEYS.has(emotionKey)) return false;
  return true;
}

/**
 * Re-arm the Idle tap after every `playEmotion` — including `_finishOneShot`
 * which fires `onComplete` *before* it returns to idle (so a tap's own
 * onComplete still sees `earWiggleHeadTouch` and would leave the hit hidden).
 * @param {{ playEmotion: Function }} emotionController
 * @param {() => void} sync
 */
export function wrapPlayEmotionWithIdleYinTapSync(emotionController, sync) {
  if (!emotionController || typeof emotionController.playEmotion !== 'function') {
    return;
  }
  if (typeof sync !== 'function') return;
  if (emotionController._idleYinTapPlayWrapped) return;
  const raw = emotionController.playEmotion.bind(emotionController);
  emotionController.playEmotion = (emotionKey, options = {}) => {
    const userComplete = options.onComplete;
    const nextOptions =
      typeof userComplete === 'function'
        ? {
            ...options,
            onComplete: (...args) => {
              try {
                userComplete(...args);
              } finally {
                sync();
              }
            }
          }
        : options;
    const result = raw(emotionKey, nextOptions);
    sync();
    return result;
  };
  emotionController._idleYinTapPlayWrapped = true;
}
