/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen Confide meta-query acceptance set (PO 2026-09-19).
 * ~30 utterances covering memory / duration / reflection routing buckets.
 * Passing this list = round acceptance for regex + honesty gates (not L3 quality).
 * Do not swap sentences across runs — compare like with like.
 *
 * Buckets:
 * - memory_list: regex hits CI-03 list (0–1s, no L0 classify)
 * - reflective_honesty: tier-3 open ask, no ledger (#822)
 * - practice_facts: CI practice duration regex
 * - hybrid_classify: regex miss but must still run L0 classify
 * - companion_greeting: tier-4 small talk
 * - generate_skip_classify: obvious chitchat; #861 skip L0 classify
 */

/** @typedef {'memory_list' | 'reflective_honesty' | 'practice_facts' | 'hybrid_classify' | 'companion_greeting' | 'generate_skip_classify'} ConfideMetaQueryBucket */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   text: string,
 *   bucket: ConfideMetaQueryBucket,
 *   note?: string
 * }>} ConfideMetaQueryAcceptanceFixture
 */

/** @type {readonly ConfideMetaQueryAcceptanceFixture[]} */
export const CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES = Object.freeze([
  // memory_list — 8
  Object.freeze({
    id: 'meta-list-zh-canonical',
    text: '列出记忆',
    bucket: 'memory_list',
    note: '2026-09-19 true gapfill; must not wait for L0 classify'
  }),
  Object.freeze({
    id: 'meta-list-zh-tw',
    text: '列出記憶',
    bucket: 'memory_list'
  }),
  Object.freeze({
    id: 'meta-list-zh-remember',
    text: '你还记得什么',
    bucket: 'memory_list'
  }),
  Object.freeze({
    id: 'meta-list-zh-kept',
    text: '你记住了什么',
    bucket: 'memory_list'
  }),
  Object.freeze({
    id: 'meta-list-en-show',
    text: 'Show me what you remember',
    bucket: 'memory_list'
  }),
  Object.freeze({
    id: 'meta-list-en-about',
    text: 'What do you remember about me?',
    bucket: 'memory_list'
  }),
  Object.freeze({
    id: 'meta-list-zh-show-kept',
    text: '给我看看你记得的',
    bucket: 'memory_list'
  }),
  Object.freeze({
    id: 'meta-list-ja',
    text: '何を覚えていますか',
    bucket: 'memory_list'
  }),

  // reflective_honesty — 8
  Object.freeze({
    id: 'meta-busy-zh-shenme',
    text: '我最近在忙什么',
    bucket: 'reflective_honesty',
    note: '#822 honest bucket; does not list memories even when store has rows'
  }),
  Object.freeze({
    id: 'meta-busy-zh-sha',
    text: '我最近在忙啥',
    bucket: 'reflective_honesty',
    note: '2026-09-19 synonym gap; must match 什么 bucket'
  }),
  Object.freeze({
    id: 'meta-busy-zh-short',
    text: '最近在忙什么',
    bucket: 'reflective_honesty'
  }),
  Object.freeze({
    id: 'meta-busy-en-spending',
    text: 'What have I been spending my time on lately?',
    bucket: 'reflective_honesty'
  }),
  Object.freeze({
    id: 'meta-why-en-started',
    text: 'Do you remember why I started doing this?',
    bucket: 'reflective_honesty'
  }),
  Object.freeze({
    id: 'meta-why-zh-practice',
    text: '为什么开始练习',
    bucket: 'reflective_honesty'
  }),
  Object.freeze({
    id: 'meta-why-zh-i-started',
    text: '我为什么开始',
    bucket: 'reflective_honesty'
  }),
  Object.freeze({
    id: 'meta-busy-en-with',
    text: 'What have I been busy with lately?',
    bucket: 'reflective_honesty'
  }),

  // practice_facts — 4
  Object.freeze({
    id: 'meta-practice-zh',
    text: '我练了多久',
    bucket: 'practice_facts'
  }),
  Object.freeze({
    id: 'meta-practice-en',
    text: 'How long have I practiced?',
    bucket: 'practice_facts'
  }),
  Object.freeze({
    id: 'meta-practice-en-device',
    text: 'Can you tell me my total sitting time on this device?',
    bucket: 'practice_facts'
  }),
  Object.freeze({
    id: 'meta-practice-zh-lifetime',
    text: '一共坐了多久',
    bucket: 'practice_facts'
  }),

  // hybrid_classify — paraphrase regex miss, L0 still required — 4
  Object.freeze({
    id: 'meta-hybrid-why-this-zh',
    text: '为什么开始做这件事',
    bucket: 'hybrid_classify'
  }),
  Object.freeze({
    id: 'meta-hybrid-why-this-zh-tw',
    text: '為什麼開始做這件事',
    bucket: 'hybrid_classify'
  }),
  Object.freeze({
    id: 'meta-hybrid-list-kept-zh',
    text: '列出你记得的',
    bucket: 'hybrid_classify',
    note: 'paraphrase; may graduate to memory_list regex later'
  }),
  Object.freeze({
    id: 'meta-hybrid-list-kept-zh-tw',
    text: '列出你記得的',
    bucket: 'hybrid_classify'
  }),

  // companion_greeting — 3
  Object.freeze({
    id: 'meta-greet-en',
    text: 'Good morning.',
    bucket: 'companion_greeting'
  }),
  Object.freeze({
    id: 'meta-greet-zh',
    text: '早上好',
    bucket: 'companion_greeting'
  }),
  Object.freeze({
    id: 'meta-greet-zh-weather',
    text: '天气真好',
    bucket: 'companion_greeting'
  }),

  // generate_skip_classify — #861 chitchat — 5
  Object.freeze({
    id: 'meta-chitchat-game-zh',
    text: '我想打游戏',
    bucket: 'generate_skip_classify'
  }),
  Object.freeze({
    id: 'meta-chitchat-tired-zh',
    text: '今天好累',
    bucket: 'generate_skip_classify'
  }),
  Object.freeze({
    id: 'meta-chitchat-annoyed-zh',
    text: '有点烦',
    bucket: 'generate_skip_classify'
  }),
  Object.freeze({
    id: 'meta-chitchat-sleep-zh',
    text: '睡不着',
    bucket: 'generate_skip_classify'
  }),
  Object.freeze({
    id: 'meta-chitchat-game-en',
    text: 'I want to play video games',
    bucket: 'generate_skip_classify'
  })
]);

/**
 * @param {ConfideMetaQueryBucket} bucket
 * @returns {readonly ConfideMetaQueryAcceptanceFixture[]}
 */
export function fixturesForMetaQueryBucket(bucket) {
  return CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.filter((row) => row.bucket === bucket);
}
