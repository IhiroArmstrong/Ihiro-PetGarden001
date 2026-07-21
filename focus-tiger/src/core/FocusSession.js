// 职责：专注会话的计时与 focusLevel 计算。
// 经过时长以墙钟时间戳差值为真值，不依赖后台被节流的 interval / rAF 累加。

export const COMPANION_MODE_STAY = 'stay';
export const COMPANION_MODE_STEP_AWAY = 'stepAway';
export const COMPANION_MODE_ACROSS_TOOLS = 'acrossTools';

/** across-tools 宽松 idle 兜底（占位，可调） */
export const ACROSS_TOOLS_IDLE_THRESHOLD_MS = 30 * 60 * 1000;

export const COMPANION_MODE_STORAGE_KEY = 'focus-tiger.companion-mode.v1';

/** 默认演示会话时长（分钟）；真实切页测 Re-focus 须更长，见 `?sessionMinutes=`。 */
export const DEMO_SESSION_MINUTES_DEFAULT = 1;

/**
 * 解析演示/测试会话目标分钟数。
 * `?sessionMinutes=5` → 5；缺省/非法 → 默认 1；夹在 1–90。
 * @param {string} [search]
 * @returns {number}
 */
export function resolveDemoSessionMinutes(search = '') {
  const raw = new URLSearchParams(search).get('sessionMinutes');
  if (raw == null || raw === '') return DEMO_SESSION_MINUTES_DEFAULT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEMO_SESSION_MINUTES_DEFAULT;
  return Math.min(90, Math.max(1, n));
}

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

/**
 * 选中 Companion 模式后是否立即开始 Focus / 计时。
 * Here & Now / Flow State：是；Offline Space：否（仍须再点 Sit）。
 * @param {string} mode
 */
export function shouldAutoStartFocusOnModeSelect(mode) {
  return (
    mode === COMPANION_MODE_STAY || mode === COMPANION_MODE_ACROSS_TOOLS
  );
}

/**
 * Arrival 结束时是否立刻开计时。
 * - Skip — begin / Sit 整体跳过 → true
 * - 先点选 Here & Now / Flow 再走 Arrival（含一步步 Choose）→ true（禁止再逼点 Sit）
 * - Sit 进 Arrival 且完整 Choose、无预选自动模式 → false → 展开 Companion
 * @param {{ skipped?: boolean, chose?: boolean, pendingAutoStartMode?: string | null }} info
 */
export function shouldBeginFocusAfterArrivalReady({
  skipped = false,
  pendingAutoStartMode = null
} = {}) {
  if (Boolean(skipped)) return true;
  if (
    pendingAutoStartMode &&
    shouldAutoStartFocusOnModeSelect(pendingAutoStartMode)
  ) {
    return true;
  }
  return false;
}

/**
 * @deprecated 用 `shouldBeginFocusAfterArrivalReady`（含预选自动开表回流）
 * Arrival 结束时是否立刻开计时（仅 Skip — begin）。
 * @param {{ skipped?: boolean }} info
 */
export function shouldBeginFocusOnArrivalReady({ skipped = false } = {}) {
  return shouldBeginFocusAfterArrivalReady({ skipped });
}

/**
 * 点选自动开计时模式后，是否真正允许 beginFocus。
 * 未过 Arrival 门闩时必须为 false；UI 侧选 Here & Now / Flow State 应启动 Arrival（禁止 HUD 静默无反应）。
 * @param {object} gates
 * @param {string} gates.mode
 * @param {boolean} gates.arrivalGateReady
 * @param {boolean} [gates.completionPending]
 * @param {boolean} [gates.arrivalOpen]
 * @param {boolean} [gates.isFocusing]
 */
export function canBeginFocusOnCompanionModeSelect({
  mode,
  arrivalGateReady,
  completionPending = false,
  arrivalOpen = false,
  isFocusing = false
}) {
  if (!shouldAutoStartFocusOnModeSelect(mode)) return false;
  if (completionPending || arrivalOpen || isFocusing) return false;
  return Boolean(arrivalGateReady);
}

/**
 * 「How shall we sit?」hint 点击裁决：禁止可点却静默无反馈。
 * - ignore：叠层中 / 专注中隐藏 → 不响应
 * - toggle：展开/收起三选一（门闩未就绪亦可先看选项；开计时仍受 canBeginFocusOnCompanionModeSelect 约束）
 * @param {object} gates
 * @param {boolean} gates.idleVisible
 * @param {boolean} gates.postSessionOverlay
 * @returns {'ignore' | 'toggle'}
 */
export function resolveCompanionHintClick({ idleVisible, postSessionOverlay }) {
  if (!idleVisible || postSessionOverlay) return 'ignore';
  return 'toggle';
}

/**
 * Rise 点击在专注中的裁决（防达标后误走「未完成」）。
 * - ignore：庆祝进行中，勿打断
 * - complete：已墙钟达标 → 走完成反馈（Celebrating / SessionComplete）
 * - incomplete：未达标主动起身
 * @param {object} gates
 * @param {boolean} gates.completionPending
 * @param {string} gates.state
 * @param {boolean} gates.hasReachedTarget
 * @returns {'ignore' | 'complete' | 'incomplete'}
 */
export function resolveRiseClickDuringFocus({
  completionPending,
  state,
  hasReachedTarget
}) {
  if (completionPending || state === 'CELEBRATE') return 'ignore';
  if (hasReachedTarget) return 'complete';
  return 'incomplete';
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
