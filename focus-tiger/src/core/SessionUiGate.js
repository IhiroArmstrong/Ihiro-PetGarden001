/**
 * Session UI 门闩 facade：集中持有 Arrival / 叠层 / 完成中等共享门闩态，
 * 并把「未就绪不得 begin」等裁决收成可单测 API。
 *
 * 纯裁决函数仍出自 `FocusSession.js`；本类只收束可变态 + 组合调用，
 * 避免 `main.js` 散落 `let arrivalGateReady` 与各 UI 副本漂移。
 *
 * @see docs/SHARED_RESOURCES.md §4
 * @see docs/ARCHITECTURE.md「工程加固四步」
 */

import {
  canBeginFocusOnCompanionModeSelect,
  resolveCompanionHintClick,
  resolveRiseClickDuringFocus,
  shouldBeginFocusAfterArrivalReady,
  shouldAutoStartFocusOnModeSelect
} from './FocusSession.js';

/**
 * @typedef {object} SessionUiGateExternal
 * @property {boolean} [arrivalOpen] Arrival Practice 面板是否打开
 * @property {boolean} [isFocusing] 是否已在 FOCUSING
 * @property {boolean} [idleChromeVisible] Companion hint 是否处于空闲可见
 */

/**
 * @typedef {'ignore' | 'start-arrival' | 'begin-focus'} SitIdleAction
 */

/**
 * @typedef {'ignore' | 'start-arrival'} CompanionNeedsArrivalAction
 */

/**
 * 叠层占用聚合：任一源为真 → overlay active。
 * 源可为 boolean 或 `() => boolean`，便于 main 用数组扩展第三种叠层而不改本函数。
 *
 * @param {Iterable<boolean | (() => boolean)>} sources
 * @returns {boolean}
 */
export function computePostSessionOverlayActive(sources) {
  return Array.from(sources).some((s) =>
    typeof s === 'function' ? Boolean(s()) : Boolean(s)
  );
}

/**
 * Companion 点选是否允许写入 storage / 提交 selected。
 * - commit-begin：Gate 允许开表
 * - commit-arrival：Gate 允许启动 Arrival
 * - reject：未通过 → **禁止**写 storage
 *
 * @param {object} info
 * @param {boolean} info.canBegin
 * @param {'ignore' | 'start-arrival'} info.needsArrivalAction
 * @returns {'commit-begin' | 'commit-arrival' | 'reject'}
 */
export function resolveCompanionModeSelectCommit({
  canBegin,
  needsArrivalAction
}) {
  if (canBegin) return 'commit-begin';
  if (needsArrivalAction === 'start-arrival') return 'commit-arrival';
  return 'reject';
}

export class SessionUiGate {
  constructor() {
    /** @type {boolean} Arrival 完成（含 Skip）后才允许自动开计时 */
    this._arrivalGateReady = false;
    /** @type {boolean} 达标庆祝 / 完成反馈进行中 */
    this._completionPending = false;
    /**
     * Honesty / Reflection / Arrival 等底部叠层占用中。
     * 与 CompanionModePicker 的 setPostSessionOverlayActive 应对齐。
     * @type {boolean}
     */
    this._postSessionOverlayActive = false;
  }

  /** @returns {boolean} */
  get arrivalGateReady() {
    return this._arrivalGateReady;
  }

  /** @returns {boolean} */
  get completionPending() {
    return this._completionPending;
  }

  /** @returns {boolean} */
  get postSessionOverlayActive() {
    return this._postSessionOverlayActive;
  }

  /**
   * @param {boolean} ready
   * @returns {void}
   */
  setArrivalGateReady(ready) {
    this._arrivalGateReady = Boolean(ready);
  }

  /**
   * @param {boolean} pending
   * @returns {void}
   */
  setCompletionPending(pending) {
    this._completionPending = Boolean(pending);
  }

  /**
   * @param {boolean} active
   * @returns {void}
   */
  setPostSessionOverlayActive(active) {
    this._postSessionOverlayActive = Boolean(active);
  }

  /**
   * 开计时前清 Arrival 门闩（beginFocus 路径）。
   * @returns {void}
   */
  clearArrivalGateForFocusStart() {
    this._arrivalGateReady = false;
  }

  /**
   * Rise / 主动结束：清门闩，避免回流误开表。
   * @returns {void}
   */
  clearArrivalGateAfterRise() {
    this._arrivalGateReady = false;
  }

  /**
   * 点选 Companion 自动开计时模式后，是否真正允许 beginFocus。
   * **失败契约**：`arrivalGateReady === false` → 必须为 false（禁止静默开表）。
   *
   * @param {string} mode
   * @param {SessionUiGateExternal} [ext]
   * @returns {boolean}
   */
  canBeginFocusOnCompanionModeSelect(mode, ext = {}) {
    return canBeginFocusOnCompanionModeSelect({
      mode,
      arrivalGateReady: this._arrivalGateReady,
      completionPending: this._completionPending,
      arrivalOpen: Boolean(ext.arrivalOpen),
      isFocusing: Boolean(ext.isFocusing)
    });
  }

  /**
   * 「How shall we sit?」hint：叠层中须 ignore（UI 侧应禁用）。
   *
   * @param {SessionUiGateExternal} [ext]
   * @returns {'ignore' | 'toggle'}
   */
  resolveCompanionHintClick(ext = {}) {
    return resolveCompanionHintClick({
      idleVisible: ext.idleChromeVisible !== false,
      postSessionOverlay: this._postSessionOverlayActive
    });
  }

  /**
   * Arrival 结束时是否立刻开计时（Skip — begin，或预选 Here & Now / Flow 回流）。
   *
   * @param {{ skipped?: boolean, pendingAutoStartMode?: string | null }} [info]
   * @returns {boolean}
   */
  shouldBeginFocusOnArrivalReady(info) {
    return shouldBeginFocusAfterArrivalReady(info);
  }

  /**
   * Rise 在专注中的裁决。
   *
   * @param {object} gates
   * @param {string} gates.state
   * @param {boolean} gates.hasReachedTarget
   * @returns {'ignore' | 'complete' | 'incomplete'}
   */
  resolveRiseClickDuringFocus({ state, hasReachedTarget }) {
    return resolveRiseClickDuringFocus({
      completionPending: this._completionPending,
      state,
      hasReachedTarget
    });
  }

  /**
   * Sit 点击（Arrival 面板未开）：未就绪 → 启动 Arrival；就绪 → begin。
   * **失败契约**：门闩未就绪不得返回 `begin-focus`。
   *
   * @param {SessionUiGateExternal} [ext]
   * @returns {SitIdleAction}
   */
  resolveSitClickWhenIdle(ext = {}) {
    if (this._completionPending) return 'ignore';
    if (ext.isFocusing) return 'ignore';
    if (!this._arrivalGateReady) return 'start-arrival';
    return 'begin-focus';
  }

  /**
   * 自动开计时模式点选但门闩未过：应启动 Arrival（禁止 HUD 静默）。
   *
   * @param {string} mode
   * @param {SessionUiGateExternal} [ext]
   * @returns {CompanionNeedsArrivalAction}
   */
  resolveAutoStartNeedsArrival(mode, ext = {}) {
    if (!shouldAutoStartFocusOnModeSelect(mode)) return 'ignore';
    if (this._completionPending || ext.isFocusing || ext.arrivalOpen) {
      return 'ignore';
    }
    if (this._arrivalGateReady) return 'ignore';
    return 'start-arrival';
  }

  /**
   * Honesty 桥接 Yes / 同类 chrome：可否启动完整 Arrival。
   *
   * @param {SessionUiGateExternal} [ext]
   * @returns {boolean}
   */
  canStartArrivalFromChrome(ext = {}) {
    if (this._completionPending) return false;
    if (ext.isFocusing) return false;
    if (ext.arrivalOpen) return false;
    return true;
  }
}
