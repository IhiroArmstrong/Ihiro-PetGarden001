/**
 * Companion Mode 三选一：按钮下弱化提示 + 向上展开面板。
 * Here & Now / Flow State：选中后立即开始 Focus+计时；
 * Offline Space：只写入预选并收起，须再点 Sit 开会话。
 * Choose / Session Intention 已迁至 Arrival Practice（ARRIVE_MOMENT_DESIGN v2）。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STORAGE_KEY,
  isValidCompanionMode,
  shouldAutoStartFocusOnModeSelect,
  canBeginFocusOnCompanionModeSelect
} from '../core/FocusSession.js';

function readStoredMode() {
  try {
    const raw = localStorage.getItem(COMPANION_MODE_STORAGE_KEY);
    if (isValidCompanionMode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return COMPANION_MODE_STAY;
}

function writeStoredMode(mode) {
  try {
    localStorage.setItem(COMPANION_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export class CompanionModePicker {
  /**
   * @param {HTMLElement} overlayRoot
   * @param {HTMLElement} focusButton
   * @param {object} [handlers]
   * @param {(mode: import('../core/FocusSession.js').CompanionMode) => void} [handlers.onModeSelected]
   */
  constructor(overlayRoot, focusButton, handlers = {}) {
    this.overlayRoot = overlayRoot;
    this.focusButton = focusButton;
    this.handlers = handlers;
    /** @type {import('../core/FocusSession.js').CompanionMode} */
    this.selected = readStoredMode();
    this._expanded = false;
    this._idleVisible = true;
    this._postSessionOverlay = false;
    /**
     * Arrival Practice 门闩：未就绪时禁止展开/点选，避免「选了 Here & Now
     * 却被 main 静默 return」的假失效。
     */
    this._arrivalReady = false;
    /** Rise 后优先显示提问；用户再选模式后改为模式名 */
    this._preferQuestionHint = true;

    this.dock = document.createElement('div');
    this.dock.id = 'session-start-dock';
    this.dock.className = 'session-start-dock';

    this.panel = document.createElement('div');
    this.panel.className = 'session-start-dock__panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'radiogroup');
    this.panel.setAttribute('aria-label', t('COMPANION_MODE_TITLE'));

    this.hintBtn = document.createElement('button');
    this.hintBtn.type = 'button';
    this.hintBtn.className = 'session-start-dock__hint';
    this.hintBtn.setAttribute('aria-expanded', 'false');
    this.hintBtn.addEventListener('click', () => {
      if (this._postSessionOverlay) return;
      this._expanded = !this._expanded;
      this._syncExpanded();
      this._syncHintLabel();
    });

    const parent = focusButton.parentElement;
    if (parent) {
      parent.insertBefore(this.dock, focusButton);
      this.dock.appendChild(this.panel);
      this.dock.appendChild(focusButton);
      this.dock.appendChild(this.hintBtn);
    }

    this._unsubLocale = onLocaleChange(() => this._render());
    this._injectStyles();
    this._render();
  }

  /** @returns {import('../core/FocusSession.js').CompanionMode} */
  getSelectedMode() {
    return this.selected;
  }

  /**
   * 空闲态：显示「模式提示」；专注中：只保留 Sit/Rise 按钮，隐藏提示与三选一面板。
   * @param {boolean} visible
   */
  setIdleChromeVisible(visible) {
    this._idleVisible = Boolean(visible);
    if (!this._idleVisible) {
      this._expanded = false;
      this._syncExpanded();
    } else {
      this._preferQuestionHint = true;
    }
    this.hintBtn.hidden = !this._idleVisible;
    this._syncHintAvailability();
    this._syncHintLabel();
  }

  /**
   * 反思 / Honesty / Arrival 等底部叠层打开时：收起三选一并禁止再展开。
   * @param {boolean} active
   */
  setPostSessionOverlayActive(active) {
    this._postSessionOverlay = Boolean(active);
    if (this._postSessionOverlay) {
      this._expanded = false;
      this._syncExpanded();
    }
    this._syncHintAvailability();
  }

  /**
   * Arrival 门闩：仅在就绪后允许展开三选一 / 自动开计时点选。
   * @param {boolean} ready
   */
  setArrivalReady(ready) {
    this._arrivalReady = Boolean(ready);
    if (!this._arrivalReady) {
      this._expanded = false;
      this._syncExpanded();
    }
    this._syncHintAvailability();
  }

  _syncHintAvailability() {
    const allowHint =
      this._idleVisible && !this._postSessionOverlay && this._arrivalReady;
    this.hintBtn.disabled = !allowHint;
    this.hintBtn.setAttribute('aria-disabled', allowHint ? 'false' : 'true');
    this.hintBtn.style.opacity = allowHint ? '' : '0.45';
    this.hintBtn.style.pointerEvents = allowHint ? '' : 'none';
  }

  open() {
    this.setIdleChromeVisible(true);
    if (this._postSessionOverlay || !this._arrivalReady) return;
    this._expanded = true;
    this._syncExpanded();
    this._syncHintLabel();
  }

  hide() {
    this._expanded = false;
    this._syncExpanded();
  }

  isOpen() {
    return this._expanded;
  }

  dispose() {
    this._unsubLocale();
  }

  _syncExpanded() {
    this.panel.hidden = !this._expanded;
    this.hintBtn.setAttribute(
      'aria-expanded',
      this._expanded ? 'true' : 'false'
    );
    this.hintBtn.classList.toggle('is-expanded', this._expanded);
  }

  _syncHintLabel() {
    if (!this._idleVisible) return;
    if (this._expanded || this._preferQuestionHint) {
      this.hintBtn.textContent = t('COMPANION_MODE_HINT');
      return;
    }
    this.hintBtn.textContent = t(this._hintLabelKey());
  }

  _hintLabelKey() {
    if (this.selected === COMPANION_MODE_STEP_AWAY) {
      return 'COMPANION_MODE_STEP_AWAY';
    }
    if (this.selected === COMPANION_MODE_ACROSS_TOOLS) {
      return 'COMPANION_MODE_ACROSS_TOOLS';
    }
    return 'COMPANION_MODE_STAY';
  }

  /**
   * @param {import('../core/FocusSession.js').CompanionMode} mode
   */
  _selectMode(mode) {
    if (!isValidCompanionMode(mode)) return;
    if (!this._arrivalReady || this._postSessionOverlay) return;
    this.selected = mode;
    writeStoredMode(mode);
    this._preferQuestionHint = false;
    this._expanded = false;
    this._render();
    if (shouldAutoStartFocusOnModeSelect(mode)) {
      // 与 main 共用同一门闩语义；未就绪时不应走到这里（setArrivalReady 会禁点选）。
      if (
        canBeginFocusOnCompanionModeSelect({
          mode,
          arrivalGateReady: this._arrivalReady,
          completionPending: false,
          arrivalOpen: false,
          isFocusing: false
        })
      ) {
        this.handlers.onModeSelected?.(mode);
      }
    }
  }

  _render() {
    this._syncHintLabel();
    this.panel.setAttribute('aria-label', t('COMPANION_MODE_TITLE'));
    this.panel.replaceChildren();

    const options = [
      {
        mode: COMPANION_MODE_STAY,
        labelKey: 'COMPANION_MODE_STAY',
        hintKey: 'COMPANION_MODE_STAY_HINT'
      },
      {
        mode: COMPANION_MODE_STEP_AWAY,
        labelKey: 'COMPANION_MODE_STEP_AWAY',
        hintKey: 'COMPANION_MODE_STEP_AWAY_HINT'
      },
      {
        mode: COMPANION_MODE_ACROSS_TOOLS,
        labelKey: 'COMPANION_MODE_ACROSS_TOOLS',
        hintKey: 'COMPANION_MODE_ACROSS_TOOLS_HINT'
      }
    ];

    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'session-start-dock__option';
      btn.setAttribute('role', 'radio');
      const selected = this.selected === opt.mode;
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      if (selected) btn.classList.add('is-selected');

      const label = t(opt.labelKey);
      const description = t(opt.hintKey);
      btn.title = description;

      const title = document.createElement('div');
      title.className = 'session-start-dock__option-title';
      title.textContent = label;
      const hint = document.createElement('div');
      hint.className = 'session-start-dock__option-hint';
      hint.textContent = description;
      btn.append(title, hint);
      btn.addEventListener('click', () => this._selectMode(opt.mode));
      this.panel.appendChild(btn);
    }

    this._syncExpanded();
  }

  _injectStyles() {
    if (document.getElementById('session-start-dock-styles')) return;
    const style = document.createElement('style');
    style.id = 'session-start-dock-styles';
    style.textContent = `
      .session-start-dock {
        position: absolute;
        left: 50%;
        bottom: 28px;
        transform: translateX(-50%);
        z-index: 12;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        pointer-events: none;
        /* 右侧留出 Sound FAB 空间，避免窄屏把音乐按钮挤掉 */
        width: min(400px, calc(100vw - 140px));
      }
      .session-start-dock > * {
        pointer-events: auto;
      }
      #btn-focus {
        position: static !important;
        left: auto !important;
        bottom: auto !important;
        transform: none !important;
      }
      #btn-focus:active {
        transform: translateY(2px) scale(0.985) !important;
      }
      .session-start-dock__hint {
        border: none;
        background: rgba(255, 252, 245, 0.88);
        color: #2c1f14;
        font-size: 13px;
        font-weight: 560;
        letter-spacing: 0.02em;
        cursor: pointer;
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 2px 0 rgba(180, 150, 110, 0.22),
          0 6px 14px rgba(44, 31, 20, 0.12);
        text-decoration: none;
        max-width: 100%;
        line-height: 1.35;
        text-align: center;
      }
      .session-start-dock__hint:hover,
      .session-start-dock__hint.is-expanded {
        color: #2c1f14;
        background: rgba(255, 252, 245, 0.96);
        filter: brightness(1.02);
      }
      .session-start-dock__hint[hidden] {
        display: none !important;
      }
      .session-start-dock__panel {
        order: -1;
        width: 100%;
        padding: 14px;
        border-radius: 16px;
        background: linear-gradient(165deg, rgba(255, 253, 247, 0.98) 0%, rgba(250, 244, 232, 0.95) 100%);
        border: 1px solid rgba(139, 115, 85, 0.28);
        box-shadow:
          0 2px 0 rgba(255, 255, 255, 0.85) inset,
          0 -1px 0 rgba(139, 115, 85, 0.12) inset,
          0 2px 0 rgba(180, 150, 110, 0.28),
          0 12px 28px rgba(44, 31, 20, 0.14);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .session-start-dock__panel[hidden] {
        display: none !important;
      }
      .session-start-dock__option {
        text-align: left;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 241, 228, 0.88) 100%);
        color: #2c1f14;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 2px 0 rgba(180, 150, 110, 0.2),
          0 3px 8px rgba(44, 31, 20, 0.08);
        transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
      }
      .session-start-dock__option:active {
        transform: translateY(1px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 1px 0 rgba(180, 150, 110, 0.18),
          0 1px 3px rgba(44, 31, 20, 0.1);
      }
      .session-start-dock__option.is-selected {
        border-color: rgba(139, 115, 85, 0.48);
        background: linear-gradient(180deg, rgba(255, 246, 230, 0.98) 0%, rgba(224, 185, 121, 0.34) 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 2px 0 rgba(160, 120, 70, 0.28),
          0 4px 10px rgba(44, 31, 20, 0.1);
      }
      .session-start-dock__option-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
      }
      .session-start-dock__option-hint {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.45;
        color: rgba(74, 58, 40, 0.78);
      }
    `;
    document.head.appendChild(style);
  }
}
