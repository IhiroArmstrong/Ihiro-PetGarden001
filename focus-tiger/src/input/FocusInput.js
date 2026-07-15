// 职责：专注信号来源。MVP阶段只实现手动按钮触发。

import { t, onLocaleChange } from '../locales/i18n.js';

export class FocusInput {
  constructor(onStart, onStop) {
    this.onStart = onStart;
    this.onStop = onStop;
    this._focusing = false;
  }

  bindManualButton(buttonElement) {
    buttonElement.textContent = this._buttonLabel();
    buttonElement.addEventListener('click', () => {
      if (!this._focusing) {
        this.onStart();
        this._focusing = true;
      } else {
        this.onStop();
        this._focusing = false;
      }
      buttonElement.textContent = this._buttonLabel();
    });
    // 语言切换时按当前专注状态刷新按钮文字
    onLocaleChange(() => {
      buttonElement.textContent = this._buttonLabel();
    });
  }

  bindPomodoroTimer() {
    /* 预留，暂不实现 */
  }

  bindSensor() {
    /* 预留，暂不实现 */
  }

  resetButton(buttonElement) {
    this._focusing = false;
    buttonElement.textContent = this._buttonLabel();
  }

  _buttonLabel() {
    return this._focusing ? t('BTN_FOCUS_STOP') : t('BTN_FOCUS_START');
  }
}
