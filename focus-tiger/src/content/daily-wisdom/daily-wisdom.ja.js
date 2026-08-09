/**
 * Daily wisdom pool · Japanese (Yin voice).
 * Ids must match `daily-wisdom.en.js`. Seed: 抓住当下 · 无所住相 · You are not the emotion.
 */

/** @typedef {{ id: string, text: string }} DailyWisdomEntry */

/** @type {readonly DailyWisdomEntry[]} */
export const DAILY_WISDOM_JA = Object.freeze([
  // 抓住当下
  { id: 'catch-this-moment', text: 'この瞬間を、つかまえて。' },
  // 无所住相
  { id: 'abide-nowhere', text: 'どこにも住まない。' },
  { id: 'not-the-emotion', text: 'あなたは、その感情そのものではない。' },
  { id: 'one-breath-return', text: 'ひと息は、すでに帰還。' },
  { id: 'watch-without-chase', text: '想いを見守り、追わない。' },
  { id: 'enough-for-now', text: 'いまは、これで足りる。' }
]);
