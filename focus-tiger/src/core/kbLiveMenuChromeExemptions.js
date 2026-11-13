/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Non-menu Idle chrome that must not be treated as
 * `listSecondaryChromeEntries` proxies. Human reasons live in
 * `docs/MENU_CHROME_CENSUS.md` §2.3. Menu rows (`help-center`, `sound`,
 * `confide`) stay in the live registry — only the shortcut chrome is exempt.
 *
 * Verified against `origin/develop` `listSecondaryChromeEntries` on 2026-11-13.
 *
 * @see docs/task-briefs/task-kb-help-single-source.md knife 2
 */

/**
 * @typedef {object} KbLiveMenuChromeExemption
 * @property {string} id
 * @property {string} censusRow
 * @property {string} reason
 * @property {readonly string[]} [registeredMenuProxies]
 */

/** @type {readonly KbLiveMenuChromeExemption[]} */
export const KB_LIVE_MENU_CHROME_EXEMPTIONS = Object.freeze([
  Object.freeze({
    id: 'sit-rise-breath-home',
    censusRow: 'Sit / Rise、左球 Breath practice',
    reason:
      'Primary home balls, not secondary menu proxies. Existing home-ball registry rows stay; do not invent menu rows for CI.'
  }),
  Object.freeze({
    id: 'narrow-question-mark',
    censusRow: '窄屏 ActionBar `?`',
    reason: 'Product intro / hint, not a feature-list proxy.'
  }),
  Object.freeze({
    id: 'help-center-shortcut',
    censusRow: '宽屏簇 / 窄屏 ActionBar Help Center 快捷',
    reason:
      'Shortcut to the same Help Center card. Menu proxy `help-center` is not exempt.',
    registeredMenuProxies: Object.freeze(['help-center'])
  }),
  Object.freeze({
    id: 'corner-sound-note',
    censusRow: '音符 / 环境音面板',
    reason:
      'Corner ♪ is the primary opener. Menu proxy `sound` is not exempt.',
    registeredMenuProxies: Object.freeze(['sound'])
  }),
  Object.freeze({
    id: 'week-heatmap-calendar',
    censusRow: '左上日历 / 周热力图',
    reason: 'Content navigation; not a secondary menu proxy.'
  }),
  Object.freeze({
    id: 'confide-ear-shortcut',
    censusRow: '倾听耳（宽）',
    reason:
      'Shortcut. Menu proxy `confide` is not exempt.',
    registeredMenuProxies: Object.freeze(['confide'])
  }),
  Object.freeze({
    id: 'desktop-update-bar',
    censusRow: '桌面更新提示条',
    reason: 'System status chrome, not a feature entry (#758).'
  })
]);

/**
 * @returns {readonly string[]}
 */
export function listKbLiveMenuChromeExemptionIds() {
  return KB_LIVE_MENU_CHROME_EXEMPTIONS.map((row) => row.id);
}
