/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Actionable undo bar after a voice-started focus session (Brief B · Slice 1).
 */

const DEFAULT_VISIBLE_MS = 5_000;

const BASE_CSS = [
  'position:absolute',
  'left:50%',
  'bottom:108px',
  'z-index:42',
  'display:flex',
  'align-items:center',
  'gap:12px',
  'max-width:min(520px,calc(100vw - 40px))',
  'padding:10px 14px',
  'border:1px solid rgba(139,115,85,.18)',
  'border-radius:16px',
  'background:rgba(255,252,245,.96)',
  'backdrop-filter:blur(8px)',
  '-webkit-backdrop-filter:blur(8px)',
  'box-shadow:0 8px 24px rgba(44,31,20,.12)',
  'color:#4a3a28',
  'font-size:14px',
  'line-height:1.45',
  'opacity:0',
  'transform:translate(-50%,10px)',
  'transition:opacity 220ms ease,transform 220ms ease',
  'pointer-events:auto'
].join(';');

export class VoiceCommandUndoToast {
  /**
   * @param {HTMLElement} container
   * @param {{ visibleMs?: number }} [options]
   */
  constructor(container, { visibleMs = DEFAULT_VISIBLE_MS } = {}) {
    this.visibleMs = visibleMs;
    this.hideTimer = null;
    this._onUndo = null;

    this.element = document.createElement('div');
    this.element.id = 'voice-command-undo-toast';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.hidden = true;
    this.element.style.cssText = BASE_CSS;

    this.messageEl = document.createElement('span');
    this.messageEl.style.flex = '1';

    this.undoBtn = document.createElement('button');
    this.undoBtn.type = 'button';
    this.undoBtn.dataset.testid = 'voice-command-undo';
    this.undoBtn.style.cssText = [
      'appearance:none',
      'border:1px solid rgba(107,58,46,.35)',
      'border-radius:999px',
      'padding:6px 12px',
      'background:rgba(255,255,255,.72)',
      'color:#4a3728',
      'font:inherit',
      'font-size:13px',
      'font-weight:600',
      'cursor:pointer'
    ].join(';');
    this.undoBtn.addEventListener('click', () => {
      const fn = this._onUndo;
      this.hide();
      fn?.();
    });

    this.element.append(this.messageEl, this.undoBtn);
    container.appendChild(this.element);
  }

  /**
   * @param {string} message
   * @param {string} undoLabel
   * @param {() => void} onUndo
   * @param {{ visibleMs?: number }} [options]
   */
  show(message, undoLabel, onUndo, options = {}) {
    if (!message) return false;
    window.clearTimeout(this.hideTimer);
    this._onUndo = typeof onUndo === 'function' ? onUndo : null;
    this.messageEl.textContent = message;
    this.undoBtn.textContent = undoLabel;
    this.element.hidden = false;
    this.element.getBoundingClientRect();
    this.element.style.opacity = '1';
    this.element.style.transform = 'translate(-50%,0)';
    const ms =
      Number.isFinite(options.visibleMs) && options.visibleMs > 0
        ? options.visibleMs
        : this.visibleMs;
    this.hideTimer = window.setTimeout(() => this.hide(), ms);
    return true;
  }

  hide() {
    window.clearTimeout(this.hideTimer);
    this._onUndo = null;
    this.element.style.opacity = '0';
    this.element.style.transform = 'translate(-50%,10px)';
    window.setTimeout(() => {
      if (this.element.style.opacity === '0') this.element.hidden = true;
    }, 220);
  }
}
