/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Scene A · 应用内轻提醒横幅伴随「鹦鹉禅意信使」动画。
 *
 * 横幅每次从隐藏 → 可见时播一次（含 dismiss 后再到期、suppress 后再显）。
 * 冷启动第一幕占用（欢迎池 / 吹花 / 清晨苏醒 / 付款致谢）期间不得抢播；
 * 留给 first-paint onComplete + CapCut 叠化后再 sync。门闩以 occupancy 为准，
 * 情绪键集合派生自 WELCOME_POOL + COLD_START_WELCOME_EXTRA_EMOTION_KEYS。
 * 权威：SCENE_ANIMATION_WIRING / EMOTION_BIBLE `parrotEarVisit`。
 */

/**
 * @param {object} opts
 * @param {'show' | 'hide'} opts.action ReminderBannerDecision.action
 * @param {boolean} [opts.bannerWasVisible] sync 前横幅是否已可见
 * @param {boolean} [opts.holdForWelcome] 第一幕占用尚未结束 → 只出横幅、不播鹦鹉
 * @returns {boolean}
 */
export function shouldPlayParrotMessengerOnBannerShow({
  action,
  bannerWasVisible = false,
  holdForWelcome = false
} = {}) {
  if (holdForWelcome) return false;
  if (action !== 'show') return false;
  if (bannerWasVisible) return false;
  return true;
}
