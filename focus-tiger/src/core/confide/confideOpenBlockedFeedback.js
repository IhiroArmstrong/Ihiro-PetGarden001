/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * When Confide cannot open (mount off, busy, etc.), user-facing feedback must
 * still surface guidance — never silent return.
 *
 * - `safety` (default): T92 safety-01 for crisis-adjacent paths (Help Center crisis ask, voice crisis).
 * - `entitlement`: Confide not available here — no crisis helpline (e.g. contemplative support bridge).
 */

import { formatConfideSafetyResourceGuidance } from './confideSafetyResources.js';

/** Playwright / e2e anchor for blocked-open toast (T92). */
export const CONFIDE_OPEN_BLOCKED_TOAST_TESTID = 'confide-open-blocked-safety-help';

/** Playwright / e2e anchor for entitlement-only blocked open. */
export const CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID =
  'confide-open-blocked-entitlement';

/** @typedef {'safety' | 'entitlement'} ConfideOpenBlockedVariant */

const ENTITLEMENT_BLOCKED_COPY = Object.freeze({
  en:
    'Confide is not open in this release. You can still practice here. Open Help Center from the menu for walkthroughs — or reach someone you trust if you need support now.',
  zh:
    '向阿寅倾诉在本版本尚未对客人开放。你仍可照常练习；可从菜单打开帮助中心查看说明。若此刻需要有人陪着，也可以联系你信任的人。',
  ja:
    'コンファイドは、この版ではゲストに開いていません。いまの練習はそのまま続けられます。メニューからヘルプセンターで説明を見られます。支えが必要なら、信頼できる人に連絡してもいいです。'
});

/**
 * @param {string} [locale]
 * @param {{ variant?: ConfideOpenBlockedVariant }} [options]
 * @returns {string}
 */
export function confideOpenBlockedUserMessage(locale = 'en', options = {}) {
  const variant = options.variant === 'entitlement' ? 'entitlement' : 'safety';
  if (variant === 'entitlement') {
    const key = locale === 'zh' || locale === 'ja' ? locale : 'en';
    return (ENTITLEMENT_BLOCKED_COPY[key] || ENTITLEMENT_BLOCKED_COPY.en).trim();
  }
  return formatConfideSafetyResourceGuidance(locale).trim();
}
