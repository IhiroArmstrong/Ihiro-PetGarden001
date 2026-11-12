/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Help Center search aliases for devices + Apple Health honesty.
 * @see docs/task-briefs/task-help-center-platform-health.md
 */

import { confideObjectKeywordMatches } from './confide/confideObjectNormalize.js';

export const HELP_CENTER_DEVICES_ARTICLE_ID = 'HELP-DEVICES-SAFARI';
export const HELP_CENTER_APPLE_HEALTH_ARTICLE_ID = 'HELP-APPLE-HEALTH-LOG';

export const HELP_CENTER_DEVICE_ALIASES = Object.freeze([
  'app store',
  'download app',
  'iphone',
  'ipad',
  'safari',
  'testflight',
  '手机',
  '平板',
  'app',
  'アプリ',
  'app store'
]);

export const HELP_CENTER_APPLE_HEALTH_ALIASES = Object.freeze([
  'apple health',
  'healthkit',
  'mindful minutes',
  'log to health',
  'shortcuts',
  '记入健康',
  '健康',
  '快捷指令',
  'wechat',
  '微信',
  'health app'
]);

/**
 * @param {string} text
 * @returns {readonly string[]}
 */
export function resolveHelpCenterPlatformAliasArticles(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  /** @type {string[]} */
  const ids = [];
  const add = (id, aliases) => {
    if (ids.includes(id)) return;
    if (aliases.some((a) => confideObjectKeywordMatches(raw, a))) ids.push(id);
  };
  add(HELP_CENTER_DEVICES_ARTICLE_ID, HELP_CENTER_DEVICE_ALIASES);
  add(HELP_CENTER_APPLE_HEALTH_ARTICLE_ID, HELP_CENTER_APPLE_HEALTH_ALIASES);
  return ids;
}
