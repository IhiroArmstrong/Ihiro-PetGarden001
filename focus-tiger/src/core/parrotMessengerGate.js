/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Scene A · 应用内轻提醒横幅伴随「鹦鹉禅意信使」动画。
 *
 * 横幅每次从隐藏 → 可见时播一次（含 dismiss 后再到期、suppress 后再显）。
 * 冷启动欢迎池播放期间不得抢播（留给 welcome onComplete 后再 sync）。
 * 权威：SCENE_ANIMATION_WIRING / EMOTION_BIBLE `parrotEarVisit`。
 */

/**
 * @param {object} opts
 * @param {'show' | 'hide'} opts.action ReminderBannerDecision.action
 * @param {boolean} [opts.bannerWasVisible] sync 前横幅是否已可见
 * @param {boolean} [opts.holdForWelcome] 冷启动欢迎尚未结束 → 只出横幅、不播鹦鹉
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
