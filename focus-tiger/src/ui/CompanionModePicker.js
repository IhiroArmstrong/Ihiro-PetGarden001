/**
 * Companion Mode 三选一：Sit 旁「How shall we sit?」hint + 向上展开面板。
 *
 * - Here & Now / Flow State：门闩就绪后选中即 `onModeSelected` → Focus+计时
 * - Offline Space：只写入预选并收起，须再点 Sit
 * - 门闩未就绪时选自动开表模式 → `onAutoStartNeedsArrival`（禁止 HUD 静默）
 * - Choose / Session Intention 在 Arrival Practice（见 ARRIVE_MOMENT_DESIGN v2）
 *
 * 权威门闩可变源：`SessionUiGate`；本类持有 UI 侧副本（`_arrivalReady` /
 * `_postSessionOverlay`），由 `main.js` 的 sync* 与 Gate 对齐。
 * @see docs/SHARED_RESOURCES.md §4
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STORAGE_KEY,
  isValidCompanionMode,
  shouldAutoStartFocusOnModeSelect,
  canBeginFocusOnCompanionModeSelect,
  resolveCompanionHintClick
} from '../core/FocusSession.js';

/**
 * @typedef {object} CompanionModePickerHandlers
 * @property {(mode: import('../core/FocusSession.js').CompanionMode) => void} [onModeSelected]
 *   门闩就绪且为自动开表模式时调用
 * @property {() => void} [onAutoStartNeedsArrival]
 *   门闩未就绪时点 Here & Now / Flow State → 启动 Arrival
 * @property {(expanded: boolean) => void} [onExpandedChange]
 *   面板展开/收起（驱动 companion-mode 气泡等）
 */

/** @returns {import('../core/FocusSession.js').CompanionMode} */
function readStoredMode() {
  try {
    const raw = localStorage.getItem(COMPANION_MODE_STORAGE_KEY);
    if (isValidCompanionMode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return COMPANION_MODE_STAY;
}

/** @param {import('../core/FocusSession.js').CompanionMode} mode */
function writeStoredMode(mode) {
  try {
    localStorage.setItem(COMPANION_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export class CompanionModePicker {
  /**
   * 将 Sit 按钮包入 dock，并在其下挂 hint / 三选一面板。
   * @param {HTMLElement} overlayRoot 现保留入参；dock 挂在 `focusButton` 父节点
   * @param {HTMLElement} focusButton Sit / Rise 主按钮
   * @param {CompanionModePickerHandlers} [handlers]
   */
  constructor(overlayRoot, focusButton, handlers = {}) {
    this.overlayRoot = overlayRoot;
    this.focusButton = focusButton;
    /** @type {CompanionModePickerHandlers} */
    this.handlers = handlers;
    /** @type {import('../core/FocusSession.js').CompanionMode} */
    this.selected = readStoredMode();
    /** @type {boolean} 三选一面板是否展开 */
    this._expanded = false;
    /** @type {boolean} 空闲 chrome：显示 hint；专注中隐藏 */
    this._idleVisible = true;
    /**
     * Reflection / Arrival 等叠层占用（与 SessionUiGate.postSessionOverlayActive 对齐）。
     * 为 true 时 hint 禁用且不可展开。
     * @type {boolean}
     */
    this._postSessionOverlay = false;
    /**
     * Arrival 门闩 UI 副本（与 SessionUiGate.arrivalGateReady 对齐）。
     * 未就绪：Here & Now / Flow 走 `onAutoStartNeedsArrival`；hint 仍可展开看选项。
     * @type {boolean}
     */
    this._arrivalReady = false;
    /** Rise 后优先显示提问文案；用户再选模式后改为模式名 */
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
    this.hintBtn.addEventListener('click', () => this._onHintClick());

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
    this._syncHintAvailability();
  }

  /**
   * 当前预选 / 已选 Companion 模式（持久化 key：`COMPANION_MODE_STORAGE_KEY`）。
   * @returns {import('../core/FocusSession.js').CompanionMode}
   */
  getSelectedMode() {
    return this.selected;
  }

  /**
   * 空闲态：显示 hint；专注中：只保留 Sit/Rise，隐藏 hint 与三选一面板。
   * @param {boolean} visible
   * @returns {void}
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
   * Reflection / Arrival 等底部叠层打开时：收起三选一，并禁用 hint（禁止可点却静默）。
   * Honesty 气泡期间通常不挡 hint（由 `main.js` sync 决定是否传入 true）。
   * @param {boolean} active
   * @returns {void}
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
   * 同步 Arrival 门闩 UI 副本。未就绪时收起面板；hint 仍可展开看三选一。
   * 自动开表点选是否 begin 由 `_selectMode` + `canBeginFocusOnCompanionModeSelect` 裁决。
   * @param {boolean} ready
   * @returns {void}
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
    const allowHint = this._idleVisible && !this._postSessionOverlay;
    this.hintBtn.disabled = !allowHint;
    this.hintBtn.setAttribute('aria-disabled', allowHint ? 'false' : 'true');
    this.hintBtn.classList.toggle('is-gated', !allowHint);
    this.hintBtn.style.opacity = '';
    this.hintBtn.style.pointerEvents = '';
  }

  _onHintClick() {
    const action = resolveCompanionHintClick({
      idleVisible: this._idleVisible,
      postSessionOverlay: this._postSessionOverlay
    });
    if (action === 'ignore') return;
    this._expanded = !this._expanded;
    this._syncExpanded();
    this._syncHintLabel();
  }

  /**
   * 展开三选一面板（叠层占用中则 no-op）。会先恢复空闲 chrome。
   * @returns {void}
   */
  open() {
    this.setIdleChromeVisible(true);
    if (this._postSessionOverlay) return;
    this._expanded = true;
    this._syncExpanded();
    this._syncHintLabel();
  }

  /**
   * 仅收起三选一面板（不改 idle chrome / 门闩）。
   * @returns {void}
   */
  hide() {
    this._expanded = false;
    this._syncExpanded();
  }

  /**
   * 三选一面板是否展开（非「门闩是否就绪」）。
   * @returns {boolean}
   */
  isOpen() {
    return this._expanded;
  }

  /**
   * 取消 locale 订阅。不移除已挂入的 dock DOM。
   * @returns {void}
   */
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
    this.handlers.onExpandedChange?.(this._expanded);
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
    if (this._postSessionOverlay) return;
    this.selected = mode;
    writeStoredMode(mode);
    this._preferQuestionHint = false;
    this._expanded = false;
    this._render();
    if (!this._arrivalReady) {
      if (shouldAutoStartFocusOnModeSelect(mode)) {
        this.handlers.onAutoStartNeedsArrival?.();
      }
      return;
    }
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
    const css = `
      .session-start-dock {
        position: absolute;
        left: 50%;
        bottom: 28px;
        transform: translateX(-50%);
        /* 须高于 Honesty 面板(z15) / 再补登入口(z14)，否则点击 Sit 会被抢走打开 Mindful Check-in */
        z-index: 16;
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
      /* 次要钮：描边软 UI（对齐 ui-kit secondary-button）；不抢 Sit 主 CTA */
      .session-start-dock__hint {
        border: 1.5px solid var(--color-ink, #2c1f14);
        background: transparent;
        color: var(--color-ink, #2c1f14);
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.02em;
        cursor: pointer;
        padding: 9px 20px;
        border-radius: 999px;
        box-shadow: none;
        text-decoration: none;
        max-width: 100%;
        line-height: 1.35;
        text-align: center;
        transition: transform 120ms ease, background 120ms ease, opacity 120ms ease;
      }
      .session-start-dock__hint:hover,
      .session-start-dock__hint.is-expanded {
        color: var(--color-ink, #2c1f14);
        background: var(--color-ink-faint, rgba(46, 43, 40, 0.1));
        filter: none;
      }
      .session-start-dock__hint:active:not(:disabled) {
        transform: scale(0.97);
        box-shadow: none;
      }
      .session-start-dock__hint.is-awaiting-arrival {
        border-color: var(--color-accent, #b5623a);
        box-shadow: none;
      }
      .session-start-dock__hint.is-gated,
      .session-start-dock__hint:disabled {
        cursor: default;
        filter: none;
        opacity: 0.4;
        box-shadow: none;
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
      /* 桌面：底部横排三选一（矮条），勿用右侧竖栏盖住 Yin 半身/鞠躬 */
      @media (min-width: 900px) {
        .session-start-dock {
          width: min(640px, calc(100vw - 160px));
        }
        .session-start-dock__panel {
          position: static;
          order: -1;
          width: 100%;
          max-height: none;
          overflow: visible;
          flex-direction: row;
          align-items: stretch;
          gap: 8px;
          padding: 10px;
        }
        .session-start-dock__option {
          flex: 1 1 0;
          min-width: 0;
          padding: 10px 8px;
        }
        .session-start-dock__option-title {
          font-size: 12px;
        }
        .session-start-dock__option-hint {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          font-size: 10px;
          line-height: 1.35;
        }
      }
      .session-start-dock__option {
        text-align: left;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid var(--color-surface-border, rgba(139, 115, 85, 0.22));
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.96) 0%,
          var(--color-surface-warm, #f8f1e4) 100%
        );
        color: var(--text-primary, #2c1f14);
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
        border-color: var(--color-surface-border-strong, rgba(139, 115, 85, 0.48));
        background: linear-gradient(
          180deg,
          var(--color-surface-warm-selected-top, #fff6e6) 0%,
          var(--color-surface-warm-selected-end, rgba(224, 185, 121, 0.34)) 100%
        );
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 2px 0 rgba(160, 120, 70, 0.28),
          0 4px 10px rgba(44, 31, 20, 0.1);
      }
      .session-start-dock__option-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, #2c1f14);
      }
      .session-start-dock__option-hint {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.45;
        color: var(--text-secondary, rgba(74, 58, 40, 0.78));
      }
    `;
    let style = document.getElementById('session-start-dock-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'session-start-dock-styles';
      document.head.appendChild(style);
    }
    // 始终写入最新 CSS，避免 Vite HMR 留下旧「扁平弱化」样式
    style.textContent = css;
  }
}
