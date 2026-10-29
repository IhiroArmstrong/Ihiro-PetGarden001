/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T55 PR-3 literal forbidden table (deterministic; no model).
 * Extends the narrow `AWAKEN_FORBIDDEN_COPY` set. Crisis / C-10 is out of scope.
 */

export const COMPANION_CONTRACT_HONESTY =
  'Honesty: literal check covers shipped fixed copy only (locale, slices, registered pools). Confide live model output is not covered. Passing this check is not verified companion behavior.';

/** Narrow invite regex already wired in InterventionOrchestrator (report coverage, do not delete). */
export const AWAKEN_FORBIDDEN_COPY_SOURCE =
  /焦虑|分心诊断|心流指数|分数|\banxiety\b|\bflow index\b|\bscore\b/i;

/**
 * @typedef {{ id: string, redline: string, re: RegExp }} CompanionForbiddenPattern
 */

/** @type {readonly CompanionForbiddenPattern[]} */
export const COMPANION_FORBIDDEN_PATTERNS = Object.freeze([
  {
    id: 'c01-diagnosis',
    redline: 'C-01',
    re: /焦虑|抑郁|分心诊断|注意力有问题|\banxiety\b|\bdepression\b|\bADHD\b|attention problem/i
  },
  {
    id: 'c02-score',
    redline: 'C-02',
    re: /心流指数|分数|\bflow index\b|\bscore\b|\branking\b|表现分/i
  },
  {
    id: 'c03-verdict',
    redline: 'C-03',
    re: /你今天状态不好|you(?:'re| are) (?:not in a good state|unfocused today)|you have a problem/i
  },
  {
    id: 'c04-guilt',
    redline: 'C-04',
    re: /你错过了|你又缺席|你又走神了|you missed (?:your )?(?:practice|session|day)|guilt trip|consecutive days you skipped/i
  },
  {
    id: 'c05-cure',
    redline: 'C-05',
    re: /治愈你|会让你好起来|this will (?:cure|heal) you|\bcure you\b|\bheal you\b/i
  },
  {
    id: 'c06-professional',
    redline: 'C-06',
    re: /作为治疗师|我是你的医生|as your (?:therapist|doctor)|i(?:'m| am) your therapist/i
  },
  {
    id: 'c07-exclusive',
    redline: 'C-07',
    re: /只有我懂你|only i (?:can )?understand you|nobody else understands you/i
  },
  {
    id: 'c08-must-stay',
    redline: 'C-08',
    re: /你必须留下|you must stay|don't leave me|do not leave me/i
  },
  {
    id: 'c09-internal',
    redline: 'C-09',
    re: /\b(?:SETTLED|DRIFTING|STRUGGLING|FLOW_PROTECT|AWAY_INVITE|LONG_SIT_INVITE)\b/
  },
  {
    id: 'c11-adapts-understands',
    redline: 'C-11',
    re: /越来越懂|更懂你了|understands you better|adapts to you|Yin is learning you/i
  },
  {
    id: 'c11-unverified-efficacy',
    redline: 'C-11',
    re: /已评估有效|evaluated as effective|proven effective|共修(?:已经)?(?:被)?(?:证明|评估).*有效/i
  },
  {
    id: 'c11-confide-training',
    redline: 'C-11',
    re: /倾诉原文|learns from (?:what )?you confide|from your confessions to train/i
  },
  {
    id: 'c11-focus-confide',
    redline: 'C-11',
    re: /(?:while|during) (?:you )?focus(?:ing)?[, ]+(?:you can )?(?:open )?confide|专注(?:途中|进行中|的时候).*(?:倾诉|Confide)/i
  },
  {
    id: 'c11-late-night-diagnosis',
    redline: 'C-11',
    re: /看出.*熬夜|noticed you stayed up|you stayed up too late again|连续熬夜/i
  }
]);

/**
 * @param {string} text
 * @returns {{ id: string, redline: string }[]}
 */
export function matchForbiddenPatterns(text) {
  const value = String(text ?? '');
  const hits = [];
  for (const row of COMPANION_FORBIDDEN_PATTERNS) {
    if (row.re.test(value)) hits.push({ id: row.id, redline: row.redline });
  }
  return hits;
}
