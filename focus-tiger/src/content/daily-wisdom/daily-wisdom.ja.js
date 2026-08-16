/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Daily wisdom pool · Japanese (Yin voice + classical lines).
 * Ids must match `daily-wisdom.en.js`. Optional `attribution` when present in EN.
 */

/** @typedef {{ id: string, text: string, attribution?: string }} DailyWisdomEntry */

/** @type {readonly DailyWisdomEntry[]} */
export const DAILY_WISDOM_JA = Object.freeze([
  // —— Yin voice seeds ——
  // 抓住当下
  { id: 'catch-this-moment', text: 'この瞬間を、つかまえて。' },
  // 无所住相 — no cling / no attachment; free in the inner mind
  { id: 'cling-to-nothing', text: '何にも執着しない。' },
  { id: 'not-the-emotion', text: 'あなたは、その感情そのものではない。' },
  { id: 'one-breath-return', text: 'ひと息は、すでに帰還。' },
  { id: 'watch-without-chase', text: '想いを見守り、追わない。' },
  { id: 'enough-for-now', text: 'いまは、これで足りる。' },

  // —— Classical / literary ——
  {
    id: 'asai-floating-world',
    text:
      'いまを生き、月・雪・桜・紅葉を心から味わう。目前に貧窮があっても、それを憂えない。心は瓢のように流れに沿い、浮世を渡る——これが浮世である。',
    attribution: '浅井了意『浮世物語』・17世紀'
  },
  {
    id: 'dogen-study-self',
    text: '仏道をならうといふは、自己をならふなり。自己をならふといふは、自己をわするるなり。',
    attribution: '道元『現成公案』'
  },
  {
    id: 'zhaozhou-drink-tea',
    text: '喫茶去。',
    attribution: '趙州従諗'
  },
  {
    id: 'sengcan-no-preferences',
    text: '至道無難、唯嫌揀擇。',
    attribution: '僧璨『信心銘』'
  },
  {
    id: 'huineng-not-a-thing',
    text: '本来無一物。',
    attribution: '慧能『六祖壇経』'
  },
  {
    id: 'basho-seek-what-they-sought',
    text: '古人の跡を求めず、古人の求めたるところを求めよ。',
    attribution: '松尾芭蕉'
  },
  {
    id: 'bankei-let-thoughts-pass',
    text: '思いを止めようとせず、ただ来ては去るにまかせよ。',
    attribution: '盤珪永琢'
  },
  {
    id: 'linji-just-be',
    text: 'ただ平常であれ——求める特別などない。',
    attribution: '臨済義玄'
  }
]);
