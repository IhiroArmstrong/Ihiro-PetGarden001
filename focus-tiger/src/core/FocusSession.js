// 职责：专注会话的计时与 focusLevel 计算。
// 经过时长以墙钟时间戳差值为真值，不依赖后台被节流的 interval / rAF 累加。

export const COMPANION_MODE_STAY = 'stay';
export const COMPANION_MODE_STEP_AWAY = 'stepAway';
export const COMPANION_MODE_ACROSS_TOOLS = 'acrossTools';

/** across-tools 宽松 idle 兜底（占位，可调） */
export const ACROSS_TOOLS_IDLE_THRESHOLD_MS = 30 * 60 * 1000;

export const COMPANION_MODE_STORAGE_KEY = 'focus-tiger.companion-mode.v1';

/** @typedef {'stay' | 'stepAway' | 'acrossTools'} CompanionMode */

/** @param {string} mode */
export function isValidCompanionMode(mode) {
  return (
    mode === COMPANION_MODE_STAY ||
    mode === COMPANION_MODE_STEP_AWAY ||
    mode === COMPANION_MODE_ACROSS_TOOLS
  );
}

/** 离开类提醒（Re-focus / visibility 分心）应抑制的模式 */
export function shouldSuppressAwayReminders(mode) {
  return (
    mode === COMPANION_MODE_STEP_AWAY ||
    mode === COMPANION_MODE_ACROSS_TOOLS
  );
}

export class FocusSession {
  constructor(targetMinutes = 25) {
    this.targetMinutes = targetMinutes;
    /** @type {CompanionMode} */
    this.companionMode = COMPANION_MODE_STAY;
    this.isRunning = false;
    /** @type {number | null} */
    this.startedAtMs = null;
    /** 主动 pause 期间累计的毫秒（不含后台节流问题：pause 用墙钟段） */
    this.pausedAccumulatedMs = 0;
    /** @type {number | null} */
    this._pauseStartedAtMs = null;
    this._now = () => Date.now();
  }

  /**
   * @param {object} [options]
   * @param {CompanionMode} [options.companionMode]
   * @param {() => number} [options.now]
   */
  start({ companionMode = COMPANION_MODE_STAY, now } = {}) {
    this._now = typeof now === 'function' ? now : () => Date.now();
    this.companionMode = isValidCompanionMode(companionMode)
      ? companionMode
      : COMPANION_MODE_STAY;
    this.pausedAccumulatedMs = 0;
    this._pauseStartedAtMs = null;
    this.startedAtMs = this._now();
    this.isRunning = true;
  }

  pause() {
    if (!this.isRunning || this._pauseStartedAtMs !== null) return;
    this.isRunning = false;
    this._pauseStartedAtMs = this._now();
  }

  resume() {
    if (this.isRunning || this.startedAtMs === null) return;
    if (this._pauseStartedAtMs !== null) {
      this.pausedAccumulatedMs += this._now() - this._pauseStartedAtMs;
      this._pauseStartedAtMs = null;
    }
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
    this.startedAtMs = null;
    this.pausedAccumulatedMs = 0;
    this._pauseStartedAtMs = null;
    this.companionMode = COMPANION_MODE_STAY;
  }

  /** @returns {boolean} */
  isStepAwayMode() {
    return this.companionMode === COMPANION_MODE_STEP_AWAY;
  }

  /** @returns {boolean} */
  isAcrossToolsMode() {
    return this.companionMode === COMPANION_MODE_ACROSS_TOOLS;
  }

  /**
   * 墙钟经过秒数（含当前仍在 pause 的一段）。
   * @returns {number}
   */
  getElapsedSeconds() {
    if (this.startedAtMs === null) return 0;
    let paused = this.pausedAccumulatedMs;
    if (this._pauseStartedAtMs !== null) {
      paused += this._now() - this._pauseStartedAtMs;
    }
    const elapsedMs = Math.max(0, this._now() - this.startedAtMs - paused);
    return elapsedMs / 1000;
  }

  /** @deprecated 保留空实现以免旧调用报错；真值见 getElapsedSeconds() */
  tick(_deltaSeconds) {
    // no-op：经过时长由墙钟计算
  }

  getFocusLevel() {
    const targetSeconds = this.targetMinutes * 60;
    if (targetSeconds <= 0) return 0;
    return Math.min(this.getElapsedSeconds() / targetSeconds, 1);
  }

  hasReachedTarget() {
    return this.startedAtMs !== null && this.getFocusLevel() >= 1;
  }
}
