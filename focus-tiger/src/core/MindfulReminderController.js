export const MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS = 20 * 60;
export const STRETCH_REMINDER_THRESHOLD_SECONDS = 2 * 60 * 60;
export const STRETCH_RESET_AFTER_INACTIVE_MS = 30 * 60 * 1000;
export const REFOCUS_PER_SESSION_LIMIT = 1;

const STRONG_EMOTIONS = new Set([
  'celebrating',
  'milestoneGlow',
  'wakeUp',
  'incenseComplete',
  'sessionComplete'
]);

export class MindfulReminderController {
  /**
   * @param {object} deps
   * @param {import('./ReminderQuotaManager.js').ReminderQuotaManager} deps.quotaManager
   * @param {import('./EmotionController.js').EmotionController} deps.emotionController
   * @param {{show(message: string): boolean}} deps.toast
   * @param {(poolKey: string) => string} deps.getCopy
   * @param {() => number} [deps.now]
   */
  constructor({
    quotaManager,
    emotionController,
    toast,
    getCopy,
    now = () => Date.now()
  }) {
    this.quotaManager = quotaManager;
    this.emotionController = emotionController;
    this.toast = toast;
    this.getCopy = getCopy;
    this.now = now;

    this.sessionActive = false;
    this.sessionElapsedSeconds = 0;
    this.activeStretchSeconds = 0;
    this.mindfulHandledThisSession = false;
    this.refocusHandledThisSession = 0;
    this.candidateDepartureCount = 0;
    this.lastSessionStoppedAt = null;
    this.attentionAway = false;
  }

  startSession() {
    if (
      this.lastSessionStoppedAt !== null &&
      this.now() - this.lastSessionStoppedAt >=
        STRETCH_RESET_AFTER_INACTIVE_MS
    ) {
      this.activeStretchSeconds = 0;
    }
    this.sessionActive = true;
    this.sessionElapsedSeconds = 0;
    this.mindfulHandledThisSession = false;
    this.refocusHandledThisSession = 0;
    this.candidateDepartureCount = 0;
    this.attentionAway = false;
  }

  stopSession() {
    if (!this.sessionActive) return;
    this.sessionActive = false;
    this.lastSessionStoppedAt = this.now();
    this.attentionAway = false;
  }

  /** @param {boolean} away */
  setAttentionAway(away) {
    this.attentionAway = away;
  }

  /** @param {number} deltaSeconds */
  update(deltaSeconds) {
    if (!this.sessionActive || deltaSeconds <= 0) return;

    this.sessionElapsedSeconds += deltaSeconds;
    if (!this.attentionAway) {
      this.activeStretchSeconds += deltaSeconds;
    }

    if (
      !this.mindfulHandledThisSession &&
      this.sessionElapsedSeconds >= MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS
    ) {
      this.mindfulHandledThisSession = true;
      this._showReminder('mindful');
    }

    if (this.activeStretchSeconds >= STRETCH_REMINDER_THRESHOLD_SECONDS) {
      this.activeStretchSeconds %= STRETCH_REMINDER_THRESHOLD_SECONDS;
      this._showReminder('stretch');
    }
  }

  /**
   * 20 秒以上的返回事件均在内部记账；只有超过 60 秒的事件可尝试展示。
   * 第一次符合展示门槛的事件即占用本会话 Re-focus 机会，即使因强反馈或
   * 每日额度用尽而静默，也不在稍后补发。
   * @param {{durationMs: number, displayEligible: boolean}} event
   */
  handleAttentionReturn(event) {
    if (!this.sessionActive) return;
    this.candidateDepartureCount += 1;
    if (
      !event.displayEligible ||
      this.refocusHandledThisSession >= REFOCUS_PER_SESSION_LIMIT
    ) {
      return;
    }

    this.refocusHandledThisSession += 1;
    this._showReminder('refocus');
  }

  /** @returns {{candidateDepartureCount: number, refocusHandledThisSession: number}} */
  getSessionStats() {
    return {
      candidateDepartureCount: this.candidateDepartureCount,
      refocusHandledThisSession: this.refocusHandledThisSession
    };
  }

  _showReminder(type) {
    const currentEmotion = this.emotionController.getCurrentEmotionKey?.();
    if (STRONG_EMOTIONS.has(currentEmotion)) return false;
    if (!this.quotaManager.tryConsume()) return false;

    const config = {
      mindful: {
        emotionKey: 'mindfulAcknowledge',
        poolKey: 'MINDFUL_FOCUS_MILESTONE'
      },
      stretch: {
        emotionKey: 'stretchReminder',
        poolKey: 'STRETCH_REMINDER'
      },
      refocus: {
        emotionKey: 'mindfulAcknowledge',
        poolKey: 'REFOCUS_ACKNOWLEDGE'
      }
    }[type];

    this.emotionController.playEmotion(config.emotionKey, { subtype: type });
    return this.toast.show(this.getCopy(config.poolKey));
  }
}
