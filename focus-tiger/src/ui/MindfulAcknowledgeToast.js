import { homeClearanceBottomCss } from './homeChromeClearance.js';

const DEFAULT_VISIBLE_MS = 4_000;

/** 补登成功 / 微仪式完成等「也算数」类确认：同一套中置（勿各写百分比）。 */
export const MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE = 'center';

/**
 * 中置锚点（相对 #ui-overlay）：胸口/蒲团一带，避开脸。
 * Honesty `HONESTY_CHECKIN_RECORDED` 与 `micro_ritual.complete` 必须同值。
 */
export const MINDFUL_TOAST_CENTER_TOP = '62%';

const BASE_CSS = [
  'position:absolute',
  'left:50%',
  'max-width:min(520px,calc(100vw - 40px))',
  'padding:10px 16px',
  'border:1px solid rgba(139,115,85,.14)',
  'border-radius:16px',
  'background:rgba(255,252,245,.62)',
  'backdrop-filter:blur(8px)',
  '-webkit-backdrop-filter:blur(8px)',
  'box-shadow:0 4px 18px rgba(44,31,20,.06)',
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
    const narrow =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 479px)').matches;
    // Narrow + Honesty bridge share the lower third — lift toast to upper band.
    const top = narrow ? '22%' : MINDFUL_TOAST_CENTER_TOP;
    return [
      `top:${top}`,
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
  // Narrow: clear `#ft-narrow-home-ctas` Sit ball (shared homeChromeClearance).
  return [
    `bottom:${homeClearanceBottomCss()}`,
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
