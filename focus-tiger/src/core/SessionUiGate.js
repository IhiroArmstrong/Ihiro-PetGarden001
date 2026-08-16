/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
  shouldAutoStartFocusOnModeSelect,
  shouldSkipArrivalOnModeSelect
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

/**
 * Sit / Rise 主钮是否应可点。
 * 完成反馈进行中或微仪式开着 → 必须禁用（禁止「可点但静默 return」）。
 *
 * @param {{ completionPending?: boolean, microRitualOpen?: boolean }} gates
 * @returns {boolean}
 */
export function shouldEnableFocusChromeButton({
  completionPending = false,
  microRitualOpen = false
} = {}) {
  return !completionPending && !microRitualOpen;
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
   * @deprecated 2026-07-25：Arrival/⚡ 解锁后须跨 Focusing→Rise 保持，
   * 以便回流点 Here & Now / Flow 立刻开表（勿在 beginFocus 清门闩）。
   * 保留 API 以免外部误用；现为 no-op。
   * @returns {void}
   */
  clearArrivalGateForFocusStart() {
    /* intentionally no-op — see setArrivalGateReady / Arrival cancel */
  }

  /**
   * @deprecated 2026-07-25：Rise 后不得清门闩（Scenario J / 用户回流）。
   * 保留 API；现为 no-op。
   * @returns {void}
   */
  clearArrivalGateAfterRise() {
    /* intentionally no-op */
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
   * Sit 点击（Arrival 面板未开）：Idle 下始终启动 Arrival（重新抵达）。
   * Companion / ⚡ 才用 `arrivalGateReady` 直接开表；Sit 不因门闩就绪而跳过仪式。
   *
   * @param {SessionUiGateExternal} [ext]
   * @returns {SitIdleAction}
   */
  resolveSitClickWhenIdle(ext = {}) {
    if (this._completionPending) return 'ignore';
    if (ext.isFocusing) return 'ignore';
    return 'start-arrival';
  }

  /**
   * 自动开计时模式点选但门闩未过：Here & Now / Flow → 启动 Arrival；
   * Offline Space → ignore（由 canBegin 直接开表，禁止进 Notice/Choose）。
   *
   * @param {string} mode
   * @param {SessionUiGateExternal} [ext]
   * @returns {CompanionNeedsArrivalAction}
   */
  resolveAutoStartNeedsArrival(mode, ext = {}) {
    if (!shouldAutoStartFocusOnModeSelect(mode)) return 'ignore';
    if (shouldSkipArrivalOnModeSelect(mode)) return 'ignore';
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
