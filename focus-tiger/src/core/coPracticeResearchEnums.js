/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** @typedef {'en' | 'ja' | 'zh'} PracticeStudyLocale */
/** @typedef {'web' | 'mac' | 'win'} PracticeStudyPlatform */

export const CO_PRACTICE_RESEARCH_SCHEMA_VERSION = 1;

/** Frozen chipId whitelist (schema v1 · DATA_DICTIONARY S0). */
export const CO_PRACTICE_RESEARCH_CHIP_IDS = Object.freeze([
  'forget_this',
  'dont_save_this',
  'practice_duration',
  'practice_compare'
]);

/** Frozen route.class whitelist (functional only). */
export const CO_PRACTICE_RESEARCH_ROUTE_CLASSES = Object.freeze([
  'help_center_redirect',
  'query_practice_duration',
  'language_not_yet_open'
]);

const CHIP_SET = new Set(CO_PRACTICE_RESEARCH_CHIP_IDS);
const ROUTE_SET = new Set(CO_PRACTICE_RESEARCH_ROUTE_CLASSES);

/**
 * @param {string} chipId
 */
export function isCoPracticeResearchChipId(chipId) {
  return typeof chipId === 'string' && CHIP_SET.has(chipId);
}

/**
 * @param {string} routeClass
 */
export function isCoPracticeResearchRouteClass(routeClass) {
  return typeof routeClass === 'string' && ROUTE_SET.has(routeClass);
}

export const CO_PRACTICE_RESEARCH_COUNT_CAPS = Object.freeze({
  practiceBlock: 200,
  companion: 500,
  sitWithYin: 200,
  minutesWeek: 10080,
  retentionDays: 365,
  comebacks: 7
});

/**
 * @param {number} value
 * @param {number} max
 */
export function clampResearchCount(value, max) {
  const n = Math.floor(Number(value) || 0);
  if (n < 0) return 0;
  return n > max ? max : n;
}
