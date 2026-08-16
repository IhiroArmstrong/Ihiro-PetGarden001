/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 专注信号来源（MVP：手动 Sit / Rise 按钮）。
 *
 * 装配方（`main.js`）在 `onStart` / `onStop` 内用 `SessionUiGate` 裁决：
 * - Sit：未就绪 → Arrival；就绪 → beginFocus；Arrival 已开 → 不跳过（请用 Quick Start）
 * - Rise：庆祝中 ignore；已达标 → 完成反馈；否则未达标起身
 *
 * 本类只维护按钮文案与 `_focusing` 显示态，不持有 Arrival / Companion 门闩。
 * @see docs/SHARED_RESOURCES.md §4
 * @see src/core/SessionUiGate.js
 */

import { t, onLocaleChange } from '../locales/i18n.js';

export class FocusInput {
  /**
   * @param {() => (boolean|void)} onStart
   *   Sit 回调。返回 `false` = 延后开始（如先走 Arrival），按钮保持 Sit。
   *   返回其它 / void = 已开始，按钮切 Rise。
   * @param {() => (boolean|void)} onStop
   *   Rise 回调。返回 `false` = 取消起身（达标完成路径 / 庆祝中忽略），按钮保持 Rise。
   *   返回其它 / void = 已结束，按钮切回 Sit。
   */
  constructor(onStart, onStop) {
    /** @type {() => (boolean|void)} */
    this.onStart = onStart;
    /** @type {() => (boolean|void)} */
    this.onStop = onStop;
    /** @type {boolean} 按钮是否显示为 Rise（与真实 FOCUSING 应对齐，由 beginFocusing/resetButton 校正） */
    this._focusing = false;
    /** @type {HTMLElement | null} */
    this._button = null;
  }

  /**
   * 绑定主按钮点击与 locale 文案刷新。
   * @param {HTMLElement} buttonElement 通常为 `#btn-focus`
   * @returns {void}
   */
  bindManualButton(buttonElement) {
    this._button = buttonElement;
    buttonElement.textContent = this._buttonLabel();
    buttonElement.addEventListener('click', () => {
      if (!this._focusing) {
        const deferred = this.onStart() === false;
        if (!deferred) {
          this._focusing = true;
          buttonElement.textContent = this._buttonLabel();
        }
      } else {
        const cancelled = this.onStop() === false;
        if (!cancelled) {
          this._focusing = false;
          buttonElement.textContent = this._buttonLabel();
        }
      }
    });
    onLocaleChange(() => {
      buttonElement.textContent = this._buttonLabel();
    });
  }

  /**
   * Companion / Quick Start 等路径已开计时时调用：按钮切到 Rise，无需再点 Sit。
   * @param {HTMLElement | null} [buttonElement=this._button]
   * @returns {void}
   */
  beginFocusing(buttonElement = this._button) {
    this._focusing = true;
    if (buttonElement) buttonElement.textContent = this._buttonLabel();
  }

  /**
   * 预留：番茄钟接入。MVP 不实现。
   * @returns {void}
   */
  bindPomodoroTimer() {
    /* 预留，暂不实现 */
  }

  /**
   * 预留：传感器接入。MVP 不实现。
   * @returns {void}
   */
  bindSensor() {
    /* 预留，暂不实现 */
  }

  /**
   * 会话结束后将按钮恢复为 Sit。
   * @param {HTMLElement | null} [buttonElement=this._button]
   * @returns {void}
   */
  resetButton(buttonElement = this._button) {
    this._focusing = false;
    if (buttonElement) buttonElement.textContent = this._buttonLabel();
  }

  /**
   * @returns {string} 当前 locale 下的 Sit / Rise 文案
   */
  _buttonLabel() {
    return this._focusing ? t('BTN_FOCUS_STOP') : t('BTN_FOCUS_START');
  }
}
