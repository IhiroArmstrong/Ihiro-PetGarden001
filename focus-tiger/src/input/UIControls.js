/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：按钮/手势/快捷键的统一绑定入口。

export class UIControls {
  constructor(focusInput) {
    this.focusInput = focusInput;
  }

  bindAll() {
    const button = document.getElementById('btn-focus');
    if (button) {
      this.focusInput.bindManualButton(button);
    }
  }
}
