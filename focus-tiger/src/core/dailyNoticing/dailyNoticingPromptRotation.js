/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export const DAILY_NOTICING_PROMPT_IDS = Object.freeze([
  'DAILY_NOTICING_Q1',
  'DAILY_NOTICING_Q2',
  'DAILY_NOTICING_Q3',
  'DAILY_NOTICING_Q4'
]);

export const DAILY_NOTICING_CLOSING_IDS = Object.freeze([
  'DAILY_NOTICING_CLOSE_1',
  'DAILY_NOTICING_CLOSE_2',
  'DAILY_NOTICING_CLOSE_3'
]);

function hashDateKey(dateKey) {
  let h = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pickDailyNoticingPrimaryPromptId(dateKey, recentPrimaryIds = []) {
  const banned = new Set(recentPrimaryIds);
  const pool = DAILY_NOTICING_PROMPT_IDS.filter((id) => !banned.has(id));
  const candidates = pool.length ? pool : [...DAILY_NOTICING_PROMPT_IDS];
  return candidates[hashDateKey(dateKey) % candidates.length];
}

export function buildDailyNoticingPromptOrder(dateKey, recentPrimaryIds = []) {
  const first = pickDailyNoticingPrimaryPromptId(dateKey, recentPrimaryIds);
  return [first, ...DAILY_NOTICING_PROMPT_IDS.filter((id) => id !== first)];
}

export function pickDailyNoticingClosingId(dateKey) {
  return DAILY_NOTICING_CLOSING_IDS[
    hashDateKey(`${dateKey}:close`) % DAILY_NOTICING_CLOSING_IDS.length
  ];
}