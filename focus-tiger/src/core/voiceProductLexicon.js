/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Closed product names for Speak-to-type.
 * macOS on-device STT has no app vocabulary; `contextualStrings` only boosts
 * likelihood. Homophone replace is a second pass for names that still land as
 * common English words (Yin → Ian).
 *
 * Do not grow this into Confide intent aliases (R-Confide-No-Symptom-List).
 * Swift `request.contextualStrings` must stay in lockstep with CONTEXTUAL_STRINGS.
 */

/** Boosted during recognition. Keep short; Apple caps usefulness past ~100. */
export const VOICE_PRODUCT_CONTEXTUAL_STRINGS = Object.freeze([
  'Yin',
  'Focus Tiger',
  'Confide',
  'Sanctuary',
  'Quiet Together',
  'Focus Circle',
  'Zen Cinema',
  'Honesty',
  'Twinsology'
]);

/**
 * Whole-token homophones → canonical product spelling.
 * Only pairs that are routinely misheard as *another name*, not common words
 * (`in`, `yen`, `inn` stay untouched).
 */
export const VOICE_PRODUCT_HOMOPHONES = Object.freeze({
  ian: 'Yin',
  ean: 'Yin',
  iain: 'Yin'
});

/**
 * @param {string} transcript
 * @returns {string}
 */
export function applyVoiceProductLexicon(transcript) {
  const raw = String(transcript || '');
  if (!raw.trim()) return raw;
  return raw.replace(/\b([A-Za-z]+)\b/g, (token) => {
    const mapped = VOICE_PRODUCT_HOMOPHONES[token.toLowerCase()];
    return mapped || token;
  });
}
