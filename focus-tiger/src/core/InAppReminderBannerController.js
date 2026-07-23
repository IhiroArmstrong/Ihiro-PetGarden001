/**
 * 应用内提醒横幅 · 页面会话内状态机（不渲染 DOM）。
 *
 * 关闭后本页会话不再展示；完整刷新或新开 App 重置。
 *
 * 会话忙碌时两种策略（**2026-07-23 已拍板 suppress**；defer 仅对照/单测）：
 * - suppress（产品路径）：忙时隐藏，不排队；下次 visibility / 启动再评
 * - defer（未启用）：忙时记 pending，回非忙碌后再展示一次
 */

/**
 * @typedef {{ shouldShow: boolean, messageKey: string | null }} InAppReminderBannerCandidate
 * @typedef {'show' | 'hide'} ReminderBannerAction
 * @typedef {{ action: ReminderBannerAction, messageKey: string | null }} ReminderBannerDecision
 */

/**
 * Arrival / Focusing / Celebrate / Reflection / 微仪式进行中视为忙碌。
 * @param {object} ctx
 * @param {string} [ctx.state]
 * @param {boolean} [ctx.arrivalOpen]
 * @param {boolean} [ctx.reflectionOpen]
 * @param {boolean} [ctx.microRitualOpen]
 * @returns {boolean}
 */
export function isReminderBusySession({
  state = '',
  arrivalOpen = false,
  reflectionOpen = false,
  microRitualOpen = false
} = {}) {
  if (arrivalOpen || reflectionOpen || microRitualOpen) return true;
  return state === 'FOCUSING' || state === 'CELEBRATE';
}

/**
 * @param {'suppress' | 'defer'} [policy]
 * @returns {'hide' | 'defer'}
 */
export function resolveBusySessionPolicy(policy = 'suppress') {
  return policy === 'defer' ? 'defer' : 'hide';
}

export class InAppReminderBannerController {
  /**
   * @param {object} [options]
   * @param {'suppress' | 'defer'} [options.busyPolicy] 产品路径固定 suppress（2026-07-23 拍板）
   */
  constructor({ busyPolicy = 'suppress' } = {}) {
    /** 本页会话内用户已关横幅 */
    this.dismissedThisPageSession = false;
    /** 方案 B：忙时排队，回 Idle 再展示 */
    this.pendingAfterSession = false;
    this.busyPolicy = busyPolicy;
  }

  /**
   * @param {InAppReminderBannerCandidate} candidate
   * @param {object} [opts]
   * @param {boolean} [opts.isBusySession]
   * @returns {ReminderBannerDecision & { deferred?: boolean }}
   */
  resolve(candidate, { isBusySession = false } = {}) {
    if (this.dismissedThisPageSession) {
      return { action: 'hide', messageKey: null };
    }

    const eligible = Boolean(candidate?.shouldShow);
    const messageKey = eligible ? candidate.messageKey : null;

    if (this.pendingAfterSession && !isBusySession && eligible) {
      this.pendingAfterSession = false;
      return { action: 'show', messageKey };
    }

    if (!eligible) {
      this.pendingAfterSession = false;
      return { action: 'hide', messageKey: null };
    }

    if (isBusySession) {
      const busy = resolveBusySessionPolicy(this.busyPolicy);
      if (busy === 'defer') {
        this.pendingAfterSession = true;
        return { action: 'hide', messageKey: null, deferred: true };
      }
      return { action: 'hide', messageKey: null };
    }

    return { action: 'show', messageKey };
  }

  /** 用户关闭横幅：本页会话内不再展示。 */
  dismiss() {
    this.dismissedThisPageSession = true;
    this.pendingAfterSession = false;
  }

  /** 测试用 */
  resetPageSession() {
    this.dismissedThisPageSession = false;
    this.pendingAfterSession = false;
  }
}
