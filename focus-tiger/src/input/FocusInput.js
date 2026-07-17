// 职责：专注信号来源。MVP阶段只实现手动按钮触发。

import { t, onLocaleChange } from '../locales/i18n.js';

export class FocusInput {
  /**
   * @param {() => (boolean|void)} onStart 返回 false 表示延后开始（如先选 Companion Mode）
   * @param {() => void} onStop
   */
  constructor(onStart, onStop) {
    this.onStart = onStart;
    this.onStop = onStop;
    this._focusing = false;
    /** @type {HTMLElement | null} */
    this._button = null;
  }

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
        this.onStop();
        this._focusing = false;
        buttonElement.textContent = this._buttonLabel();
      }
    });
    onLocaleChange(() => {
      buttonElement.textContent = this._buttonLabel();
    });
  }

  /** Companion Mode 确认后调用，将按钮切到「起身 / Rise」。 */
  beginFocusing(buttonElement = this._button) {
    this._focusing = true;
    if (buttonElement) buttonElement.textContent = this._buttonLabel();
  }

  bindPomodoroTimer() {
    /* 预留，暂不实现 */
  }

  bindSensor() {
    /* 预留，暂不实现 */
  }

  resetButton(buttonElement = this._button) {
    this._focusing = false;
    if (buttonElement) buttonElement.textContent = this._buttonLabel();
  }

  _buttonLabel() {
    return this._focusing ? t('BTN_FOCUS_STOP') : t('BTN_FOCUS_START');
  }
}
