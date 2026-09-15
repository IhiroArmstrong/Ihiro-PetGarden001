/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Locked #774 ja chitchat variance probe inputs (5173 QA diff samples).
 * Do not swap sentences across probe runs — compare like with like.
 */

/** @type {readonly { id: string, text: string }[]} */
export const CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES = Object.freeze([
  Object.freeze({ id: 'ja-chitchat-01', text: '小可耐喜欢吃胖粉吗？' }),
  Object.freeze({ id: 'ja-chitchat-02', text: '小姐姐喜欢吃啥？' }),
  Object.freeze({ id: 'ja-chitchat-03', text: '我今天不太想静坐练习。' }),
  Object.freeze({
    id: 'ja-chitchat-04',
    text: 'I only have ten minutes. Is that still worth doing?'
  }),
  Object.freeze({
    id: 'ja-chitchat-05',
    text: "Today was a mess. Anyway, let's begin."
  })
]);
