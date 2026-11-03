/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * T76 B2: Help Center search aliases for quiet-sit names.
 * These words must list Sit-with-Yin help cards, not “we have no meditation”.
 * SSOT: docs/task-briefs/task-t76-cold-start-quiet-sit.md §7 B2.
 */

import { confideObjectKeywordMatches } from './confide/confideObjectNormalize.js';

export const HELP_CENTER_QUIET_SIT_ALIASES = Object.freeze([
  'mindfulness',
  'meditation',
  'zazen',
  'zen practice',
  '坐禅',
  '瞑想',
  'マインドフルネス'
]);

export const HELP_CENTER_QUIET_SIT_ARTICLE_IDS = Object.freeze([
  'KB-EDU-0003',
  'KB-FUNC-0001'
]);

/**
 * @param {string} text already-normalized ask text
 * @returns {boolean}
 */
export function helpCenterAskMatchesQuietSitAlias(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  return HELP_CENTER_QUIET_SIT_ALIASES.some((alias) =>
    confideObjectKeywordMatches(raw, alias)
  );
}

/**
 * @param {string} text already-normalized ask text
 * @returns {readonly string[]}
 */
export function resolveHelpCenterQuietSitAliasArticles(text) {
  if (!helpCenterAskMatchesQuietSitAlias(text)) return [];
  return HELP_CENTER_QUIET_SIT_ARTICLE_IDS;
}
