/**
 * 变花吹散鼓励气泡（Phase 2a Lab）。
 * 气质：随风喃喃 — glass 半透明，非 Toast/Modal。
 * 驻留 3.0–3.5s；点气泡或空白处可消；≤3.5s 强制销毁。
 */

import { glassPanelSurfaceDecls } from './glassPanelStyles.js';
import {
  FLOWER_BLOW_BUBBLE_FADE_MS,
  FLOWER_BLOW_BUBBLE_HOLD_MS
} from './flowerBlowWelcomeCopy.js';

const ROOT_ID = 'flower-blow-welcome-bubble';

/**
 * @param {string[]} decls
 */
function declsToCss(decls) {
  return decls.join(';');
}

export class FlowerBlowWelcomeBubbleUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   */
  constructor(container) {
    this.container = container;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    /** @type {((ev: MouseEvent) => void) | null} */
    this._outsideHandler = null;
    this._visible = false;
  }

  /**
   * @param {string[]} lines
   * @param {{ holdMs?: number, onHidden?: () => void }} [opts]
   */
  show(lines, opts = {}) {
    const textLines = (lines || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (!textLines.length) return false;

    this.hide({ immediate: true });

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');
    root.dataset.ftFlowerBlowBubble = '1';
    root.style.cssText = [
      'position:absolute',
      'left:50%',
      // 头顶上方（勿压眼/鼻）：靠 viewport 顶缘，耳尖之上约 12–16px 叙事位
      'top:max(10px, env(safe-area-inset-top, 0px) + 10px)',
      'z-index:17',
      'max-width:min(360px,calc(100vw - 56px))',
      'padding:10px 16px',
      'color:#4a3a28',
      'font-size:13px',
      'line-height:1.5',
      'letter-spacing:0.02em',
      'text-align:center',
      'opacity:0',
      'transform:translate(-50%,6px)',
      `transition:opacity 400ms ease-out,transform 400ms ease-out`,
      'pointer-events:auto',
      'cursor:pointer',
      declsToCss(glassPanelSurfaceDecls())
    ].join(';');

    for (let i = 0; i < textLines.length; i += 1) {
      const line = textLines[i];
      const p = document.createElement('p');
      p.style.cssText =
        'margin:0;padding:0;' + (i > 0 ? 'margin-top:6px;' : '');
      p.textContent = line;
      root.appendChild(p);
    }

    root.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.hide();
    });

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._onHidden = typeof opts.onHidden === 'function' ? opts.onHidden : null;

    // force reflow → fade/slide in
    root.getBoundingClientRect();
    root.style.opacity = '1';
    root.style.transform = 'translate(-50%,0)';

    const holdMs =
      Number.isFinite(opts.holdMs) && opts.holdMs > 0
        ? opts.holdMs
        : FLOWER_BLOW_BUBBLE_HOLD_MS;
    this._holdTimer = window.setTimeout(() => this.hide(), holdMs);

    this._outsideHandler = (ev) => {
      const t = ev.target;
      if (!(t instanceof Node)) return;
      if (this.root?.contains(t)) return;
      // debug panel / chrome clicks should not be "blank" dismiss for lab comfort
      if (t instanceof Element) {
        if (t.closest('#emotion-debug-ui')) return;
        if (t.closest('button, a, input, select, textarea, [role="button"]')) {
          return;
        }
      }
      this.hide();
    };
    // capture so we hear blank taps even if something stops bubble
    window.setTimeout(() => {
      document.addEventListener('pointerdown', this._outsideHandler, true);
    }, 0);

    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    window.clearTimeout(this._holdTimer);
    window.clearTimeout(this._fadeTimer);
    this._holdTimer = null;
    this._fadeTimer = null;
    if (this._outsideHandler) {
      document.removeEventListener('pointerdown', this._outsideHandler, true);
      this._outsideHandler = null;
    }

    const root = this.root;
    const finish = () => {
      if (root?.parentNode) root.parentNode.removeChild(root);
      if (this.root === root) this.root = null;
      const was = this._visible;
      this._visible = false;
      const cb = this._onHidden;
      this._onHidden = null;
      if (was && cb) cb();
    };

    if (!root) {
      this._visible = false;
      return;
    }

    if (opts.immediate) {
      finish();
      return;
    }

    root.style.opacity = '0';
    root.style.transform = 'translate(-50%,-8px)';
    this._fadeTimer = window.setTimeout(finish, FLOWER_BLOW_BUBBLE_FADE_MS);
  }

  isVisible() {
    return this._visible;
  }
}
