// 职责：专注信号来源。MVP阶段只实现手动按钮触发。

export class FocusInput {
  constructor(onStart, onStop) {
    this.onStart = onStart;
    this.onStop = onStop;
    this._focusing = false;
  }

  bindManualButton(buttonElement) {
    buttonElement.addEventListener('click', () => {
      if (!this._focusing) {
        this.onStart();
        this._focusing = true;
        buttonElement.textContent = '结束专注';
      } else {
        this.onStop();
        this._focusing = false;
        buttonElement.textContent = '开始专注';
      }
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
    buttonElement.textContent = '开始专注';
  }
}
