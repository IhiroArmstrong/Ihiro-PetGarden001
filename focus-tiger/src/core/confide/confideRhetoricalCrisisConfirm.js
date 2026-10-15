/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CR-48: after a semantic crisis hit, confirm self-directed wish vs
 * rhetorical / affectionate use of “die”. Uncertain still refers.
 * Shape of addressee / intensifier — not a growing phrase list.
 */

export const RHETORICAL_CRISIS_CONFIRM = Object.freeze({
  SELF: 'self',
  RHETORICAL: 'rhetorical',
  UNCERTAIN: 'uncertain'
});

const HARD_SELF_RES = Object.freeze([
  /\bkill(?:ing|ed)?\s+my\s*self\b/i,
  /\bhurt(?:ing)?\s+my\s*self\b/i,
  /\bend\s+my\s+life\b/i,
  /\bdon'?t\s+want\s+to\s+live\b/i,
  /\bwish\s+i\s+(?:was|were)\s+dead\b/i,
  /\bno\s+reason\s+to\s+(?:keep\s+)?liv/i,
  /\bbetter\s+off\s+dead\b/i,
  /不想活/,
  /自杀|自殺/,
  /结束生命|結束生命/,
  /伤害自己|傷害自己/,
  /寻死|尋死/
]);

const SOFT_SELF_RES = Object.freeze([
  /\bwant(?:ed)?\s+to\s+die\b/i,
  /\bi\s+wish\s+i\s+(?:could\s+)?die\b/i,
  /我想死/,
  /想死了\s*$/,
  /活着没有意义|活著沒有意義/
]);

const RHETORICAL_RES = Object.freeze([
  /\bdying\s+to\b/i,
  /\bdying\s+for\b/i,
  /\b(?:is|are|was|were|'s|’s)\s+killing\s+me\b/i,
  /\bthis\s+is\s+killing\s+me\b/i,
  /\bdie\s+of\s+(?:embarrassment|laughter|boredom|hunger|thirst|shame|curiosity|happiness|joy|waiting)\b/i,
  /\bdie\s+laughing\b/i,
  /\b(?:bored|sick|scared|worried|frightened|starving)\s+to\s+death\b/i,
  /\b(?:love|miss|hate)\s+you\s+to\s+death\b/i,
  /想死(?:了)?(?:你|您|他|她|它|谁|誰|你们|你們|他们|他們|她们|她們)/,
  /(?:你|您|他|她|谁|誰|你们|你們).{0,3}去死/,
  /(?:笑|乐|樂|累|饿|餓|渴|撑|忙|热|熱|冷|困|懒|懶|疼|痛|吓|嚇|气|氣|急|烦|煩|开心|高興|高兴|喜欢|喜歡|爱|愛|美|帅|帥)死(?:我|你|您|他|她|它)?了?/
]);

function matchesAny(text, res) {
  return res.some((re) => re.test(text));
}

/**
 * @param {string | null | undefined} text
 * @returns {'self' | 'rhetorical' | 'uncertain'}
 */
export function confirmRhetoricalCrisisUse(text) {
  const t = String(text || '').trim();
  if (!t) return RHETORICAL_CRISIS_CONFIRM.UNCERTAIN;
  if (matchesAny(t, HARD_SELF_RES)) return RHETORICAL_CRISIS_CONFIRM.SELF;
  if (matchesAny(t, RHETORICAL_RES)) return RHETORICAL_CRISIS_CONFIRM.RHETORICAL;
  if (matchesAny(t, SOFT_SELF_RES)) return RHETORICAL_CRISIS_CONFIRM.SELF;
  return RHETORICAL_CRISIS_CONFIRM.UNCERTAIN;
}
