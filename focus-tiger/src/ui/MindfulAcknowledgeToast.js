const DEFAULT_VISIBLE_MS = 4_000;

const BASE_CSS = [
  'position:absolute',
  'left:50%',
  'max-width:min(520px,calc(100vw - 40px))',
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

/**
 * @param {'bottom' | 'center'} placement
 */
function placementCss(placement) {
  if (placement === 'center') {
    // 下移到胸口/蒲团一带：避开脸部（原 42% 偏高挡脸）
    return [
      'top:62%',
      'bottom:auto',
      'z-index:40',
      'padding:14px 22px',
      'font-size:16px',
      'font-weight:560',
      'background:rgba(255,252,245,.96)',
      'box-shadow:0 12px 32px rgba(44,31,20,.16)',
      'transform:translate(-50%,8px)'
    ].join(';');
  }
  return [
    'bottom:104px',
    'top:auto',
    'z-index:18',
    'transform:translate(-50%,10px)'
  ].join(';');
}

export class MindfulAcknowledgeToast {
  /**
   * @param {HTMLElement} container
   * @param {object} [options]
   * @param {number} [options.visibleMs]
   */
  constructor(container, { visibleMs = DEFAULT_VISIBLE_MS } = {}) {
    this.visibleMs = visibleMs;
    this.hideTimer = null;
    /** @type {'bottom' | 'center'} */
    this._placement = 'bottom';

    this.element = document.createElement('div');
    this.element.id = 'mindful-acknowledge-toast';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.dataset.placement = 'bottom';
    this.element.style.cssText = `${BASE_CSS};${placementCss('bottom')}`;
    container.appendChild(this.element);
  }

  /**
   * @param {string} message
   * @param {{ placement?: 'bottom' | 'center', visibleMs?: number }} [options]
   */
  show(message, options = {}) {
    if (!message) return false;
    window.clearTimeout(this.hideTimer);
    const placement = options.placement === 'center' ? 'center' : 'bottom';
    this._placement = placement;
    this.element.dataset.placement = placement;
    this.element.style.cssText = `${BASE_CSS};${placementCss(placement)}`;
    this.element.textContent = message;
    // force reflow so opacity/transform transition runs after placement swap
    this.element.getBoundingClientRect();
    this.element.style.opacity = '1';
    this.element.style.transform =
      placement === 'center'
        ? 'translate(-50%,-50%)'
        : 'translate(-50%,0)';
    const ms =
      Number.isFinite(options.visibleMs) && options.visibleMs > 0
        ? options.visibleMs
        : this.visibleMs;
    this.hideTimer = window.setTimeout(() => this.hide(), ms);
    return true;
  }

  hide() {
    this.element.style.opacity = '0';
    this.element.style.transform =
      this._placement === 'center'
        ? 'translate(-50%,-40%)'
        : 'translate(-50%,10px)';
  }

  dispose() {
    window.clearTimeout(this.hideTimer);
    this.element.remove();
  }
}
