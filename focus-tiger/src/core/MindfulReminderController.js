import {
  SCENE_ANIM_EVENTS,
  resolveSceneAnimation
} from './sceneAnimationDispatcher.js';

export const MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS = 20 * 60;
export const STRETCH_REMINDER_THRESHOLD_SECONDS = 2 * 60 * 60;
export const STRETCH_RESET_AFTER_INACTIVE_MS = 30 * 60 * 1000;
export const REFOCUS_PER_SESSION_LIMIT = 1;

/** User-initiated Recover cooldown (anti-misfire; does not share passive quota). */
export const ACTIVE_RECOVER_COOLDOWN_MS = 3 * 60 * 1000;
/** Active Recover toast visibility (shorter than default mindful toast). */
export const ACTIVE_RECOVER_TOAST_MS = 3000;

const STRONG_EMOTIONS = new Set([
  'celebrating',
  'milestoneGlow',
  'dormantWake',
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
   * @param {() => number} [deps.random]
   * @param {(type: 'mindful' | 'stretch' | 'refocus' | 'activeRecover') => void} [deps.onReminderShown]
   */
  constructor({
    quotaManager,
    emotionController,
    toast,
    getCopy,
    now = () => Date.now(),
    random = Math.random,
    onReminderShown = null
  }) {
    this.quotaManager = quotaManager;
    this.emotionController = emotionController;
    this.toast = toast;
    this.getCopy = getCopy;
    this.now = now;
    this.random = random;
    this.onReminderShown = onReminderShown;

    this.sessionActive = false;
    this.sessionElapsedSeconds = 0;
    this.activeStretchSeconds = 0;
    this.mindfulHandledThisSession = false;
    this.refocusHandledThisSession = 0;
    this.candidateDepartureCount = 0;
    this.lastSessionStoppedAt = null;
    this.attentionAway = false;
    this.suppressAwayReminders = false;
    /** @type {null | (() => number)} */
    this._getSessionElapsedSeconds = null;
    /** Earliest wall time an active Recover may fire again. */
    this._activeRecoverAvailableAt = 0;
  }

  /**
   * @param {object} [options]
   * @param {boolean} [options.suppressAwayReminders] Companion Mode step-away
   * @param {() => number} [options.getSessionElapsedSeconds] 墙钟经过秒（与 FocusSession 对齐）
   */
  startSession({
    suppressAwayReminders = false,
    getSessionElapsedSeconds = null
  } = {}) {
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
    this.suppressAwayReminders = Boolean(suppressAwayReminders);
    this._getSessionElapsedSeconds =
      typeof getSessionElapsedSeconds === 'function'
        ? getSessionElapsedSeconds
        : null;
    // Fresh session: active Recover available immediately (cooldown is per-session use).
    this._activeRecoverAvailableAt = 0;
  }

  stopSession() {
    if (!this.sessionActive) return;
    this.sessionActive = false;
    this.lastSessionStoppedAt = this.now();
    this.attentionAway = false;
    this.suppressAwayReminders = false;
    this._getSessionElapsedSeconds = null;
    this._activeRecoverAvailableAt = 0;
  }

  /** @param {boolean} away */
  setAttentionAway(away) {
    this.attentionAway = away;
  }

  /** @param {number} deltaSeconds */
  update(deltaSeconds) {
    if (!this.sessionActive || deltaSeconds < 0) return;

    if (this._getSessionElapsedSeconds) {
      this.sessionElapsedSeconds = this._getSessionElapsedSeconds();
    } else if (deltaSeconds > 0) {
      this.sessionElapsedSeconds += deltaSeconds;
    }

    // 活跃累计：仅在前台可见且未 away 时累加；step-away 离开时仍暂停（已确认）
    if (deltaSeconds > 0 && !this.attentionAway) {
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
    // Companion Mode step-away：离开是预期行为，不触发 Re-focus / 离开类提醒
    if (this.suppressAwayReminders) return;

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

  /** @returns {number} ms until active Recover is available again (0 = ready). */
  getActiveRecoverCooldownRemainingMs() {
    return Math.max(0, this._activeRecoverAvailableAt - this.now());
  }

  /** @returns {boolean} */
  isActiveRecoverAvailable() {
    return (
      this.sessionActive && this.getActiveRecoverCooldownRemainingMs() === 0
    );
  }

  /**
   * User-initiated Recover (Tiger Anchor). Zero MicroRitual / Reflection / ledger.
   * Does **not** consume ReminderQuotaManager or the per-session Re-focus slot.
   * Timer continues; presentation only.
   * @returns {{ ok: boolean, reason?: string, remainingMs?: number, shown?: boolean }}
   */
  triggerActiveRecover() {
    if (!this.sessionActive) {
      return { ok: false, reason: 'inactive' };
    }
    const remainingMs = this.getActiveRecoverCooldownRemainingMs();
    if (remainingMs > 0) {
      return { ok: false, reason: 'cooldown', remainingMs };
    }
    const currentEmotion = this.emotionController.getCurrentEmotionKey?.();
    if (STRONG_EMOTIONS.has(currentEmotion)) {
      return { ok: false, reason: 'strong_emotion' };
    }

    this.emotionController.playEmotion('mindfulAcknowledge', {
      subtype: 'activeRecover'
    });
    const shown = this.toast.show(this.getCopy('ACTIVE_RECOVER'), {
      placement: 'center',
      visibleMs: ACTIVE_RECOVER_TOAST_MS
    });
    this._activeRecoverAvailableAt = this.now() + ACTIVE_RECOVER_COOLDOWN_MS;
    if (shown) this.onReminderShown?.('activeRecover');
    return { ok: true, shown: Boolean(shown) };
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
        emotionKey: null, // resolved via scene Animation Dispatcher pool
        poolKey: 'STRETCH_REMINDER'
      },
      refocus: {
        emotionKey: 'mindfulAcknowledge',
        poolKey: 'REFOCUS_ACKNOWLEDGE'
      }
    }[type];

    let emotionKey = config.emotionKey;
    if (type === 'stretch') {
      const decision = resolveSceneAnimation({
        event: SCENE_ANIM_EVENTS.STRETCH_REMINDER,
        sessionState: 'FOCUSING',
        random: this.random
      });
      emotionKey = decision.emotionKey || 'stretchReminder';
    }
    this.emotionController.playEmotion(emotionKey, { subtype: type });
    const shown = this.toast.show(this.getCopy(config.poolKey));
    if (shown) this.onReminderShown?.(type);
    return shown;
  }
}
