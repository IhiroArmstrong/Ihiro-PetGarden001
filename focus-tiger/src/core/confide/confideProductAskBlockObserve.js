/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CR-52 live observation: counts only, never stores the utterance.
 */

const counts = {
  emotion_demote: 0,
  life_or_mood_override: 0
};

/**
 * @param {'emotion_demote' | 'life_or_mood_override'} kind
 */
export function observeConfideProductAskBlock(kind) {
  if (kind !== 'emotion_demote' && kind !== 'life_or_mood_override') return;
  counts[kind] += 1;
}

/**
 * @returns {{ emotion_demote: number, life_or_mood_override: number }}
 */
export function readConfideProductAskBlockObservation() {
  return { emotion_demote: counts.emotion_demote, life_or_mood_override: counts.life_or_mood_override };
}

export function resetConfideProductAskBlockObservation() {
  counts.emotion_demote = 0;
  counts.life_or_mood_override = 0;
}
