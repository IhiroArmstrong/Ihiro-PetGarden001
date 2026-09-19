/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L3 observe quality gate: shuffle-match set (scheme B).
 * Human protocol lives in task-l3-observe-prompt-redesign.md §12.
 * This module is fixtures + scoring only — it does not call the model.
 */

export const L3_OBSERVE_SHUFFLE_MIN_N = 12;

export const L3_OBSERVE_SHUFFLE_PASS_HITS = 8;

/** Replies from 2026-09-19 / 2026-09-20 field QA — interchangeable cub theater. */
export const L3_GENERIC_CUB_THEATER_FAILS = [
  'The cub shifts its weight slightly.',
  'The cub stretches a paw out onto the floor.',
  'The cub blinks slowly.',
  'The cub nudges its nose toward a patch of moss.',
  'My ears twitch slightly at the sound of your words.',
  'My tail gives a small, restless flick.',
  'My paws shift a little on the ground.',
  '耳朵一抖。',
  '尾巴一甩。',
  '爪子搁地。'
];

export const L3_OBSERVE_SHUFFLE_FIXTURES = [
  { id: 'e-irritation', bucket: 'emotion', text: '有点烦' },
  { id: 'e-sleepless', bucket: 'emotion', text: '睡不着' },
  { id: 'e-mind-away', bucket: 'emotion', text: "I'm here, but my mind really isn't." },
  { id: 'e-putting-off', bucket: 'emotion', text: 'I keep putting off things I know I should do.' },
  { id: 'e-motions', bucket: 'emotion', text: "I feel like I'm just going through the motions today." },
  { id: 'q-what-doing', bucket: 'ask-yin', text: '你想干啥？' },
  { id: 'q-what-eat', bucket: 'ask-yin', text: '你想吃啥？' },
  { id: 'q-whom-like', bucket: 'ask-yin', text: 'Whom do you like?' },
  { id: 'h-phone', bucket: 'habit', text: 'I keep reaching for my phone without even thinking about it.' },
  { id: 'h-morning', bucket: 'habit', text: 'I was doing pretty well until this morning.' },
  { id: 'h-different', bucket: 'habit', text: "Today felt different, and I can't explain why." },
  { id: 'q-pangfen', bucket: 'ask-yin', text: '谁喜欢吃胖粉？' }
];

/**
 * @param {Array<{ expectedId?: string, guessedId?: string }>} pairs
 * @returns {{ n: number, hits: number, pass: boolean }}
 */
export function scoreL3ObserveShuffleMatches(pairs = []) {
  const rows = Array.isArray(pairs) ? pairs : [];
  const n = rows.length;
  const hits = rows.filter((row) => row && row.expectedId === row.guessedId).length;
  return {
    n,
    hits,
    pass: n >= L3_OBSERVE_SHUFFLE_MIN_N && hits >= L3_OBSERVE_SHUFFLE_PASS_HITS
  };
}
