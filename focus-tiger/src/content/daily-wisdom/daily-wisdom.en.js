/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Daily wisdom pool · English (Yin voice + classical lines).
 *
 * Curation:
 * - Keep `id` stable when editing `text` / `attribution`.
 * - Optional `attribution` for historical / literary lines; omit for Yin-voice seeds.
 * - Card length: prefer ≤ ~220 chars of `text` (Reflection footer).
 * - Product locales: en + ja only (Chinese sources → translate; no zh product pool).
 * - Tone: observational, non-anxious; no FOMO / hard sell.
 * - Taste-layer freeze (2026-08-18): 14 ids; do not expand/delete this pack
 *   as part of the overlay until freeze lifted. SSOT: PROCESS Backlog 云端品味层.
 * - Copy pass (2026-08-18): keep ids; rewrite opaque koan literals so a
 *   first-time reader can take a breath of meaning (改字另议).
 */

/** @typedef {{ id: string, text: string, attribution?: string }} DailyWisdomEntry */

/** @type {readonly DailyWisdomEntry[]} */
export const DAILY_WISDOM_EN = Object.freeze([
  // —— Yin voice seeds ——
  // 抓住当下
  { id: 'catch-this-moment', text: 'Catch this moment.' },
  // 无所住相 — no cling / no attachment; free in the inner mind
  { id: 'cling-to-nothing', text: 'Cling to nothing.' },
  { id: 'not-the-emotion', text: 'You are not the emotion.' },
  { id: 'one-breath-return', text: 'One breath is already a return.' },
  { id: 'watch-without-chase', text: 'Watch the thought; do not chase it.' },
  { id: 'enough-for-now', text: 'This is enough for now.' },

  // —— Classical / literary (optional attribution) ——
  {
    id: 'asai-floating-world',
    text:
      'Live in this moment—savor the moon, the snow, the cherry blossoms and the maple leaves. Even if poverty stands before you, do not worry. The heart is like a floating gourd; follow the stream. This is the floating world.',
    attribution: 'Asai Ryōi · Tales of the Floating World · 17th c.'
  },
  {
    id: 'dogen-study-self',
    text: 'To study the Way is to study the self. To study the self is to forget the self.',
    attribution: 'Eihei Dōgen · Genjōkōan'
  },
  {
    id: 'zhaozhou-drink-tea',
    text: 'When the next thought asks what to do — drink tea.',
    attribution: 'Zhaozhou Congshen (Jōshū)'
  },
  {
    id: 'sengcan-no-preferences',
    text: 'The Great Way is not difficult for those who have no preferences.',
    attribution: 'Sengcan · Xinxin Ming'
  },
  {
    id: 'huineng-not-a-thing',
    text: 'Nothing here needs to be held onto.',
    attribution: 'Huineng · Platform Sutra'
  },
  {
    id: 'basho-seek-what-they-sought',
    text: 'Do not seek to follow in the footsteps of the wise. Seek what they sought.',
    attribution: 'Matsuo Bashō'
  },
  {
    id: 'bankei-let-thoughts-pass',
    text: 'Do not try to stop thoughts; simply let them come and go.',
    attribution: 'Bankei Yōtaku'
  },
  {
    id: 'linji-just-be',
    text: 'Just be ordinary—nothing special to seek.',
    attribution: 'Linji Yixuan (Rinzai)'
  }
]);
