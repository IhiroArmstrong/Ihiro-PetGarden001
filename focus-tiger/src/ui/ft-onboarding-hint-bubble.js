/**
 * Lit 试点：单条 onboarding 提示气泡（响应式文案 / 尖角 / 显隐）。
 * 定位仍由 OnboardingHintsUI 写 left/top / --tip-*；本组件只负责渲染壳。
 * @see docs/task-briefs/task-lit-pilot-onboarding-hints.md
 */

import { LitElement, html, css } from 'lit';

export class FtOnboardingHintBubble extends LitElement {
  static properties = {
    message: { type: String },
    /** @type {'top'|'bottom'|'left'|'right'} */
    tip: { type: String, attribute: 'data-tip', reflect: true },
    tipX: { type: String, attribute: false },
    tipY: { type: String, attribute: false },
    remedy: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true }
  };

  static styles = css`
    :host {
      position: fixed;
      z-index: 26;
      box-sizing: border-box;
      padding: 9px 14px;
      border-radius: 16px 16px 16px 4px;
      border: 1.5px solid var(--color-surface-border, rgba(139, 115, 85, 0.35));
      background: linear-gradient(
        165deg,
        var(--color-surface-warm-top, rgba(255, 255, 255, 0.96)) 0%,
        var(--color-surface-warm, #f8f1e4) 100%
      );
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.65) inset,
        0 6px 16px rgba(44, 31, 20, 0.12);
      color: var(--text-primary, #2c1f14);
      font-family:
        'Iowan Old Style', 'Palatino Linotype', Palatino, 'Songti SC',
        'Noto Serif SC', Georgia, serif;
      font-size: 12.5px;
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.01em;
      line-height: 1.45;
      text-align: left;
      pointer-events: auto;
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(44, 31, 20, 0.08));
      --tip-x: 50%;
      --tip-y: 50%;
    }
    :host(:hover) {
      filter: brightness(1.02) drop-shadow(0 2px 4px rgba(44, 31, 20, 0.1));
    }
    :host::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    }
    :host([data-tip='bottom'])::after {
      left: var(--tip-x, 50%);
      bottom: -8px;
      transform: translateX(-50%);
      border-width: 8px 7px 0 7px;
      border-color: var(--color-surface-warm, #f8f1e4) transparent transparent transparent;
      filter: drop-shadow(0 1px 0 rgba(139, 115, 85, 0.28));
    }
    :host([data-tip='top'])::after {
      left: var(--tip-x, 50%);
      top: -8px;
      transform: translateX(-50%);
      border-width: 0 7px 8px 7px;
      border-color: transparent transparent var(--color-surface-warm-top, #fffef9) transparent;
    }
    :host([data-tip='right'])::after {
      right: -8px;
      top: var(--tip-y, 50%);
      transform: translateY(-50%);
      border-width: 7px 0 7px 8px;
      border-color: transparent transparent transparent var(--color-surface-warm, #f8f1e4);
    }
    :host([data-tip='left'])::after {
      left: -8px;
      top: var(--tip-y, 50%);
      transform: translateY(-50%);
      border-width: 7px 8px 7px 0;
      border-color: transparent var(--color-surface-warm, #f8f1e4) transparent transparent;
    }
    :host(:not([open])) {
      display: none !important;
    }
    .label {
      display: block;
      color: var(--text-secondary, rgba(74, 58, 40, 0.78));
    }
  `;

  constructor() {
    super();
    this.message = '';
    this.tip = 'bottom';
    this.tipX = '50%';
    this.tipY = '50%';
    this.remedy = false;
    this.open = false;
  }

  /**
   * @param {Map<string, unknown>} changed
   */
  updated(changed) {
    if (changed.has('tipX') || changed.has('tipY')) {
      this.style.setProperty('--tip-x', this.tipX || '50%');
      this.style.setProperty('--tip-y', this.tipY || '50%');
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-live', 'polite');
    this.addEventListener('click', this._onActivate);
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onActivate);
    this.removeEventListener('keydown', this._onKeydown);
    super.disconnectedCallback();
  }

  /** @param {MouseEvent} event */
  _onActivate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('ft-hint-dismiss', { bubbles: true, composed: true })
    );
  };

  /** @param {KeyboardEvent} event */
  _onKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.dispatchEvent(
        new CustomEvent('ft-hint-dismiss', { bubbles: true, composed: true })
      );
    }
  };

  render() {
    return html`<span class="label">${this.message}</span>`;
  }
}

if (!customElements.get('ft-onboarding-hint-bubble')) {
  customElements.define('ft-onboarding-hint-bubble', FtOnboardingHintBubble);
}
