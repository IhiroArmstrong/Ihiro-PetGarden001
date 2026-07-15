const DEFAULT_VISIBLE_MS = 4_000;

export class MindfulAcknowledgeToast {
  /**
   * @param {HTMLElement} container
   * @param {object} [options]
   * @param {number} [options.visibleMs]
   */
  constructor(container, { visibleMs = DEFAULT_VISIBLE_MS } = {}) {
    this.visibleMs = visibleMs;
    this.hideTimer = null;

    this.element = document.createElement('div');
    this.element.id = 'mindful-acknowledge-toast';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:104px',
      'max-width:min(520px,calc(100vw - 40px))',
      'transform:translate(-50%,10px)',
      'padding:10px 16px',
      'border:1px solid rgba(139,115,85,.22)',
      'border-radius:16px',
      'background:rgba(255,252,245,.9)',
      'box-shadow:0 8px 24px rgba(44,31,20,.1)',
      'color:#4a3a28',
      'font-size:14px',
      'line-height:1.5',
      'text-align:center',
      'opacity:0',
      'transition:opacity 260ms ease,transform 260ms ease',
      'pointer-events:none'
    ].join(';');
    container.appendChild(this.element);
  }

  /** @param {string} message */
  show(message) {
    if (!message) return false;
    window.clearTimeout(this.hideTimer);
    this.element.textContent = message;
    this.element.style.opacity = '1';
    this.element.style.transform = 'translate(-50%,0)';
    this.hideTimer = window.setTimeout(() => this.hide(), this.visibleMs);
    return true;
  }

  hide() {
    this.element.style.opacity = '0';
    this.element.style.transform = 'translate(-50%,10px)';
  }

  dispose() {
    window.clearTimeout(this.hideTimer);
    this.element.remove();
  }
}
