/**
 * Daily wisdom pool · English (Yin voice).
 * Small sample set first — expand later; keep `id` stable when editing `text`.
 * Seed meanings: 抓住当下 · 无所住相 · You are not the emotion.
 */

/** @typedef {{ id: string, text: string }} DailyWisdomEntry */

/** @type {readonly DailyWisdomEntry[]} */
export const DAILY_WISDOM_EN = Object.freeze([
  // 抓住当下
  { id: 'catch-this-moment', text: 'Catch this moment.' },
  // 无所住相 — no cling / no attachment; free in the inner mind
  { id: 'cling-to-nothing', text: 'Cling to nothing.' },
  { id: 'not-the-emotion', text: 'You are not the emotion.' },
  { id: 'one-breath-return', text: 'One breath is already a return.' },
  { id: 'watch-without-chase', text: 'Watch the thought; do not chase it.' },
  { id: 'enough-for-now', text: 'This is enough for now.' }
]);
