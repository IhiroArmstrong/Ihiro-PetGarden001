/**
 * Scene A · 应用内轻提醒横幅伴随「鹦鹉禅意信使」动画。
 *
 * 横幅首次变为可见时播一次；同页会话内不重复（含 suppress 隐藏后再显）。
 * 权威：SCENE_ANIMATION_WIRING / EMOTION_BIBLE `parrotEarVisit`。
 */

/**
 * @param {object} opts
 * @param {'show' | 'hide'} opts.action ReminderBannerDecision.action
 * @param {boolean} [opts.bannerWasVisible] sync 前横幅是否已可见
 * @param {boolean} [opts.alreadyPlayedThisPageSession] 本页是否已播过信使
 * @returns {boolean}
 */
export function shouldPlayParrotMessengerOnBannerShow({
  action,
  bannerWasVisible = false,
  alreadyPlayedThisPageSession = false
} = {}) {
  if (alreadyPlayedThisPageSession) return false;
  if (action !== 'show') return false;
  if (bannerWasVisible) return false;
  return true;
}
